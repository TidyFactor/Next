# Workflow: audit-dev-perf

One outcome: A comprehensive, evidence-based **Development Performance Audit Report** with a 120-point Health Scorecard and a P0–P3 prioritized action list — produced without modifying a single file.

> **Pre-condition**: This workflow is loaded by `../commands/perf.md` after the Session Gate (`../memory/spec.md` + `ARCHITECTURE.md`) and Phase 0 (mode detection) are both complete.
> If the project's `ARCHITECTURE.md` has a filled "Performance context" section, use it as the starting point for Phase 1 and Phase 2 — do not re-derive what is already documented.

---

## Execution Steps

### Phase 1 — Project & Environment Discovery

Inspect without modifying. Collect:

**Framework & Runtime:**
- Next.js version, React version, Node.js version, TypeScript version
- Package manager (npm / pnpm / yarn / bun) and lockfile type
- Bundler: Turbopack / Webpack / other
- Operating system (relevant for path/watch behavior)

**Project Surface:**
- Total project directory size
- Source code size (`app/`, `components/`, `lib/`, `hooks/` etc.)
- `node_modules/` size
- `.next/` total size, `.next/cache/` size
- Other caches: `.turbo/`, `.eslintcache`, `tsconfig.tsbuildinfo`
- Source file count (`.ts`, `.tsx`, `.js`, `.jsx`)
- Total dependency count (`dependencies` in `package.json`)
- Total devDependency count

**Configuration files to inspect:**
- `package.json` (scripts, dep list)
- `next.config.*` (all optimization flags active)
- `tsconfig.*` (include, exclude, incremental)
- `eslint.config.*` / `.eslintrc.*`
- Tailwind configuration (if present)
- Workspace / monorepo config (if present)
- `.gitignore`

> Do NOT read or expose `.env` files or secrets.

---

### Phase 2 — Baseline Contract Establishment

**Record the following before any changes are ever made:**

```
BASELINE SNAPSHOT — [Date & Time]
─────────────────────────────────
Project Size:          [X MB]
Source Size:           [X MB]
node_modules Size:     [X MB]
.next Total:           [X MB]
.next/cache:           [X MB]

Dependency Count:      [X]
devDependency Count:   [X]

Next.js:               [version]
Node.js:               [version]
React:                 [version]
TypeScript:            [version]
Bundler:               [Turbopack | Webpack]

Dev Startup Time:      [X.Xs] (if measurable)
Production Build:      [Xs] (if measurable)
HMR Rebuild (cold):    [X.Xs] (if measurable)
Typecheck Time:        [X.Xs] (if measurable)
Lint Time:             [X.Xs] (if measurable)
```

If timings cannot be measured from this environment, state explicitly:
```
Unable to measure [dev startup / build / HMR] from current environment.
Run: [specific command] manually to establish baseline.
```

Never invent or estimate timing values.

---

### Phase 3 — Dependency Graph Analysis

Analyze from `../memory/dependency-optimization.md`:

```
Direct Dependencies
      ↓
Transitive Dependencies (what they pull)
      ↓
Module Surface (how many modules analyzed per dep)
      ↓
Client Bundle Exposure (what reaches the browser)
      ↓
Build Cost (compilation overhead per dep)
```

Identify:
- Unused dependencies (cross-reference imports before flagging)
- Duplicate packages / multiple versions of same package
- Dependencies classified as `dependencies` but only used at build time
- Packages with very large transitive dependency trees
- CommonJS packages where ESM alternatives exist
- Packages that prevent tree-shaking
- Packages already in `optimizePackageImports` vs. those that should be considered

**Key rule**: 50 deps with one heavy transitive tree can cost more than 150 clean deps. Count means nothing without transitive graph analysis.

---

### Phase 4 — Import & Tree-Shaking Analysis

Scan source code for:
- Barrel imports (`import * from 'library'`, `import { a, b, c, d, e, f, ... } from 'components/index'`)
- Importing entire libraries when only one module is needed
- Poor ESM import patterns defeating tree-shaking
- Duplicate imports across files
- Server-only packages imported into Client Components
- Client-only packages imported into Server Components / Route Handlers

Classify each finding: Safe to Fix / Requires Review / High Risk.
Do NOT perform automated broad import rewrites.

---

### Phase 5 — Client Bundle Composition Analysis

Using `../memory/client-server-boundaries.md`:

Identify what actually reaches the browser. High-risk categories for SaaS/LMS:
- Database clients (Supabase, Prisma, Drizzle ORM)
- AI SDKs (OpenAI, Anthropic, Vercel AI SDK)
- Large utility libraries (lodash, moment, date-fns)
- Icon libraries (lucide-react, heroicons, react-icons)
- Charting libraries (recharts, chart.js, d3)
- Rich text / code editors (Monaco, TipTap, CodeMirror)

Detect the pattern: `server-only package → imported in Client Component → leaks into client bundle`

Classify findings:
1. **Safe** — confirmed server-only, no client exposure
2. **Requires Developer Review** — suspected leak, needs verification
3. **High Risk** — confirmed server package in client bundle

Do NOT automatically convert components. Present findings only.

---

### Phase 6 — Next.js Architecture Audit

Analyze:
- `"use client"` propagation (unnecessary directives cascading down the tree)
- `"use server"` Server Actions usage and location
- Suspense boundary placement
- Dynamic import usage for large client components
- Excessive global client-side providers wrapping the entire app
- Route Handlers vs Server Actions for mutations
- Static vs Dynamic rendering per route
- `generateStaticParams` usage

Classify every finding as:
1. **Safe** — can be addressed
2. **Requires Developer Review** — non-trivial RSC conversion
3. **High Risk** — touches auth, RLS, or tenant boundaries

---

### Phase 7 — Git Hygiene vs Dev Tooling Hygiene (Separate Analysis)

**These are independent scopes:**

| Config | Controls |
|---|---|
| `.gitignore` | What enters version control |
| `tsconfig exclude` | What TypeScript analyzes |
| `watchIgnore` / `watchOptions` in `next.config` | What the file watcher monitors |
| Bundler ignore patterns | What the bundler processes |

**Educational anchor** (from `../memory/cache-storage-rules.md`):
> `.next/` in `.gitignore` does NOT prevent Next.js from using it. They are independent scopes.

Audit `.gitignore` for generated/build artifacts that should be excluded.
Audit `tsconfig.json` for directories that TypeScript is unnecessarily analyzing (generated types, `.next/`, `node_modules/`, migration snapshots, test fixtures).
Audit `next.config` watchOptions if set.

---

### Phase 8 — Watch Boundary Audit

Inspect the project directory tree for large file collections inside the development tree:

High-risk patterns for SaaS / LMS projects:
```
public/
├── uploads/          ← user-uploaded files
├── videos/           ← media assets
├── generated/        ← AI-generated outputs
exports/              ← bulk data exports
backups/              ← database snapshots
logs/                 ← application logs
```

**File watching + metadata operations + cache invalidation overhead** on thousands of static/media files can become a real bottleneck for HMR and TypeScript.

If detected: present as an architectural recommendation (not automated fix):
```
Architectural Escalation:
Large media/upload directory detected inside project filesystem.
Consider: Supabase Storage / S3 / CDN
Instead of: Project filesystem storage
```

---

### Phase 9 — Cache & Storage Analysis

Using `../memory/cache-storage-rules.md`:

Measure:
- `.next/cache` size vs project source size ratio
- Whether cache is being invalidated too often (causing I/O pressure)
- Generated files stored inside source directories
- Temporary files inside development tree

**Do NOT recommend disabling caching as an optimization.**

Explain the trade-off explicitly:
```
More caching → less rebuild time → more RAM → more Disk I/O on low-RAM systems
Less caching → faster restart → slower HMR rebuilds → more CPU per rebuild

Recommendation depends on the primary bottleneck (Phase 12).
```

---

### Phase 10 — TypeScript Scope Audit

Inspect `tsconfig.json`:
- `include`: is it broader than the actual source?
- `exclude`: are generated directories, `.next/`, `node_modules/`, test fixtures excluded?
- `incremental`: is it enabled? Is `tsbuildinfo` stored correctly?
- `paths` / `baseUrl`: are aliases efficient?
- Are generated type files (from Supabase, Drizzle, Prisma) accidentally included in the main type surface?

Recommend smallest safe scope without removing project functionality.

---

### Phase 11 — ESLint & Development Tooling Overhead

Audit:
- ESLint configuration: plugins loaded, rules enabled
- TypeScript-ESLint: `typeChecked` rules (expensive — require full type program)
- Duplicate linting: ESLint + another linter/formatter running on same files
- Pre-commit hooks: what runs on every commit (type check, lint, tests, formatting)
- Parallel script overhead

Identify processes that consume CPU/RAM/Disk unnecessarily.
Do NOT recommend removing linting or type checking.

---

### Phase 12 — Bottleneck Classification

Classify the **primary bottleneck** using `../memory/perf-optimization-rules.md`:

| Bottleneck | Symptoms |
|---|---|
| **RAM Pressure** | Disk I/O spikes; paging to swap; browser + IDE + Node competing |
| **CPU** | High utilization during type checking, bundling, linting |
| **Disk I/O** | Slow HMR on SATA/HDD; cache R/W the bottleneck |
| **Dependency Graph** | Large `node_modules/` → more module analysis → slower startup |
| **TypeScript Scope** | Wide `include` → TypeScript analyzes unnecessary files |
| **ESLint / Tooling** | Expensive rules + large file surface = slow lint pass |
| **Project Architecture** | Unnecessary file watching, uploads in dev tree |
| **Mixed** | Multiple contributing factors — rank by severity |

Causality models to apply:
- `RAM pressure → paging → high Disk I/O (especially HDD) → slower builds`
- `Large dependency graph → more module analysis → more CPU/RAM → slower startup`
- `Slow storage → cache R/W becomes bottleneck → high disk active time → slow HMR`

---

### Phase 13 — Development Environment Assessment

Report what can be measured. For host-level metrics unavailable in this environment, state explicitly and provide manual commands.

```
Development Environment Assessment
───────────────────────────────────
RAM Detected:     [X GB] or "NOT MEASURABLE from this environment"
CPU Cores:        [X] or NOT MEASURABLE
Storage Type:     HDD / SATA SSD / NVMe / NOT MEASURABLE
Free Disk Space:  [X GB] or NOT MEASURABLE
Node Processes:   [X running] or NOT MEASURABLE
Docker Active:    Yes / No / NOT MEASURABLE
```

**Hardware Recommendation is an OUTPUT, not an Optimization.** Hardware thresholds (8GB/16GB/32GB/64GB) are Baseline References, not diagnostic verdicts. A finding like "RAM = 16GB" does NOT automatically mean RAM is the bottleneck. The verdict requires:
```
Observed Memory Pressure (high/low/unknown)
+ Paging Activity (active/inactive/unknown)
+ Working Set Size (project complexity)
+ Bottleneck Confirmed in Phase 12
→ Then deliver hardware recommendation
```

Hardware Recommendation Matrix (only after bottleneck confirmed):
| RAM Pressure | Disk I/O | Primary Recommendation |
|---|---|---|
| HIGH | HIGH (HDD) | RAM upgrade + NVMe — both needed |
| HIGH | LOW (NVMe) | RAM is the bottleneck |
| LOW | HIGH (HDD) | Storage is the bottleneck — NVMe upgrade |
| LOW | LOW | Hardware is not the bottleneck — check tooling/architecture |
| NOT MEASURABLE | NOT MEASURABLE | Cannot assess. Provide manual commands. |


---

## Final Report Structure

```markdown
# Development Performance Audit — [Project Name]
Generated: [Date]

## Executive Summary
Overall Development Health: [Excellent | Good | Needs Attention | Poor]
Score: [X/120]

Primary Bottleneck: [RAM | CPU | Disk I/O | Dependencies | TypeScript | Tooling | Architecture | Mixed]

## Baseline
[Full baseline snapshot from Phase 2]

## Findings
| Phase | Area | Finding | Severity | Confidence | Impact | Recommendation | Action Status |
|-------|------|---------|----------|------------|--------|----------------|---------------|
| 3 | Dependencies | Unused dep: `some-lib` confirmed 0 imports | HIGH | HIGH (verified via grep) | Reduced node_modules -23 MB | Remove from package.json | PROPOSED |
| 5 | Client Bundle | `supabase-js` service client suspected in client component | CRITICAL | MEDIUM (import chain analysis) | Service role key exposure risk | Review import chain | PROPOSED |
| 9 | Cache | .next/cache 8x source size | LOW | HIGH (measured) | Marginal storage cleanup | Clear old cache | PROPOSED |
...

Severity levels: CRITICAL / HIGH / MEDIUM / LOW / INFO
Confidence levels: HIGH / MEDIUM / LOW / NOT MEASURABLE
Action Status values: APPLIED / PROPOSED / REJECTED / BLOCKED / NOT MEASURABLE

A single CRITICAL item outweighs ten LOW items in priority.

**Finding format for each row:**
```
Finding: [Observation]
Severity: [CRITICAL | HIGH | MEDIUM | LOW | INFO]
Confidence: [HIGH | MEDIUM | LOW | NOT MEASURABLE]
Evidence:
  - [Specific data point 1]
  - [Specific data point 2]
Action Status: [APPLIED | PROPOSED | REJECTED | BLOCKED | NOT MEASURABLE]
Reason for status: [If NOT MEASURABLE: what would be needed to measure it]
```

Example:
```
Finding: Disk I/O is likely the primary development bottleneck.
Severity: HIGH
Confidence: MEDIUM
Evidence:
  - .next/cache is 1.8 GB vs 180 MB source (10:1 ratio)
  - HMR writes to cache on every save
  - Storage type: UNKNOWN (cannot detect from this environment)
Action Status: NOT MEASURABLE
Reason: Host-level disk I/O metrics unavailable.
  Run: Get-PhysicalDisk | Select MediaType (Windows)
       cat /sys/block/sda/queue/rotational (Linux)
```

## Critical Bottlenecks (ranked)
1. [Bottleneck] — CRITICAL
2. [Bottleneck] — HIGH

## Optimization Priority
P0 — Immediate (Safe, high-impact, low-risk)
P1 — Short-term (Requires developer review)
P2 — Medium-term (Architectural changes, developer decision)
P3 — Long-term (Infrastructure / environment)

## Recommended Manual Actions
[List of Yellow/Red items requiring developer approval]

## Architecture Recommendations
[Escalations: e.g., move uploads to Supabase Storage]

## Development Environment Assessment
[Phase 13 output]

## Category Scorecard (0–10 each)
| Category | Score |
|---|---|
| Dependency Hygiene | X/10 |
| Dependency Graph Efficiency | X/10 |
| Import Efficiency | X/10 |
| Tree-Shaking | X/10 |
| Client Bundle Composition | X/10 |
| Next.js Architecture | X/10 |
| Server/Client Boundaries | X/10 |
| Cache Management | X/10 |
| Watch Boundaries | X/10 |
| TypeScript Configuration | X/10 |
| ESLint/Tooling | X/10 |
| Project Structure | X/10 |

TOTAL SCORE: X/120

## Optimization Budget Rule
Do NOT modify files for P2/P3 items when a P0 bottleneck remains unresolved.
Example: Do not restructure barrel imports (P2) while disk I/O saturation (P0) persists.
Resolve in strict priority order.
```


---

## Validation Checklist

- [ ] `spec.md` read at session start (Session Gate confirmed)
- [ ] `ARCHITECTURE.md` checked — existing perf context re-used, not re-derived
- [ ] Baseline snapshot recorded with actual measured values (no invented estimates)
- [ ] All 13 phases executed (even if some produce "no findings")
- [ ] Every finding has: Phase, Area, Severity, **Confidence**, Impact, Recommendation, **Action Status**
- [ ] `NOT MEASURABLE` findings include: what data is needed + exact commands to collect it
- [ ] Primary bottleneck explicitly named with causality model
- [ ] Hardware recommendation delivered ONLY after bottleneck confirmation (Baseline Reference, not verdict)
- [ ] No files were modified during this audit
- [ ] SaaS Safety Boundary check performed — no findings cross into RLS/Auth/Tenant scope
- [ ] Final report includes Technical Score (X/120), Optimization Priority (P0–P3), Confidence per finding
- [ ] Optimization Budget rule applied — P2/P3 not proposed while P0 unresolved
- [ ] Next recommended action explicitly stated (OPTIMIZE / DIAGNOSE / BENCHMARK)
- [ ] `ARCHITECTURE.md` "Performance context" section updated with:
      - This audit's date + git commit
      - Primary bottleneck found (if any)
      - Open risks added to the risk log

# Memory: perf-optimization-rules

Operational anchors for the Development Performance & Resource Optimization Engine. Pure diagnostic criteria, scoring rubric, causality models, and priority thresholds. No narrative.

---

## 14-Phase Execution Anchors

| Phase | Name | Workflow |
|---|---|---|
| 0 | Intent & Mode Detection | `../commands/perf.md` command (pre-workflow gate) |
| 1 | Project & Environment Discovery | `../workflows/audit-dev-perf.md` |
| 2 | Baseline Contract Establishment | `../workflows/audit-dev-perf.md` + `../workflows/benchmark-perf.md` |
| 3 | Dependency Graph Analysis | `../workflows/audit-dev-perf.md` + `dependency-optimization.md` |
| 4 | Import & Tree-Shaking Analysis | `../workflows/audit-dev-perf.md` |
| 5 | Client Bundle Composition Analysis | `../workflows/audit-dev-perf.md` + `client-server-boundaries.md` |
| 6 | Next.js Architecture Audit | `../workflows/audit-dev-perf.md` |
| 7 | Git Hygiene vs Dev Tooling Hygiene | `../workflows/audit-dev-perf.md` + `cache-storage-rules.md` |
| 8 | Watch Boundary Audit | `../workflows/audit-dev-perf.md` + `cache-storage-rules.md` |
| 9 | Cache & Storage Analysis | `../workflows/audit-dev-perf.md` + `cache-storage-rules.md` |
| 10 | TypeScript Scope Audit | `../workflows/audit-dev-perf.md` |
| 11 | ESLint & Dev Tooling Overhead | `../workflows/audit-dev-perf.md` |
| 12 | Resource Bottleneck Classification | `../workflows/diagnose-dev-bottleneck.md` |
| 13 | Development Environment Assessment | `../workflows/audit-dev-perf.md` + `../workflows/diagnose-dev-bottleneck.md` |

---

## Bottleneck Causality Models

### Model A — RAM Pressure → Disk I/O Cascade
```
RAM fills (node + IDE + browser + Docker)
  → OS pages to swap/pagefile
  → Swap lives on disk
  → All dev ops compete with page I/O
  → Result: inconsistent HMR, sluggish IDE, slow TypeScript
Fix: RAM upgrade. NVMe speeds up paging even when RAM is low.
```

### Model B — Large Dependency Graph → CPU/RAM
```
Large node_modules (heavy transitive trees)
  → Bundler traverses module graph on startup
  → TypeScript analyzes type surface across all packages
  → Result: slow cold start, slow first typecheck
Fix: Dependency hygiene. Transitive tree depth matters more than dep count.
```

### Model C — Slow Storage → Cache I/O Bottleneck
```
Next.js .next/cache read/write on every HMR
  → HDD: cache I/O becomes the bottleneck
  → SATA SSD: improved, still noticeable
  → NVMe: cache ops are near-instant
Fix: Storage upgrade. NEVER disable cache as primary fix.
```

### Model D — TypeScript Scope Too Wide
```
tsconfig include covers project root or entire filesystem
  → TypeScript analyzes generated files, .next, test fixtures
  → Language server carries same overhead → IDE slowness
Fix: Tighten include to actual source dirs only.
```

### Model E — ESLint / Tooling Overhead
```
typeChecked ESLint rules require full TSC program per lint run
  → TSC + ESLint = double type analysis
Fix: Evaluate --cache flag, scope ESLint to changed files in CI.
```

### Model F — Watch Boundary Overflow
```
uploads/, videos/, generated/ inside project tree
  → File watcher monitors thousands of non-source files
  → Cache invalidation checks on every event
  → TypeScript language server watches same scope
Fix: watchIgnore for known large static/media directories. Architectural: move to object storage.
```

---

## 120-Point Scoring Rubric

12 categories × 0–10 points each = 120 maximum.

| # | Category | 10 (Excellent) | 5 (Needs Attention) | 0 (Poor) |
|---|---|---|---|---|
| 1 | **Dependency Hygiene** | No unused/duplicate deps; correct dev/prod classification | A few orphaned deps | Many unused; classification errors |
| 2 | **Dependency Graph Efficiency** | Shallow transitive trees; no hidden heavy packages | 1-2 heavy transitive deps | Large transitive trees causing startup overhead |
| 3 | **Import Efficiency** | Direct named imports throughout | Some barrel imports | Widespread barrel imports, no tree-shaking |
| 4 | **Tree-Shaking** | All packages ESM-compatible and tree-shaken | Mixed CJS/ESM | Heavy CJS packages blocking tree-shaking |
| 5 | **Client Bundle Composition** | Only necessary code reaches browser | 1-2 suspected server leaks | DB clients / server SDKs in client bundle |
| 6 | **Next.js Architecture** | RSC/RCC boundary optimal; no excessive providers | Occasional unnecessary `use client` | Widespread `use client` propagation |
| 7 | **Server/Client Boundaries** | Clean server-only containment | Minor leaks suspected | Confirmed server packages in client bundle |
| 8 | **Cache Management** | Cache well-scoped; watch options configured | Cache slightly oversized | .next/cache >> source size; no watch tuning |
| 9 | **Watch Boundaries** | No large non-source dirs in project tree | Small media dirs present | Thousands of user uploads/videos inside tree |
| 10 | **TypeScript Configuration** | Tight include/exclude; incremental on; no generated dirs | Slightly wide scope | Wide scope analyzing node_modules or .next |
| 11 | **ESLint / Tooling** | Efficient rules; cached where possible | A few expensive rules | typeChecked on entire codebase; no caching |
| 12 | **Project Structure** | Clean separation; no uploads/backups in source | Minor structural issues | Generated, media, and source code mixed |

---

## Severity Levels

```
CRITICAL  → Directly causing significant friction; must fix before other optimizations
HIGH      → Noticeable impact; should be addressed in current sprint
MEDIUM    → Worth fixing; low urgency
LOW       → Minor; optional improvement
INFO      → Observation only; no action required
```

**Priority rule**: A single CRITICAL item outweighs ten LOW items. Address bottlenecks in order of severity, not count.

---

## Confidence Levels

Every finding must carry a Confidence level. This prevents the agent from converting an inference into a verdict.

```
HIGH         → Supported by directly measured, verified data
               (grep confirmed 0 imports, file size measured, version verified)

MEDIUM       → Supported by indirect evidence or partial data
               (import chain analysis, size ratio, symptom pattern)

LOW          → Inferred from project characteristics only; no direct measurement
               (suspected based on project type, no host metrics)

NOT MEASURABLE → The metric cannot be obtained in the current environment
               Always accompanied by: what data is needed and how to get it
```

Finding format:
```
Finding: [Observation]
Severity: [CRITICAL | HIGH | MEDIUM | LOW | INFO]
Confidence: [HIGH | MEDIUM | LOW | NOT MEASURABLE]
Evidence:
  - [Specific data point]
Action Status: [APPLIED | PROPOSED | REJECTED | BLOCKED | NOT MEASURABLE]
```

---

## Action Status Taxonomy

Every optimization finding must end with one of these statuses:

```
APPLIED          → Change was applied; DELTA recorded
PROPOSED         → Recommendation presented; awaiting developer decision
REJECTED         → Developer reviewed and decided not to apply
BLOCKED          → Cannot apply due to dependency on another unresolved issue
NOT MEASURABLE   → Cannot assess without host-level access; manual commands provided
```

`NOT MEASURABLE` is not a failure state. It is a valid status that indicates the environment limit — not a broken finding.

Example:
```
Finding: Host-level RAM pressure cannot be measured from this environment.
Severity: INFO
Confidence: NOT MEASURABLE
Action Status: NOT MEASURABLE
To measure: Run `free -h` (Linux) or `wmic os get TotalVisibleMemorySize` (Windows)
```

---

## Dual Scoring Output Format

Every audit produces both:

```
TECHNICAL SCORE: [X/120]
Overall Development Health: Excellent (≥100) / Good (80-99) / Needs Attention (60-79) / Poor (<60)

CRITICAL BOTTLENECKS (address first, regardless of score):
  1. [Bottleneck] — CRITICAL
  2. [Bottleneck] — HIGH

OPTIMIZATION PRIORITY:
  P0 — [Immediate, behavior-preserving, low-risk]
  P1 — [Requires developer review]
  P2 — [Architectural change, developer decision]
  P3 — [Environment / infrastructure]
```

---

## Optimization Budget Rule

Do NOT apply or propose changes for lower-priority items while a higher-priority bottleneck remains unresolved.

```
P0 — Critical bottleneck (e.g., Disk I/O saturation)
  ↓ Resolve first. Everything else is blocked.
P1 — High impact, low risk (e.g., large unused dependencies)
  ↓ Apply after P0 confirmed resolved or not applicable.
P2 — Medium impact (e.g., barrel import restructuring)
  ↓ Only after P0+P1 are addressed.
P3 — Nice to have (e.g., minor ESLint tuning, tidy imports)
  ↓ Only after P0+P1+P2 are addressed.
```

Example violation to avoid:
```
DO NOT: Reorder barrel imports (P2)
        while 100% Disk Active Time (P0) remains unresolved.

DO NOT: Tune ESLint config (P3)
        while a server-side secret suspected in client bundle (P0) is unconfirmed.
```

---

## Hardware Baseline Reference

> These are **Baseline References**, not diagnostic verdicts. A RAM value alone does not determine the bottleneck. The full verdict requires: Observed Memory Pressure + Paging Activity + Working Set Size + Bottleneck Confirmed in Phase 12.

**RAM Baseline Reference:**
- 8 GB → Often insufficient for Next.js + IDE + Browser + Node + Docker running simultaneously
- 16 GB → Commonly usable; may be constrained under heavy workloads
- 32 GB → Comfortable for most full-stack SaaS development workflows
- 64 GB → Useful for AI processing, video, or very large monorepos

> Example where 8GB works well: Small Next.js project + NVMe + no Docker + terminal-only IDE.
> Example where 32GB is insufficient: Large monorepo + HDD + Docker + Electron-based IDE.

**Storage Baseline Reference:**
- HDD → .next/cache R/W is usually a bottleneck; not recommended for development
- SATA SSD → Acceptable for most projects; paging overhead tolerable
- NVMe SSD → Recommended; cache I/O and paging near-instant
- Network drive / WSL on Windows → Known to cause significant watch and I/O overhead

**Measurement commands (for developer to run if environment access is limited):**
```bash
# RAM available
free -h                              # Linux/macOS
wmic os get TotalVisibleMemorySize  # Windows

# Storage type
cat /sys/block/sda/queue/rotational  # 0 = SSD, 1 = HDD (Linux)
Get-PhysicalDisk | Select MediaType  # Windows PowerShell

# Project sizes
du -sh node_modules/ .next/ .next/cache/   # Linux/macOS
# Windows: Properties dialog on each folder

# Dev startup timing
time npx next dev -- --port 3001  (stop after "Ready in Xs")

# Build timing
time next build

# TypeScript timing
time npx tsc --noEmit
```

---

## SaaS Safety Boundary (Non-Negotiable)

Performance optimization applied by the `perf` track MUST NOT weaken:

| Protected Concern | Source of Truth |
|---|---|
| Tenant Isolation model | `spec.md` |
| RLS policy coverage | `rls-patterns.md` (managed by `rls` command only) |
| RBAC / ABAC authorization | `auth-patterns.md` (managed by `auth` command only) |
| Authentication flows | `auth-patterns.md` |
| Server-side secret containment | `spec.md` |
| API security boundaries | API contracts & route handler scope |
| CSRF / XSS protections | Always preserved regardless of optimization |

If a proposed optimization crosses any of these boundaries — even if measurably faster — reclassify immediately to 🔴 Red and present as a manual architectural recommendation only.

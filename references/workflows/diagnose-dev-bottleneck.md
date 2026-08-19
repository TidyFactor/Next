# Workflow: diagnose-dev-bottleneck

One outcome: Identify **the primary bottleneck** in the development environment — RAM, CPU, Disk I/O, Dependency Graph, TypeScript scope, ESLint, or project architecture — with a causality explanation and a ranked recommendation. This workflow does NOT modify any files.

---

## Execution Steps

### Step 1 — Symptom Interview (What is Actually Slow?)

Before analyzing anything, establish exactly what the developer is experiencing. Do not assume.

Ask or infer from context:

```
What specifically is slow?
─────────────────────────
[ ] Dev server startup (cold start)
[ ] HMR rebuild after saving a file
[ ] Production build (`next build`)
[ ] TypeScript type checking (`tsc --noEmit`)
[ ] ESLint lint pass
[ ] IDE responsiveness (autocomplete, hover types)
[ ] Terminal feels sluggish
[ ] System fan is loud / system heats up
[ ] Disk activity light constantly on
[ ] High RAM usage observed in Task Manager / Activity Monitor
[ ] Everything is slow — unclear source

When does it happen?
────────────────────
[ ] Always (from a fresh start)
[ ] After running for a while (accumulates)
[ ] After adding a new dependency
[ ] After a git pull / merge
[ ] Only on this machine (works fine on another)
[ ] After a Next.js upgrade
```

If the user says "the machine is slow" or "dev is slow" with no specifics, ask these two questions first. Do not proceed with assumptions.

---

### Step 2 — Establish Minimal Baseline

Even in DIAGNOSE mode, record a minimal baseline snapshot before conclusions:

```
DIAGNOSIS BASELINE — [Date & Time]
───────────────────────────────────
Dev Startup (approximate): [X.Xs] or "Unable to measure — run: time next dev"
HMR (approximate):         [X.Xs] or "Unable to measure — save a file and observe"
node_modules Size:         [X MB]
.next/cache Size:          [X MB]
RAM visible to process:    [if measurable]
Storage type:              [NVMe | SATA SSD | HDD | Unknown]
```

If values cannot be measured programmatically, provide exact commands for the developer to run and return results from.

---

### Step 3 — Apply Bottleneck Causality Models

Using `../memory/perf-optimization-rules.md`, apply the relevant causality model based on symptoms:

#### Model A — RAM Pressure → Disk I/O Cascade
```
Symptoms: System slows over time, disk activity high, HMR inconsistent

RAM fills with:
  node processes + IDE (VS Code/Cursor) + Browser(s) + Docker + background services
          ↓
  OS starts paging (writing RAM contents to pagefile/swap)
          ↓
  Pagefile lives on disk (SSD: fast, HDD: very slow)
          ↓
  All development operations now compete with paging I/O
          ↓
  Result: Inconsistent slow HMR, slow TypeScript, sluggish IDE

Diagnosis: If RAM is the constraint, even fast NVMe helps — HDD makes it critical.
```

#### Model B — Large Dependency Graph → CPU/RAM
```
Symptoms: Slow dev startup, slow after `npm install`, HMR on first save is slow

Large node_modules (many or heavy packages)
          ↓
  More modules to resolve and analyze on startup
          ↓
  Bundler (Webpack/Turbopack) must traverse module graph
          ↓
  TypeScript must also analyze types across the graph
          ↓
  Result: Slow cold start, slow initial typecheck

Diagnosis: Check node_modules size and transitive dependency depth.
```

#### Model C — Slow Storage → Cache I/O Bottleneck
```
Symptoms: HMR slow, consistent across all operations, not related to RAM

Next.js caches aggressively to .next/cache/
          ↓
  Every HMR cycle reads/writes cache files
          ↓
  On HDD or slow SATA: disk I/O becomes the bottleneck
          ↓
  NVMe or SATA SSD dramatically improves this

Diagnosis: Check storage type. If HDD — storage upgrade is primary recommendation.
Note: Disabling caching is NOT the answer — it trades cache I/O for MORE rebuild work.
```

#### Model D — TypeScript Scope Too Wide
```
Symptoms: Slow type checking even with incremental mode

tsconfig.json `include` covers too much (e.g., entire project root)
          ↓
  TypeScript analyzes generated files, .next/, node_modules/ exceptions missed
          ↓
  More files = longer type graph = slower full typecheck
          ↓
  Also affects IDE responsiveness (language server uses same tsconfig)

Diagnosis: Inspect tsconfig include/exclude. Generated type dirs should be excluded.
```

#### Model E — ESLint / Tooling Overhead
```
Symptoms: Slow lint runs, slow pre-commit hooks, high CPU during development

TypeScript-ESLint `typeChecked` rules require full type program loaded per lint run
          ↓
  Running both TSC and ESLint separately = double type analysis
          ↓
  Heavy plugins (import/order, unused-vars across all files) on large codebases

Diagnosis: Audit eslint config for expensive rules. Consider --cache flag.
```

#### Model F — Project Architecture / Watch Boundary
```
Symptoms: Slow HMR, high disk active time even on NVMe

Large directories inside project tree being watched:
  uploads/, videos/, public/generated/, AI outputs, backups, logs
          ↓
  File watcher monitors thousands of static files for changes
          ↓
  Cache invalidation checks on every file watcher event
          ↓
  TypeScript language server also watches project scope

Diagnosis: Check project directory for large non-source directories.
```

---

### Step 4 — Classification & Primary Bottleneck Determination

After applying causality models, rank findings:

```
Primary Bottleneck: [ONE dominant cause]
Contributing Factors: [secondary causes if applicable]

Severity:
  CRITICAL — Directly degrading development to a point of significant friction
  HIGH     — Noticeable impact, should be addressed
  MEDIUM   — Worth fixing, low urgency
  LOW      — Minor, optional
  INFO     — Observation only
```

**Rule**: Do not output a list of ten LOW items and call it a diagnosis. Identify THE bottleneck.

---

### Step 5 — Hardware Assessment Output

Deliver hardware assessment ONLY after bottleneck is confirmed. This is an OUTPUT, not an optimization.

```
Development Environment Assessment
───────────────────────────────────
Detected RAM Pressure: HIGH / MEDIUM / LOW / Unknown
Detected Disk Activity: HIGH / MEDIUM / LOW / Unknown
Detected CPU Load: HIGH / MEDIUM / LOW / Unknown

Storage type detected: [NVMe | SATA SSD | HDD | Cannot determine]
```

Hardware Recommendation Matrix (only recommend after bottleneck confirmed):

| RAM Pressure | Disk I/O | Primary Action |
|---|---|---|
| HIGH | HIGH (HDD) | RAM upgrade + NVMe upgrade — both required |
| HIGH | LOW (NVMe) | RAM is the bottleneck — upgrade RAM |
| LOW | HIGH (HDD) | Storage is the primary bottleneck — upgrade to NVMe |
| LOW | LOW | Bottleneck is not hardware — check tooling/architecture |
| Unknown | Unknown | Cannot assess — provide `[commands]` to measure manually |

RAM thresholds:
- 8 GB → Insufficient for Next.js + IDE + Browser + Docker
- 16 GB → Usable, but constrained with heavy workloads
- 32 GB → Recommended for full-stack SaaS development
- 64 GB → Useful for very heavy workloads (AI/video processing)

---

### Step 6 — Diagnosis Report Output

```markdown
# Bottleneck Diagnosis — [Project Name]
Generated: [Date]

## Primary Bottleneck
[Bottleneck type] — [CRITICAL | HIGH | MEDIUM]

## Causality Model Applied
[Which model (A–F) was applied and why]

## Evidence
[Concrete observations: node_modules size, .next/cache size, storage type, symptoms]

## Contributing Factors (if any)
1. [Factor] — [Severity]
2. [Factor] — [Severity]

## Recommended Next Action
[ ] Run `perf audit` for a full 120-pt scorecard
[ ] Run `perf optimize` with `../memory/safe-optimizations-catalog.md` after audit
[ ] Fix bottleneck first before optimizing (e.g., upgrade storage before tuning next.config)

## Hardware Assessment
[Phase 5 output]

## Commands to Run for Precise Baseline
[Exact commands the developer should run to get measurable data]
```

---

## Validation Checklist

- [ ] Symptom interview completed before any analysis began (no assumptions made)
- [ ] Minimal baseline recorded or commands provided to measure manually
- [ ] At least one causality model explicitly applied and documented
- [ ] Primary bottleneck named with supporting evidence (not a generic list of issues)
- [ ] Hardware recommendation (if any) delivered AFTER bottleneck confirmed — not speculatively
- [ ] No files were modified during this diagnosis
- [ ] Report ends with a clear "Recommended Next Action"
- [ ] If host-level RAM/disk cannot be measured: explicitly stated with manual commands provided

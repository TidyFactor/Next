# Workflow: benchmark-perf

One outcome: A formal **BEFORE / CHANGE / AFTER / DELTA** measurement record for development performance metrics — with Noise Control to distinguish genuine improvement from measurement variance.

---

## When to Use This Workflow

| Trigger | Use |
|---|---|
| Before `apply-safe-perf` | Establish baseline contract |
| After `apply-safe-perf` | Record DELTA and confirm improvement |
| After a Next.js upgrade | Verify performance regression/improvement |
| After adding a large dependency | Check startup impact |
| When developer reports a change made things slower | Isolate which change caused regression |
| Periodic health check | Track performance over time |

---

## Execution Steps

### Step 1 — Identify What to Benchmark

Select from the available metrics based on what the developer wants to measure:

| Metric | Command to Run | What It Measures |
|---|---|---|
| Dev startup time | `time npx next dev -- --port 3001` (stop after "Ready") | Cold start + module loading |
| Production build time | `time next build` | Full production compilation |
| TypeScript check time | `time npx tsc --noEmit` | Type analysis across entire project |
| ESLint time | `time npx eslint . --max-warnings 0` | Full lint pass |
| HMR rebuild time | Save a mid-sized component, observe HMR output | Hot Module Replacement speed |
| Test suite time | `time npm test` | Test runner duration |

**If the developer's environment does not allow running commands from this context**, output the exact commands with instructions. Never invent timing values.

---

### Step 2 — Pre-Benchmark Snapshot

Before any measurements, record the current state:

```
BENCHMARK SESSION — [Date & Time]
──────────────────────────────────
Session Type:          BEFORE | AFTER | REGRESSION CHECK | PERIODIC
Project:               [name]
Next.js version:       [X.X.X]
Node.js version:       [X.X.X]
Bundler:               Turbopack | Webpack

Disk sizes:
  node_modules:        [X MB]
  .next (total):       [X MB]
  .next/cache:         [X MB]
```

---

### Step 3 — Noise Control & Measurement Protocol

**Why single-run measurements are unreliable:**

```
A change from 4.8s → 4.3s does NOT necessarily mean improvement.

Common sources of measurement noise:
  OS file cache      → second run faster because OS cached pages from first run
  Filesystem cache   → .next/cache already loaded in OS buffer
  Warm Node process  → JIT-compiled code already warmed
  Warm .next/cache   → prior build artifacts already in place
  Background process → antivirus, indexer, Docker, IDE extensions running
  CPU scheduling     → OS assigned less CPU slice on one run
  Network activity   → npm registry check, telemetry, background sync
```

**Cold Run definition:**
```
- .next/cache cleared before each run
- Node process freshly started
- No prior build artifacts
- OS disk cache cleared where possible
- All background-intensive processes paused if feasible
```

**Warm Run definition:**
```
- .next/cache exists from a prior build
- Node module cache warm
- OS has already cached relevant files
- Represents realistic "subsequent restart" experience
```

**Measurement protocol:** Run each metric 3 times, record ALL values and the median. The median is the only value used for DELTA comparison — not min, not max.

```
Noise Threshold Rule:
  If Max – Min > 20% of Median:
    → Measurement environment is too noisy
    → Pause background processes and repeat
    → Note high variance in the report
    → Do NOT claim a DELTA unless it exceeds the noise range

Minimum significant DELTA:
  A DELTA is only reportable if it exceeds twice the measurement noise floor.
  Example: if runs vary by ±0.4s, a reported DELTA of 0.3s is within noise; do NOT claim improvement.
```

---

### Step 3a — Cold Run Measurements

Clear `.next/cache` before the first run of each session. Run each metric 3 times:

```
COLD RUN SESSION
────────────────
.next/cache cleared before each run

DEV STARTUP (cold)
──────────────────
Run 1:   [X.Xs]
Run 2:   [X.Xs]
Run 3:   [X.Xs]
Median:  [X.Xs]  ← used for DELTA
Variance: [X.Xs] (Max - Min)

PRODUCTION BUILD (cold)
───────────────────────
Run 1:   [Xs]
Run 2:   [Xs]
Run 3:   [Xs]
Median:  [Xs]
Variance: [Xs]

TYPECHECK (cold — delete tsbuildinfo before each run)
──────────────────────────────────────────────────────
Run 1:   [X.Xs]
Run 2:   [X.Xs]
Run 3:   [X.Xs]
Median:  [X.Xs]
Variance: [X.Xs]

ESLINT (cold)
─────────────
Run 1:   [X.Xs]
Run 2:   [X.Xs]
Run 3:   [X.Xs]
Median:  [X.Xs]
Variance: [X.Xs]
```

---

### Step 3b — Warm Run Measurements (Optional, for realistic daily-use baseline)

Run without clearing cache — represents the developer's actual day-to-day experience:

```
WARM RUN SESSION
────────────────
.next/cache present from prior build

DEV STARTUP (warm)
──────────────────
Run 1:   [X.Xs]
Run 2:   [X.Xs]
Run 3:   [X.Xs]
Median:  [X.Xs]
Variance: [X.Xs]
```

Note cold vs warm difference in the report. Warm runs reflect developer experience; cold runs reflect worst-case / CI behavior.


### Step 4 — Environment Notes

Record any relevant environment conditions that could affect measurements:

```
Environment Notes:
- Background processes: [IDE, browser tabs, Docker, etc.]
- Disk active at start: [Yes / No / Unknown]
- RAM available at start: [X GB / Unknown]
- Antivirus scan: [running / not running / unknown]
- Warm cache: [Yes (prior build existed) / No (fresh)]
```

Warm vs cold cache significantly affects startup time. Note which condition applies.

---

### Step 5 — BEFORE/AFTER Comparison Table (When Used Post-Optimization)

When this workflow is run after `apply-safe-perf`, produce the full DELTA table:

```
PERFORMANCE DELTA REPORT
─────────────────────────────────────────────────────────────────
Metric                  BEFORE     AFTER      DELTA      % Change
─────────────────────────────────────────────────────────────────
Dev startup (median)    4.8s       3.2s       -1.6s      -33%
Production build        31s        27s        -4s        -13%
TypeScript check        8.1s       5.9s       -2.2s      -27%
ESLint pass             12.3s      11.8s      -0.5s      -4%
node_modules            847 MB     791 MB     -56 MB     -7%
.next/cache             1.8 GB     1.4 GB     -400 MB    -22%
─────────────────────────────────────────────────────────────────
Changes applied:
  1. tsconfig scope correction → TypeScript check -27%
  2. watchIgnore boundary → Dev startup -33% (HMR impact)
  3. Removed 2 unused dependencies → node_modules -56 MB
  4. optimizePackageImports: ['lucide-react'] → Build -13%
─────────────────────────────────────────────────────────────────
```

**Document neutral or negative results honestly:**
```
ESLint pass:   -0.5s (-4%) — Negligible improvement. No ESLint changes were made.
HMR rebuild:   No measurable change — storage type remains SATA SSD (NVMe would help more).
```

---

### Step 6 — Regression Detection (When Used After a Dependency or Config Change)

If benchmarking to detect a regression:

```
REGRESSION CHECK
─────────────────
Metric           BEFORE CHANGE    AFTER CHANGE     DELTA       Status
──────────────────────────────────────────────────────────────────────
Dev startup      3.2s             6.8s             +3.6s       ⚠ REGRESSION
Build time       27s              29s              +2s         ⚠ MINOR REGRESSION
TypeScript       5.9s             5.8s             -0.1s       ✓ No regression
──────────────────────────────────────────────────────────────────────

Likely cause:
The dependency added in the last commit (`heavy-library`) has a large transitive
dependency tree (+234 packages). This is the probable cause of the dev startup regression.

Recommendation:
Run: `perf audit` → Phase 3 (Dependency Graph Analysis) to confirm.
```

---

## Validation Checklist

- [ ] Session type explicitly stated (BEFORE / AFTER / REGRESSION / PERIODIC)
- [ ] All measurements run 3 times with median recorded (not single runs)
- [ ] Environment notes recorded (warm/cold cache, background processes)
- [ ] disk sizes snapshot taken at start of session
- [ ] If AFTER session: full BEFORE/AFTER/DELTA table produced
- [ ] Neutral and negative results documented honestly (no suppression of unfavorable results)
- [ ] If regression detected: likely cause identified and next action specified
- [ ] No files modified during benchmarking

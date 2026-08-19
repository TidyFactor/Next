# Workflow: apply-safe-perf

One outcome: Apply **only Green-tier optimizations** from `../memory/safe-optimizations-catalog.md`, with a mandatory BEFORE / CHANGE / AFTER / DELTA record for every modification, followed by a 10-step validation protocol.

---

## Pre-Execution Requirements

Before any file is touched, all three conditions must be met:

1. **Audit exists**: A completed `audit-dev-perf.md` run exists for this project (with baseline snapshot).
2. **Bottleneck identified**: The primary bottleneck has been diagnosed. Do not optimize speculatively.
3. **Green tier only**: Every proposed change is explicitly classified as 🟢 Green in `../memory/safe-optimizations-catalog.md`. Yellow items require explicit developer approval before proceeding.

If any condition is unmet, stop and route to the appropriate prior workflow.

---

## Baseline Contract (Enforced Before First Change)

Load the existing baseline from the last audit. If no baseline exists, establish one now:

```
OPTIMIZATION BASELINE — [Date & Time]
──────────────────────────────────────
Dev Startup Time:      [X.Xs]  (run: time npx next dev -- --port 3001, then Ctrl+C)
Production Build:      [Xs]    (run: time next build)
TypeScript Check:      [X.Xs]  (run: time npx tsc --noEmit)
ESLint Pass:           [X.Xs]  (run: time npx eslint . --max-warnings 0)
HMR Rebuild:           [X.Xs]  (save any component file and observe)
node_modules Size:     [X MB]
.next Total:           [X MB]
.next/cache:           [X MB]
```

**The skill CANNOT claim "performance improved" without concrete DELTA values.**

---

## Execution Steps

### Step 1 — Build the Safe Change Plan

From the audit findings, list only Green-tier items:

```
SAFE CHANGE PLAN
────────────────
Change 1: [Description]
  Classification: 🟢 Green
  File: [path]
  Reason: [why it is safe]
  Expected Benefit: [specific measurable expectation]
  Risk: [minimal — state explicitly]

Change 2: ...
```

Present this plan before applying any changes. Allow the developer to remove items.

---

### Step 2 — Apply Changes One at a Time

For each Green-tier change, execute the BEFORE / CHANGE / AFTER / DELTA protocol:

```
─────────────────────────────────────
CHANGE: [Description]
─────────────────────────────────────
File:    [path/to/file]
BEFORE:
  [relevant lines or config before change]

AFTER:
  [relevant lines or config after change]

Reason: [why this is safe and beneficial]
Expected: [what metric should improve]
```

**Examples of valid Green-tier changes:**

#### Example A — Verified Unused Dependency Removal
```
BEFORE: package.json contains "some-package": "^1.2.3"
VERIFY: grep -r "some-package" src/ app/ components/ → 0 results
VERIFY: grep -r "some-package" pages/ lib/ hooks/ → 0 results
AFTER: Remove from package.json dependencies, run install
REASON: Zero usage confirmed in source code
EXPECTED: Reduced node_modules size, faster dependency resolution
```

#### Example B — devDependency Classification Correction
```
BEFORE: "eslint": "^8.57.0" in dependencies
VERIFY: ESLint is only used at development time, not imported in app code
AFTER: Move to devDependencies
REASON: Reduces production dependency surface
EXPECTED: Cleaner dependency graph
```

#### Example C — TypeScript Scope Correction
```
BEFORE: tsconfig.json include: ["**/*"]
AFTER:  tsconfig.json include: ["app/**/*", "components/**/*", "lib/**/*", "types/**/*"]
        tsconfig.json exclude: [".next", "node_modules", "dist", "supabase/functions"]
REASON: Eliminates TypeScript analysis of generated and cache directories
EXPECTED: Faster typecheck (measure DELTA)
```

#### Example D — .gitignore / watchIgnore Boundary Fix
```
BEFORE: public/uploads/ not in watchOptions.ignored
AFTER:  next.config.js watchOptions: { ignored: ['**/public/uploads/**', '**/public/videos/**'] }
REASON: Prevents file watcher from tracking thousands of user-uploaded files
EXPECTED: Faster HMR, lower Disk I/O during development
```

#### Example E — Evidence-Based optimizePackageImports (Yellow — requires approval)

> **This is a Yellow item.** Present for developer approval before applying.

```
DETECT:   lucide-react is imported in 14 components
INSPECT:  import { Check, X, ChevronDown } from 'lucide-react' (named imports)
CHECK:    lucide-react is a barrel-exporting package with 1000+ icons
EVALUATE: Next.js optimizePackageImports intercepts these imports at build level
DECISION: Present recommendation, await developer confirmation
APPLY IF APPROVED:
  next.config.js: experimental: { optimizePackageImports: ['lucide-react'] }
BENCHMARK: Measure dev startup DELTA after applying
```

---

### Step 3 — Resolve Dependencies

After all changes are applied:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install
```

Verify lockfile is consistent and no peer dependency warnings appeared.

---

### Step 4 — 10-Step Validation Protocol

Execute every step. If any step fails, identify the cause, revert the specific change that broke it, and do not leave the project in a broken state.

```
Step 1:  npm install / pnpm install → Dependencies resolve cleanly
Step 2:  npx tsc --noEmit → TypeScript compiles with zero new errors
Step 3:  npx eslint . → Lint passes with zero new errors
Step 4:  npm test / pnpm test → Test suite passes (if tests exist)
Step 5:  next build → Production build completes successfully
Step 6:  next dev → Dev server starts and becomes ready
Step 7:  Navigate to 3 key routes → Pages render correctly
Step 8:  Test auth flow (login, logout, session) → Authentication unchanged
Step 9:  Verify a tenant-scoped request → Tenant isolation intact [CRITICAL for SaaS]
Step 10: Record AFTER baseline → Calculate DELTA for all tracked metrics
```

**Step 9 is non-negotiable.** Even a trivial optimization must not weaken tenant isolation.

---

### Step 5 — DELTA Report

Document the measured improvement for each changed metric:

```
OPTIMIZATION RESULTS — [Date & Time]
──────────────────────────────────────
Metric               BEFORE     AFTER      DELTA
─────────────────────────────────────────────────
Dev Startup          4.8s       3.2s       -1.6s  (-33%)
TypeScript Check     8.1s       5.9s       -2.2s  (-27%)
Production Build     31s        27s        -4s    (-13%)
.next/cache          1.8 GB     1.4 GB     -400MB (-22%)
node_modules         847 MB     791 MB     -56 MB (-7%)
──────────────────────────────────────────────────
Summary: Primary gain from TypeScript scope correction + watchIgnore boundary fix.
```

If no measurable improvement is detected for a change, document that too. Do not suppress neutral or negative results.

---

## Changes That Were NOT Applied (Yellow / Red)

List any items from the audit that were not applied in this run and why:

```
Item: optimizePackageImports for date-fns
Classification: 🟡 Yellow — requires developer review
Reason: date-fns has complex tree-shaking behavior; needs testing in project context
Action required: Developer to evaluate and approve

Item: Convert <DashboardProvider> from Client to Server Component
Classification: 🟡 Yellow — requires developer review
Reason: Component accesses useContext hooks; conversion non-trivial
Action required: Developer architecture review
```

---

## Validation Checklist

- [ ] Audit baseline existed before any changes were made
- [ ] Change plan presented before execution (no surprise modifications)
- [ ] Every change documented with BEFORE / AFTER / REASON / EXPECTED BENEFIT
- [ ] Unused dependency removals verified with grep/import scan before removal
- [ ] `optimizePackageImports` applied only with evidence of applicable import pattern (Yellow — developer approved)
- [ ] All 10 validation steps completed and results recorded
- [ ] Step 9 (tenant isolation check) explicitly confirmed as passed
- [ ] DELTA table produced with actual measured values
- [ ] Neutral or negative deltas documented honestly
- [ ] Yellow / Red items listed with required actions for developer
- [ ] Project left in fully working, compilable, and tested state

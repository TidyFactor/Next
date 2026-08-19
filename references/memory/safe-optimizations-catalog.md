# Memory: safe-optimizations-catalog

Classification taxonomy for all performance optimizations. Used by `../workflows/apply-safe-perf.md` to determine what the agent can apply directly, what requires developer approval, and what is permanently forbidden from automated application.

---

## 🟢 Green — Apply Automatically (Behavior-Preserving, Low-Risk)

These changes preserve all existing behavior, public APIs, routing, database schema, authentication, RLS, and tenant isolation. No developer approval required. Document every change with BEFORE/AFTER/DELTA.

| Optimization | Condition to Apply | Expected Benefit |
|---|---|---|
| **Remove verified unused dependency** | grep/import scan confirms zero usage in all source files | Reduced node_modules size; faster dep resolution |
| **Correct dep → devDep classification** | Dependency only used in build scripts / config / test files, not imported in app code | Cleaner production dependency surface |
| **TypeScript `include` scope correction** | Tighten to actual source directories only | Faster typecheck; lighter language server |
| **TypeScript `exclude` scope addition** | Exclude `.next/`, `node_modules/`, generated type dirs, migration snapshots | Eliminates unnecessary file analysis |
| **TypeScript `incremental: true`** | Not already set; `tsbuildinfo` output configured | Faster subsequent typechecks |
| **`tsconfig.tsbuildinfo` location correction** | Move to project root or `.next/` if not already there | Avoids TypeScript re-analyzing unchanged files |
| **`.gitignore` additions** | Generated artifacts, build output, editor caches not already ignored | Cleaner git status; no accidental commits |
| **`next.config` watchOptions.ignored** | Large non-source directories confirmed in project tree (uploads/, backups/, logs/) | Reduces file watcher event volume; lower HMR I/O |
| **Verified duplicate import cleanup** | Exact duplicate import of same symbol in same file | No behavior change; cleaner module graph |
| **ESLint `--cache` flag addition** | Not already in lint script | Faster lint runs on subsequent passes |

---

## 🟡 Yellow — Apply with Explicit Developer Approval

These are generally safe in most Next.js projects but carry a meaningful (not theoretical) risk of behavior change in specific contexts. Present the evidence, explain the risk, and await developer confirmation before applying.

| Optimization | Risk Reason | Evidence Required Before Proposing |
|---|---|---|
| **`optimizePackageImports` for a package** | Not all packages benefit; behavior depends on package internals and import patterns. Some packages with side effects break. | 1) Package uses barrel exports, 2) Package is imported in multiple files, 3) Check package README for known issues |
| **Barrel import restructuring** | Changing from barrel to direct imports can affect module execution order and side effects | Confirm no side-effect dependencies on barrel import order |
| **Client Component → Server Component conversion** | Requires removing hooks, browser APIs, event handlers — non-trivial | Audit component's API surface; classify risk first |
| **Provider hierarchy relocation** | Moving providers can break context access in child components | Map provider → consumer dependencies before changing |
| **Dynamic import introduction** | May change component hydration behavior; affects bundle splitting | Confirm component is not needed for critical path rendering |
| **Package replacement proposal** | New package has different API; requires code changes | Propose only; never apply replacement automatically |
| **`next.config` `outputFileTracingExcludes`** | Incorrect patterns can break deployment traces | Verify which files are truly safe to exclude |

**Evidence Required Pipeline for Every Yellow Item:**

Before a Yellow item can be proposed to the developer, it must pass through this pipeline:

```
Step 1 — OBSERVATION
  What was observed in the project?
  (e.g., "lucide-react imported in 14 files")

Step 2 — EVIDENCE COLLECTION
  What specific data supports this as an optimization opportunity?
  Evidence types:
    - Import pattern confirmed (barrel vs. direct)
    - File/usage count measured
    - Package characteristics inspected (ESM/CJS, barrel, known issues)
    - Before benchmark exists
    - Current behavior baseline recorded

Step 3 — RISK ASSESSMENT
  What is the specific failure scenario?
  (e.g., "packages with initialization side effects may break")

Step 4 — RECOMMENDATION
  Present with all evidence collected:
    Observation:  [what was found]
    Evidence:     [specific data points]
    Risk:         [specific scenario where it could fail]
    Confidence:   [HIGH | MEDIUM | LOW]
    Expected:     [measurable improvement estimate]

Step 5 — APPROVAL
  "Would you like to apply this? I'll test with the 10-step validation protocol."

Step 6 — APPLY (only if approved)

Step 7 — BENCHMARK
  Record DELTA vs baseline. Confirm positive improvement.

Step 8 — VALIDATE
  All 10 validation steps including tenant isolation check.
```

**Example — `optimizePackageImports` for lucide-react:**
```
Observation:  lucide-react imported in 14 components
Evidence:
  - Import pattern: barrel (import { Check, X, ChevronDown } from 'lucide-react')
  - Package type: barrel-exporting (1000+ icons in single index)
  - Next.js supports optimizePackageImports for this package
  - Dev startup baseline recorded: 4.8s
Confidence:   MEDIUM (optimization benefit expected but not yet benchmarked)
Risk:         Icon packages with side-effect initialization could behave differently
Expected:     Reduced module graph; estimated dev startup improvement

Decision: RECOMMENDED — pending developer approval and benchmark confirmation
```

Pattern matched → Modify file is FORBIDDEN for Yellow items.


---

## 🔴 Red — Forbidden from Automated Application

These changes require a separate architectural decision involving the full development team. The `perf` track will NEVER apply these, regardless of potential performance benefit.

| Forbidden Change | Why It Is Forbidden |
|---|---|
| **Database schema modifications** | Migrations are irreversible; affects all tenants |
| **RLS policy changes** | Tenant data security boundary — managed by `rls` command only |
| **Auth / RBAC / ABAC changes** | Session and access control — managed by `auth` command only |
| **Tenant isolation model changes** | Core SaaS architecture — managed by `tenant` command only |
| **Service-role key exposure** | Bypasses all RLS; forbidden per `spec.md` |
| **Client → direct Supabase bypass** | Even if faster, violates tenant isolation architecture |
| **Next.js major version upgrade** | Can break App Router APIs, Server Actions, streaming behavior |
| **React major version upgrade** | Can break hooks, Suspense, RSC behavior |
| **Node.js major version upgrade** | Affects runtime APIs, native modules, CI compatibility |
| **Webpack → Turbopack migration** | Can break custom loaders, plugins, source maps |
| **Turbopack → Webpack migration** | Same; architectural bundler decision |
| **Disabling `.next/cache` globally** | Trades cache I/O for more rebuild CPU work; always net negative |
| **Removing TypeScript** | Not a performance optimization |
| **Removing ESLint** | Not a performance optimization |
| **Removing test infrastructure** | Not a performance optimization |
| **Large component rewrites** | Scope creep; outside `perf` track |
| **Changing API route handler architecture** | Route contract changes — managed by `api` command |
| **Removing Suspense boundaries** | May affect streaming, loading UI, or data fetching strategy |

---

## SaaS Safety Boundary Enforcement

Before any Yellow item is presented or any Green item is applied, verify:

```
Does this change affect any of the following?
  [ ] Tenant data isolation
  [ ] RLS enforcement
  [ ] RBAC / role-based access
  [ ] Authentication state or session handling
  [ ] Server-side secrets / service-role key handling
  [ ] API authorization middleware
  [ ] CSRF / XSS protection headers

If YES to any → Reclassify to 🔴 Red immediately.
Present as: "Manual Architectural Recommendation — Requires Security Review"
```

---

## Classification Decision Tree

```
Is it in the Green catalog?
  YES → Verify condition is met → Apply → Document BEFORE/AFTER/DELTA
  NO ↓

Is it in the Yellow catalog?
  YES → Gather evidence → Present with risk explanation → Await approval → Apply if approved → 10-step validation
  NO ↓

Is it in the Red catalog?
  YES → Present as manual recommendation only → Never apply automatically
  NO ↓

New optimization not in catalog:
  → Apply SaaS Safety Boundary check first
  → If passes: treat as Yellow (developer approval required)
  → If fails: treat as Red
```

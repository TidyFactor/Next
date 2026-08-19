# Command: perf

Runtime dispatcher for Development Performance & Resource Optimization — bottleneck diagnosis, evidence-based safe optimization, and formal benchmarking for Next.js SaaS projects.

---

## Session Gate (Before ANY Phase)

> **Read `../memory/spec.md` once per session before this command does any work.**
> It is the canonical rule set every command in this track enforces.
> The `perf` command is subordinate to the SaaS architecture contract defined there.
> Do not silently deviate from it — if an optimization seems to require deviation, surface it explicitly.

**Then read the project's `ARCHITECTURE.md` (generated from `references/architecture-doc-skeleton.md`):**

```
Does ARCHITECTURE.md exist?
  ├── YES → Read the "Performance context" section:
  │     - Known bottlenecks (pre-existing diagnosis)
  │     - Storage strategy (project filesystem vs. Supabase Storage / S3)
  │     - Active perf baseline (link to last audit, if any)
  │     - Last perf audit date + git commit
  │   → Skip re-discovery work already documented there
  │   → Use last audit as baseline if it exists and is current
  │
  └── NO  → Proceed, but note:
            "ARCHITECTURE.md not found. Running full discovery (Phase 1).
             Consider running `init` to scaffold it after this audit."
```

**If `ARCHITECTURE.md` has unfilled `<placeholder>` fields in the perf context section:**
Do not silently assume. State the gap and ask the developer to fill it before proceeding with optimization (not before auditing — a read-only audit can proceed without it).

---

## Phase 0 — Intent & Mode Detection (MANDATORY SECOND GATE)

**Before any analysis, identify the mode from the user's request:**

| User Intent | Detected Mode | Workflow to Load |
|---|---|---|
| "perf audit", "audit performance", "audit dev performance", "تدقيق الأداء" | `AUDIT` | `../workflows/audit-dev-perf.md` |
| "what is slow", "why is dev server slow", "diagnose bottleneck", "بطيء", "ما المشكلة" | `DIAGNOSE` | `../workflows/diagnose-dev-bottleneck.md` |
| "apply safe perf", "optimize imports", "optimize deps", "clean up packages", "طبّق التحسينات" | `OPTIMIZE` | `../workflows/apply-safe-perf.md` |
| "benchmark build", "measure startup", "measure HMR", "time the build", "قياس الأداء" | `BENCHMARK` | `../workflows/benchmark-perf.md` |
| "show perf report", "perf status", "last audit results", "تقرير الأداء" | `REPORT` | See Report Mode below |

**Critical rule enforced by this command:**
```
audit ≠ optimize

If the user says "the machine is slow" or "dev is slow":
→ Do NOT start modifying next.config.js
→ Start with DIAGNOSE mode:
   What is slow?
   When is it slow?
   - Dev server startup?
   - HMR rebuild?
   - Production build?
   - Type checking?
   - Linting?
   - IDE responsiveness?
   - Disk active time?
   - RAM pressure?
```

---

## Report Mode — Staleness Check

When mode is `REPORT`, do NOT blindly show a cached result:

```
Existing audit report found?
  ├── YES → Inspect:
  │     - Audit Timestamp vs current date
  │     - Git commit at audit time vs current HEAD (if git available)
  │     - Working tree dirty? (uncommitted changes since audit?)
  │     - node_modules changed? (lockfile modified after audit?)
  │   ─────────────────────────────────────────────────
  │   If report is < 24h old AND no significant project state change:
  │     → Present existing report with staleness label: [CURRENT]
  │   If report is stale OR project state changed:
  │     → State: "Report is stale. Running lightweight audit."
  │     → Run Phase 1–3 of audit-dev-perf.md (discovery + baseline + dep graph only)
  │
  └── NO  → State: "No existing audit found. Running lightweight audit."
            → Run Phase 1–3 of audit-dev-perf.md
```

**Every report output must include a header:**
```
Audit Report — [Project Name]
Generated:   [ISO timestamp]
Git Commit:  [SHA] or "git not available"
Tree State:  Clean / Dirty (X uncommitted changes)
Status:      CURRENT | STALE | PARTIAL (lightweight)
```

---

## What It Loads

**Always loaded with this command:**
- `../memory/perf-optimization-rules.md` — 14-phase diagnostic anchors, bottleneck models, 120-pt scoring rubric
- `../memory/safe-optimizations-catalog.md` — Green / Yellow / Red taxonomy + SaaS Safety Boundary

**Loaded based on mode:**
- `AUDIT` / `DIAGNOSE`: also load `../memory/dependency-optimization.md` + `../memory/client-server-boundaries.md` + `../memory/cache-storage-rules.md`
- `OPTIMIZE`: also load `../memory/dependency-optimization.md` + `../memory/cache-storage-rules.md`
- `BENCHMARK`: no additional memory files

---

## What It Does NOT Load

- Do NOT load `../memory/rls-patterns.md` (RLS authoring is strictly `rls` command scope).
- Do NOT load `../memory/auth-patterns.md` (authentication is strictly `auth` command scope).
- Do NOT load `../memory/spec.md` unless a SaaS Safety Boundary check is needed (then read the boundary rules only, not the full tenant lifecycle spec).
- Do NOT route `perf` to the `rls`, `auth`, or `tenant` commands. Performance optimization operates entirely within project tooling and dependency scope — it does not modify security, RLS, or tenant architecture.

---

## SaaS Safety Boundary (Non-Negotiable)

Before any optimization is applied, verify it does not touch:
- Tenant Isolation model
- RLS policies
- RBAC / ABAC authorization
- Authentication flows
- Server-side secrets containment
- API security boundaries
- CSRF / XSS protections

If a proposed optimization crosses this boundary, it is immediately reclassified to 🔴 Red and presented as a manual architectural recommendation only.

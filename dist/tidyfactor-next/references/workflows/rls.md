# Workflow: rls

One outcome: RLS policies written (or leak diagnosed) for a specific table or
set of tables, using the templates in `../memory/rls-patterns.md` — not a
freeform policy design each time.

## Steps

1. **Classify the table**: tenant-scoped (Pattern 1/2), service-role
   administrative path (Pattern 3), or intentionally shared/reference
   (Pattern 4). Get this classification right before writing any SQL — it's
   the branch point for everything else.

2. **Generate policies** from the matching pattern in `../memory/rls-patterns.md`.
   Adapt column/table names only — don't redesign the pattern per table
   unless the table has a genuinely different access shape (e.g. a
   many-to-many join table needs policies on the join, not just the parents).

3. **Run the coverage audit** (for "audit RLS coverage" / periodic checks):
   ```sql
   select schemaname, tablename, rowsecurity
   from pg_tables
   where schemaname = 'public'
     and rowsecurity = false;
   -- any tenant-scoped table appearing here is a defect
   ```
   ```sql
   select tablename, count(*) as policy_count
   from pg_policies
   where schemaname = 'public'
   group by tablename
   having count(*) = 0;
   -- tables with RLS enabled but zero policies deny all access by default —
   -- flag as likely-broken-feature rather than assuming it's intentional
   ```

4. **Leak diagnosis** (for "why is tenant A seeing tenant B's data"):
   - Check policy existence first via the audit queries above.
   - Check for service-role usage on the code path — the #1 real cause once
     policies exist and look correct.
   - Check for a cache key that omits tenant_id (data cached under a
     tenant-agnostic key and served cross-tenant).
   - Check signed URLs / storage paths for tenant scoping (see `storage`
     command once built) — a common leak vector policies alone don't cover.

## Validation checklist
(same as the RLS testing checklist in `../memory/rls-patterns.md` — don't
duplicate criteria, just confirm every item there before closing out)

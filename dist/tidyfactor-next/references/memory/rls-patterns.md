# RLS Pattern Library

Operational patterns for the `rls` command. Templates, not narrative.

## Pattern 1 — Standard tenant-scoped table

```sql
alter table public.<table> enable row level security;

create policy "<table>_tenant_isolation_select"
  on public.<table> for select
  using (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

create policy "<table>_tenant_isolation_insert"
  on public.<table> for insert
  with check (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

create policy "<table>_tenant_isolation_update"
  on public.<table> for update
  using (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
  with check (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

create policy "<table>_tenant_isolation_delete"
  on public.<table> for delete
  using (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

Four separate policies, not one `for all` — `for all` policies are harder to
audit individually and easier to accidentally over-permission on one operation
while writing another.

## Pattern 2 — Role-scoped access within a tenant (RBAC on top of RLS)

```sql
create policy "<table>_admin_full_access"
  on public.<table> for all
  using (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    and (auth.jwt() ->> 'role') = 'admin'
  )
  with check (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    and (auth.jwt() ->> 'role') = 'admin'
  );
```

Tenant check and role check are ANDed, never role-only — a role check alone
would authorize an admin of tenant A to act on tenant B's rows if the role
claim were somehow shared or misconfigured.

## Pattern 3 — Service-role administrative path (use sparingly, see spec.md)

Service-role clients bypass RLS entirely by design. Any code using the
service-role key MUST re-implement the tenant check explicitly in application
code before it touches data, since Postgres will not do it. This is the one
place app-layer filtering is load-bearing, not optional — flag any
service-role query missing an explicit `.eq('tenant_id', ctx.tenantId)` (or
equivalent) as a defect, not a style issue.

## Pattern 4 — Cross-tenant tables that intentionally have no tenant_id

Reference/lookup tables (e.g. `plans`, `countries`) are shared across tenants
by design. Document this explicitly in the table comment
(`comment on table public.plans is 'shared reference data, not tenant-scoped';`)
so a future migration author doesn't "fix" a missing tenant_id that was never
supposed to exist.

## RLS testing checklist (used by `rls` command's validation step)

- [ ] Every tenant-scoped table has RLS enabled (`pg_tables` / `pg_policies`
      audit query provided in `../workflows/rls.md`)
- [ ] At least one policy exists per CRUD operation the table supports
- [ ] A test authenticated as tenant A cannot select/update/delete tenant B's
      row by primary key (the #1 real-world leak: guessing/enumerating IDs)
- [ ] A test authenticated with no tenant claim gets zero rows, not an error
      that leaks row existence
- [ ] Service-role paths have an explicit application-layer tenant filter

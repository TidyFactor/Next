# Workflow: tenant

One outcome: tenant resolution + context + lifecycle wired end-to-end for the
strategy already locked in ARCHITECTURE.md. Does not touch RLS policy content
(that's the `rls` command) — this workflow assumes RLS exists and focuses on
getting the correct `tenant_id` into every request in the first place.

## Steps

1. **Read ARCHITECTURE.md** — do not ask the resolution-strategy question
   again if it's already answered there.

2. **Edge resolution** (middleware, single entry point):
   - Subdomain/custom-domain: resolve `tenant_id` from host header against
     the `tenants` table (cache this lookup — see `perf` command later for
     the caching strategy once it exists; for now, keep the cache tenant-id
     keyed, never a bare route key).
   - Session-claim strategy: read `tenant_id` from the Supabase Auth JWT
     custom claim, set at tenant-membership time.
   - On failure to resolve: fail closed (404/403), never fall through to an
     unscoped or "default" tenant.

3. **Context propagation**:
   - Server Components / Server Actions / Route Handlers read tenant context
     from the single resolved source (e.g. a `getTenantContext()` server-only
     helper reading the request's resolved value) — no independent
     re-derivation logic scattered across files.
   - Client components never resolve tenant identity themselves; they receive
     it from the server.

4. **Tenant lifecycle**:
   - Create: transactionally creates the tenant row + owner membership +
     any default resources, so no tenant exists without an owner.
   - Suspend: a status flag checked at the RLS layer or edge resolution
     (decide which, document in ARCHITECTURE.md ADR log) — suspended tenants
     must not be able to bypass suspension via a code path that skips the
     check.
   - Delete: soft-delete by default (data retention/compliance); document
     the hard-delete path separately since it's a cross-tenant-adjacent,
     higher-risk operation per spec.md's cross-tenant review rule.

## Validation checklist

- [ ] Tenant resolution has exactly one implementation, not one per route
- [ ] Resolution failure fails closed, never defaults to a tenant
- [ ] Client code never independently determines tenant identity
- [ ] Tenant creation is transactional (no orphaned tenant-without-owner state)
- [ ] Suspension is enforced at a layer that can't be bypassed by adding a
      new route that forgets to check it (prefer RLS/DB-level over
      per-route application checks)

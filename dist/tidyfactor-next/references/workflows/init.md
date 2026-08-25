# Workflow: init

One outcome: a scaffolded project + a filled `ARCHITECTURE.md`. Nothing else.

## Steps

1. **Interview** (ask, don't assume — these are the "chosen once" fields in
   `../architecture-doc-skeleton.md`):
   - Data/query layer: Supabase JS client / Drizzle / Prisma
   - Tenant resolution strategy: subdomain / custom domain / path prefix / session claim
   - Auth provider + methods
   - Role model: fixed roles vs custom RBAC vs ABAC
   - Deployment target and environment mapping

2. **Scaffold the project**:
   - `create-next-app` with App Router, TypeScript strict, no `src/` ambiguity
     — pick one convention and state it in ARCHITECTURE.md.
   - Install and configure the chosen query layer only (don't install all
     three "just in case").
   - Supabase project wiring: env vars for anon key (client-safe) and
     service-role key (server-only, document explicitly where it's allowed
     to be imported — see spec.md's service-role rule).

3. **Wire the tenant skeleton** (thin, not full implementation — that's the
   `tenant` command's job):
   - `tenants` table migration with RLS enabled from the first migration,
     not added later.
   - A single middleware entry point that resolves tenant context per the
     chosen strategy, so `tenant` command has one place to build on.

4. **Write ARCHITECTURE.md** from `../architecture-doc-skeleton.md`, every "chosen once" field
   filled, domain boundaries listed based on what the user describes their
   product as.

5. **Report** in four sections — Done / Reusable / Next / Path — listing what
   was scaffolded, what later commands can build on directly, that `tenant`
   is the natural next command, and the project's root path.

## Validation checklist

- [ ] Project builds and runs (`next dev` succeeds)
- [ ] `ARCHITECTURE.md` exists with no unfilled `<placeholder>` fields
- [ ] First migration includes `tenants` table with RLS already enabled
- [ ] `service_role` key is referenced only in a server-only env var, never
      in any file importable by client components
- [ ] Only the chosen query layer's dependency is installed — no unused
      alternates left in package.json

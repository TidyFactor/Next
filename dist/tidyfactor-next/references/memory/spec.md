# tidyfactor-next — Canonical Spec

Read once per session before dispatching any command. This is the rule set every
command below enforces. Do not silently deviate from it — if a task seems to
require deviation, surface that to the user explicitly before proceeding.

## Locked decisions (do not re-litigate per project)

1. **Tenant isolation model: shared schema, `tenant_id` + Postgres RLS.**
   Every tenant-scoped table carries a `tenant_id uuid NOT NULL REFERENCES tenants(id)`.
   No schema-per-tenant, no database-per-tenant. RLS policies are the enforcement
   boundary, not application-layer filtering — application code MAY add a
   `WHERE tenant_id = ...` clause for query-plan efficiency, but must NEVER rely
   on it as the isolation mechanism. If RLS is off, the query is unsafe by
   definition, regardless of what the application code does.

2. **Stack: Next.js 16 App Router + React 19 + TypeScript strict + Supabase**
   (Postgres, Auth, Storage, Edge Functions, Realtime). Not a menu — this is the
   platform layer, pinned like every other TidyFactor track pins its runtime.

3. **Query/data-access layer: pluggable, chosen once per project during `init`.**
   Unlike the platform layer, this is NOT pinned at the skill level. Options:
   `Supabase JS client + raw SQL/RLS`, `Drizzle ORM + Supabase`, `Prisma + Supabase`.
   The `init` command's interview asks and records the choice in the project's
   own `ARCHITECTURE.md` (generated from `../architecture-doc-skeleton.md`).
   Every other command reads that choice and generates code consistent with it —
   a `data` command run against a Drizzle project must not emit raw Prisma-style
   code. Chosen once per project, recorded in ARCHITECTURE.md, consistent for the
   project's life.

## Non-negotiable safety rules (every command enforces these, no exceptions)

- **No tenant-scoped table ships without RLS enabled AND a policy.** A migration
  that creates a tenant-scoped table without `ALTER TABLE ... ENABLE ROW LEVEL
  SECURITY` and at least one policy is an incomplete migration — flag it, don't
  ship it.
- **`service_role` key never reaches client code or client-exposed API routes.**
  It exists only in server-only contexts (Server Actions, Route Handlers running
  server-side, Edge Functions) that have already re-verified tenant context.
  Service-role bypass during debugging requires explicit user confirmation
  before proceeding — never a routine workaround.
- **Tenant context is resolved once, at the edge, and threaded explicitly.**
  Middleware/proxy resolves the tenant (subdomain, custom domain, or session
  claim) and sets it in a single place. Downstream code reads that resolved
  context — it does not re-derive tenant identity from request internals at
  arbitrary points in the call stack.
- **Every cross-tenant code path is a security review trigger.** Admin
  impersonation, tenant migration/merge tooling, cross-tenant reporting — these
  are legitimate but must be explicitly labeled and isolated from normal
  request paths, never bolted onto an existing tenant-scoped service.

## Terminology used across all commands

- **Tenant** — the isolation boundary (an organization/account), not a user.
- **Tenant context** — the resolved `tenant_id` (+ role/claims) attached to a
  request after edge resolution.
- **Isolation leak** — any code path where data from tenant A becomes visible to
  a request authenticated as tenant B, whether via missing RLS, a service-role
  bypass, a caching key that omits tenant_id, or a signed URL that isn't
  tenant-scoped.

## Command → workflow → memory map

| Command | Workflow | Additional memory loaded |
|---|---|---|
| `init` | `../workflows/init.md` | `spec.md` (this file) + `../architecture-doc-skeleton.md` |
| `tenant` | `../workflows/tenant.md` | `spec.md` |
| `rls` | `../workflows/rls.md` | `spec.md` + `rls-patterns.md` |
| `auth` | `../workflows/auth.md` | `spec.md` + `auth-patterns.md` |
| `data` | *(not yet built)* | — |
| `storage` | *(not yet built)* | — |
| `api` | *(not yet built)* | — |
| `app` | *(not yet built)* | — |
| `test` | *(not yet built)* | — |
| `observe` | *(not yet built)* | — |
| `deploy` | *(not yet built)* | — |
| `perf` | `../workflows/audit-dev-perf.md` + `../workflows/diagnose-dev-bottleneck.md` + `../workflows/apply-safe-perf.md` + `../workflows/benchmark-perf.md` | `spec.md` (boundary rules only) + `perf-optimization-rules.md` + `safe-optimizations-catalog.md` + additional memory per mode |
| `incident` | *(not yet built)* | — |
| `audit` | *(not yet built — will follow tidyfactor-skill-architect's standard audit shape)* | — |

Read only the command file that matches the request. Do not read all of them.

## Project ARCHITECTURE.md

Every project using this skill generates an `ARCHITECTURE.md` from
`../architecture-doc-skeleton.md` during `init`. This file is the
single source of truth for all "chosen once per project" decisions:

- Data/query layer choice
- Tenant resolution strategy
- Auth provider and role model
- Deployment environments
- Performance context (read by `perf` before any audit)
- ADR log (append-only, never re-debated silently)
- Open risks / tech debt (populated by `perf`, `rls`, `audit`, `incident`)

**If `ARCHITECTURE.md` is missing or has unfilled placeholders:** surface the
gap to the developer before proceeding. Never silently decide a field that
was supposed to be asked during `init`.

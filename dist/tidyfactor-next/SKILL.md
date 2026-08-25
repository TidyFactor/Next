---
name: tidyfactor-next
description: "TidyFactor Next.js track — production-grade multi-tenant SaaS on Next.js 16, React 19, TypeScript strict, and Supabase with Contextual Decision Layer (CDL). Features locked tenant isolation (shared schema, tenant_id + Postgres RLS) and pluggable query layer (Supabase JS, Drizzle, Prisma). Trigger on commands 'brief', 'init', 'tenant', 'rls', 'auth', 'data', 'storage', 'api', 'app', 'test', 'observe', 'deploy', 'perf', 'incident', 'audit', or requests like 'build a multi-tenant SaaS', 'add RLS to this table', 'tenant resolution', 'audit tenant isolation'. Anti-triggers: Do NOT use for single-tenant static sites or non-Next.js backends."
---

# TidyFactor Next.js

A command dispatcher for production multi-tenant SaaS on Next.js 16 and Supabase. This router declares commands and workflows without performing execution directly.

## Commands

| User intent | Command | What it loads |
|---|---|---|
| Strategic SaaS Discovery & Baseline Architecture | `references/commands/brief.md` | `workflows/brief.md` + `memory/decision-points.md` + `memory/quality-bar.md` |
| Scaffold a new multi-tenant project | `references/commands/init.md` | `workflows/init.md` + `memory/spec.md` |
| Tenant resolution, context, lifecycle | `references/commands/tenant.md` | `workflows/tenant.md` + `memory/spec.md` |
| RLS policy authoring, coverage audit, leak diagnosis | `references/commands/rls.md` | `workflows/rls.md` + `memory/rls-patterns.md` |
| Auth, RBAC/ABAC | `references/commands/auth.md` | `workflows/auth.md` + `memory/auth-patterns.md` |
| Schema, migrations, transactions, constraints | `references/commands/data.md` | `workflows/data.md` + `memory/decision-points.md` |
| Buckets, signed URLs, tenant-scoped storage paths | `references/commands/storage.md` | `workflows/storage.md` + `memory/cache-storage-rules.md` |
| Route handlers, server actions, API contracts | `references/commands/api.md` | `workflows/api.md` + `memory/client-server-boundaries.md` |
| App Router / React 19 patterns, RSC boundaries | `references/commands/app.md` | `workflows/app.md` + `memory/client-server-boundaries.md` |
| Unit/integration/RLS/E2E/security tests | `references/commands/test.md` | `workflows/test.md` + `memory/quality-bar.md` |
| Logging, tracing, audit logs, health checks | `references/commands/observe.md` | `workflows/observe.md` + `memory/quality-bar.md` |
| CI/CD, environments, secrets, rollback, backups | `references/commands/deploy.md` | `workflows/deploy.md` + `memory/spec.md` |
| Dev performance: slow startup, HMR, RAM usage, imports | `references/commands/perf.md` | `workflows/audit-dev-perf.md` + `memory/perf-optimization-rules.md` |
| Failure modes, retries, DR, recovery runbooks | `references/commands/incident.md` | `workflows/incident.md` + `memory/spec.md` |
| Structural/architecture audit of the whole project | `references/commands/audit.md` | `workflows/audit.md` + `memory/quality-bar.md` |

Read only the command file that matches the request. Do not load all commands simultaneously.

## Non-Negotiable Invariants

1. **Contextual Decision Layer (CDL)**: Resolve project baselines via `/brief` or `.tidyfactor/next-brief.md` before emitting code.
2. **Locked Tenant Isolation**: Every tenant-owned table MUST include `tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE`.
3. **Forced RLS Boundary**: Every tenant table MUST have `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`.
4. **Zero Service-Role Leaks**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to client components or public API responses.
5. **7-Axis Pre-Emit Critique**: All generated code must be evaluated with `/* Pre-emit critique: P5 H5 E5 S5 R5 V5 D5 */`.

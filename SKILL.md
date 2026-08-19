---
name: tidyfactor-next
description: "TidyFactor Next.js track — production-grade multi-tenant SaaS on Next.js 16, React 19, TypeScript strict, and Supabase (Postgres, Auth, Storage, Edge Functions, Realtime). Locked tenant isolation (shared schema, tenant_id + Postgres RLS); pluggable query layer (Supabase JS / Drizzle / Prisma) chosen once per project. Covers architecture, tenant resolution/lifecycle, RLS authoring and leak diagnosis, auth/RBAC, schema/data management, storage security, API contracts, App Router/React 19 patterns, testing, observability, CI/CD, performance, incident recovery, maintenance. Trigger on commands 'init', 'tenant', 'rls', 'auth', 'data', 'storage', 'api', 'app', 'test', 'observe', 'deploy', 'perf', 'incident', 'audit', or requests like 'build a multi-tenant SaaS', 'add RLS to this table', 'why is one tenant seeing another tenant's data', 'set up tenant resolution', 'audit our tenant isolation'. Use for new projects and for hardening/auditing existing Next.js + Supabase SaaS codebases."
---

# TidyFactor Next.js

A command dispatcher, same shape as every other TidyFactor track. This file
does not do the work — it routes to the command, which routes to the
workflow, which injects the right memory. Read `references/memory/spec.md`
once per session before dispatching anything; it's the canonical rule set
every command below enforces, including the locked tenant-isolation model
and the non-negotiable safety rules (service-role handling, fail-closed
tenant resolution, etc.).

## Commands

| User intent | Command | Status |
|---|---|---|
| Scaffold a new multi-tenant project | `references/commands/init.md` | Built |
| Tenant resolution, context, lifecycle | `references/commands/tenant.md` | Built |
| RLS policy authoring, coverage audit, leak diagnosis | `references/commands/rls.md` | Built |
| Auth, RBAC/ABAC | `references/commands/auth.md` | Built |
| Schema, migrations, transactions, constraints | `references/commands/data.md` | Not yet built |
| Buckets, signed URLs, tenant-scoped storage paths | `references/commands/storage.md` | Not yet built |
| Route handlers, server actions, API contracts | `references/commands/api.md` | Not yet built |
| App Router / React 19 patterns, RSC boundaries | `references/commands/app.md` | Not yet built |
| Unit/integration/RLS/E2E/security tests | `references/commands/test.md` | Not yet built |
| Logging, tracing, audit logs, health checks | `references/commands/observe.md` | Not yet built |
| CI/CD, environments, secrets, rollback, backups | `references/commands/deploy.md` | Not yet built |
| Development performance & resource optimization: dev startup slow, HMR slow, build time, RAM usage, optimize imports, perf audit, perf diagnose, perf optimize, perf benchmark, بطيء, تدقيق الأداء | `references/commands/perf.md` | Built |
| Failure modes, retries, DR, recovery runbooks | `references/commands/incident.md` | Not yet built |
| Structural/architecture audit of the whole project | `references/commands/audit.md` | Not yet built |

Read only the command file that matches the request. Do not read all of them.

## Non-negotiable constraints (from `tidyfactor-skill-architect`)

This track is governed by the standard TidyFactor methodology: this file is a
dispatcher, not a task-doer; each workflow covers exactly one outcome with a
validation checklist; memory is operational (patterns, templates, locked
decisions), never narrative; no empty folders for command types that don't
exist yet; growth (new commands) is added when actually needed, not
speculatively.

## Handoff to skill-creator

When building out a not-yet-built command above, follow skill-creator's
normal interview/draft/validate loop, but the draft must satisfy
`tidyfactor-skill-architect`'s constraints (see its SKILL.md) and must reuse
`references/memory/spec.md` rather than re-deriving the tenant-isolation rules per
command.

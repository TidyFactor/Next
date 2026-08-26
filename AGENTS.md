# AGENTS.md — TidyFactor Next.js Architecture & Dev-Perf Engine (`tidyfactor-next`)

Production-grade **Multi-Tenant SaaS Architecture & Development Resource Optimization Engine** following the strict **TidyFactor Skill Methodology**. Enforces locked tenant isolation on Next.js 16 and Supabase with PostgreSQL RLS as the non-negotiable security boundary, paired with an evidence-based development performance engine.

---

## ⚡ Skill & 15-Stage SaaS Command Dispatchers

This project exposes an Agentic Skill under `SKILL.md` (and `.claude-skill/SKILL.md`). The following 15 command modules covering the complete SaaS engineering lifecycle are fully implemented:

| Stage | Command | Purpose | Reference Spec | Status |
|---|---|---|---|:---:|
| **0. Discovery** | `brief` | Pre-flight CDL SaaS discovery & stack selection | `references/commands/brief.md` | ✅ **Built** |
| **1. Foundation** | `init` | Scaffold new multi-tenant project & generate `ARCHITECTURE.md` | `references/commands/init.md` | ✅ **Built** |
| **1. Foundation** | `tenant` | Edge tenant resolution, context propagation, lifecycle | `references/commands/tenant.md` | ✅ **Built** |
| **2. Security** | `rls` | RLS policy authoring, 4-policy pattern, leak diagnosis | `references/commands/rls.md` | ✅ **Built** |
| **2. Security** | `auth` | Supabase Auth, custom JWT claims hook, RBAC/ABAC | `references/commands/auth.md` | ✅ **Built** |
| **3. Data** | `data` | Schema, migrations, transactions, constraints | `references/commands/data.md` | ✅ **Built** |
| **3. Data** | `storage` | Tenant-scoped buckets, signed URLs, storage RLS | `references/commands/storage.md` | ✅ **Built** |
| **4. Application** | `api` | Route handlers, server actions, API contracts | `references/commands/api.md` | ✅ **Built** |
| **4. Application** | `app` | App Router, React 19, RSC boundaries, Suspense | `references/commands/app.md` | ✅ **Built** |
| **5. Quality** | `test` | Unit, integration, RLS coverage, E2E security tests | `references/commands/test.md` | ✅ **Built** |
| **5. Quality** | `observe` | Tracing, tenant-scoped audit logs, health checks | `references/commands/observe.md` | ✅ **Built** |
| **6. DevOps** | `deploy` | CI/CD, environments, rollback, point-in-time backups | `references/commands/deploy.md` | ✅ **Built** |
| **6. DevOps / Perf** | `perf` | Dev & runtime performance audit, bottleneck diagnosis, safe perf | `references/commands/perf.md` | ✅ **Built** |
| **7. Operations** | `incident` | Disaster recovery, tenant leak remediation runbooks | `references/commands/incident.md` | ✅ **Built** |
| **7. Operations** | `audit` | Full-stack multi-tenant architecture & compliance audit | `references/commands/audit.md` | ✅ **Built** |

---

## 🛠️ CLI Execution Modes

- **Interactive Setup Wizard** (`npx @alwkala/tidyfactor-next`): Launches interactive terminal wizard to scaffold projects, select query layers (Supabase JS, Drizzle, Prisma), configure auth providers, and establish tenant resolution strategies.
- **Skill Injection Mode** (`npx @alwkala/tidyfactor-next add-skill`): Injects `.agents/skills/tidyfactor-next/` directly into any existing Next.js repository.
- **AI Agent Execution**: Antigravity, Claude Code, Cursor, Codex, and Windsurf execute slash commands directly via `references/commands/<name>.md`.

---

## 🛡️ Critical Architecture & SaaS Guardrails (Non-Negotiable)

1. **Locked Tenant Isolation**:
   - Shared database schema with `tenant_id uuid NOT NULL REFERENCES tenants(id)`.
   - PostgreSQL Row Level Security (RLS) is the security boundary—never application-layer `WHERE` filters alone.
2. **`service_role` Key Isolation**:
   - Never exposed to client bundles or browser-callable routes. Used exclusively in server-only contexts after explicit tenant re-verification.
3. **Fail-Closed Edge Resolution**:
   - Middleware resolves tenant identity once at the network edge. Any resolution failure fails closed (404/403)—never falling back to an unscoped default tenant.
4. **Development Performance Rule (`audit ≠ optimize`)**:
   - Diagnostic evidence required before modifying any file. Only 🟢 Green-tier optimizations apply automatically. 🟡 Yellow optimizations require evidence and developer approval.
5. **SaaS Safety Boundary**:
   - Performance optimization must NEVER weaken tenant isolation, RLS, authentication, or authorization contracts.

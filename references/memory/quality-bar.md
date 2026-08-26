# Memory: quality-bar (Anti-Slop & Multi-Tenant SaaS Quality Gate)

<!-- last-verified: 2026-08-27 -->

Enforces strict tenant isolation, zero data leakage, and architectural purity across all Next.js + Supabase deliverables.

---

## 🛡️ 7-Axis Pre-Emit Self-Critique Stamp

Every generated code block, route handler, server action, or migration must be evaluated and stamped before emission:
`/* Pre-emit critique: P5 H5 E5 S5 R5 V5 D5 */`

| Axis | Dimension | Score 1 (Slop / Reject) | Score 5 (Production Pass) |
|:---:|---|---|---|
| **P** | **Purpose & Tenant Safety** | Ambiguous tenant isolation; leaks data across organizations. | Bulletproof RLS (`tenant_id = auth.jwt() ->> 'tenant_id'`); fail-closed resolution. |
| **H** | **Hierarchy & Boundary Clarity** | Leaks server logic into client bundles (`"use client"` abuse); bloated props over RSC wire. | Strict RSC boundaries; data fetched server-side; minimal serialized DTOs passed across boundary. |
| **E** | **Execution Completeness** | Missing error boundaries, loading states, or validation schemas. | Zod schemas, optimistic UI, complete error handling, and audit logs. |
| **S** | **Stack Native Strictness** | Next.js 12/13 legacy patterns; untyped `any` signatures. | Next.js 16 + React 19 native (`use`, Server Actions, `after()`, strict TypeScript). |
| **R** | **RLS & Security Enforcement** | Direct `service_role` use in client/route handlers without check. | `service_role` strictly restricted to internal background workers. |
| **V** | **Velocity & Performance** | Sequential waterfalls, missing `React.cache()`, un-split heavy bundles, re-render slop. | Zero waterfalls (guards before await, parallel fetches), `React.cache()` dedup, `after()` for non-blocking I/O, dynamic imports for heavy UI. |
| **D** | **Decision Alignment** | Violates confirmed `.tidyfactor/next-brief.md` stack choices. | 100% compliant with confirmed Query Layer, Tenant Mode, and Auth choices. |

---

## 🚫 Non-Negotiable Multi-Tenant Security Invariants

1. **Locked Tenant Isolation**: Every tenant-owned table MUST include `tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE`.
2. **Postgres RLS Enabled**: Every table MUST execute `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;` and `ALTER TABLE <table> FORCE ROW LEVEL SECURITY;`.
3. **No Unbounded Queries**: Never emit queries without `LIMIT` and pagination constraints.
4. **Zero Secrets in Client**: Never pass `SUPABASE_SERVICE_ROLE_KEY` to client components or public route responses.

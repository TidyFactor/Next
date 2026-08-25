# Memory: decision-points (Contextual Decision Layer — CDL v1.0)

A thin arbitration protocol for resolving high-impact architectural and multi-tenant SaaS ambiguities before code emission.

---

## 🏛️ Decision Matrix (N1–N5)

| Code | Decision Dimension | Options (Reference SSOT) | Default Fallback | Trigger / Ambiguity Condition |
|:---:|---|---|---|---|
| **N1** | **Query & ORM Layer** | • `supabase-js` (Direct PostgREST client)<br>• `drizzle` (Drizzle ORM over Postgres)<br>• `prisma` (Prisma ORM with RLS extensions) | `supabase-js` | When prompt asks to create models, repositories, or database queries without declaring the ORM. |
| **N2** | **Tenant Resolution Mode** | • `subdomain` (`tenant.app.com`)<br>• `path` (`app.com/t/tenant`)<br>• `header` (`x-tenant-id` / API Auth) | `subdomain` | When building tenant routing, auth middleware, or API contracts. |
| **N3** | **Auth & RBAC Model** | • `supabase-auth` (Built-in Auth + metadata)<br>• `custom-rbac` (Dedicated `roles` and `permissions` tables)<br>• `abac` (Attribute-based policy matrix) | `supabase-auth` + `custom-rbac` | When designing user management, team invitations, or protected routes. |
| **N4** | **Storage & Asset Security** | • `private-tenant-buckets` (Scoped paths `tenant_id/user_id/*`)<br>• `signed-urls` (Short-lived signed URLs for sensitive media)<br>• `public-cdn` (Public assets with CDN caching) | `private-tenant-buckets` | When creating upload handlers, media libraries, or bucket policies. |
| **N5** | **Output Scope & Depth** | • `sprint-feature` (Single Route / Component / RLS Policy)<br>• `complete-blueprint` (Full multi-tenant architecture with migration & tests) | `sprint-feature` | When user request could mean a quick helper or a complete full-stack module. |

---

## ⚡ Boolean Skip Conditions (Deterministic Bypass)

Skip interactive elicitation and proceed silently when ANY of the following are true:
1. **Cached Brief Exists**: `.tidyfactor/next-brief.md` exists and contains confirmed decisions.
2. **Explicit User Declaration**: Prompt explicitly declares query layer, tenant resolution, and auth mode (e.g., `"Use Drizzle with subdomain tenant routing"`).
3. **Direct Command Invocation**: User invokes explicit commands (e.g. `/rls`, `/perf`, `/auth`, `/data`) with concrete specifications.
4. **Maintenance / Refactor Task**: Fixes, performance optimizations (`/perf`), or RLS leak audits (`/audit`) silently preserve existing project architecture.

---

## 🎯 Single-Round Batching & Priority Overflow

When elicitation is required:
1. **Max 3 Questions**: Ask at most 3 concise questions in a single round.
2. **Priority Order**:
   $$\mathbf{N1 \text{ (Query/ORM)}} > \mathbf{N2 \text{ (Tenant Mode)}} > \mathbf{N3 \text{ (Auth/RBAC)}} > \mathbf{N4 \text{ (Storage)}} > \mathbf{N5 \text{ (Scope)}}$$
3. **Conservative Default**: Any unasked or unanswered dimensions automatically adopt the **Default Fallback**.

---

## 💾 Brief Persistence Protocol

When `/brief` runs, save confirmed decisions to `.tidyfactor/next-brief.md`:
```markdown
# Next.js Multi-Tenant SaaS Brief
- Query Layer: [supabase-js | drizzle | prisma]
- Tenant Resolution: [subdomain | path | header]
- Auth / RBAC: [supabase-auth | custom-rbac | abac]
- Storage Security: [private-tenant-buckets | signed-urls | public-cdn]
- Scope Depth: [sprint-feature | complete-blueprint]
- Confirmed At: YYYY-MM-DD
```
All downstream workflows read `.tidyfactor/next-brief.md` first.

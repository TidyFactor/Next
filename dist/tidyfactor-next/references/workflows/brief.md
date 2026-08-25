# Workflow: brief

Discovers and records core SaaS architectural baselines before writing code.

---

## Steps

1. **Check Existing State**:
   - Inspect `.tidyfactor/next-brief.md`, `package.json`, and `supabase/config.toml` to detect existing stack choices.

2. **Conduct Structured Discovery (Max 3 Questions)**:
   - If not already determined, present options for:
     1. **Query Layer (N1)**: `supabase-js`, `drizzle`, or `prisma`?
     2. **Tenant Routing Mode (N2)**: Subdomain (`tenant.app.com`), Path (`/t/tenant`), or Header (`x-tenant-id`)?
     3. **Auth & RBAC Model (N3)**: Supabase Auth + metadata vs Custom RBAC tables?

3. **Record Decisions**:
   - Write `.tidyfactor/next-brief.md` with confirmed parameters.

4. **Report Summary**:
   - Confirm baseline architecture and advise the user to invoke `/init`, `/tenant`, or `/rls`.

---

## Validation checklist

- [ ] `.tidyfactor/next-brief.md` exists and contains confirmed values for N1–N5.
- [ ] No more than 3 questions were asked in a single round.
- [ ] All stack choices follow `references/memory/spec.md` safety invariants.

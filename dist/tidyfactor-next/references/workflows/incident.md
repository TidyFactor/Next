# Workflow: incident

Emergency runbook for diagnosing and fixing multi-tenant data leaks, Supabase outages, and corrupted migrations.

---

## Steps

0. **Step 0: Triage & Containment**:
   - If a cross-tenant data leak is suspected, immediately revoke compromised API tokens and lock vulnerable routes.

1. **Root-Cause Analysis**:
   - Inspect RLS policies for missing `tenant_id` filters or bypassed `auth.jwt()` lookups.
   - Inspect Route Handlers using `createAdminClient` or service-role keys insecurely.

2. **Patch & Apply Hotfix**:
   - Write corrective SQL migration enforcing RLS.
   - Apply hotfix migration immediately.

3. **Pre-Emit Self-Critique**:
   - `/* Pre-emit critique: P5 H5 E5 S5 R5 V5 D5 */`

---

## Validation checklist

- [ ] Immediate containment step identified.
- [ ] Root cause identified in RLS or server handler.
- [ ] Patch includes both SQL migration and regression test.
- [ ] Pre-emit critique stamp included.

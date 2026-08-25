# Workflow: test

Authors comprehensive test suites specifically targeting multi-tenant data isolation, RLS policy verification, and route security.

---

## Steps

0. **Step 0: CDL Resolution & Brief Check**:
   - Verify test target (Unit, Integration, RLS, or E2E).

1. **RLS Policy Isolation Tests**:
   - Create tests asserting Tenant A CANNOT read, insert, update, or delete Tenant B records.
   - Assert anonymous requests are rejected when querying private tables.

2. **Integration & Route Tests**:
   - Mock Supabase auth tokens and test route handlers and server actions.

3. **Pre-Emit Self-Critique**:
   - `/* Pre-emit critique: P5 H5 E5 S5 R5 V5 D5 */`

---

## Validation checklist

- [ ] Multi-tenant isolation test explicitly asserts cross-tenant access rejection.
- [ ] RLS tests verify both authenticated and unauthenticated roles.
- [ ] Pre-emit critique stamp included.

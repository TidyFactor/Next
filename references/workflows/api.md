# Workflow: api

Builds type-safe Route Handlers (`app/api/...`) and Server Actions with fail-closed tenant validation and input sanitization.

---

## Steps

0. **Step 0: CDL Resolution & Brief Check**:
   - Check `.tidyfactor/next-brief.md` for Query Layer and Auth conventions.

1. **Input Validation**:
   - Define Zod schema for request parameters and body payloads.

2. **Tenant Context Resolution**:
   - Resolve tenant from session headers/JWT (`requireTenantContext(req)`).
   - Reject unauthenticated or cross-tenant requests with `401 Unauthorized` / `403 Forbidden`.

3. **Execute Scoped Operation**:
   - Execute query through authenticated Supabase client or scoped ORM instance.

4. **Pre-Emit Self-Critique**:
   - `/* Pre-emit critique: P5 H5 E5 S5 R5 V5 D5 */`

---

## Validation checklist

- [ ] All inputs validated via Zod before processing.
- [ ] Tenant resolution executes and fails closed on missing context.
- [ ] Response headers include proper cache-control and CORS settings.
- [ ] Pre-emit critique stamp included.

# Workflow: api

Builds type-safe Route Handlers (`app/api/...`) and Server Actions with fail-closed tenant validation, input sanitization, and high-performance server runtime patterns.

---

## Steps

0. **Step 0: CDL Resolution & Brief Check**:
   - Check `.tidyfactor/next-brief.md` for Query Layer and Auth conventions.
   - Reference `memory/react-perf-rules.md` for Tier 1 (Waterfalls) and Tier 3 (Server Performance).

1. **Input Validation**:
   - Define Zod schema for request parameters and body payloads. Validate synchronously before async work (`async-cheap-condition-before-await`).

2. **Tenant Context Resolution & Early Promise Initiation**:
   - Resolve tenant from session headers/JWT (`requireTenantContext(req)`).
   - Start independent async promises immediately (`async-api-routes`).
   - Reject unauthenticated or cross-tenant requests with `401 Unauthorized` / `403 Forbidden`.

3. **Execute Scoped Operation & Server Action Security**:
   - Execute query through authenticated Supabase client or scoped ORM instance.
   - If authoring Server Actions (`'use server'`), enforce identical auth and tenant validation as Route Handlers (`server-auth-actions`).

4. **Non-Blocking Telemetry & Side Effects via `after()`**:
   - Offload audit logs, analytics, notification webhooks, and metric increments to Next.js `after()` (`server-after`).

5. **Pre-Emit Self-Critique**:
   - `/* Pre-emit critique: P5 H5 E5 S5 R5 V5 D5 */`

---

## Validation checklist

- [ ] All inputs validated via Zod before async processing.
- [ ] Tenant resolution executes and fails closed on missing context.
- [ ] Server Actions enforce identical auth & tenant checks as Route Handlers.
- [ ] Non-blocking side effects (audit logging, metrics) offloaded to `after()`.
- [ ] Response headers include proper cache-control and CORS settings.
- [ ] Pre-emit critique stamp included.

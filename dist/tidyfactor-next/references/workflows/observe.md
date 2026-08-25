# Workflow: observe

Implements structured logging, security audit logging (`audit_logs` table), OpenTelemetry tracing, and health endpoints.

---

## Steps

0. **Step 0: CDL Resolution & Brief Check**:
   - Check logging and monitoring targets.

1. **Tenant-Scoped Audit Logs**:
   - Create `audit_logs` table with `tenant_id`, `actor_id`, `action`, `resource`, `metadata`, and `timestamp`.
   - Add trigger or middleware to capture sensitive operations (role changes, billing events, data exports).

2. **Health & Liveness Check Route**:
   - Implement `app/api/health/route.ts` checking DB connectivity and external services.

3. **Pre-Emit Self-Critique**:
   - `/* Pre-emit critique: P5 H5 E5 S5 R5 V5 D5 */`

---

## Validation checklist

- [ ] Audit logs include `tenant_id` and `actor_id`.
- [ ] No passwords or sensitive tokens written to log output.
- [ ] Health check endpoint returns 200 on healthy database connection.
- [ ] Pre-emit critique stamp included.

# Workflow: audit

Audits the entire Next.js + Supabase SaaS codebase for security vulnerabilities, RLS leaks, RSC boundary violations, and performance regressions.

---

## Steps

0. **Step 0: CDL Resolution & Brief Check**:
   - Compare codebase against `.tidyfactor/next-brief.md` architectural baseline.

1. **RLS & Database Audit**:
   - Verify every table has `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`.
   - Verify all policies query `auth.jwt() ->> 'tenant_id'`.

2. **RSC & Client Boundary Audit**:
   - Check for unnecessary `"use client"` directives in data fetching layouts.

3. **Performance & Dependency Audit**:
   - Run bundle analysis to identify oversized dependencies.

4. **Pre-Emit Self-Critique**:
   - `/* Pre-emit critique: P5 H5 E5 S5 R5 V5 D5 */`

---

## Validation checklist

- [ ] Complete audit report produced with pass/fail grades.
- [ ] Every failed item has a concrete, actionable remediation step.
- [ ] Pre-emit critique stamp included.

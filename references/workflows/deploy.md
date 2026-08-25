# Workflow: deploy

Configures automated GitHub Actions CI/CD workflows for building Next.js, applying Supabase migrations, and deploying to Vercel or custom hosts.

---

## Steps

0. **Step 0: CDL Resolution & Brief Check**:
   - Check target host (Vercel, Docker, VPS, or AWS).

1. **GitHub Actions Workflow**:
   - Create `.github/workflows/deploy.yml` with:
     - TypeScript strict typecheck (`tsc --noEmit`)
     - Linting (`next lint`)
     - Test run (`npm run test`)
     - Supabase migration apply (`supabase db push`)

2. **Environment Variables & Secret Verification**:
   - Ensure all `NEXT_PUBLIC_*` and server-only secrets are registered.

3. **Pre-Emit Self-Critique**:
   - `/* Pre-emit critique: P5 H5 E5 S5 R5 V5 D5 */`

---

## Validation checklist

- [ ] CI pipeline validates migrations and tests before deployment.
- [ ] Production secrets are secured and never exposed in client bundles.
- [ ] Pre-emit critique stamp included.

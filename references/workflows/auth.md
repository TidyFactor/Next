# Workflow: auth

One outcome: Supabase Auth + role model wired so that `role` and `tenant_id`
land in the JWT as trusted claims, matching what `../commands/rls.md`'s Pattern 2
policies already expect. Does not write the RLS policies themselves (that's
`rls`) — this workflow's job ends at "the claims exist and are trustworthy."

## Steps

1. **Read ARCHITECTURE.md** — auth provider/methods and role model were
   asked during `init`. Do not re-ask; if unfilled, that's an `init` gap to
   flag, not something to silently decide here.

2. **Auth provider setup**: configure the chosen method(s) (email/password,
   magic link, OAuth) in the Supabase project. Nothing role/tenant-specific
   yet — this step is plain Supabase Auth config.

3. **Membership model**: create `tenant_memberships` per `../memory/auth-patterns.md`'s
   template. This is the join between `auth.users` and `tenants` — it does
   not go on the `tenants` or a custom `users` table as a column.

4. **Claims hook**: write and register the custom access token hook per the
   template. Resolve the multi-tenant-user question explicitly (active-tenant
   switcher vs single-tenant-per-account) — don't ship the placeholder
   `limit 1` from the template as final.

5. **Role model implementation**: fixed roles / custom RBAC / ABAC per what
   was chosen in ARCHITECTURE.md's role-model field. If nothing was chosen,
   default to fixed roles and record that choice — don't build RBAC
   speculatively.

6. **Wire role-gated UI** only after the matching RLS policy exists (hand off
   to `rls` command for any table that doesn't have one yet). Never ship a
   role check in a component/route with no backing policy.

## Validation checklist

(same as the checklist in `../memory/auth-patterns.md` — confirm every item
there before closing out; don't duplicate criteria here)

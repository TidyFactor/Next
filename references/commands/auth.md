# Command: auth

Triggers: "set up auth", "add roles", "RBAC", "who can access what", "add a
new role", "protect this route by role".

Loads: `../workflows/auth.md` + `../memory/spec.md` + `../memory/auth-patterns.md`.

Outcome: Supabase Auth wired per the method chosen in ARCHITECTURE.md, plus a
role model whose claims match what `rls.md`'s Pattern 2 policies already
expect (`role` in the JWT, checked alongside `tenant_id`, never instead of
it).

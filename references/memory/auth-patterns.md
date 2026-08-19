# Auth Patterns

Operational patterns for the `auth` command. Templates, not narrative.

## Membership model (all role models sit on top of this)

A user's relationship to a tenant is its own row, not a column on `users`.
One person can belong to multiple tenants with different roles in each.

```sql
create table public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

alter table public.tenant_memberships enable row level security;

create policy "memberships_self_select"
  on public.tenant_memberships for select
  using (user_id = auth.uid());
```

`tenant_memberships` is itself tenant-scoped data — it gets RLS via the same
Pattern 1 rules in `rls-patterns.md`, not a special case.

## Getting `tenant_id` and `role` into the JWT

Supabase Auth supports a Custom Access Token Hook (Postgres function invoked
at token issuance) to inject custom claims. This is the mechanism — do not
have client code separately fetch role/tenant and pass it around as
"trusted" data; only the JWT claim, set server-side by the hook, is trusted
by RLS policies.

```sql
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  membership record;
begin
  claims := event->'claims';
  -- Active tenant resolved by the request (see tenant.md's edge resolution);
  -- passed in via a session variable or looked up by user_id + active tenant.
  select tenant_id, role into membership
  from public.tenant_memberships
  where user_id = (event->>'user_id')::uuid
  limit 1; -- single-tenant-per-session assumption; see "Multi-tenant users" below

  if membership is not null then
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(membership.tenant_id));
    claims := jsonb_set(claims, '{role}', to_jsonb(membership.role));
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;
```

Register this in the Supabase project's Auth hook config, not just as a
loose function — an unregistered hook function silently does nothing and the
RLS policies expecting `role`/`tenant_id` claims will fail closed (safe, but
confusing to debug — check hook registration first when claims are missing).

## Multi-tenant users (a user belonging to more than one tenant)

The hook above picks one membership arbitrarily via `limit 1` — that's a
placeholder, not a real strategy. Pick one explicitly:

- **Active-tenant switcher**: session carries an explicit "active tenant"
  selection (cookie or user preference), hook looks up that specific
  membership. Requires a token refresh on tenant switch — plan the UX for
  that latency, don't silently swap tenant context mid-session without one.
- **Single-tenant-per-account**: simplest, disallow a user joining a second
  tenant. Fine for consumer-ish SaaS; wrong for agency/consultant use cases
  where one person legitimately works across tenants.

Document which one the project uses in ARCHITECTURE.md — this is an ADR-log
entry, not a default to leave implicit.

## Role model options

- **Fixed roles** (`owner`, `admin`, `member`): role is a plain text column,
  checked directly in RLS policies per Pattern 2. Simplest; fine when
  permissions don't need per-resource granularity.
- **Custom RBAC** (roles map to a permissions table): add a
  `role_permissions (role text, permission text)` table; RLS policies check
  `exists (select 1 from role_permissions where role = (auth.jwt()->>'role') and permission = '<needed>')`
  instead of a raw role-name comparison. Use when the same role needs
  different permissions across tenants (e.g. a tenant customizing what
  "admin" can do).
- **ABAC** (attribute-based): claims carry multiple attributes (department,
  seniority, resource tags) and policies evaluate combinations. Only justify
  this when fixed roles or RBAC have already proven insufficient — it's
  materially harder to audit for isolation leaks, since the policy logic
  itself grows the attack surface described in spec.md.

## Route/UI-level checks are UX, not the security boundary

Hiding a button or redirecting an unauthorized route is a UX convenience.
The RLS policy is what actually stops the read/write. Never build a
role-gated route/component without the matching RLS policy already in place
— an app-only check is bypassable by anyone calling the API/Supabase client
directly.

## Validation checklist (used by `auth` command)

- [ ] `tenant_memberships` table exists, RLS-enabled, unique on `(tenant_id, user_id)`
- [ ] Custom access token hook is registered in the Supabase project config,
      not just defined as a loose function
- [ ] Multi-tenant-user strategy is explicit and documented in ARCHITECTURE.md
      (not left as the placeholder `limit 1`)
- [ ] Every role-gated UI element has a matching RLS policy — spot-check by
      calling the underlying table directly as a lower-privileged role
- [ ] Token refresh is triggered on role/tenant change (role changes don't
      take effect on a stale JWT until refresh)

# Command: rls

Triggers: "add RLS to this table", "write the isolation policies", "audit RLS
coverage", "why is this tenant seeing another tenant's data" (isolation-leak
debugging).

Loads: `../workflows/rls.md` + `../memory/spec.md` + `../memory/rls-patterns.md`.

Outcome: every tenant-scoped table has RLS enabled with policies matching the
patterns in `../memory/rls-patterns.md`, and a coverage audit query confirms no gaps.

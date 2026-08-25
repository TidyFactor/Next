# Command: tenant

Triggers: "add tenant resolution", "build the tenant context", "tenant
lifecycle", "onboard a new tenant", "tenant-aware service".

Loads: `../workflows/tenant.md` + `../memory/spec.md`.

Outcome: tenant resolution, context propagation, and lifecycle (create /
suspend / delete) implemented per the strategy locked in ARCHITECTURE.md —
never re-deciding the resolution strategy per feature.

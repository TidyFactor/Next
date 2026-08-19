# Contributing to TidyFactor Next.js

Thank you for your interest in contributing to **TidyFactor Next.js**!

## Development Guidelines

1. **Strict Methodology Compliance**:
   - Every command dispatcher in `references/commands/` must be concise and route directly to a workflow and operational memory.
   - Workflows in `references/workflows/` must enforce **One Workflow = One Outcome** with an explicit `## Validation checklist`.
   - Memory files in `references/memory/` must contain pure operational patterns, schemas, and architecture rules—never narrative prose.
2. **Tenant Isolation Invariant**:
   - Never introduce code that bypasses RLS policies or passes the `service_role` key to client components.
3. **Evidence-Based Performance**:
   - Never add automated optimizations without prior diagnostic baseline requirements and verifiable DELTA metrics.
4. **Validation**:
   - Before opening a PR or submitting changes, ensure all relative links resolve cleanly and that the skill passes structural audits.

## Pull Requests

1. Fork the repo and create your branch from `main`.
2. Ensure your changes adhere strictly to the TidyFactor governance standards.
3. Test your changes locally.
4. Submit your pull request with a detailed description of the changes.

## Questions & Support

Reach out to the maintainers at [hello@alwkala.com](mailto:hello@alwkala.com) or open an issue on GitHub.

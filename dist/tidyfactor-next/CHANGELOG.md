# Changelog — TidyFactor Next.js

All notable changes to the **[@alwkala/tidyfactor-next](https://www.npmjs.com/package/@alwkala/tidyfactor-next)** package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-08-27

### Added
- **8-Tier Prioritized React 19 & Next.js 16 Runtime Performance Catalog**: Added `references/memory/react-perf-rules.md` encapsulating 40+ production rules learned from Vercel Engineering (`react-best-practices`):
  - **Tier 1 (CRITICAL — Waterfalls)**: Synchronous guard evaluation before `await`, deferred `await`, `Promise.all` / dependency parallelization, route handler early promise execution, `<Suspense>` streaming boundaries.
  - **Tier 2 (CRITICAL — Bundle Size)**: Barrel import elimination, `next/dynamic` for heavy client modules, deferred 3rd-party scripts past hydration, intent-based chunk preloading.
  - **Tier 3 (HIGH — Server Performance)**: `React.cache()` request deduplication, Next.js 16 `after()` for non-blocking telemetry and audit logs, minimal RSC props serialization DTOs, Server Action auth parity.
  - **Tier 4 (MEDIUM-HIGH — Client Data Fetching)**: SWR / TanStack request deduplication, passive scroll event listeners.
  - **Tier 5 (MEDIUM — Re-render Optimization)**: Pure derived state in render phase (zero redundant `useEffect` mirrors), primitive `useMemo` prevention, lazy `useState` initializers, `startTransition` / `useDeferredValue`.
  - **Tier 6 (MEDIUM — Rendering Performance)**: CSS `content-visibility: auto`, static JSX hoisting, explicit boolean conditions.
  - **Tier 7 (LOW-MEDIUM — JavaScript Performance)**: Layout thrashing batching, `Set`/`Map` $O(1)$ lookups, `toSorted()` immutability.
  - **Tier 8 (LOW — Advanced Patterns)**: `useEffectEvent` non-reactive callbacks, single app initialization pattern.
- **App Router & API Workflow Upgrades**: Updated `references/workflows/app.md` and `references/workflows/api.md` with runtime performance checklists.
- **7-Axis Quality Gate Hardening**: Upgraded Axis V (Velocity & Performance) and Axis H (Hierarchy & Boundary Clarity) in `references/memory/quality-bar.md`.

---

## [1.2.0] - 2026-08-25

### Added
- **Contextual Decision Layer (CDL v1.0)**: Added `references/memory/decision-points.md` defining a thin arbitration protocol for resolving high-impact multi-tenant SaaS ambiguities (N1–N5: Query Layer, Tenant Resolution Mode, Auth/RBAC, Storage Security, Scope Depth).
- **Brief Command (`/brief`)**: Added `references/commands/brief.md` and `references/workflows/brief.md` for pre-flight SaaS discovery and saving baseline choices in `.tidyfactor/next-brief.md`.
- **Complete Command & Workflow Suite (15 Commands)**: Scaffolded and built all 9 missing command files and workflows (`data`, `storage`, `api`, `app`, `test`, `observe`, `deploy`, `incident`, `audit`).
- **7-Axis Multi-Tenant Quality Gate (`P/H/E/S/R/V/D`)**: Added `references/memory/quality-bar.md` with strict RLS policy rules and pre-emit self-critique stamps across all workflows.
- **Packaging & Validation Suite**: Added `bin/add-skill.js`, updated `package.json` `"bin"` mapping, and created `tools/validate_skill.py` and `tools/build-skill.js`.

---

## [1.1.0] - 2026-08-18

### 🛠️ Added — 17 Deterministic Python Runtime Tools (`tools/`)
- **Project & Environment**: `tools/project/scan_project.py` for structured metadata, sizes, and ratio inspection.
- **Dependency Diagnostics**: `tools/dependencies/analyze_graph.py` and `tools/dependencies/find_unused.py` for non-destructive usage analysis.
- **Import Analysis**: `tools/imports/analyze_imports.py` for evidence-based `optimizePackageImports` recommendations.
- **Next.js & Security Boundary**: `tools/next/analyze_config.py` and `tools/next/scan_client_boundary.py` (detects server package leaks into client components).
- **TypeScript Compiler Diagnostics**: `tools/typescript/analyze_tsconfig.py`, `tools/typescript/explain_scope.py` (`tsc --explainFiles`), and `tools/typescript/profile.py` (`tsc --extendedDiagnostics`).
- **Cache & Watch Boundaries**: `tools/cache/analyze_cache.py` (cache-to-source ratios) and `tools/cache/watch_boundary.py` (detects large media trees inside dev watch boundaries).
- **Statistical Benchmark Engine**: `tools/benchmark/run.py` (multi-run median with 20% noise threshold) and `tools/benchmark/compare.py` (BEFORE / AFTER / DELTA percentages).
- **Host Resources**: `tools/resources/system_probe.py` (best-effort RAM/CPU/Disk) and `tools/resources/node_processes.py` (active node memory inspector).
- **Safety & Structural Validation**: `tools/validation/check_change_scope.py` (blocks changes touching DB/RLS/Auth) and `tools/validation/validate_skill.py` (verifies 100% governance compliance).

## [1.0.0] - 2026-08-18

### 🚀 Initial Production Release
- **Locked Tenant Isolation Model**: Shared schema with `tenant_id uuid NOT NULL REFERENCES tenants(id)` + PostgreSQL Row Level Security (RLS) enforcement boundary.
- **4-Policy RLS Library & Leak Diagnosis**: Dedicated SELECT, INSERT, UPDATE, and DELETE policies per tenant-scoped table, role-scoped policies, and automated `pg_tables` / `pg_policies` coverage audits.
- **Supabase Custom Access Token Hook**: Server-side JWT claim injection (`tenant_id` + `role`) issued at token generation time without client manipulation.
- **Fail-Closed Edge Resolution**: Subdomain, custom domain, and session claim resolution in middleware with fail-closed (404/403) protection.
- **Pluggable Query Layer**: Choice of Supabase JS client, Drizzle ORM, or Prisma configured during `init` and locked in `ARCHITECTURE.md`.
- **Development Performance & Resource Optimization Track (`perf`)**:
  - 13-phase comprehensive read-only audit with 120-point scorecard.
  - 6 Bottleneck Causality Models (RAM Pressure, CPU, Disk I/O, Dependency Graph, TypeScript Scope, Watch Boundary).
  - 🟢 Green / 🟡 Yellow / 🔴 Red optimization catalog with 8-step Evidence Required pipeline for Yellow items.
  - Benchmark Noise Control with Cold/Warm run separation and 3-run median protocol.
  - SaaS Safety Boundary ensuring performance optimizations never weaken tenant isolation or security.
- **Project Memory & ADR Log**: Generation and synchronization of `ARCHITECTURE.md` with Performance Context and Risk Log.
- **CLI Wizard & Multi-Agent Distribution**: Standalone NPX installer (`npx @alwkala/tidyfactor-next add-skill`), `.agents/skills/tidyfactor-next/`, `.claude-skill/`, and global IDE integration.

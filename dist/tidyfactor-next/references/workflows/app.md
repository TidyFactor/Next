# Workflow: app

Assembles production App Router pages, layouts, error boundaries, and suspense boundaries following React 19 RSC best practices and runtime performance invariants.

---

## Steps

0. **Step 0: CDL Resolution & Brief Check**:
   - Check `.tidyfactor/next-brief.md` for UI styling and tenant routing mode.
   - Reference `memory/react-perf-rules.md` for Tier 1 (Waterfalls), Tier 2 (Bundle Size), and Tier 5 (Re-renders).

1. **Layout & Tenant Context Scaffolding**:
   - Create root/tenant layout with header, navigation, and tenant switcher.
   - Hoist static JSX icons and layout elements outside component functions (`rendering-hoist-jsx`).

2. **Server-Component Data Fetching & Waterfalls Elimination**:
   - Fetch data directly in async React Server Components (RSC) to eliminate client-side JS.
   - Wrap fetchers with `React.cache()` for per-request deduplication (`server-cache-react`).
   - Run independent fetches via `Promise.all()` (`async-parallel`).
   - Evaluate synchronous guards before awaiting promises (`async-cheap-condition-before-await`).

3. **Suspense Streaming & Loading Skeletons**:
   - Wrap slow or independent widget subtrees in `<Suspense fallback={<Skeleton />}>` (`async-suspense-boundaries`).
   - Provide route-level `loading.tsx` skeletons and `error.tsx` reset boundaries.

4. **Client Component Isolation & RSC Serialization**:
   - Keep `"use client"` strictly at leaf nodes (interactive forms, modals, controls).
   - Pass only minimal serialized DTOs across the RSC $\to$ RCC boundary (`server-dedup-props`).
   - Dynamically import heavy client widgets (Monaco, TipTap, Charts) via `next/dynamic` (`bundle-dynamic-imports`).
   - Calculate derived state in render phase; zero redundant state/effects (`rerender-derived-state`).

5. **Pre-Emit Self-Critique**:
   - `/* Pre-emit critique: P5 H5 E5 S5 R5 V5 D5 */`

---

## Validation checklist

- [ ] Page components fetch data on server side (RSC) with `Promise.all` for parallel queries.
- [ ] No synchronous guard placed after an `await` statement.
- [ ] Independent slow RSC subtrees wrapped in `<Suspense>` boundaries.
- [ ] `"use client"` directive restricted to leaf interactive components.
- [ ] Serialized props across RSC $\to$ RCC boundary are minimal DTOs (no raw DB entities).
- [ ] Heavy client libraries dynamically imported with `next/dynamic`.
- [ ] `loading.tsx` and `error.tsx` present for route segment.
- [ ] Pre-emit critique stamp included.

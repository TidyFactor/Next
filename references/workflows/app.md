# Workflow: app

Assembles production App Router pages, layouts, error boundaries, and suspense boundaries following React 19 RSC best practices.

---

## Steps

0. **Step 0: CDL Resolution & Brief Check**:
   - Check `.tidyfactor/next-brief.md` for UI styling and tenant routing mode.

1. **Layout & Tenant Context Scaffolding**:
   - Create root/tenant layout with header, navigation, and tenant switcher.

2. **Server-Component Data Fetching**:
   - Fetch data directly in async React Server Components (RSC) to minimize client-side JavaScript.

3. **Client Component Isolation**:
   - Keep `"use client"` strictly at leaf nodes (e.g., interactive forms, buttons, modals).

4. **Loading & Error States**:
   - Provide `loading.tsx` skeletons and `error.tsx` reset boundaries.

5. **Pre-Emit Self-Critique**:
   - `/* Pre-emit critique: P5 H5 E5 S5 R5 V5 D5 */`

---

## Validation checklist

- [ ] Page components fetch data on server side (RSC).
- [ ] `"use client"` directive restricted to leaf interactive components.
- [ ] `loading.tsx` and `error.tsx` present for route segment.
- [ ] Pre-emit critique stamp included.

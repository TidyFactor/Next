# Memory: client-server-boundaries

Operational reference for Client Bundle Composition Analysis and Server/Client boundary detection in Next.js App Router projects. Used during Phase 5 of `../workflows/audit-dev-perf.md`. Findings are classified only — never automatically converted.

---

## The Core Question

> What actually reaches the browser?

Every byte in the client bundle was sent over the network and parsed by JavaScript engine. The App Router makes it possible to keep most application logic server-side — but only if boundaries are correctly enforced.

---

## Server vs Client vs Shared

```
Server-only execution:
  - Route Handlers (app/api/)
  - Server Components (default in App Router)
  - Server Actions ('use server')
  - Middleware (edge runtime)

Client-only execution:
  - Client Components ('use client')
  - Custom hooks using React state/effects
  - Browser APIs (window, document, localStorage)

Shared (runs in both contexts):
  - Utility functions without environment dependencies
  - Type definitions
  - Constants
  - Pure data transformation functions
```

---

## High-Risk Library Categories for SaaS/LMS

These packages should NEVER reach the client bundle. Detect and flag if imported inside a Client Component.

| Library Category | Examples | Why It Must Be Server-Only |
|---|---|---|
| **Database clients** | `@supabase/supabase-js` (service role), Drizzle ORM, Prisma Client | Contains connection strings, bypasses RLS if service role key exposed |
| **AI SDKs (server-side calls)** | `openai`, `@anthropic-ai/sdk`, `@google/generative-ai` | Contains API keys; calls must be server-side |
| **Storage SDKs** | `@aws-sdk/client-s3`, `@google-cloud/storage` | Contains access credentials |
| **Email providers** | `@sendgrid/mail`, `nodemailer`, `resend` | Contains API keys; sending from client would expose them |
| **Server-only Next.js utilities** | `next/headers`, `next/cookies`, `server-only` | Explicitly runtime-restricted |
| **Crypto/Secrets** | `jsonwebtoken`, `bcryptjs`, `crypto` (Node.js) | Server-side security operations |

**Supabase-specific risk**: The `supabase-js` client with `serviceRoleKey` MUST only exist on the server. The anon client with `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe for browser — but it must still go through RLS.

---

## Server Leak Detection Pattern

The most common leak pattern in Next.js App Router:

```
lib/db.ts (server-only)
  → imports from @supabase/supabase-js with service role key

components/Dashboard.tsx
  → imports from lib/db.ts
  → has 'use client' directive at top

Result:
  lib/db.ts → included in client bundle
  service role key → exposed in browser network tab
```

**Detection method:**
1. Find all files with `'use client'` directive
2. Trace their import graph
3. Check if any imported module transitively imports a server-only package
4. Flag as HIGH RISK if confirmed

---

## Large UI Libraries in Client Bundle (SaaS/LMS Hotspots)

These are expected in client bundles but should be evaluated for size:

| Library | Expected Size | Optimization Lever |
|---|---|---|
| **lucide-react** | 1 icon ≈ 2-4 KB; 50 icons ≈ 100-200 KB | `optimizePackageImports` (Yellow) |
| **@heroicons/react** | Similar to lucide-react | Direct icon imports |
| **recharts / chart.js** | 50-150 KB minified | Dynamic import (`next/dynamic`) |
| **Monaco Editor** | 2-5 MB | Must be dynamically imported with `ssr: false` |
| **TipTap / ProseMirror** | 200-500 KB | Dynamic import; use extension tree-shaking |
| **date-fns** | v3: 10-15 KB with tree-shaking | Direct function imports only |
| **moment** | 300+ KB (no tree-shaking) | Replace with date-fns / dayjs |
| **@tanstack/react-table** | 30-50 KB | Already tree-shakeable; fine |
| **zod** | 12 KB minified | Fine on client |

---

## Findings Classification

For every finding in Phase 5:

| Classification | Meaning | Action |
|---|---|---|
| **Safe — Server Contained** | Package confirmed server-only; no client exposure | Document; no action needed |
| **Requires Developer Review** | Suspected leak; import chain ambiguous | Present import chain; developer verifies |
| **High Risk — Confirmed Client Leak** | Server-only package confirmed in client bundle | Flag CRITICAL; never auto-convert; present remediation path |

**Classification rule**: Do NOT automatically convert any component. Even a "High Risk" finding only becomes an action item when the developer reviews and approves the remediation plan.

---

## Remediation Patterns (Present, Do Not Apply Automatically)

### Pattern 1 — Add `server-only` package
```typescript
// lib/db.ts
import 'server-only'  // throws at build time if imported in Client Component

import { createClient } from '@supabase/supabase-js'
// ...
```

### Pattern 2 — Move server logic to Server Action
```typescript
// Before: logic in Client Component making API call
// After: 'use server' action extracts the server-side operation
'use server'
export async function fetchTenantData(tenantId: string) {
  // Server-only logic here
}
```

### Pattern 3 — Dynamic import with SSR disabled
```typescript
// For large UI-only libraries (Monaco, charts)
import dynamic from 'next/dynamic'
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })
```

### Pattern 4 — Correct `NEXT_PUBLIC_` usage
```typescript
// Only non-secret config should be NEXT_PUBLIC_
NEXT_PUBLIC_SUPABASE_URL=...     // Safe — not a secret
NEXT_PUBLIC_SUPABASE_ANON_KEY=... // Safe — anon key, RLS controls access
SUPABASE_SERVICE_ROLE_KEY=...    // NEVER NEXT_PUBLIC_ — must be server-only
```

---

## SaaS Safety Boundary (Applies to All Findings)

Any finding involving tenant isolation, RLS enforcement, or secret key exposure is automatically CRITICAL and reclassified to 🔴 Red — not addressable by the `perf` track alone. Route to `rls` or `auth` commands as appropriate.

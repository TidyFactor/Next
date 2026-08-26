# Memory: react-perf-rules (React 19 & Next.js 16 Runtime Performance Catalog)

<!-- last-verified: 2026-08-27 -->

Operational memory containing the 8-tier prioritized performance rules for React 19 and Next.js 16 App Router applications. Pure patterns, schemas, anti-patterns, and correct implementations. No narrative filler.

---

## 8-Tier Prioritization Matrix

```
┌──────────────────────────────────────────────────────────────┐
│ Tier 1: Eliminating Waterfalls (async-*)         [CRITICAL]  │
│ Tier 2: Bundle Size Optimization (bundle-*)      [CRITICAL]  │
│ Tier 3: Server-Side Performance (server-*)       [HIGH]      │
│ Tier 4: Client-Side Data Fetching (client-*)     [MED-HIGH]  │
│ Tier 5: Re-render Optimization (rerender-*)      [MEDIUM]    │
│ Tier 6: Rendering Performance (rendering-*)      [MEDIUM]    │
│ Tier 7: JavaScript Performance (js-*)            [LOW-MED]   │
│ Tier 8: Advanced React Patterns (advanced-*)     [LOW]       │
└──────────────────────────────────────────────────────────────┘
```

---

## Tier 1: Eliminating Waterfalls (`async-*`) — CRITICAL

### 1.1 `async-cheap-condition-before-await`
Evaluate cheap synchronous guards (local props, session cookies, route params) before awaiting remote flags or DB queries.

```typescript
// ❌ Incorrect: Always pays async penalty even if synchronous check fails
const flag = await getFeatureFlag('beta_pricing');
if (flag && isEligibleUser(user)) {
  renderBeta();
}

// ✅ Correct: Bypasses async network call on cold path
if (isEligibleUser(user)) {
  const flag = await getFeatureFlag('beta_pricing');
  if (flag) renderBeta();
}
```

### 1.2 `async-defer-await`
Defer `await` expressions into the exact conditional branch or code block where the data is actually used.

```typescript
// ❌ Incorrect: Awaits query before branch decision
const auditLog = await fetchHeavyAuditLog(orgId);
if (mode === 'lightweight') {
  return <SummaryView />;
}
return <FullAuditView log={auditLog} />;

// ✅ Correct: Only awaits when entering heavy branch
if (mode === 'lightweight') {
  return <SummaryView />;
}
const auditLog = await fetchHeavyAuditLog(orgId);
return <FullAuditView log={auditLog} />;
```

### 1.3 `async-parallel` & `async-dependencies`
Never sequence independent promises with sequential `await`. Use `Promise.all()` for independent fetches or resolve partial dependency graphs concurrently.

```typescript
// ❌ Incorrect: Sequential network waterfall
const tenant = await getTenant(tenantId);
const subscription = await getSubscription(tenantId);
const teamMembers = await getTeamMembers(tenantId);

// ✅ Correct: Concurrent execution
const [tenant, subscription, teamMembers] = await Promise.all([
  getTenant(tenantId),
  getSubscription(tenantId),
  getTeamMembers(tenantId),
]);
```

### 1.4 `async-api-routes`
In Route Handlers and Server Actions, initiate asynchronous promises immediately at handler start; await only when assembling response payload.

```typescript
// ❌ Incorrect: Waterfalling auth check and queries
export async function GET(req: Request) {
  const session = await auth();
  const data = await db.query(session.tenantId);
  return Response.json(data);
}

// ✅ Correct: Early promise initiation
export async function GET(req: Request) {
  const sessionPromise = auth();
  // Initiate parallel tasks if possible, or await at leaf
  const session = await sessionPromise;
  const data = await db.query(session.tenantId);
  return Response.json(data);
}
```

### 1.5 `async-suspense-boundaries`
Wrap slow or non-critical async RSC subtrees in `<Suspense fallback={<Skeleton />}>` to unlock progressive streaming and avoid blocking the initial HTML shell.

```typescript
// ✅ Correct: Fast shell renders immediately; heavy data streams in
export default async function DashboardPage({ params }: PageProps) {
  return (
    <div className="dashboard-grid">
      <Header />
      <Suspense fallback={<StatsSkeleton />}>
        <AsyncStatsWidget tenantId={params.tenantId} />
      </Suspense>
      <Suspense fallback={<ActivitySkeleton />}>
        <AsyncActivityFeed tenantId={params.tenantId} />
      </Suspense>
    </div>
  );
}
```

---

## Tier 2: Bundle Size Optimization (`bundle-*`) — CRITICAL

### 2.1 `bundle-barrel-imports`
Never import through barrel/index files for large icon or component libraries. Use direct subpath imports or Next.js `optimizePackageImports`.

```typescript
// ❌ Incorrect: Triggers full barrel bundle resolution
import { Check, AlertTriangle, Shield } from 'lucide-react';

// ✅ Correct: Configured via next.config.ts or direct path
// next.config.ts: experimental: { optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'] }
import { Check } from 'lucide-react';
```

### 2.2 `bundle-dynamic-imports`
Dynamically import heavy, non-critical client components (charts, rich text editors, PDF viewers) with `next/dynamic`.

```typescript
// ✅ Correct: Loaded on-demand; zero impact on main page bundle
const RichTextEditor = dynamic(() => import('@/components/editor/TipTapEditor'), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse bg-muted rounded" />
});
```

### 2.3 `bundle-defer-third-party`
Defer third-party analytics, customer support widgets, and tracking scripts until after hydration.

```typescript
// ✅ Correct: Offloads script execution past critical hydration
import Script from 'next/script';

<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive"
/>;
```

### 2.4 `bundle-preload`
Preload heavy dynamic chunks on intent triggers (`onMouseEnter` / `onFocus`) before click.

```typescript
const Modal = dynamic(() => import('@/components/HeavyModal'));

function TriggerButton() {
  return (
    <button
      onMouseEnter={() => { import('@/components/HeavyModal'); }}
      onClick={() => setOpen(true)}
    >
      Open Settings
    </button>
  );
}
```

---

## Tier 3: Server-Side Performance (`server-*`) — HIGH

### 3.1 `server-cache-react`
Wrap per-request read operations in `React.cache()` to automatically deduplicate identical calls within the same RSC render tree.

```typescript
import { cache } from 'react';
import { db } from '@/lib/db';

export const getTenantProfile = cache(async (tenantId: string) => {
  return db.tenants.findUnique({ where: { id: tenantId } });
});
```

### 3.2 `server-after`
Use Next.js 16 `after()` to execute non-blocking operations (audit logs, metrics, notifications) after the HTTP response has finished streaming.

```typescript
import { after } from 'next/server';

export async function POST(req: Request) {
  const result = await processPayment(req);
  
  // Non-blocking telemetry & audit trail
  after(async () => {
    await logAuditEvent({ action: 'payment.completed', id: result.id });
    await sendSlackAlert(result);
  });

  return Response.json({ success: true });
}
```

### 3.3 `server-dedup-props` & `server-serialization`
Minimize data serialized across the RSC $\to$ RCC boundary. Never pass full database records or server entity classes to Client Components; pass only minimal typed DTOs.

```typescript
// ❌ Incorrect: Serializes 50 unused columns across the RSC wire
<ClientUserCard user={rawDbUserRecord} />

// ✅ Correct: Only serializes essential presentation fields
<ClientUserCard 
  id={rawDbUserRecord.id} 
  name={rawDbUserRecord.name} 
  avatarUrl={rawDbUserRecord.avatar_url} 
/>
```

### 3.4 `server-auth-actions`
Treat Server Actions with the exact same security boundaries as public Route Handlers: always re-authenticate, verify tenant scope, and validate inputs via Zod.

---

## Tier 4: Client-Side Data Fetching (`client-*`) — MEDIUM-HIGH

### 4.1 `client-swr-dedup`
Client components fetching dynamic data must use SWR or TanStack Query with consistent cache keys for automatic request deduplication and cache sharing.

### 4.2 `client-passive-listeners`
Attach touch and wheel event listeners with `{ passive: true }` to keep scrolling smooth and unblocked.

```typescript
useEffect(() => {
  const handler = () => { /* read scroll */ };
  window.addEventListener('scroll', handler, { passive: true });
  return () => window.removeEventListener('scroll', handler);
}, []);
```

---

## Tier 5: Re-render Optimization (`rerender-*`) — MEDIUM

### 5.1 `rerender-derived-state`
Never mirror props to state or use `useEffect` to synchronize derived calculations. Compute derived values directly in the render function.

```typescript
// ❌ Incorrect: Redundant re-render loop
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${user.firstName} ${user.lastName}`);
}, [user]);

// ✅ Correct: Pure derived state in render
const fullName = `${user.firstName} ${user.lastName}`;
```

### 5.2 `rerender-primitive-usememo`
Never wrap cheap primitive calculations or simple string concatenations in `useMemo`.

```typescript
// ❌ Incorrect: useMemo overhead exceeds calculation cost
const total = useMemo(() => a + b, [a, b]);

// ✅ Correct
const total = a + b;
```

### 5.3 `rerender-nested-components`
Never declare a React component inside another React component's body. Always hoist to module scope.

### 5.4 `rerender-lazy-state`
When initializing state with an expensive calculation, pass an initializer function `useState(() => init())` to prevent recalculation on every re-render.

```typescript
// ❌ Incorrect: Parses JSON on every single render
const [config, setConfig] = useState(JSON.parse(localStorage.getItem('cfg') || '{}'));

// ✅ Correct: Runs exactly once on mount
const [config, setConfig] = useState(() => JSON.parse(localStorage.getItem('cfg') || '{}'));
```

### 5.5 `rerender-transitions`
Wrap non-urgent state updates in `startTransition()` or `useDeferredValue()` to keep high-frequency inputs responsive.

```typescript
const [isPending, startTransition] = useTransition();

function handleSearch(term: string) {
  setQuery(term); // urgent input update
  startTransition(() => {
    setFilteredResults(filterList(term)); // non-urgent list update
  });
}
```

---

## Tier 6: Rendering Performance (`rendering-*`) — MEDIUM

### 6.1 `rendering-content-visibility`
Apply `content-visibility: auto` with `contain-intrinsic-size` on long lists, data tables, and activity feeds.

```css
.virtual-row-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 48px;
}
```

### 6.2 `rendering-hoist-jsx`
Hoist static JSX icons, badges, and layout wrappers outside component render functions to reuse identical VNode instances.

### 6.3 `rendering-explicit-conditions`
Never use `count && <Component />` with numeric or string values (renders `0` or `""`). Use explicit ternary expressions: `count > 0 ? <Component /> : null`.

---

## Tier 7: JavaScript Performance (`js-*`) — LOW-MEDIUM

### 7.1 `js-layout-thrashing`
Never interleave DOM reads (`offsetWidth`, `getBoundingClientRect`) and DOM writes (`style.width`, `classList.add`). Batch all reads first, then execute writes.

### 7.2 `js-set-map` & `js-index-maps`
Use `Set` and `Map` for $O(1)$ item lookup in arrays exceeding 50 items.

```typescript
// ❌ Incorrect: O(N * M) nested lookup
const activeUsers = users.filter(u => activeIds.includes(u.id));

// ✅ Correct: O(N + M) Set lookup
const activeIdSet = new Set(activeIds);
const activeUsers = users.filter(u => activeIdSet.has(u.id));
```

### 7.3 `js-tosorted`
Use immutable array methods (`toSorted()`, `toReversed()`, `toSpliced()`) instead of mutating originals (`sort()`, `reverse()`).

---

## Tier 8: Advanced React Patterns (`advanced-*`) — LOW

### 8.1 `advanced-use-effect-event`
Extract non-reactive callback logic and analytics trackers from effect bodies using `useEffectEvent` (or stable ref callbacks) to avoid triggering unwanted effect re-runs.

### 8.2 `advanced-init-once`
Run one-time application initialization at the module scope or inside a root layout guard, never inside per-mount component effects.

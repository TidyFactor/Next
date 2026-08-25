# Memory: cache-storage-rules

Operational reference for cache scope analysis, watch boundary auditing, and the strict separation of Git hygiene from development tooling hygiene. Used in Phases 7, 8, and 9 of `../workflows/audit-dev-perf.md`.

---

## Critical Conceptual Separation

### Git Hygiene vs Dev Tooling Hygiene — Independent Scopes

These are NOT the same. Each controls a completely different system:

| Config | System It Controls | What Happens If Misconfigured |
|---|---|---|
| `.gitignore` | Git version control | Files accidentally committed; repo bloat |
| `tsconfig.json exclude` | TypeScript compiler & language server | TS analyzes unnecessary files; slow typecheck & IDE |
| `next.config watchOptions.ignored` | Next.js file watcher (chokidar) | Unnecessary HMR invalidations; high disk I/O |
| `next.config pageExtensions` | Next.js page resolution | Non-page files treated as routes |
| `.eslintignore` / `eslint.config ignores` | ESLint | Unnecessary files linted; slow lint pass |

**The educational anchor rule:**
> `.next/` in `.gitignore` does NOT prevent Next.js from using it.
> `.next/` in `tsconfig exclude` prevents TypeScript from analyzing it.
> These are independent scopes and must be configured separately.

---

## Git Hygiene Audit Checklist

Inspect `.gitignore` for missing entries:

```
Should be in .gitignore:
  ✓ .next/
  ✓ node_modules/
  ✓ .env.local
  ✓ .env.*.local
  ✓ .turbo/
  ✓ .eslintcache
  ✓ tsconfig.tsbuildinfo
  ✓ *.tsbuildinfo

Common omissions in SaaS/LMS projects:
  ? dist/
  ? out/
  ? .vercel/
  ? coverage/
  ? playwright-report/
  ? test-results/
  ? uploads/ (if user uploads stored locally — ideally moved to object storage)
  ? logs/*.log
  ? *.export.csv
  ? *.export.json (if bulk data exports generated locally)
```

---

## Dev Tooling Hygiene Audit Checklist

### TypeScript (`tsconfig.json`)

Directories that should be in `exclude` but are often missing:

```json
{
  "exclude": [
    "node_modules",
    ".next",
    "dist",
    "out",
    ".turbo",
    "coverage",
    "playwright-report",
    "supabase/functions",           // Edge Functions have their own tsconfig
    "scripts",                       // If build scripts use different tsconfig
    "**/*.test.ts",                  // Only if tests have separate tsconfig
    "**/*.spec.ts"
  ]
}
```

`include` should list only actual source directories, not the entire project root:

```json
// Bad (analyzes everything):
{ "include": ["**/*"] }
{ "include": ["."] }

// Good (analyzes only source):
{ "include": ["app", "components", "lib", "hooks", "types", "utils"] }
```

### Next.js File Watcher (`next.config.js`)

```javascript
// next.config.js
module.exports = {
  // Add watchOptions if large non-source directories exist in project tree
  webpack: (config) => {
    config.watchOptions = {
      ignored: [
        '**/node_modules/**',
        '**/.next/**',
        '**/public/uploads/**',     // If user uploads stored locally
        '**/public/videos/**',      // If video assets stored locally
        '**/public/generated/**',   // If AI or tool outputs stored here
        '**/logs/**',               // Application logs
        '**/backups/**',            // Database backups
        '**/exports/**',            // Bulk data exports
      ]
    }
    return config
  }
}
```

---

## Cache & Storage Analysis

### Cache Size Benchmarks

| Condition | .next/cache : source ratio | Assessment |
|---|---|---|
| Healthy | < 3:1 | Normal operation |
| Watch | 3:1 – 10:1 | Acceptable; older caches accumulating |
| Needs attention | 10:1 – 50:1 | Clear cache; investigate cache invalidation patterns |
| Problem | > 50:1 | Cache not being evicted; storage pressure |

### Cache Trade-Off Model

```
MORE caching:
  → Less rebuild work (CPU savings)
  → More RAM used (module cache in memory)
  → More disk space used (.next/cache)
  → More disk I/O (reading cache on each startup)

LESS caching:
  → More rebuild work (CPU increase)
  → Less RAM used
  → Less disk space
  → Slower HMR rebuilds

Recommendation: Always depends on the PRIMARY BOTTLENECK.
  RAM-constrained machine → reduce in-memory cache via --max-old-space-size
  Disk I/O constrained (HDD) → NVMe upgrade beats cache tuning
  CPU-constrained → maximize cache to avoid recomputation
```

**DO NOT disable `.next/cache` as a general optimization. It always increases rebuild work.**

---

## Watch Boundary Audit — Target Patterns

Inspect the project directory tree for these high-risk patterns, especially in SaaS/LMS projects:

```
HIGH RISK (watch boundary violation):
  project/
  ├── public/
  │   ├── uploads/          ← user-uploaded files (images, documents, avatars)
  │   ├── videos/           ← course videos, webinar recordings
  │   └── generated/        ← AI-generated outputs, exported PDFs, processed images
  ├── exports/              ← bulk data exports (CSV, Excel, JSON)
  ├── backups/              ← database backups, snapshot files
  ├── logs/                 ← application log files
  └── scripts/generated/   ← code generation outputs

MEDIUM RISK:
  ├── prisma/migrations/    ← SQL migration files (many of them over time)
  └── supabase/migrations/  ← Supabase migration files
```

**Impact calculation:**
- 1,000 files in `public/uploads/` → 1,000 extra inotify/fs watch events to manage
- On HDD: each metadata stat() call is slow
- TypeScript language server may attempt to resolve type information for these files

**Immediate action** (Green): Add to `watchOptions.ignored` in `next.config.js`
**Architectural recommendation** (present as manual): Move to `Supabase Storage / S3 / CDN` if the scale is significant

---

## Architectural Escalation Template

When `uploads/` or `videos/` inside the project tree exceed ~500 files or ~500 MB, present this escalation (never apply automatically):

```markdown
### Architectural Recommendation: Move Media to Object Storage

**Finding**: [X] files / [X GB] detected in `public/uploads/` inside the project filesystem.

**Current Architecture**:
  Browser → Next.js Server → Project Filesystem

**Recommended Architecture**:
  Browser → Next.js Server → Supabase Storage (or S3 / Cloudflare R2)

**Benefits**:
  - Removes thousands of files from the development file watch boundary
  - Eliminates dev startup overhead from watching media files
  - Provides CDN delivery for better production performance
  - Scales independently of the application server

**Migration requires**:
  - Developer and architecture team review
  - File storage service setup
  - Upload handler changes
  - URL path migration for existing stored files

**Risk**: NOT a safe automated change — present for team decision.
```

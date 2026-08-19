# Memory: dependency-optimization

Operational reference for dependency graph analysis, transitive dependency evaluation, and module surface assessment. Used during Phase 3 of `../workflows/audit-dev-perf.md`.

---

## Dependency Graph Mental Model

```
Direct Dependencies (package.json)
         ↓
Transitive Dependencies (what each dep pulls in)
         ↓
Module Surface (total modules analyzed by bundler + TypeScript)
         ↓
Client Bundle Exposure (what actually reaches the browser)
         ↓
Build Cost (compilation + analysis time per dep)
```

**Key insight**: Dependency COUNT is a poor proxy for dependency COST.

```
50 deps with 1 heavy transitive tree
   > 150 deps with clean, shallow graphs

Example: Adding `aws-sdk` v2 (one package) pulls in 400+ modules.
Example: 120 lightweight utility packages may have <200 total modules combined.
```

---

## Analysis Dimensions

### 1. Direct Dependencies (`package.json → dependencies`)
- List all packages in `dependencies`
- Identify any that are only used in: build scripts, config files, tests, CLI tools
  - These should be in `devDependencies`
- Identify packages with zero imports in source code (candidates for removal — verify before flagging)

### 2. Transitive Dependency Surface
- For each large or suspicious package, check total modules it pulls in
- Tools to use if available: `npm ls --all`, `pnpm why <package>`, `npx depcheck`
- Focus on packages known for heavy transitive trees:
  - AWS SDK v2 (legacy, very large)
  - Firebase SDK (modular v9+ is better; v8 is monolithic)
  - `moment` (large; `date-fns` or `dayjs` preferred for bundle)
  - `lodash` (if not imported as `lodash/function`, pulls everything)
  - Full `@mui/material` (large if not tree-shaken)

### 3. Duplicate Package Versions
- Multiple versions of same package in lockfile → bundler bundles both
- Common with: React, TypeScript utilities, `tslib`, form libraries
- Check: `npm ls <package-name>` to see all resolved versions
- Impact: Increased bundle size; potential type mismatch errors

### 4. CommonJS vs ESM
| Condition | Impact |
|---|---|
| Package is CJS (uses `require`) | Cannot be tree-shaken; entire package is bundled |
| Package is ESM (uses `export`) | Tree-shakeable; only imported exports included |
| Package has `"exports"` field in package.json | Modern ESM-aware; tree-shaking works |
| Package lacks `"module"` or `"exports"` field | Likely CJS; verify before assuming |

- Check: `package.json → "type": "module"` or `"exports"` field of the dependency
- Next.js handles many CJS packages automatically, but CJS still costs more in module graph traversal

### 5. `optimizePackageImports` Applicability Criteria

This is a **Yellow** optimization — not a blanket switch.

Apply ONLY when ALL of the following are true:
1. The package uses barrel exports (exports many symbols from a single `index.js`)
2. The package is imported in multiple source files
3. The package appears in Next.js's own recommended list OR has been verified to work with this setting
4. Benchmarked BEFORE and AFTER to confirm positive DELTA

Known packages that commonly benefit:
```
lucide-react       ← icon library, 1000+ icons, barrel export
@heroicons/react   ← similar to lucide-react
react-icons        ← massive icon library
@radix-ui/*        ← individual package imports are already optimal; skip
date-fns           ← v3+ is already ESM; verify before adding
```

Known packages to be careful with:
```
@mui/material   ← has its own tree-shaking optimizations; may conflict
lodash          ← use direct imports instead: import debounce from 'lodash/debounce'
moment          ← monolithic; replace with dayjs/date-fns instead of optimizePackageImports
```

---

## Barrel Import Anti-Patterns

### What Is a Barrel Import?
```typescript
// components/index.ts (the barrel file)
export { Button } from './Button'
export { Modal } from './Modal'
export { DataTable } from './DataTable'
// ... 50 more exports

// Usage in source code
import { Button } from 'components'  // Barrel import — pulls in entire barrel
```

### Why It's Costly
- Bundler must resolve the barrel → load all re-exported modules → analyze each
- Even if only `Button` is used, the bundler may load `DataTable` and `Modal` first
- In large codebases: hundreds of files × deep barrel chains = large module graph

### Recommended Pattern
```typescript
// Direct import (tree-shakeable)
import { Button } from 'components/Button'
import { Modal } from 'components/Modal'
```

### When NOT to change barrel imports automatically
- Barrel files that have side effects (CSS imports, module augmentation, polyfills)
- Barrel files in third-party libraries (controlled by `optimizePackageImports`)
- Internal barrel files where the team has explicitly chosen the pattern

---

## Dependency Classification Table

Use this during Phase 3 to categorize findings:

| Finding Type | Severity | Recommended Action | Safe to Apply |
|---|---|---|---|
| Verified unused dep in `dependencies` | HIGH | Remove after grep verification | 🟢 Green (post-verification) |
| Runtime dep classified as `dependencies` but build-only | MEDIUM | Move to `devDependencies` | 🟢 Green |
| Duplicate package versions in lockfile | MEDIUM | `npm dedupe` / `pnpm dedupe` | 🟡 Yellow (verify types match) |
| Large CJS dep without ESM alternative | MEDIUM | Present alternative; developer decides | 🔴 Red (replacement) |
| Barrel import pattern in own code | LOW | Propose direct imports | 🟡 Yellow |
| `optimizePackageImports` candidate | LOW | Present evidence; developer approves | 🟡 Yellow |
| Heavy transitive tree dep (build-time only) | HIGH | Evaluate devDep move | 🟢 Green if verified |

---

## Commands for Manual Dependency Analysis

```bash
# Find unused dependencies (needs manual verification before removal)
npx depcheck

# See full dependency tree for a specific package
npm ls <package-name> --all
pnpm why <package-name>

# Check for duplicate versions
npm ls --all | grep -E "deduped|duplicated"

# Estimate bundle impact (build analysis)
npx @next/bundle-analyzer  # requires ANALYZE=true env var and config

# Check if a package is ESM
cat node_modules/<package-name>/package.json | grep -E '"type"|"exports"|"module"'
```

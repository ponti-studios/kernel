# Type Architecture

Types are the contract between modules. Where a type lives determines who can use it, who can change it, and what breaks when it changes.

## Type Ownership

Every type has exactly one source of truth. Duplication creates divergence.

| Type category              | Lives in                                                    |
| -------------------------- | ----------------------------------------------------------- |
| Database row types         | `packages/db` — Kysely codegen output, never hand-edited    |
| API request/response types | `packages/api` or `services/api` — derived from Zod schemas |
| Shared domain types        | A dedicated `packages/types` or `packages/core`             |
| App-local UI state types   | The app package that owns them                              |
| Utility types              | The package that uses them — do not hoist unless shared     |

**Import direction:** apps import from packages; packages do not import from apps.

## Zod-First Schemas

Define schemas with Zod. Derive types from schemas — never maintain parallel type definitions.

```typescript
import { z } from "zod";

// Define once
export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(["admin", "standard"]).default("standard"),
});

// Derive — do not redeclare
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
```

Never write:

```typescript
// ❌ schema and type maintained separately — they will diverge
const CreateUserSchema = z.object({ email: z.string() });
type CreateUserInput = { email: string }; // duplication
```

## tsconfig Layout

Use TypeScript project references for monorepos.

```
tsconfig.json             ← root: solution config (references only)
tsconfig.base.json        ← shared compiler options
packages/
  db/
    tsconfig.json         ← composite: true, declarationMap: true
  api/
    tsconfig.json         ← composite: true, references db
  types/
    tsconfig.json         ← composite: true
apps/
  web/
    tsconfig.json         ← references api, types
```

```json
// Root tsconfig.json — solution file
{
  "files": [],
  "references": [
    { "path": "./packages/db" },
    { "path": "./packages/types" },
    { "path": "./packages/api" },
    { "path": "./apps/web" }
  ]
}
```

```json
// packages/api/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declarationMap": true,
    "outDir": "./dist"
  },
  "references": [{ "path": "../db" }, { "path": "../types" }]
}
```

Build with project references: `bun run typecheck` (tsgo under the hood). This rebuilds only changed packages.

## Base tsconfig

```json
// tsconfig.base.json — shared by all packages
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "skipLibCheck": false,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "jsx": "react-jsx"
  }
}
```

Always enable `strict`, `exactOptionalPropertyTypes`, and `noUncheckedIndexedAccess`. These catch real bugs. Never use `module: NodeNext` or `moduleResolution: NodeNext` — the stack uses Vite's bundler resolution.

## Package Exports

Use the `exports` field — not `main` — for all packages.

```json
// packages/api/package.json
{
  "name": "@acme/api",
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
    "./types": { "import": "./dist/types.js", "types": "./dist/types.d.ts" }
  }
}
```

Import paths in consuming packages: `import type { X } from "@acme/api/types"` — not from relative paths across package boundaries.

## Avoiding Common Pitfalls

| Anti-pattern                                           | Fix                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------- |
| `any` in a shared type                                 | Use `unknown` and narrow explicitly                                       |
| Types redeclared in multiple packages                  | Move to `packages/types`, export from there                               |
| Circular package references                            | Introduce a shared types package that neither imports from the other      |
| Hand-edited codegen output                             | Regenerate from source; add to `.gitignore` if it should not be committed |
| `@ts-ignore` or `@ts-expect-error` without explanation | Explain in a comment why it is necessary; add a ticket to remove it       |

## Guardrails

- Never use `any` in exported types — it propagates unsafety to every consumer
- Never import from a package's `src/` directory — always from its published exports
- Never hand-edit generated type files (database types, GraphQL types, OpenAPI types)
- A type belongs in the lowest-level package that needs it — do not hoist to shared until two packages need it
- Keep `tsconfig.json` files minimal — most options should live in `tsconfig.base.json`

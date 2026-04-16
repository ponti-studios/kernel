---
name: kernel-project-init
kind: skill
tags:
  - project
  - setup
profile: extended
description: "Scaffolds new projects using the prescribed stack: TypeScript 7
  (tsgo), Vite+, TanStack Router, Hono, Kysely, Goose, Tailwind CSS + CSS
  Modules, and Better-Auth. Use when starting a new repository or bootstrapping
  a project from scratch."
license: MIT
compatibility: Bun + TypeScript projects.
metadata:
  author: project
  version: "2.0"
  category: Engineering
  tags:
    - project
    - init
    - setup
    - typescript
    - vite
    - tanstack-router
    - hono
    - kysely
    - goose
    - tailwind
    - better-auth
    - bun
when:
  - starting a new project or repository from scratch
  - bootstrapping a monorepo with web, API, and shared packages
  - user asks how to set up a new project
applicability:
  - Use when initializing any new project before application code is written
termination:
  - TypeScript type-check passes with zero errors
  - Build succeeds with zero errors and zero warnings treated as errors
  - Test runner executes and passes
  - Lint passes with zero violations
  - Git initialized with .gitignore and initial commit
outputs:
  - Initialized project with prescribed stack, working build, test, lint, and
    type-check pipelines
---

Initialize a new project using the prescribed stack. Every choice below is non-negotiable — do not substitute, suggest alternatives, or ask the user to choose.

## Prescribed Stack

| Concern             | Technology                                                         |
| ------------------- | ------------------------------------------------------------------ |
| Runtime             | Bun                                                                |
| Language            | TypeScript 7 (tsgo)                                                |
| Monorepo            | Vite+ (Vitest, Vite workspaces)                                    |
| Web framework       | TanStack Router                                                    |
| Backend framework   | Hono                                                               |
| Mobile framework    | React Native + Expo (EAS for builds)                               |
| Database query      | Kysely                                                             |
| Database migrations | Goose                                                              |
| Styling             | Tailwind CSS + CSS Modules (web); StyleSheet / NativeWind (mobile) |
| Auth                | Better-Auth                                                        |

Never use: Express, Next.js, Remix, Prisma, Drizzle, tRPC, Webpack, Create React App, plain React Router, React Native CLI (use Expo), or any other substitute. If the user asks to use a different technology, explain the standard and proceed with the prescribed choice.

## Steps

### 1. Confirm project type

Determine the shape of the project:

- **Full-stack web app** — TanStack Router (frontend) + Hono (backend) + Kysely + Goose
- **Backend service only** — Hono + Kysely + Goose
- **Frontend only** — TanStack Router + Vite
- **Mobile app** — React Native + Expo + EAS
- **Monorepo** — Vite+ workspaces containing any combination of the above

### 2. Scaffold

```bash
# Monorepo root
bun init
```

Monorepo workspace layout:

```
apps/
  web/          # TanStack Router app
  api/          # Hono service
  mobile/       # React Native + Expo app
packages/
  db/           # Kysely client + Goose migrations
  ui/           # Shared components (Tailwind + CSS Modules)
  auth/         # Better-Auth config
```

Single-app projects follow the same internal structure without the workspace layer.

### 3. Configure TypeScript

Use TypeScript 7 with tsgo. `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ESNext",
    "jsx": "react-jsx"
  }
}
```

Strict mode is non-negotiable. Never disable `strict`, `noImplicitAny`, or `strictNullChecks`.

### 4. Configure tooling

**Vite+ (build + dev server):**

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

**Tailwind CSS:**

```bash
bun add -d tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts — add to plugins
import tailwindcss from "@tailwindcss/vite";
plugins: [react(), tailwindcss()];
```

Use CSS Modules for component-scoped styles alongside Tailwind utility classes. Never use inline styles.

**Linting and formatting:**

```bash
bun add -d eslint @typescript-eslint/eslint-plugin prettier
```

Enforce via CI — format and lint must pass before merge.

**Testing:**

```bash
bun add -d vitest @testing-library/react
```

### 5. Set up TanStack Router (web)

```bash
bun add @tanstack/react-router
bun add -d @tanstack/router-vite-plugin
```

Use file-based routing. Enable the Vite plugin for automatic route generation. Never use `createBrowserRouter` from React Router.

### 6. Set up Hono (backend)

```bash
bun add hono
```

```ts
// src/index.ts
import { Hono } from "hono";
const app = new Hono();
export default app;
```

### 7. Set up Kysely + Goose (database)

```bash
bun add kysely
bun add -d goose
```

- Kysely handles query building and type-safe DB access.
- Goose handles all schema migrations — never modify the schema with raw SQL outside a migration file.
- Migration files live in `packages/db/migrations/`.
- Generated Kysely types live in `packages/db/src/schema.ts` — regenerate after every migration.

### 8. Set up Better-Auth

```bash
bun add better-auth
```

- All auth logic lives in `packages/auth/`.
- Never implement custom session handling, JWT issuance, or password hashing — Better-Auth owns all of this.

### 9. Configure environment

```bash
cp .env.example .env.local
```

`.env.example` must contain every required key with a placeholder value and a comment describing it. No key may be added to source code without a corresponding entry in `.env.example`.

### 10. Initialize git

```bash
git init
git add .
git commit -m "chore: initial project setup"
```

`.gitignore` must exclude: `node_modules/`, `dist/`, `.env.local`, `*.local`, `.turbo/`, `build/`.

### 11. Verify

Do not write application code until all of these pass:

```bash
bun run typecheck   # zero errors
bun run build       # zero errors, zero warnings-as-errors
bun test            # runner executes and passes
bun run lint        # zero violations
```

## Guardrails

- Never use a technology outside the prescribed stack without explicit user override.
- Never disable TypeScript strict mode or any strictness flag.
- Never commit `.env.local` or any file containing real credentials.
- Never write schema changes outside a Goose migration file.
- Never implement custom auth — Better-Auth owns all authentication.
- Do not proceed to application code until all verification checks in Step 11 pass.

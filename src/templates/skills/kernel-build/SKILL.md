---
name: kernel-build
kind: skill
tags:
  - infrastructure
  - tooling
profile: extended
description: Runs and diagnoses the build, type-check, test, and lint pipeline
  using Bun, Vite, tsgo, and Vitest. Use when a build fails, tests are broken,
  CI is failing, or when running the full pipeline before a deploy or merge.
license: MIT
compatibility: Bun + Vite + TypeScript 7 projects.
metadata:
  author: project
  version: "2.0"
  category: Engineering
when:
  - running a production build
  - running tests or debugging a test failure
  - diagnosing a CI failure that doesn't reproduce locally
  - debugging a build failure after a dependency or config change
applicability:
  - Use when building or testing a project
  - Use when a build or test is failing and the root cause is unknown
termination:
  - Build succeeds with zero errors and zero suppressed warnings
  - All tests pass
  - Root cause of any failure is identified and fixed
outputs:
  - Passing build and test suite
  - Root cause analysis if a failure was diagnosed
argumentHint: package name or test filter (optional)
---

Run builds, type-checks, and tests using the prescribed toolchain. Diagnose and fix failures.

## Prescribed Toolchain

| Concern    | Tool                       |
| ---------- | -------------------------- |
| Runtime    | Bun                        |
| Build      | Vite (`bun run build`)     |
| Type-check | tsgo (`bun run typecheck`) |
| Test       | Vitest (`bun test`)        |
| Lint       | ESLint (`bun run lint`)    |

Never use: `npm`, `npx`, `yarn`, `pnpm`, `tsc` (use tsgo), Jest, Webpack, or any other substitute.

## Standard Commands

```bash
# Full pipeline — run in this order
bun run typecheck   # TypeScript 7 / tsgo — zero errors required
bun run build       # Vite production build — zero errors, zero warnings-as-errors
bun test            # Vitest — all tests must pass
bun run lint        # ESLint — zero violations
```

### Monorepo — targeting a specific package

```bash
bun run --filter @your-org/api build
bun run --filter @your-org/web typecheck
bun test --project packages/db
```

### Before building

- Confirm dependencies are installed: `bun install`
- Clean previous artifacts if stale: `rm -rf dist/ .vite/ .turbo/`
- Ensure `NODE_ENV=production` for production builds

### After building

- Verify artifacts exist in `dist/` and sizes are plausible
- Run a smoke test or preview: `bun run preview`
- Check build logs for warnings — treat all warnings as errors

## Debugging a Failure

1. Read the full error — the actual message is usually at the bottom, not the top.
2. Classify the failure:
   - **Type error** — fix the type; never use `as any` or `@ts-ignore` to suppress
   - **Missing module** — run `bun install`; check the import path and `tsconfig.json` paths
   - **Config error** — check `vite.config.ts`, `tsconfig.json`, or the relevant config file
   - **Logic failure** — read the test assertion; fix the code, not the test
3. Check if the failure is local-only or reproducible in CI.
4. Fix the root cause — never suppress errors or skip tests to make the pipeline pass.
5. Re-run the full pipeline to confirm the fix didn't introduce a new failure.

### CI vs. local differences

| Symptom                     | Likely cause                                                                            |
| --------------------------- | --------------------------------------------------------------------------------------- |
| Passes locally, fails in CI | Missing env var; lockfile drift (`bun install --frozen-lockfile`); case-sensitive paths |
| Fails locally, passes in CI | Stale local artifacts — clean and rebuild                                               |
| Flaky test                  | Timing assumption or shared state — isolate the test                                    |
| Type error only in CI       | tsgo version mismatch — check `package.json`                                            |

## Guardrails

- Never use `as any`, `@ts-ignore`, or `// eslint-disable` to make a pipeline pass — fix the root cause.
- Never skip or mark a test as expected-failing to unblock a build — fix or explicitly delete the test with a comment.
- Never deploy from a build that produced warnings unless each one is reviewed and accepted.
- Always run the full pipeline (`typecheck → build → test → lint`) before declaring a fix complete.

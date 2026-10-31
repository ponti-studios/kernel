# Tier 1 — the foundation

Everything here is syntax-level or type-level. It is cheap, it runs in seconds, and it removes the entire
class of review comment that a machine should have caught.

## Install

```bash
npm i -D oxlint oxfmt knip vitest @vitest/coverage-v8 lefthook
brew install shellcheck        # or: apt-get install shellcheck
uv tool install ruff           # or: pipx install ruff
```

`knip` and `oxfmt` have no runtime dependencies worth worrying about; `vitest` replaces `jest`/`node:test`
and brings coverage with it.

## Scripts

```jsonc
{
  "scripts": {
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "format": "oxfmt --write .",
    "format:check": "oxfmt --check .",
    "knip": "knip",
    "lint:sh": "shellcheck -x scripts/*.sh",
    "lint:py": "ruff check . && ruff format --check .",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "hooks": "lefthook install"
  }
}
```

## Type-check first, not last

Run the compiler **before** the linter and **after** every autofix:

- `noImplicitAny: true` is the single highest-yield flag. On a real repo it exposed a state field typed
  `any`, which is why eight callbacks had implicit parameters and nobody noticed.
- The compiler is the only gate that sees the difference between "unused variable removed" and "the type
  the code depended on disappeared". `oxlint --fix` and `oxfmt` both rewrite code; a build after them is
  not optional.
- If a build is slow, `tsc --noEmit` in a separate fast job is still worth it.

## Coverage is a floor, not a target

Measure first, then set the floor just under the measurement so the number can only ratchet up:

```bash
npm run test:coverage            # read the table
# then write thresholds just below each measured number
```

Two hard-won rules:

1. **Cover the artefact that runs.** If the tests import `dist/`, point `coverage.include` at `dist/`.
   Measuring the sources in that setup reports ~0% and everyone concludes coverage is broken.
2. **Never set a target you have not measured.** A threshold invented at 80% on a repo at 61% fails on day
   one and gets deleted on day two, which teaches the team that gates are decorative.

## knip: entry points first

`knip`'s first run on a real repo is wrong, and it is wrong in an instructive way: anything nothing imports
looks dead. That includes launchd jobs, CLI entry points, migration scripts, and framework route files that
are discovered by convention. List them in `entry`, re-run, and only investigate what survives. The
dependencies section is the valuable part — unused packages are supply-chain surface with no upside.

## Order of operations on the first run

1. format everything once (`npm run format`) — expect a large diff, and commit it alone so the real changes
   stay reviewable. A real repo had 98 files drift from any format because nothing enforced anything.
2. `lint:fix`, then fix the rest by hand.
3. build — the autofix will have broken something.
4. tests — a formatter can expose a type error that was hiding behind `any`.
5. coverage floor, knip entry points, hooks.

## Hooks

`lefthook install` writes the git hooks. Pre-commit: lint and format with `stage_fixed: true` so the fix
lands in the same commit; shellcheck and ruff for the scripts nobody formats. Pre-push: build, knip, tests.
Keep pre-push under a minute or people will use `--no-verify`.

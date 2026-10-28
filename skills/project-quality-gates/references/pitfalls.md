# Pitfalls, with the measurement that exposed each one

Ordered by how much time they cost. Every entry is a real failure, not a hypothetical.

## Coverage reports 0%

Tests import the build output (`../dist/lib/thing.js`), coverage measures `src/`. Either point
`coverage.include` at the compiled files, or turn on source maps and map back. Confirm by checking one file
you know is exercised — if it reads 0%, the plumbing is wrong, not the tests.

## An autofix breaks the build

`oxlint --fix` (and ESLint's equivalent) rewrites code without updating types: `unicorn/prefer-set-has`
turned a `Set`-like constant into `new Set([...])` while the annotation still said `string[]` and the call
site still used `.includes()`. Rule: **build after every autofix**, and make the build part of the same
commit.

## `knip` reports everything as unused

Entry points that nothing imports (launchd jobs, CLI scripts, route files) look dead. List them in `entry`.
If `knip` still reports an export as unused, check whether it is used only by a test — that is a real
finding in most repos, and a config change in a few.

## The secret scanner flags its own tests

A fixture that proves a scanner works must contain credentials. Allowlist those **paths** — not the rule —
then verify with a planted token. If the planted token passes, the allowlist blinded the scanner and the
gate is worthless.

## The link checker reports nine broken links

Private repositories 404 for unauthenticated requests. Pass a token (`gh auth token`), and exclude loopback
URLs, which are instructions to run a dev server rather than links.

## Accessibility gates on colour contrast

axe rates contrast "serious", so a naive gate fails every page with a muted palette and gets deleted. Gate
on structure, annotate contrast. The number still gets reported, which is what makes it actionable.

## Mutation testing cannot start under TypeScript 7

`TypeError: ts.parseConfigFileTextToJson is not a function` — Stryker's preprocessor is injected
unconditionally and TS 7's native release does not ship the JS compiler API (`createProgram` is also
missing). Keep a TypeScript 5 install for tooling, or catch it in the npm script and explain rather than
dumping a stack trace.

## A launchd/systemd entry point silently stops running

A job wired to a script whose `case` statement does not know its name exits immediately with an empty log —
and the exit code looks fine. `launchctl print` is ground truth, not the exit code. Add a test that asserts
every scripted agent is accepted by the runner **and** has a template that names it.

## Hooks installed but never run

`lefthook install` writes `core.hooksPath`; a clone that has not run it has no hooks. Put `npm run hooks` in
the README's first-run block and in any container/devcontainer setup, and let CI be the backstop — never the
only line of defence.

## A gate that everyone has learned to ignore

If a check is advisory for more than a sprint, either give it a threshold that means something or delete it.
A warning nobody reads costs the same attention as a failure nobody trusts.

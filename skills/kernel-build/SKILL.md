---
name: kernel-build
description: Runs the repo's build, type-check, test, and lint pipeline, diagnoses failures, and verifies fixes. Use when CI is failing, a local build or test is broken, or before merge or deploy when the validation pipeline must pass.
license: MIT
compatibility: Any project with a defined local build, type-check, test, or lint workflow.
metadata:
  author: project
  version: "2.0"
  category: Engineering
when:
  - running a production build
  - running tests or debugging a test failure
  - diagnosing a CI failure that doesn't reproduce locally
  - debugging a build failure after a dependency or config change
  - running the full validation pipeline before merge or deploy
applicability:
  - Use when running or debugging the repo's validation pipeline
  - Use when a build or test is failing and the root cause is unknown
termination:
  - The relevant validation commands succeed with no unreviewed warnings or suppressed errors
  - The failing step is reproduced locally or the CI-only cause is identified
  - Root cause of any failure is identified and fixed
outputs:
  - Passing validation pipeline
  - Root cause analysis if a failure was diagnosed
argumentHint: package name or test filter (optional)
---

Run the repo's validation pipeline, diagnose failures, and verify the fix.

## Standards

Use the commands and package manager the repo actually defines. Prefer the project's documented workflow over generic defaults.

The validation job owned by this skill is operational:

- discover the relevant build, type-check, test, and lint commands
- run the failing step or full pipeline as appropriate
- classify the failure accurately
- fix the root cause or hand off to a narrower specialist when needed
- rerun the relevant checks to verify the fix

Do not invent a new pipeline if the repo already has one. Read `package.json`, workspace scripts, CI config, or repo docs first.

If a failure is clearly domain-specific, keep ownership of the pipeline run but use the narrower skill for the fix:

- `kernel-typescript` for type-system issues
- `kernel-testing` for test design, flaky tests, or coverage questions
- `kernel-react` / `kernel-react-native` for UI-layer failures
- `kernel-database` for migration or schema failures

## Process

1. Inspect the repo's defined scripts and CI entrypoints before running commands.
2. Reproduce the failing step with the narrowest command that still exposes the problem.
3. Classify the failure:
   - **Type error**: fix the type issue; do not suppress it.
   - **Build/config error**: inspect the relevant config and dependency graph.
   - **Test failure**: determine whether the bug is in production code, test setup, or the test itself.
   - **Lint failure**: fix the underlying code or configuration mismatch.
   - **CI-only failure**: compare environment, lockfile, OS/path behavior, and missing secrets or services.
4. Fix the root cause or route to the correct specialist skill if deeper domain work is needed.
5. Rerun the failing step first, then rerun the broader validation pipeline needed for confidence.
6. Report what failed, what changed, and what verification now passes.

## CI vs. Local Differences

| Symptom                     | Likely cause                                                                            |
| --------------------------- | --------------------------------------------------------------------------------------- |
| Passes locally, fails in CI | Missing env var; lockfile drift (`pnpm install --frozen-lockfile`); case-sensitive paths |
| Fails locally, passes in CI | Stale local artifacts — clean and rebuild                                               |
| Flaky test                  | Timing assumption or shared state — isolate the test                                    |
| Type error only in CI       | Version mismatch, different build flags, or stale generated artifacts                   |

## Guardrails

- Never use `as any`, `@ts-ignore`, or `// eslint-disable` to make a pipeline pass unless the user explicitly approves a temporary exception.
- Never skip a failing test just to get green CI without naming the tradeoff and intended follow-up.
- Never silently normalize warnings, flaky behavior, or environment drift as "good enough."
- Never claim a fix is complete without rerunning the relevant verification commands.

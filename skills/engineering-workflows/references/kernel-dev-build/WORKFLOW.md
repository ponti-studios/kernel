> Invoke with: package name or test filter (optional).

## Definition of done

- The relevant validation commands succeed with no unreviewed warnings or suppressed errors
- The failing step is reproduced locally or the CI-only cause is identified
- Root cause of any failure is identified and fixed

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

- [kernel-dev-typescript](../kernel-dev-typescript/WORKFLOW.md) for type-system issues
- [kernel-dev-testing](../kernel-dev-testing/WORKFLOW.md) for test design, flaky tests, or coverage questions
- [kernel-dev-react](../kernel-dev-react/WORKFLOW.md) / [kernel-dev-react-native](../kernel-dev-react-native/WORKFLOW.md) for UI-layer failures
- [kernel-dev-database](../kernel-dev-database/WORKFLOW.md) for migration or schema failures

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

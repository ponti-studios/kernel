---
name: kernel-archive
description: "Closes and cleans up completed project issues and associated follow-up work in Linear. Use when a project milestone is done, stale work needs cleanup, or users ask to archive, close, or wrap up completed items."
---

Close completed project work using Linear issues.

## Steps

### 1. Verify and orient

- List all issues under the project scope.
- Count: how many are `done`? How many remain `todo`, `in-progress`, or `blocked`?

### 2. Resolve or defer remaining issues

For each issue that is not `done`:

- **In Progress** — determine if it can be finished now or must be deferred. If deferring, reconcile its status first.
- **Blocked** — diagnose the blocker. If it cannot be resolved, defer to a follow-up issue.
- **Todo** — classify using the scope test below, then act accordingly.

**Scope test — is this issue in-scope or out-of-scope?**

- **In-scope**: the issue directly serves the parent's stated goal, was planned from the start, and can be completed without expanding the original scope.
- **Out-of-scope**: the issue was discovered during execution, serves a different goal, or would require work beyond the parent's acceptance criteria.
- **Grey area**: if unsure, ask — does completing this issue change what the parent delivers? If yes, it's scope expansion and should be deferred.

For in-scope todo items that are small, complete them now. For out-of-scope or large items, create a follow-up issue under a different parent or new project. Always record the follow-up issue ID in the completion summary.

### 3. Mark the project complete

- Confirm all sub-issues are either `done`, `cancelled`, or deferred to a clearly identified follow-up.
- Update the parent issue `state` to `done`.

### 4. Write a completion summary

- Add a completion comment on the parent issue:
  - What was delivered.
  - What was deferred (link or reference to follow-up issues).
  - Lessons or risks to carry forward.

### 5. Report

- Confirm the parent issue is closed.
- List any follow-up issues created with their IDs.

## Guardrails

- Always use Linear to transition state — never manage closure in local mirrors.
- Surface all incomplete items before closing — do not silently skip unresolved work.
- Deferred work must have a named home (a follow-up issue or project) — do not delete or cancel it.
- Every closed project must have a completion comment; closure without a summary is not complete.

---
name: kernel-execute
description: 'Execute implementation work from Linear issues one at a time, following priority and blocking order. Updates issue state in Linear before and after every unit of work. Use when tasks are ready for implementation, or when users say "start on this", "build", "implement", or "do this".'
argument-hint: "Issue ID, project ID, or scope to execute"
---

# kernel-execute

Implement work from Linear issues. Work on exactly one issue at a time. Every state change must be written back to Linear immediately.

---

## Execution Loop

Repeat this loop for each issue until the selected scope is complete or blocked.

### 0. Orient (first issue only)

- Identify the target scope: a project, parent issue, or single issue ID.
- Read all `state: todo` issues in scope to confirm the full queue before starting.
- Confirm the first issue has no unresolved blocking relations. If it does, surface them and stop.

### 1. Select the next issue

Use this priority order:

**a. Relations-first (explicit ordering)**
Read the most recently completed issue. If it has `blocks` relations, those issues are now unblocked — pick the highest-priority one.

**b. Sibling sub-issues (implicit ordering)**
If the completed issue has a `parentId`, read sibling child issues with the same parent and `state: todo`. Pick the highest-priority unstarted sibling.

**c. Project backlog fallback**
Read all `state: todo` issues in the target project, ordered by priority. Pick the top unblocked issue.

Before claiming, re-read the candidate issue to confirm no unresolved blocking relations.

### 2. Claim the issue

- `mcp_linear_save_issue` — transition `state` to `in-progress` before writing a single line of code.
- Do not start implementation until the state update is confirmed.

### 3. Implement and verify

- Implement only what the issue's acceptance criteria describe — nothing more, nothing less.
- Add or update tests that prove the acceptance criteria are met.
- Do not refactor surrounding code, add docstrings, or fix unrelated lint. Separate concerns go in a new issue.
- Run type-check, lint, and tests. All must pass before marking done.
- If a blocker surfaces mid-implementation: stop, `mcp_linear_save_comment` to explain it, transition to **Blocked** via `mcp_linear_save_issue`, and do not continue.

### 4. Complete the issue

- `mcp_linear_save_comment` — add a completion note: what changed, why, files touched, follow-up issues if any.
- `mcp_linear_save_issue` — transition `state` to `done` only after all checks pass.

### 5. Move to the next issue

- Return to Step 1 only after the current issue is `done`.
- Never hold more than one issue `in-progress` simultaneously.

---

## Guardrails

- One issue `in-progress` at a time. Finish or block before starting the next.
- Claim `in-progress` before coding. Mark `done` only after verification passes.
- If scope beyond the current issue is discovered, create a new issue — do not expand the current one.
- Linear is the source of truth — do not track state in chat comments or local notes.

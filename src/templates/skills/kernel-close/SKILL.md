---
name: kernel-close
description: "Close out a completed project or milestone: resolve remaining open issues, write a completion summary, and create a retrospective document. Use when a project is done, a milestone has shipped, or users ask to wrap up, close, or finalize a body of work."
argument-hint: "Project name, milestone, or parent issue ID to close"
---

# kernel-close

Close out completed project work cleanly. This is the deliberate completion workflow — distinct from Linear's own "Archive" button (which hides items from the active backlog without a completion record).

---

## Step 1 — Orient

- `mcp_linear_list_issues` for the project or parent scope.
- Count: how many are `done`? How many remain `todo`, `in-progress`, or `blocked`?

---

## Step 2 — Resolve remaining issues

For each issue that is not `done`, apply the **scope test**:

**In-scope**: directly serves the parent's stated goal, was planned from the start, completable without expanding original acceptance criteria.
**Out-of-scope**: discovered during execution, serves a different goal, or requires work beyond acceptance criteria.
**Grey area**: if completing this issue changes what the parent delivers, it is scope expansion — defer it.

| Issue state                 | Action                                                           |
| --------------------------- | ---------------------------------------------------------------- |
| In progress, finishable now | Finish it                                                        |
| In progress, needs deferral | Move to `todo`, then defer to follow-up                          |
| Blocked, unresolvable now   | Defer to a follow-up issue                                       |
| Todo, in-scope, small       | Complete it                                                      |
| Todo, out-of-scope or large | Create a follow-up issue under a different parent or new project |

Always record the follow-up issue ID for the completion summary.

---

## Step 3 — Mark the project complete

- Confirm all sub-issues are `done`, `cancelled`, or deferred to an identified follow-up.
- `mcp_linear_save_issue` — transition the parent issue `state` to `done`.
- If a project milestone is complete, `mcp_linear_save_milestone` to update its status.

---

## Step 4 — Write the completion summary

`mcp_linear_save_comment` on the parent issue:

- What was delivered
- Which acceptance criteria were met
- What was deferred (with follow-up issue IDs)
- Key decisions made during execution

---

## Step 5 — Write the retrospective document

`mcp_linear_create_document` linked to the project or team:

```markdown
## Retrospective: <project or milestone name>

**Delivered**: <one-sentence summary>
**Duration**: <start → end>

### What went well

-

### What didn't go well

-

### What to change next time

-

### Deferred work

- [ISSUE-ID] <title> — <reason deferred>

### Key decisions

-
```

---

## Step 6 — Report

- Confirm the parent issue is closed with its Linear ID.
- List any follow-up issues created with their IDs.
- Confirm the retrospective document was created and provide the link.

---

## Guardrails

- Surface all incomplete items before closing — never silently skip unresolved work.
- Deferred work must have a named home (a follow-up issue) — do not delete or cancel it.
- Every closed project must have both a completion comment and a retrospective — closure without documentation is not complete.
- This skill closes deliverables with a completion record. Use Linear's native "Archive" only to clean up inactive backlog items.

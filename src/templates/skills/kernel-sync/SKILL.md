---
name: kernel-sync
description: "Reconcile Linear issue tracking with what actually happened. Audits in-progress issues against codebase evidence, surfaces drift, and presents a clear action list for the user to confirm before anything is changed. Use when the board has drifted from reality, work was completed without updates, or users ask to sync or clean up the board."
---

# kernel-sync

Reconcile Linear issue state with the current state of the codebase. This skill reports drift and presents recommendations — it never auto-creates or auto-transitions issues without the user confirming.

---

## Step 1 — Collect current project state

- `mcp_linear_list_issues` with `state: in-progress` — find currently claimed work.
- `mcp_linear_list_issues` with `state: todo` — find queued work in scope.

---

## Step 2 — Audit each in-progress issue

For every issue currently marked `in-progress`:

- Read the issue description, comments, and acceptance criteria.
- Search the codebase for evidence the work is complete (relevant files changed, tests passing, feature present).
- Classify as one of:

| Classification            | Criteria                                          |
| ------------------------- | ------------------------------------------------- |
| **Done**                  | Work is complete and verified in the codebase     |
| **Stale**                 | No recent codebase activity; no progress evidence |
| **Blocked**               | Work started but stopped for a known reason       |
| **Genuinely In Progress** | Active work is happening; leave as-is             |

---

## Step 3 — Audit the todo queue for orphans

- Identify any `todo` issues that have no `parentId` but belong to an existing parent or project scope.
- Note these as candidates for re-parenting.

---

## Step 4 — Surface git drift

- Check recent git commits and changed files for meaningful work with no corresponding Linear issue.
- Do **not** create issues automatically. Collect the list of undocumented changes and present it to the user.

---

## Step 5 — Present the drift report and confirm

Before making any changes, show the user a complete drift report:

```
## Sync Report

### Recommended transitions
| Issue ID | Title | Current state | Recommended | Reason |
|---|---|---|---|---|
| TEAM-NNN | <title> | in-progress | done | Work verified in <file> |
| TEAM-NNN | <title> | in-progress | todo | No codebase activity found |
| TEAM-NNN | <title> | in-progress | blocked | Blocker found: <description> |

### Orphaned issues (no parentId)
| Issue ID | Title | Suggested parent |
|---|---|---|
| TEAM-NNN | <title> | TEAM-NNN (<parent title>) |

### Undocumented git activity (no Linear issue found)
| Commit / file | Description | Suggested action |
|---|---|---|
| <hash> | <commit message> | Create issue? Skip? |

Shall I apply these changes? (yes / no / select)
```

Wait for the user to confirm before applying any transitions.

---

## Step 6 — Apply confirmed changes

For each transition the user approves:

- `mcp_linear_save_issue` — apply the state transition
- `mcp_linear_save_comment` — add a brief comment explaining the change
- For any undocumented work the user wants to capture: `mcp_linear_save_issue` with `state: done`

---

## Step 7 — Final report

Summarise what was changed: how many issues transitioned, any issues re-parented, and any undocumented work captured.

---

## Guardrails

- Never transition an issue to `done` without codebase evidence.
- Never auto-create issues for undocumented git activity — present candidates first and let the user decide.
- Do not delete or cancel issues during sync; flag them for human review.
- Run before starting a new implementation session to prevent double-claiming work.

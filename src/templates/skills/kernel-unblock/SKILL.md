---
name: kernel-unblock
description: "Diagnose a blocked Linear issue and determine how to resolve it. Use when an issue is in blocked status, implementation has stopped on a dependency, or a blocking relationship has not resolved."
---

# kernel-unblock

Diagnose and resolve a blocked Linear issue.

---

## Step 1 — Read the blocked issue

- `mcp_linear_get_issue` — read the blocked issue and its comments.
- Read the blocking comment to understand the specific blocker.
- List all relations — identify any `blockedBy`, `blocks`, `duplicate`, or `related` links.
- Check: are any `blockedBy` issues already `done`?

---

## Step 2 — Diagnose the blocker

Classify the blocker using the relation type as a guide:

| Classification           | Criteria                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| **Stale dependency**     | A `blockedBy` issue is already `done`. State reconciliation needed.                                         |
| **Missing information**  | Issue description lacks enough detail. Clarification required before work can proceed.                      |
| **Technical dependency** | Upstream code, API, or infrastructure is genuinely not ready. Issue cannot proceed.                         |
| **Scope conflict**       | Implementation revealed overlap with another issue. `blocks` or `related` link may exist. Needs re-scoping. |
| **Duplicate**            | A `duplicate` relation exists or the work is the same as another issue.                                     |
| **External dependency**  | Blocked on a person, team, or third-party outside this codebase.                                            |

---

## Step 3 — Resolve based on classification

| Classification           | Resolution                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stale dependency**     | Confirm the `blockedBy` issue is actually done. Remove the blocking relation. `mcp_linear_save_issue` to transition blocked issue to `todo`.                  |
| **Missing information**  | Write clarification into the issue description. `mcp_linear_save_issue` to transition to `todo`.                                                              |
| **Technical dependency** | Confirm an upstream issue exists and is tracked. Leave as `blocked`. Add a `mcp_linear_save_comment` naming the unblocking condition and expected timeline.   |
| **Scope conflict**       | `mcp_linear_save_issue` — split conflicting scope into a new child issue. Update relations. Transition the original to `todo` with reduced scope.             |
| **Duplicate**            | Mark the blocked issue as duplicate of the canonical one. Close or cancel it. Comment with the canonical issue ID.                                            |
| **External dependency**  | `mcp_linear_save_comment` naming the external dependency and expected resolution date. Leave as `blocked`. Update the parent issue if timeline is threatened. |

---

## Step 4 — Update the parent issue

- If the blocker shifts delivery timeline or changes scope, `mcp_linear_save_issue` to update the parent description.

---

## Step 5 — Report

- State the blocker classification and which relation type was involved.
- Describe the action taken.
- Confirm the new status of the previously blocked issue.
- State whether implementation can resume immediately or must wait.

---

## Guardrails

- Never silently remove a blocking relation without understanding why it existed.
- Distinguish between `blockedBy` (sequential dependency) and `duplicate` (same work) and `related` (informational) — each requires a different resolution.
- Every resolution must leave a comment trail.
- If resolution requires implementation work, transition to `todo` and let the execution workflow pick it up — do not implement during unblock.
- When in doubt about classification, investigate first.

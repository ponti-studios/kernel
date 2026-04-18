---
name: kernel-do
kind: command
tags:
  - workflow
description: Execution coordinator — works through the active kernel work plan task by task, verifies each step, and surfaces blockers immediately.
group: workflow
argumentHint: optional specific task or scope override (e.g., 'implement the login route', 'only the database layer')
backedBySkill: kernel-execute
---

Use this when a kernel work plan exists and implementation should begin or continue. Do not use this when the plan is unclear — use `kernel-plan` first.

## Before Touching Anything

Read the current work state:

1. Run `kernel work status` to confirm the active work item and goal.
2. Read `kernel/work/<id>/brief.md` to confirm the acceptance criteria.
3. Read `kernel/work/<id>/tasks.md` to identify the next unchecked task.
4. Read `kernel/work/<id>/journal.md` to check for blockers or context from prior sessions.

Do not start executing until you know:

- What the current task is
- What "done" looks like for that task (from `brief.md`)
- Whether any blockers were recorded that have not been resolved

## Execution Loop

Repeat for each unchecked task in order:

1. **Confirm** — run `kernel work next` to get the exact task title and confirm it matches your read of `tasks.md`.
2. **State the completion criterion** — before writing any code, state: *"This task is complete when [specific, observable condition]."* If you cannot state this clearly, stop and use `kernel-plan` to clarify.
3. **Implement** — make the change. Keep scope tight to this task only.
4. **Verify** — confirm the acceptance criterion is met. Run tests, read the output, check the behavior.
5. **Close** — run `kernel work done <taskId>` to mark the task complete.
6. **Progress update** — after each task, output a brief update (see format below).

## Progress Update Format

After each completed task:

```
**Done** — [task title]: [what changed / what was produced]
**Next** — [next task title]
**Blocked** — (list blockers, or "none")
```

## Handling Blockers

When you hit a blocker:

- **Stop** — do not guess through it or apply a silent workaround.
- **Classify** — is it missing context, a hidden dependency, an environment issue, or a scope change?
- **Record** — note the blocker in `kernel/work/<id>/journal.md` so it is visible to the next session.
- **Escalate** — use `kernel-plan` to revise the plan if the blocker changes what needs to be done.

Never continue past a blocker with a workaround that isn't captured in the plan.

## Handling Scope Drift

When reality differs from the plan:

- **Small deviation** — update `journal.md` and continue.
- **New task discovered** — add it to `tasks.md` before absorbing it into the work.
- **Scope change** — pause, update `brief.md` and `tasks.md` to reflect the new understanding, then resume.

Never absorb unplanned work silently.

## When to Use Other Commands

| Situation | Command to use |
|-----------|---------------|
| Plan is unclear or missing | `kernel-plan` |
| Need to investigate before implementing | `kernel-search` |
| Implementation complete, needs review | `kernel-review` |
| Git operations needed | `kernel-git` |

## Guardrails

- Never start without reading the current kernel work state.
- Never mark a task done without verifying its acceptance criterion.
- Never add scope without updating `brief.md` and `tasks.md` first.
- Never hide drift between the code and the work artifacts — write it to the journal.
- If the active work item's milestone is already marked done, stop and verify scope has not shifted before continuing.

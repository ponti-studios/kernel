---
name: kernel-work-status
kind: command
tags:
  - workflow
description: Show the current goal, progress, next task, and local work location
  for the active work item.
group: workflow
target: work status
argumentHint: optional work id
---

Use this when you need a quick readiness or progress check without changing the work state.

What this command should tell you:

- The active goal.
- Total, complete, and remaining task counts.
- The next unchecked task.
- The repo-visible work directory.

What healthy status looks like:

- The goal still matches the work being done.
- The next task is still valid.
- Progress in `tasks.md` matches reality.

What to do next:

- Run `kernel-work-plan` if the plan no longer reflects reality.
- Run `kernel-work-next` if the next task is ready to execute.
- Run `kernel-work-archive` once the work is complete.

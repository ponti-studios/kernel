---
name: kernel-work-done
kind: command
tags:
  - workflow
description: Mark one task complete in the active local work item and keep the
  work state in sync with reality.
group: workflow
target: work done
argumentHint: task id or title
---

Use this immediately after finishing and verifying a task.

What this command is for:

- Mark the completed task in local work state.
- Keep `tasks.md` aligned with what actually happened.
- Report how much work remains.

Completion expectations:

- Only mark a task done after verification.
- Use the task id or a clear task title match.
- Keep progress updates small and honest instead of batching several tasks together.

What to do next:

- Run `kernel-work-next` to pick up the next task.
- Run `kernel-work-status` if you want to inspect the remaining plan before continuing.

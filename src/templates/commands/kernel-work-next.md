---
name: kernel-work-next
kind: command
tags:
  - workflow
description: Read the active local work item, identify the next unchecked task,
  and use it as the single execution target.
group: workflow
target: work next
argumentHint: optional work id
---

Use this when a work item is planned and you are ready to implement the next step.

Execution expectations:

- Read the active work goal and current task list first.
- Identify the next unchecked task instead of skipping ahead.
- State the completion criterion before starting implementation.
- Execute one task at a time.
- Stop and surface blockers instead of guessing around them.

A task is ready when:

- It is the next unchecked item in `tasks.md`.
- Its acceptance criterion is observable.
- The current plan still supports it.

What to do next:

- Run `kernel-work-done` after verifying the task is complete.
- Run `kernel-work-plan` if execution reveals scope drift or missing planning.
- Run `kernel-work-status` if you want a quick progress snapshot before continuing.

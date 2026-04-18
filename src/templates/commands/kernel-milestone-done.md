---
name: kernel-milestone-done
kind: command
tags:
  - workflow
description: Mark a milestone as complete
group: workflow
target: milestone done
argumentHint: optional milestone id
---

Mark a milestone as done.

Before marking complete:

- Confirm that all work items under this milestone are archived or explicitly deferred.
- Use `kernel-milestone-status` to check linked work items.

This updates the milestone status to "done" and records the completion time. The milestone directory is preserved — it is not deleted.

What to do next:

- Check whether the parent project is now complete — if all its milestones are done, run `kernel-project-done`.
- Run `kernel-milestone-list` to see remaining active milestones.

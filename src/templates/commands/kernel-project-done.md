---
name: kernel-project-done
kind: command
tags:
  - workflow
description: Mark a project as complete
group: workflow
target: project done
argumentHint: optional project id
---

Mark a project as done.

Before marking complete:

- Confirm that all milestones under this project are done or explicitly deferred.
- Use `kernel-milestone-list` to check the status of linked milestones.

This updates the project status to "done" and records the completion time. The project directory is preserved — it is not deleted.

What to do next:

- Check whether the parent initiative is now complete — if all its projects are done, run `kernel-initiative-done`.
- Run `kernel-project-list` to see remaining active projects.

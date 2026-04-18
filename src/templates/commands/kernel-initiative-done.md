---
name: kernel-initiative-done
kind: command
tags:
  - workflow
description: Mark an initiative as complete
group: workflow
target: initiative done
argumentHint: optional initiative id
---

Mark a strategic initiative as done.

Before marking complete:

- Confirm that all projects under this initiative are done or explicitly deferred.
- Use `kernel-project-list` to check the status of linked projects.

This updates the initiative status to "done" and records the completion time. The initiative directory is preserved — it is not deleted.

What to do next:

- Run `kernel-initiative-list` to see remaining active initiatives.
- Start a new initiative with `kernel-initiative-new` if needed.

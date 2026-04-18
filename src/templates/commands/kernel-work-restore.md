---
name: kernel-work-restore
kind: command
tags:
  - workflow
description: Restore an archived work item back to active status.
group: workflow
target: work restore
---

Use this to bring an archived work item back into the active queue.

Provide the work item ID (e.g., `build-analytics-dashboard`) to restore it.

What this does:

- Moves the item from `kernel/work/archive/` back to `kernel/work/`
- Resets status to `active` and clears `doneAt`
- Sets the restored item as the current work pointer
- Appends a "Restored from archive" entry to the journal

Use this when:

- A previously archived item needs to be reopened
- Work was archived prematurely and must continue

What to do next:

- Run `kernel-work-status` to confirm the item is active.
- Run `kernel-work-next` to see what task to pick up.

---
name: kernel-work-archive
kind: command
tags:
  - workflow
description: Archive a completed local work item into kernel/work/archive/ while
  preserving its history.
group: workflow
target: work archive
argumentHint: optional work id
---

Use this when a local work item is done and should leave the active queue.

Archive expectations:

- Check what is being archived before moving it.
- Surface incomplete tasks before closing the work item.
- Preserve the full local record under `kernel/work/archive/`.
- Treat archive as lifecycle completion, not deletion.

When to archive:

- The planned work is complete.
- Remaining unchecked tasks are intentionally deferred or already captured elsewhere.
- The work record should no longer be the active item.

What to do next:

- Start the next item with `kernel-work-new`.
- Check whether the parent milestone is now complete — if all its work items are done, run `kernel-milestone-done`.
- Use the archived record later for review, follow-up planning, or historical context.

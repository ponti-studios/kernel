---
name: kernel-work-list
kind: command
tags:
  - workflow
description: List all active local work items and show which one is currently active.
group: workflow
target: work list
---

Use this to see all work items in the active queue.

Output includes:

- The currently active work item (pointer)
- All work item IDs, goals, statuses, and task progress (complete / remaining)
- Parent milestone or project links (if set)

Use this to:

- Discover available work items after archiving the active one
- Find a work item ID to pass explicitly to other commands
- Get a progress snapshot across all in-flight work

What to do next:

- Run `kernel-work-status` with a specific work ID to inspect a single item.
- Run `kernel-work-next` to begin executing the currently active item.
- Run `kernel-work-new` to start a new item.

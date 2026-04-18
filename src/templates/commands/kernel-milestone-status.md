---
name: kernel-milestone-status
kind: command
tags:
  - workflow
description: Show the status of a milestone and its linked work items
group: workflow
target: milestone status
argumentHint: optional milestone id
---

View the current status and metadata of a milestone.

Output includes:

- Milestone goal and status
- Target date (if set)
- Parent project (if linked)
- File path to the milestone directory
- Linked work items with their completion status (done / active / archived)

Use this to quickly check:

- What the milestone is about
- When the milestone is due
- How many work items are complete vs remaining
- Whether it's active or done

What to do next:

- Run `kernel-milestone-plan` if the scope or approach has drifted.
- Run `kernel-work-next` to continue executing the next work item.
- Run `kernel-milestone-done` once all work items are archived.

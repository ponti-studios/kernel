---
name: kernel-milestone-plan
kind: command
tags:
  - workflow
  - planning
description: Refine and structure a milestone
group: workflow
target: milestone plan
backedBySkill: kernel-plan
argumentHint: optional milestone id
---

Use this when a milestone needs deeper planning or restructuring.

What this does:
- Refreshes the milestone brief.md
- Prepares the milestone for planning with kernel-plan skill
- Structures milestone scope and success criteria

When to use:
- After creating a new milestone and want to flesh it out
- When the milestone scope or date has shifted
- Before creating work items under this milestone

Next steps:
- Run `kernel-milestone-status` to review the milestone
- Run `kernel-work-new --milestone <id>` to create a work item

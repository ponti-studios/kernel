---
name: kernel-project-plan
kind: command
tags:
  - workflow
  - planning
description: Refine and structure a project
group: workflow
target: project plan
backedBySkill: kernel-plan
argumentHint: optional project id
---

Use this when a project needs deeper planning or restructuring.

What this does:
- Refreshes the project brief.md and plan.md
- Prepares the project for planning with kernel-plan skill
- Structures project phases and success criteria

When to use:
- After creating a new project and want to flesh it out
- When the project scope or approach has shifted
- Before creating milestones under this project

Next steps:
- Run `kernel-project-status` to review the project
- Run `kernel-milestone-new --project <id>` to create a milestone

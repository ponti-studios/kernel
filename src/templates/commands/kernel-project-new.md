---
name: kernel-project-new
kind: command
tags:
  - workflow
  - planning
description: Create a new project
group: workflow
target: project new
argumentHint: goal
---

Create a new project. Use this for time-bound deliverables that can be delivered by a team and contain phases or milestones.

What this command creates:
- A new project directory at `kernel/projects/<id>/`
- A brief.md with the project goal
- A plan.md for approach and risks
- A project.yaml record

Options:
- `--initiative <initiativeId>` — Link this project to a strategic initiative

Next steps:
- Run `kernel-project-plan` to refine the project
- Run `kernel-milestone-new --project <id>` to create milestones under this project
- Run `kernel-work-new --milestone <id>` to create work items under a milestone

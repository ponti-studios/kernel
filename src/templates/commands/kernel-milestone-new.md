---
name: kernel-milestone-new
kind: command
tags:
  - workflow
  - planning
description: Create a new milestone
group: workflow
target: milestone new
argumentHint: goal
---

Create a new milestone. Use this for phases or checkpoints within a project.

What this command creates:
- A new milestone directory at `kernel/milestones/<id>/`
- A brief.md with the milestone goal
- A milestone.yaml record

Options:
- `--project <projectId>` — Link this milestone to a project

Next steps:
- Run `kernel-milestone-plan` to refine the milestone
- Run `kernel-work-new --milestone <id>` to create work items under this milestone

---
name: kernel-initiative-new
kind: command
tags:
  - workflow
  - planning
description: Create a new strategic initiative
group: workflow
target: initiative new
argumentHint: goal
---

Create a new strategic initiative. Use this when you want to define a long-term theme or vision that will span multiple projects or teams.

What this command creates:
- A new initiative directory at `kernel/initiatives/<id>/`
- A brief.md with the strategic goal
- An initiative.yaml record

Next steps:
- Run `kernel-initiative-plan` to refine the initiative
- Run `kernel-project-new --initiative <id>` to create projects under this initiative

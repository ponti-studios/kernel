---
name: kernel-initiative-plan
kind: command
tags:
  - workflow
  - planning
description: Refine and structure an initiative
group: workflow
target: initiative plan
backedBySkill: kernel-plan
argumentHint: optional initiative id
---

Use this when an initiative needs deeper planning or structuring.

What this does:
- Refreshes the initiative brief.md with updated context
- Prepares the initiative for planning with kernel-plan skill

When to use:
- After creating a new initiative and want to flesh it out
- When the initiative direction has shifted and needs restructuring
- Before linking projects under this initiative

Next steps:
- Run `kernel-initiative-status` to review the initiative
- Run `kernel-project-new --initiative <id>` to create a project under this initiative

To plan an entire hierarchy (initiative → project → milestone → work items) in one guided flow, invoke the `kernel-plan` skill directly.

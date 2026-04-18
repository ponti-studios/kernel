---
name: kernel-initiative-status
kind: command
tags:
  - workflow
description: Show the status of an initiative and its linked projects
group: workflow
target: initiative status
argumentHint: optional initiative id
---

View the current status and metadata of an initiative.

Output includes:

- Initiative goal and status
- File path to the initiative directory
- Linked projects with their completion status (done / active / archived)

Use this to quickly check:

- What the initiative is about
- How many projects are complete vs remaining
- Whether it's active or done

What to do next:

- Run `kernel-initiative-plan` if the strategic direction has shifted.
- Run `kernel-project-new --initiative <id>` to add a new project.
- Run `kernel-initiative-done` once all linked projects are complete.

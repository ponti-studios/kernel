---
name: kernel-work-plan
kind: command
tags:
  - workflow
  - planning
description: Refine the active local work item so brief.md, plan.md, and
  tasks.md become the single planning surface.
group: workflow
target: work plan
argumentHint: optional work id
backedBySkill: kernel-plan
---

Use this after creating a work item or whenever the plan has drifted.

What this command is for:

- Clarify scope and constraints.
- Surface unknowns, risks, and hidden dependencies.
- Tighten success criteria before implementation.
- Normalize `brief.md`, `plan.md`, and `tasks.md` around the current work state.

Planning expectations:

- Keep `kernel/work/<id>/brief.md`, `plan.md`, and `tasks.md` as the only planning artifacts.
- Make tasks concrete, sequential when needed, and easy to verify.
- Ensure the next task is small enough to execute without new architectural decisions.
- Call out blockers or open questions in the local work files instead of keeping them in chat only.

Move to execution when:

- The goal and success criteria are explicit.
- The next unchecked task is obvious.
- The plan reflects the current understanding of the work.

What to do next:

- Run `kernel-work-next` when the next unchecked task is ready to execute.
- Run `kernel-work-status` if you only need a quick progress check.

For structured planning across all hierarchy levels (initiatives, projects, milestones, and work items), use the `kernel-plan` skill directly.

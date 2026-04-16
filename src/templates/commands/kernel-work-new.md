---
name: kernel-work-new
kind: command
tags:
  - workflow
description: Start a new local work item from a natural-language goal and set up
  the planning surface in kernel/work/.
group: workflow
target: work new
argumentHint: goal or work description
---

Use this when you are beginning a new feature, fix, or scoped project slice.

What this command is for:

- Turn a natural-language goal into a durable local work item.
- Create the repo-visible planning surface in `kernel/work/<id>/`.
- Establish a first pass at the brief, plan, tasks, and journal.

How to use it well:

- Pass the outcome you want in natural language.
- Keep the goal focused enough to complete in one local work record.
- Prefer user outcome language over implementation details when possible.

What good output looks like:

- The goal is clear.
- The work item is active.
- The user can immediately open `brief.md`, `plan.md`, and `tasks.md`.

What to do next:

- Run `kernel-work-plan` to tighten scope, risks, acceptance criteria, and task sequencing before implementation.

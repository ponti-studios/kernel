---
name: kernel-plan
kind: command
tags:
  - workflow
  - planning
description: Pre-implementation planning — interrogates intent, surfaces hidden requirements, maps dependencies, and produces a sequenced kernel work plan before any code is written.
group: workflow
argumentHint: goal or task to plan (e.g., 'add user authentication', 'refactor the API layer')
backedBySkill: kernel-plan
---

Use this before implementation begins — or whenever the goal, scope, or sequence is unclear. Do not write code until the plan produced here is confirmed.

## What This Does

- Interrogates intent to surface what is actually being asked
- Identifies implicit requirements the user has not stated
- Maps dependencies and identifies sequencing risks
- Produces a confirmed kernel work plan with concrete, verifiable tasks
- Creates the right level of artifact in the kernel hierarchy (initiative, project, milestone, or work item)

## Step 1 — Classify the Scope

Before creating any kernel artifact, determine which level of the hierarchy this belongs to:

| Scope | When to use | CLI command |
|-------|------------|-------------|
| **Initiative** | Multi-project strategic objective | `kernel initiative new "<goal>"` |
| **Project** | Multi-step deliverable with a defined end state | `kernel project new "<goal>"` |
| **Milestone** | Time-bounded phase of a project | `kernel milestone new "<goal>"` |
| **Work item** | Focused, atomic change or feature | `kernel work new "<goal>"` |

Default to the smallest scope that fully contains the work. A single feature is a work item, not a project.

## Step 2 — Interrogate Intent

Ask the questions the user has not answered yet:

- What does success look like in concrete, observable terms?
- What is explicitly out of scope?
- Are there dependencies on external systems, teams, or unresolved decisions?
- What is the biggest risk in this work?
- Are there any constraints (deadline, performance, security, compatibility)?
- What has already been tried, if anything?

Do not proceed to step 3 until the answers are specific enough to write verifiable acceptance criteria.

## Step 3 — Map Dependencies

Before writing tasks, identify:

- Files, modules, or systems that will be affected
- Work that must be complete before this can start
- Work that this will block once started
- Decisions that are still open and must be resolved during execution

Use `kernel-search` to investigate unknowns before committing to a sequence.

## Step 4 — Write the Plan

Create the kernel artifact and populate it:

1. Run the appropriate `kernel <level> new "<goal>"` command.
2. Edit `brief.md` to capture the goal and specific, testable acceptance criteria.
3. Edit `plan.md` to capture the approach, risks, and validation steps.
4. Edit `tasks.md` to write an ordered task list — each task should be:
   - Small enough to complete in one focused session
   - Verifiable against a clear criterion
   - Named with a slug that matches how you will call `kernel work done <taskId>`

## Step 5 — Confirm Before Handing Off

Before calling this command complete, confirm:

- [ ] The goal is written in `brief.md` in unambiguous terms
- [ ] Acceptance criteria are specific enough to be tested, not just described
- [ ] All implicit requirements have been surfaced and recorded
- [ ] The task sequence is free of cycles and unnecessary dependencies
- [ ] Risks and open questions are documented in `plan.md`
- [ ] The next task is small enough to execute without additional planning

## Guardrails

- No code, no file edits outside of kernel artifacts.
- Do not carry the plan only in chat — it must live in `kernel/work/<id>/` (or the appropriate hierarchy level).
- If a key decision cannot be resolved from available context, use `kernel-search` before committing to a sequence.
- If scope is ambiguous, classify it explicitly before creating artifacts.

## What to Do Next

- Run `kernel-do` to begin executing the confirmed plan task by task.
- Run `kernel-search` if unknowns must be resolved before the plan can be finalized.

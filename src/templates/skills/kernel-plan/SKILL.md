---
name: kernel-plan
kind: skill
tags:
  - workflow
profile: core
description: "Structure and create work plans at any scope level: strategic initiative,
  project, milestone, or work item. Guides the user through proposal structuring,
  interviews to gather requirements, then creates local filesystem artifacts in the
  correct hierarchy order. Use when planning new work, breaking down goals, or when
  users say 'plan this', 'create a project for', or 'help me think through this'."
license: MIT
metadata:
  author: project
  version: "2.1"
  category: Workflow
  tags:
    - workflow
    - plan
    - planning
    - project
    - initiative
    - milestone
    - local
    - proposal
when:
  - user wants to plan new work, a feature, or a breakdown
  - user describes a change request, product idea, or strategic goal
  - a rough idea needs to be structured before artifact creation
  - a new initiative, project, milestone, or work item needs to be created
  - user says 'plan this', 'create a project for', 'break this down', or 'help me
    think through'
termination:
  - Proposal is reviewed and confirmed by the user
  - All requested local artifacts created in the correct hierarchy
  - Brief and plan files written for each scope level
  - Creation summary delivered with file paths and next actions
outputs:
  - Completed proposal structured according to templates
  - Initiative, project, milestone, and/or work item directories under kernel/
  - Brief.md and plan.md files documenting the scope and approach
  - Proper parent-ID linkage between hierarchy levels
disableModelInvocation: true
argumentHint: work to plan — goal, feature, initiative, or project description
allowedTools:
  - bash
---

# kernel-plan

Structure and create work plans at any level of abstraction. Supports all four scopes: **initiative** (cross-project strategy), **project** (time-bound deliverable), **milestone** (phase within a project), or **work item** (discrete task). Guides the user through proposal structuring using reference templates, then creates local filesystem artifacts using the kernel CLI. All work is confirmed by the user before artifacts are created.

---

## Step 1 — Determine scope

Classify the work into one of these scopes:

| If the work…                                                                                   | Scope          |
| ---------------------------------------------------------------------------------------------- | -------------- |
| Spans multiple projects or teams, represents a long-term strategic theme, has no firm end date | **Initiative** |
| Has a defined end state, can be delivered by one team, will contain phases or milestones       | **Project**    |
| Is a phase or deliverable within an already-created project                                    | **Milestone**  |
| Is a discrete task under a milestone or project                                                | **Work Item**  |

If the scope is unclear, ask:

> "Is this a long-term strategic theme (initiative), a time-bound deliverable (project), a phase inside an existing project (milestone), or a discrete work task (work item)?"

---

## Step 2 — Prepare the proposal framework

Based on scope, set up the proposal framework using these reference templates as a guide:

- **Initiative** → use `plan-template.md` as reference (scope, hierarchy, success criteria)
- **Project** → use `parent-issue-template.md` as reference (problem, goal, success criteria)
- **Milestone** → use `milestone-template.md` as reference (scope, purpose, deliverables, risks)
- **Work Item** → use `task-template.md` as reference (title, description, done criteria)

Present a checklist of required information based on scope:

### Initiative checklist

```
- [ ] Initiative name and one-line strategic objective
- [ ] Which projects or areas it spans
- [ ] Success criteria or key results
- [ ] Any relevant context or open decisions
```

### Project checklist

```
- [ ] Project name and one-sentence summary of what it delivers
- [ ] Why now — customer pain or business reason
- [ ] Target date (or "no date")
- [ ] Rough phases or breakdown (e.g. "schema → API → UI → tests")
- [ ] Success criteria — how we know it's done
- [ ] Key constraints or risks
```

### Milestone checklist

```
- [ ] Which project this milestone belongs to
- [ ] Milestone name and goal
- [ ] Target date
- [ ] Key deliverables
- [ ] Acceptance criteria
- [ ] Known blockers or dependencies
```

### Work Item checklist

```
- [ ] Which milestone this work belongs to
- [ ] Clear title describing the outcome
- [ ] Description of what needs to happen
- [ ] Done criteria — what signals completion
- [ ] Any dependencies or blockers
```

---

## Step 3 — Interview the user to build the proposal

Walk through the checklist. For each item:

- Explain what the section is for
- Ask the user to provide input
- Offer examples or defaults when helpful
- Mark items as completed
- Do not proceed until all items are resolved or the user explicitly says to skip

Rules:
- Ask in batches — group related questions together
- State reasonable defaults when obvious; ask for confirmation rather than starting from scratch
- Keep a running checklist visible to the user

---

## Step 4 — Present the proposal for confirmation

Render the complete proposal as a markdown document with clear headings and bullets. Show it to the user and ask:

> "Here is the proposal I've structured. Is this complete and ready to create artifacts?"

Make any edits the user requests. Do **not** proceed to artifact creation until the user confirms.

---

## Step 5 — Create local artifacts

Execute creation in dependency order using the kernel CLI.

### Initiative

1. Call `kernel initiative new "<goal>"` to create the initiative
2. Call `kernel initiative plan <initiativeId>` to set up the brief.md

### Project

1. If linked to an initiative, call `kernel project new "<goal>" --initiative <initiativeId>`; otherwise call `kernel project new "<goal>"`
2. Call `kernel project plan <projectId>` to set up brief.md and plan.md

### Milestone

1. If linked to a project, call `kernel milestone new "<goal>" --project <projectId>`; otherwise call `kernel milestone new "<goal>"`
2. Call `kernel milestone plan <milestoneId>` to set up the brief.md

### Work Item

1. If linked to a milestone, call `kernel work new "<goal>" --milestone <milestoneId>`; otherwise call `kernel work new "<goal>"`
2. Call `kernel work plan <workId>` to set up brief.md, plan.md, and tasks.md

---

## Step 6 — Confirm before creating

Print a final summary and ask for confirmation:

```
Here is what I will create:

[Scope: Initiative / Project / Milestone / Work Item]

<Summary of all artifacts to be created with hierarchy and structure>

Shall I proceed with artifact creation?
```

Do not create anything until the user confirms. If they want to revise the proposal, go back to Step 3.

---

## Step 7 — Report

Return a summary of everything created:

```
## Created

[Scope: <Initiative / Project / Milestone / Work Item>]

**Artifacts**:
| ID | Path | Type |
| --- | --- | --- |
| <id> | kernel/initiatives/<id> | Initiative |
| <id> | kernel/projects/<id> | Project |
| <id> | kernel/milestones/<id> | Milestone |
| <id> | kernel/work/<id> | Work Item |

**Hierarchy**: Initiative → Project → Milestone → Work Item

**Next action**: Open the brief.md and plan.md files to refine the scope and approach.
```

---

## Guardrails

- Never skip template sections during proposal structuring — proposals must be complete before artifact creation
- Never create artifacts before the user confirms the proposal in Step 4 AND the creation plan in Step 6
- Always create parent artifacts before child artifacts (e.g., project before milestone)
- The kernel CLI is the source of truth — all plan data lives in the filesystem
- Link artifacts to their parents using the `--initiative`, `--project`, and `--milestone` flags
- Work items inherit the hierarchy from their parent milestone
- Keep proposals focused on **what** and **why**, not **how** — implementation details come later

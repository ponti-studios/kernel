---
name: kernel-plan
description: 'Create a structured work plan at any scope level: strategic initiative, project, milestone, or cycle sprint. Interviews the user to understand scope, then creates all Linear artifacts in the correct hierarchy order. Use when proposing new work, planning a sprint, or when users say "plan this", "create a project for", or "break this down".'
argument-hint: "Work to plan — goal, feature, initiative, or sprint description"
---

# kernel-plan

Structure new work in Linear at the right level of abstraction. Supports all four planning scopes: **initiative** (cross-project strategy), **project** (time-bound deliverable), **milestone** (phase within a project), or **cycle/sprint** (iteration commitment from the backlog). Interviews the user before creating anything.

---

## Step 1 — Determine scope

Before asking the user anything, classify the work into one of these scopes:

| If the work…                                                                                   | Scope          |
| ---------------------------------------------------------------------------------------------- | -------------- |
| Spans multiple projects or teams, represents a long-term strategic theme, has no firm end date | **Initiative** |
| Has a defined end state, can be delivered by one team, will contain phases or milestones       | **Project**    |
| Is a phase or deliverable within an already-created project                                    | **Milestone**  |
| Is a sprint-sized commitment drawn from an existing backlog                                    | **Cycle**      |

If classification is not obvious, ask:

> "Is this a new long-term strategic theme (initiative), a time-bound deliverable (project), a phase inside an existing project (milestone), or a sprint commitment (cycle)?"

---

## Step 2 — Build the information checklist

Before asking questions, print a to-do list of everything needed for the identified scope so the user can see what is required.

### Initiative checklist

```
- [ ] Initiative name and one-line strategic objective
- [ ] Which teams or projects it spans
- [ ] Owner and horizon (quarters, not dates)
- [ ] Key results or success metrics
```

### Project checklist

```
- [ ] Project name and one-sentence summary of what it delivers
- [ ] Priority (urgent / high / medium / low)
- [ ] Target date (or "no date")
- [ ] Team and assignee (or "unassigned")
- [ ] Why now — customer pain or business reason
- [ ] Phases — rough breakdown (e.g. "schema → API → UI → tests")
- [ ] Success criteria — how we know the project is done
```

### Milestone checklist

```
- [ ] Which project this belongs to
- [ ] Milestone name and goal
- [ ] Acceptance criteria
- [ ] Estimated start / target date
```

### Cycle checklist

```
- [ ] Team and project or backlog to draw from
- [ ] Cycle start and end dates
- [ ] Capacity — how many issues to commit to
- [ ] Any must-have issues to include
```

---

## Step 3 — Interview the user

Ask for every unchecked item in the checklist. Rules:

- Ask in batches — group related questions together.
- State reasonable defaults when obvious; ask the user to confirm rather than starting from scratch.
- Mark items as resolved as the user answers.
- Do not create anything until all items are resolved or the user explicitly says to proceed.

---

## Step 4 — Confirm before creating

Print a full summary and ask for confirmation:

```
Here is what I will create in Linear:

[Scope: Initiative / Project / Milestone / Cycle]

<Summary of all artifacts to be created, hierarchy, phases, and blocking relations>

Shall I proceed?
```

Do not create anything until the user confirms.

---

## Step 5 — Create Linear artifacts

Execute creation in dependency order. Each artifact requires the ID returned by the previous step.

### Initiative

1. `mcp_linear_list_teams` — confirm team IDs
2. `mcp_linear_save_project` with initiative-level scope fields
3. Link related projects under the initiative

### Project

1. `mcp_linear_list_teams` — resolve `teamId`
2. `mcp_linear_save_project` — create the project with `name`, `description`, `summary`, `priority`, `targetDate`, `teamIds`
3. `mcp_linear_save_issue` — create the parent issue (problem statement + acceptance criteria), `state: in_progress`, `projectId` from step 2
4. For each phase in sequence: `mcp_linear_save_issue` with `title: "[Phase N] <name>"`, `state: todo`, `parentId` from step 3
5. Set blocking relations: call `mcp_linear_save_issue` with `blocks: [<next-phase-id>]` on each phase that must complete before the next

### Milestone

1. `mcp_linear_list_projects` — confirm the target project ID
2. `mcp_linear_save_milestone` with `name`, `description`, `targetDate`, `projectId`

### Cycle

1. `mcp_linear_list_teams` — confirm team ID
2. `mcp_linear_list_issues` — identify candidate issues from the backlog
3. Assign selected issues to the cycle using the cycle's issue assignment API

---

## Step 6 — Report

Return a summary of everything created:

```
## Created

[Scope: <Initiative / Project / Milestone / Cycle>]

**Artifacts**:
| Linear ID | Title | Type | State |
| --------- | ----- | ---- | ----- |
| TEAM-NNN  | <name> | Project | Active |
| TEAM-NNN  | <parent title> | Issue | In Progress |
| TEAM-NNN  | [Phase 1] <name> | Sub-issue | Todo |
| TEAM-NNN  | [Phase 2] <name> | Sub-issue | Todo |

**Blocking chain**: Phase 1 → Phase 2 → Phase 3 → …

**Next action**: <Phase 1 title> — <what "in progress" means for this phase>
```

---

## Guardrails

- Never create Linear artifacts before the user confirms the plan in Step 4.
- Sub-issues must have `parentId` set — orphan issues in a project are not acceptable.
- Create project before parent issue; parent issue before sub-issues.
- Set blocking relations between all adjacent phases.
- Linear is the single source of truth — never create local markdown plans as a substitute.

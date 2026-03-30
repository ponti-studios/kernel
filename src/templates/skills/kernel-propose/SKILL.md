---
name: kernel-propose
description: 'Propose a new product idea or feature as a fully structured Linear project with phases, sub-issues, blocking relations, and correct metadata. Use when: proposing a new product, feature, initiative, or major change that needs a Linear project, milestone, parent issue, and phased sub-issues created from scratch. Triggers: "propose", "new idea", "create a project", "plan this feature", "add to Linear". Interviews the user before creating anything — builds a to-do list of missing information, asks questions, then creates all Linear artifacts once satisfied.'
argument-hint: 'Product idea or feature to propose (e.g., "onboarding flow", "file processing system")'
---

# kernel-propose

Create a fully structured Linear project with a parent issue and phased sub-issues for a new product idea or feature. Linear is the single source of truth — no local files are created. Interviews the user first — builds a checklist of everything needed, asks until satisfied, then creates all Linear artifacts in the correct order.

---

## When to Use

- Proposing a new product, initiative, or major feature
- Translating a rough idea into a sequenced execution plan in Linear
- Creating a Linear project + parent issue + phase sub-issues with blocking relations in one pass

---

## Procedure

### Step 1 — Build the information checklist

Before asking the user any questions, produce a to-do list of every piece of information required to create high-quality Linear artifacts. Print it to the user so they can see what is needed.

Required information checklist:

```
## Information Needed

### Project
- [ ] Project name
- [ ] One-sentence summary (shown in Linear project list)
- [ ] Full description / motivation (why now, what customer pain)
- [ ] Target date or milestone (or "no date")
- [ ] Priority (urgent / high / medium / low)
- [ ] Labels / tags

### Parent Issue
- [ ] Problem statement (what is broken or missing)
- [ ] Proposed approach overview
- [ ] Success criteria (how we know it is done)
- [ ] Open decisions or unknowns

### Phases
- [ ] List of phases (each must be independently shippable or testable)
- [ ] For each phase: goal, deliverables, acceptance criteria
- [ ] Blocking order between phases
- [ ] Estimated size / complexity per phase (optional)

### Metadata
- [ ] Assignee (or "unassigned")
- [ ] Team (defaults to current workspace team)
- [ ] Related issues or projects (if any)
```

---

### Step 2 — Interview the user

Ask the user for every unchecked item in the checklist. Follow these rules:

- **Ask in batches** — group related questions together. Do not ask one question per message.
- **Use defaults when obvious** — infer team and priority from context where possible. State the inference and ask the user to confirm rather than asking from scratch.
- **Do not create anything yet** — this step is research only.
- **Mark items as resolved** on the checklist as the user answers.
- **Stop when all items are checked** or the user explicitly says "that's enough, go ahead".

Example first batch:

> I need a few things before I can create the Linear project. Let me work through the list:
>
> 1. **Project name and summary** — what should the project be called, and in one sentence, what does it deliver?
> 2. **Why now?** — what customer pain or business reason makes this urgent?
> 3. **Phases** — how do you see the work breaking down? Even a rough list (e.g., "schema, API, UI, tests") helps.
> 4. **Priority** — urgent / high / medium / low?
> 5. **Target date** — is there a deadline or milestone, or should I leave it open?

---

### Step 3 — Confirm before creating

Once all checklist items are resolved, summarize the full plan back to the user:

```
Here is what I will create in Linear:

**Project**: <name> — <summary>
**Priority**: <priority>
**Target date**: <date or none>

**Parent issue**: <title>
  Problem: <one sentence>
  Success criteria: <bullet list>

**Sub-issues**:
  [Phase 1] <name> — <goal>
  [Phase 2] <name> — <goal> (blocked by Phase 1)
  [Phase 3] <name> — <goal> (blocked by Phase 2)
  ...

**Blocking chain**: Phase 1 → Phase 2 → Phase 3 → ...

Shall I proceed?
```

Do not create anything until the user confirms.

---

### Step 4 — Create Linear artifacts

Create in this exact order (each step depends on the ID returned by the previous):

1. **Look up the team** — use `mcp_linear_list_teams` to get `teamId`. If more than one team exists, confirm with the user.
2. **Create the Linear project** — use `mcp_linear_save_project` with `name`, `description`, `summary`, `priority`, `targetDate`, `teamIds`.
3. **Create the parent issue** — use `mcp_linear_save_issue` with `title`, `description` (full body from `references/parent-issue-template.md`), `priority`, `state: in_progress`, `team`, `projectId` (from step 2).
4. **Create sub-issues in phase order** — for each phase in sequence, use `mcp_linear_save_issue` with `title: "[Phase N] <name>"`, `description` (from `references/sub-issue-template.md`), `priority`, `state: todo`, `team`, `parentId` (parent issue ID from step 3).
5. **Set blocking relations** — after all issues exist, call `mcp_linear_save_issue` with `blocks: [<next-phase-id>]` for each phase that must complete before the next begins.

> IDs returned from Linear are in the format `TEAM-NNN` (e.g., `HUMAN-42`). Use these as `id`, `parentId`, and `projectId` values in subsequent calls.

---

### Step 5 — Report

Return a summary of everything created:

```
## Created

**Linear Project**: <name> — <url>

**Issues**:
| Linear ID | Title | State |
| --------- | ----- | ----- |
| TEAM-NNN  | <parent title> | In Progress |
| TEAM-NNN  | [Phase 1] <name> | Todo |
| TEAM-NNN  | [Phase 2] <name> | Todo |
...

**Blocking chain**: Phase 1 → Phase 2 → Phase 3 → ...

**Open decisions to resolve before work begins**:
- <decision 1>
- <decision 2>

**Next action**: <Phase 1 issue title> — <what "in progress" means for this phase>
```

---

## Guardrails

- Never create Linear issues before the user confirms the plan in Step 3.
- Sub-issues must have `parentId` set — orphan issues are not acceptable.
- Set blocking relations between all adjacent phases.
- Create the project before the parent issue; create the parent issue before sub-issues.
- Linear is the single source of truth — do not create local files.

---

## Reference Templates

- [Parent issue](./references/parent-issue-template.md)
- [Sub-issue / phase](./references/sub-issue-template.md)
- [Plan](./references/plan-template.md)
- [Phase](./references/phase-template.md)
- [Milestone](./references/milestone-template.md)
- [Task](./references/task-template.md)

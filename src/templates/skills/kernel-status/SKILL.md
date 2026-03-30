---
name: kernel-status
description: "Report the current state of work: what is done, in-progress, blocked, and next. Supports cycle/sprint progress, milestone rollups, project board views, and health checks. Use when asking where things stand, what is blocking progress, or what comes next."
argument-hint: "Project, milestone, cycle, team, or issue ID to check"
---

# kernel-status

Answer: _where are we and what do we need to know right now?_

Reads the current state from Linear and produces a clear, actionable picture. Automatically adapts the view based on what is in scope.

---

## Step 1 — Determine the view

Ask or infer what the user wants to understand:

| User intent                                         | View mode          |
| --------------------------------------------------- | ------------------ |
| "What's in this sprint?" / "How's the cycle going?" | **Cycle view**     |
| "How far is this milestone / phase?"                | **Milestone view** |
| "What are we all working on?"                       | **Board view**     |
| "Are we on track?" / "What's blocking us?"          | **Health check**   |

Multiple views can be combined in a single response.

---

## Step 2 — Gather data

**Cycle view**

- `mcp_linear_list_cycles` — find the active cycle for the relevant team
- Read all issues assigned to the cycle; group by workflow state
- Calculate: total committed, done, in-progress, remaining, blocked count

**Milestone view**

- `mcp_linear_list_milestones` — list milestones for the target project
- Read issues associated with each milestone; calculate completion percentage

**Board view**

- `mcp_linear_list_issues` — filter by project, team, parent, or label as appropriate
- Group into: `blocked`, `in-progress`, `todo`, `done`, `cancelled`
- Sort each bucket: priority first, most-recently-updated second, then by issue ID

**Health check**

- Surface any `blocked` issues with their blocking relations and recommended resolutions
- Flag `in-progress` issues with no recent activity (stale indicators)
- Note if the active cycle or a milestone appears at risk of not completing on time

---

## Step 3 — Render the status

Adapt the format to the view selected. Always include:

1. A status verdict: `on track | at risk | blocked`
2. The data view (cycle breakdown, milestone progress, or board buckets)
3. Blockers with recommended resolutions — never just describe the blocker without a resolution
4. A single clear "Next action" recommendation

**Standard format:**

```
## Status: [on track | at risk | blocked]

**Cycle**: <name> — X of Y done (NN%)           [if cycle scope]
**Milestone**: <name> — X% complete              [if milestone scope]

### Blocked
- [ID] <title>: <what is blocking it> — [recommended resolution]

### In Progress
- [ID] <title>

### Next Up
- [ID] <title>

### Done (this cycle / since last check)
- [ID] <title>

**Recommendation**: [One sentence — what should happen next and who owns it]
```

---

## Step 4 — Persist only if explicitly requested

If the user asks for a durable snapshot, write the summary to a Linear document using `mcp_linear_create_document`. Otherwise, return the status in chat only.

---

## Guardrails

- Report only what can be verified from Linear — do not speculate about progress.
- Every blocker must have a recommended resolution, not just a description.
- Do not invent statuses or relations not present in Linear.
- The recommendation must be actionable: one sentence, one clear direction.

---
name: kernel-intake
description: "Intake, classify, and correctly place new bugs, ad-hoc requests, and unplanned work into Linear. Resolves team, workflow status, labels, relation type, and optionally cycle and milestone before creating the issue. Use when a new bug report arrives, an unstructured request needs placement, or work needs to be positioned correctly in the Linear hierarchy."
argument-hint: "Bug description, request summary, or unstructured idea to intake"
---

# kernel-intake

Classify incoming work and place it correctly in the Linear issue hierarchy. Fully resolves all Linear metadata — team, workflow status, labels, relations, and optionally cycle and milestone — before creating the issue.

---

## Step 1 — Understand the incoming item

Gather the full description. Identify:

- What is broken or missing?
- Who is affected?
- Is there a deadline or severity?

Classify as one of:

| Type          | Description                                                       |
| ------------- | ----------------------------------------------------------------- |
| **Bug**       | Something that was working is now broken                          |
| **Gap**       | A missing capability in an already-defined feature                |
| **New scope** | Work outside all existing parent issues                           |
| **Spike**     | Research or investigation needed before a solution can be defined |

---

## Step 2 — Resolve team and workflow context

1. `mcp_linear_list_teams` — identify the relevant team
2. `mcp_linear_list_issue_statuses` for the team — confirm the exact workflow status names to use. Never guess `todo` or `triage` — use the team's actual status label.
3. `mcp_linear_list_issue_labels` for the team — identify applicable labels: `bug`, `improvement`, `spike`, `chore`, etc.

---

## Step 3 — Find the right parent

Search existing Linear projects and issues:

1. **Exact feature match** — the item directly relates to an existing parent's stated goal
2. **Component match** — the item affects the same module or service as an existing parent
3. **No match** — the item is genuinely new scope

When multiple parents could match, prefer the narrower and more specific one.

- If a matching parent exists: the new item is a child issue — record `parentId`.
- If no parent exists and scope is broad: invoke `kernel-plan` to create one first, then place the new item as its first child.

---

## Step 4 — Determine placement, priority, and relations

Review the parent's existing child issues and blocking relations.

**Priority rules:**

- Bugs affecting production users: `urgent` or `high`
- Bugs affecting development or staging: `medium` or `high`
- Gaps in existing features: `medium`
- New scope or spikes: `low` or `medium`

**Relation type** — choose the correct one:

- **blocks** — this item must be resolved before another issue can proceed
- **blocked by** — another issue must complete before this one can start
- **duplicate** — this is the same as an existing issue; do not create; mark the incoming item as a duplicate and close
- **related to** — informational link with no sequencing dependency

**Cycle assignment** — if the team has an active cycle and this item belongs in the current sprint, assign it.

**Milestone assignment** — if the item belongs to a project phase, assign it to the correct milestone.

---

## Step 5 — Create the issue

`mcp_linear_save_issue` with:

- `teamId` from Step 2
- `parentId` when applicable
- `projectId` when the work belongs to an existing project
- `status` set to the team's resolved intake status from Step 2
- `priority` from Step 4
- `labelIds` from Step 2
- `blocks` / `blockedBy` relations from Step 4
- A clear description: **what** is wrong or needed, **acceptance criteria**, and reproduction steps for bugs

---

## Step 6 — Report

- Share the new issue ID and its position in the hierarchy.
- Note any phase-ordering changes made.
- Flag if the item revealed scope that should update the parent issue or project description.

---

## Guardrails

- Do not start implementation during intake — it ends when the issue is correctly placed.
- Never use a guessed workflow status — always resolve via `mcp_linear_list_issue_statuses`.
- If the item is a duplicate, flag it and link it — do not create a second issue for the same work.
- Bugs that affect an in-progress phase must be evaluated for whether they block the current implementation session.

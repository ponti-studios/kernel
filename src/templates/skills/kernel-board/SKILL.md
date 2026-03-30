---
name: kernel-board
description: "Generates a current-state task board from Linear projects and issues. Use when the board needs to be rebuilt, issue states changed, or users ask to see the current work queue without opening individual issues."
---

Generate a current-state task board from Linear projects and issues.

## Steps

### 1. Identify the scope

- Determine whether the user wants a board for a team, project, milestone, parent issue, or a filtered issue set.
- Read the relevant Linear project, milestone, and issue data before summarizing anything.
- Include child issues and blocking relations when they materially affect sequencing.

### 2. Normalize the work into board buckets

- Group issues into `blocked`, `in-progress`, `todo`, `done`, and `cancelled` buckets.
- Derive `blocked` from explicit blocking relations or a blocked issue state — do not infer it from narrative text alone.
- Sort each bucket by priority first, then by most recently updated work, then by issue identifier.
- Preserve parent/child relationships where they help explain order or ownership.

### 3. Render the board

- Produce a concise markdown board in the response.
- Start with a summary table that shows counts for each bucket.
- Then render grouped sections for each bucket in this order: blocked, in-progress, todo, done, cancelled.
- For each issue, include the Linear ID, title, state, and the parent or blocking context when relevant.

### 4. Persist only if explicitly requested

- If the user asks for a durable copy, write the board summary to a Linear document.
- Otherwise, return the board in chat only.

## Guardrails

- Linear is the source of truth — never rebuild a board from local markdown mirrors.
- Do not invent statuses, priorities, or relations that are not present in Linear.
- Distinguish the raw Linear state from the normalized board bucket when they differ.

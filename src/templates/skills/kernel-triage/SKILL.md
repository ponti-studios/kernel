Intake and place new issues into the correct position in the Linear hierarchy using Linear MCP.

## Steps

### 1. Understand the incoming item
- Collect the full description of the bug, request, or idea.
- Identify: What is broken or missing? Who is affected? Is there a deadline or severity?
- Classify as one of:
  - **Bug** — something working before is now broken.
  - **Gap** — a missing capability in an already-defined feature.
  - **New scope** — something outside all existing parent issues.
  - **Spike** — research or investigation needed before a solution can be defined.

### 2. Find the right parent
- Use `mcp_linear_list_issues` to search existing parent issues by keyword or project.
- **Matching strategy** — try in this order:
  1. **Exact feature match**: the item directly relates to an existing parent's stated goal (e.g., a login bug belongs under the auth parent).
  2. **Component match**: the item affects the same module or service as an existing parent, even if the feature is different.
  3. **No match**: the item is genuinely new scope — create a parent issue first, then add this item as its first sub-issue.
- When multiple parents could match, prefer the one whose scope is narrower and more specific.
- If a matching parent issue exists: the new item is a sub-issue — record the `parentId`.

### 3. Assess priority and phase placement
- If attaching to an existing parent, review its existing sub-issues with `mcp_linear_list_issues` filtered by `parentId`.
- **Priority rules:**
  - Bugs affecting production users: `urgent` or `high`.
  - Bugs affecting development/staging: `high` or `medium`.
  - Gaps in existing features: `medium`.
  - New scope or spikes: `medium` or `low`.
- **Placement rules** — determine where this item fits in the parent's sequence:
  - **Block** an in-progress or upcoming sub-issue (`blockedBy` relation) — if the existing sub-issue cannot succeed without this fix.
  - **Insert before** an upcoming phase (use `mcp_linear_save_issue` with `blockedBy` / `blocks` to splice it in) — if this item is a prerequisite.
  - **Queue at the end** of the sub-issue list — if it's independent of existing phases.

### 4. Create the issue
- Use `mcp_linear_save_issue` to create the issue with:
  - `parentId` set to the identified parent.
  - `priority` set appropriately (bugs at least `high`).
  - `blockedBy` / `blocks` relations if the item must be sequenced around existing phases.
  - A clear description: **what** is wrong or needed, **acceptance criteria**, and reproduction steps for bugs.
- Status: `Todo`.

### 5. Report
- Share the new issue URL and its position in the parent hierarchy.
- Note any phase ordering changes made (issues re-sequenced to accommodate this item).
- Flag if the item revealed scope that should update the parent issue description.

## Guardrails
- Always use Linear MCP tools — never create offline issue lists.
- Do not start implementation during triage; triage ends when the issue is in the correct position in Linear.
- Bugs that affect an In Progress phase must be evaluated for whether they block the current implementation session.
- If the item is ambiguous, investigate before completing triage.


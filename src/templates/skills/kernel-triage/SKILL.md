---
name: kernel-triage
description: "Assesses and classifies incoming bugs, ad-hoc requests, and unplanned issues before work begins. Use when a new bug report arrives, an unstructured request needs sizing, or work needs to be placed into the correct position in the project issue hierarchy."
---

Intake and place new issues into the correct position in the Linear issue hierarchy.

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

- Search existing Linear projects and issues by keyword, scope, and related component.
- **Matching strategy** — try in this order:
  1. **Exact feature match**: the item directly relates to an existing parent's stated goal (e.g., a login bug belongs under the auth parent).
  2. **Component match**: the item affects the same module or service as an existing parent, even if the feature is different.
  3. **No match**: the item is genuinely new scope — create a parent issue first, then add this item as its first child or follow up via the proposal workflow if the scope is broad.
- When multiple parents could match, prefer the one whose scope is narrower and more specific.
- If a matching parent issue exists: the new item is a child issue — record the `parentId`.

### 3. Assess priority and phase placement

- If attaching to an existing parent, review its existing child issues and blocking relations.
- **Priority rules:**
  - Bugs affecting production users: `urgent` or `high`.
  - Bugs affecting development/staging: `high` or `medium`.
  - Gaps in existing features: `medium`.
  - New scope or spikes: `medium` or `low`.
- **Placement rules** — determine where this item fits in the parent's sequence:
  - **Block** an in-progress or upcoming child issue with an explicit blocking relation — if the existing issue cannot succeed without this fix.
  - **Insert before** an upcoming phase by updating blocking relations — if this item is a prerequisite.
  - **Queue at the end** of the child issue list — if it's independent of existing phases.

### 4. Create the issue

- Create the Linear issue with:
  - `parentId` set to the identified parent when applicable.
  - `project` set when the work belongs to an existing project.
  - `priority` set appropriately.
  - `blockedBy` or `blocks` relations if the item must be sequenced around existing phases.
  - A clear description: **what** is wrong or needed, **acceptance criteria**, and reproduction steps for bugs.
- State: `todo` unless the user explicitly wants it claimed immediately.

### 5. Report

- Share the new Linear issue ID and its position in the parent hierarchy.
- Note any phase ordering changes made.
- Flag if the item revealed scope that should update the parent issue or project description.

## Guardrails

- Always use Linear as the source of truth — never create offline issue lists or local mirrors.
- Do not start implementation during triage; triage ends when the issue is in the correct position in the hierarchy.
- Bugs that affect an In Progress phase must be evaluated for whether they block the current implementation session.
- If the item is ambiguous, investigate before completing triage.

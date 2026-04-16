---
name: kernel-execute
kind: skill
tags:
  - workflow
profile: core
description: Execute implementation work from kernel work items one at a time,
  following priority and parent hierarchy. Updates work item state before and after
  every unit of work. Use when tasks are ready for implementation, or when users say
  'start on this', 'build', 'implement', or 'do this'.
license: MIT
metadata:
  author: project
  version: "2.0"
  category: Workflow
  tags:
    - workflow
    - execute
    - implement
    - local
    - tasks
when:
  - user wants to implement work from a work item or sub-item
  - there is an unblocked task ready for implementation
  - user says 'work on', 'implement', 'build', 'start', or 'do this' for a work item
termination:
  - All work items in scope implemented, verified, and marked done
  - Work item state reflects reality (done or blocked with journal trail)
outputs:
  - Implemented code changes
  - Updated kernel work item states and completion journal entries
dependencies:
  - kernel-investigate
  - kernel-plan
disableModelInvocation: true
argumentHint: work item ID, milestone ID, or scope to execute
allowedTools:
  - bash
---

# kernel-execute

Implement work from kernel work items. Work on exactly one item at a time. Every state change must be written to the kernel system immediately.

---

## Execution Loop

Repeat this loop for each work item until the selected scope is complete or blocked.

### 0. Orient (first work item only)

Identify the target scope — a milestone, project, or single work item ID:

```bash
# Find all todo work items in scope
grep -r "done: false" kernel/work/*/work.yaml
# Or for a specific milestone:
grep -r "milestoneId: <milestoneId>" kernel/work/*/work.yaml
```

- Confirm the first work item has no unresolved parent blockers
- If parent milestone/project is not done, check if that's blocking this work
- If blockers exist, surface them and stop

### 1. Select the next work item

Use this priority order:

**a. Parent order (explicit sequencing)**
If working within a milestone, check the work item order in the milestone's plan. Pick the next unblocked item in sequence.

**b. Sibling work items (implicit ordering)**
Read sibling work items under the same milestone or parent. Pick the highest-priority unstarted one.

**c. Backlog fallback**
List all `done: false` work items in scope, ordered by parent priority. Pick the top unblocked one.

Before claiming, re-read the candidate work item to confirm no parent-level blockers.

### 2. Claim the work item

```bash
kernel work plan <workId>
```

- This updates the work item's `updatedAt` timestamp
- Add a journal entry: "Started implementation"
- Do not start coding until the file update is confirmed

### 3. Implement and verify

- Implement only what the work item's acceptance criteria describe — nothing more, nothing less
- Add or update tests that prove the acceptance criteria are met
- Do not refactor surrounding code, add docstrings, or fix unrelated lint. Separate concerns go in a new work item
- Run type-check, lint, and tests. All must pass before marking done
- If a blocker surfaces mid-implementation: add a journal entry explaining it, and stop work on this item

### 4. Complete the work item

```bash
kernel work done <workId>
```

- This marks the task as complete and updates `updatedAt`
- Add a completion journal entry: what changed, files touched, follow-up work items if any

### 5. Move to the next work item

- Return to Step 1 only after the current item is marked done
- Never hold more than one work item in active implementation simultaneously

---

## Guardrails

- One work item at a time. Finish or block before starting the next
- Use `kernel work plan` to claim. Use `kernel work done` to mark complete
- If scope beyond the current item is discovered, create a new work item — do not expand the current one
- The kernel filesystem is the source of truth — do not track state in chat comments or local notes
- Every state change must be persisted to the filesystem immediately

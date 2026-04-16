---
name: kernel-unblock
kind: skill
tags:
  - workflow
profile: extended
description: Diagnoses blocked kernel work items and determines how to resolve them.
  Use when work is blocked, implementation has stopped on a dependency, or a
  blocking relationship has not resolved — decides whether to resolve, defer, or
  split, and updates the work item.
license: MIT
metadata:
  author: project
  version: "2.0"
  category: Workflow
  tags:
    - workflow
    - unblock
    - tasks
    - blocked
    - local
when:
  - a work item is blocked
  - implementation stopped due to a blocker
  - a blocking dependency has not been resolved
applicability:
  - Use to diagnose and resolve blocked kernel work items
  - Use when a blocker must be classified and actioned before implementation can
    resume
termination:
  - Blocker classified and resolution action taken
  - Blocked work item status updated
  - Parent work item updated if timeline or scope is affected
outputs:
  - Updated work item status and description
  - Journal entry explaining blocker resolution
  - Unblock report
dependencies:
  - kernel-investigate
  - kernel-sync
disableModelInvocation: true
argumentHint: blocked work item ID or title
allowedTools:
  - bash
---

# kernel-unblock

Diagnose and resolve a blocked kernel work item.

---

## Step 1 — Read the blocked work item

Read the blocked work item and its context:

```bash
# Read the work item metadata and description
cat kernel/work/<workId>/work.yaml
cat kernel/work/<workId>/brief.md
cat kernel/work/<workId>/plan.md
cat kernel/work/<workId>/journal.md

# Identify blocking relations by checking parent milestones
MILESTONE_ID=$(grep milestoneId kernel/work/<workId>/work.yaml | sed 's/.*: //')
ls kernel/milestones/$MILESTONE_ID/
```

- Understand the work item goal and acceptance criteria
- Read the journal to find blocker notes
- Identify parent milestone/project that might reveal dependencies
- Check if any milestone-level or project-level blockers exist

---

## Step 2 — Diagnose the blocker

Classify the blocker:

| Classification | Criteria |
| --- | --- |
| **Stale dependency** | A parent milestone/project is already done but this work item still marked blocked |
| **Missing information** | Work item description lacks enough detail or acceptance criteria unclear |
| **Technical dependency** | Upstream code, API, or infrastructure is genuinely not ready |
| **Scope conflict** | Implementation revealed overlap with another work item. Needs re-scoping |
| **Duplicate** | Work is the same as another existing work item |
| **External dependency** | Blocked on a person, team, or third-party outside the codebase |

---

## Step 3 — Resolve based on classification

| Classification | Resolution |
| --- | --- |
| **Stale dependency** | Confirm parent is done. Update work item status. Remove the blocking note from journal |
| **Missing information** | Write clarification into work item brief.md or plan.md. Update status to allow work to resume |
| **Technical dependency** | Confirm upstream work item exists in kernel system. Add journal entry with unblocking condition and expected timeline |
| **Scope conflict** | Create new work item for conflicting scope. Update current work to reduced scope. Transition to todo |
| **Duplicate** | Identify the canonical work item ID. Update journal with reference. Consider archiving |
| **External dependency** | Add journal entry naming the external dependency and expected resolution date. Leave as blocked if still unresolved |

To update a work item's status:

```bash
# Edit the YAML directly or use:
kernel work plan <workId>  # to refresh and reset status
```

---

## Step 4 — Update the parent milestone or project

If the blocker shifts timeline or scope:

```bash
# Update parent milestone brief or plan:
nano kernel/milestones/<milestoneId>/brief.md
nano kernel/milestones/<milestoneId>/plan.md
```

---

## Step 5 — Report

- State the blocker classification
- Describe the action taken
- Confirm the new status of the previously blocked work item
- State whether implementation can resume immediately or must wait

---

## Guardrails

- Never silently remove a blocker without understanding why it was blocked
- Distinguish between parent-level blockers (milestone/project not ready) and work-item-level blockers (missing info/external dependency) — each requires different resolution
- Every resolution must leave a journal entry trail
- If resolution requires implementation work, update status to `todo` and let the execution workflow pick it up — do not implement during unblock
- When in doubt about classification, investigate the parent work item first

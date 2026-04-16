---
name: kernel-close
kind: skill
tags:
  - workflow
profile: extended
description: "Close out a completed project or milestone: resolve remaining open
  work items, write a completion summary, and create a retrospective document.
  Use when a project is done, a milestone has shipped, or users ask to wrap up,
  close, or finalize a body of work."
license: MIT
metadata:
  author: project
  version: "2.0"
  category: Workflow
  tags:
    - workflow
    - close
    - closeout
    - retrospective
    - local
    - done
when:
  - A project or milestone is complete
  - User wants to close or finalize finished work
  - User says 'wrap up', 'close out', 'finalize', or 'we're done with' a project
    or milestone
termination:
  - Project or milestone marked done in kernel system
  - All open work items resolved, deferred, or captured as follow-up
  - Completion summary written to project/milestone
  - Retrospective document created locally
outputs:
  - Closed project or milestone in kernel system
  - Follow-up work items for deferred work
  - Completion journal entry
  - Retrospective markdown document
dependencies:
  - kernel-execute
disableModelInvocation: true
argumentHint: project name, milestone, or ID to close
allowedTools:
  - bash
---

# kernel-close

Close out completed project or milestone work cleanly. This is the deliberate completion workflow — distinct from archiving (which hides items without a completion record).

---

## Step 1 — Orient

Identify the target scope and audit work items:

```bash
# For a project:
kernel project status <projectId>
ls kernel/milestones/ | grep -v archive

# For a milestone:
kernel milestone status <milestoneId>
grep -r "milestoneId: <milestoneId>" kernel/work/*/work.yaml

# Count work item completion:
grep "done: true" kernel/work/*/work.yaml | wc -l
grep "done: false" kernel/work/*/work.yaml | wc -l
```

Count: how many work items are done? How many remain todo, in-progress, or blocked?

---

## Step 2 — Resolve remaining work items

For each work item that is not done, apply the **scope test**:

**In-scope**: directly serves the parent's stated goal, was planned from the start, completable without expanding original acceptance criteria.
**Out-of-scope**: discovered during execution, serves a different goal, or requires work beyond acceptance criteria.
**Grey area**: if completing this work changes what the parent delivers, it is scope expansion — defer it.

| Work item state | Action |
| --- | --- |
| In progress, finishable now | Finish it |
| In progress, needs deferral | Defer to follow-up |
| Blocked, unresolvable now | Defer to follow-up |
| Todo, in-scope, small | Complete it |
| Todo, out-of-scope or large | Create follow-up work item under different parent |

Always record the follow-up work item ID for the completion summary.

---

## Step 3 — Mark the project or milestone complete

```bash
# For a project:
kernel project done <projectId>

# For a milestone:
kernel milestone done <milestoneId>

# Update the status file:
echo "- $(date -u +%Y-%m-%dT%H:%M:%SZ): Project completed" >> kernel/projects/<projectId>/journal.md
```

Confirm all work items are done, cancelled, or deferred to identified follow-ups.

---

## Step 4 — Write the completion summary

Add a completion entry to the project or milestone:

```bash
# Update project brief or plan:
cat >> kernel/projects/<projectId>/plan.md <<EOF

## Completion Summary

**Delivered**: <one-sentence summary of what was delivered>
**Duration**: <start date> → <end date>

**Acceptance criteria met**:
- [ ]

**Deferred work**:
- [work-id] <title> — <reason deferred>

**Key decisions**:
- 
EOF
```

---

## Step 5 — Write the retrospective document

Create a local retrospective markdown file:

```bash
mkdir -p kernel/retrospectives
cat > kernel/retrospectives/$(date +%Y-%m-%d)-<project-name>.md <<EOF
# Retrospective: <Project or Milestone Name>

**Delivered**: <one-sentence summary>
**Duration**: <start date> → <end date>

## What went well

- 

## What didn't go well

- 

## What to change next time

- 

## Deferred work

- [work-id] <title> — <reason deferred>

## Key decisions

- 
EOF
```

---

## Step 6 — Report

- Confirm the project or milestone is marked done with its ID
- List any follow-up work items created with their IDs
- Confirm the retrospective document was created at the path

---

## Guardrails

- Surface all incomplete items before closing — never silently skip unresolved work
- Deferred work must have a named home (a follow-up work item) — do not delete or cancel it
- Every closed project must have both a completion summary and a retrospective — closure without documentation is not complete
- This skill closes deliverables with a completion record. Only archive work items that were never started

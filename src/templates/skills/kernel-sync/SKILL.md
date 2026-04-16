---
name: kernel-sync
kind: skill
tags:
  - workflow
  - kernel
profile: core
description: Reconciles kernel work item tracking with what actually happened —
  updates stale work items, marks completed work done, and fills in missing work
  records. Use when work items have drifted from reality, work was completed without
  updates, or users ask to sync or clean up.
license: MIT
metadata:
  author: project
  version: "2.0"
  category: Workflow
  tags:
    - workflow
    - sync
    - tasks
    - reconcile
    - local
when:
  - Work items are stuck with no recent activity
  - Work was completed without updating work items
  - The work item state does not match the codebase
  - Before starting a new implementation session
applicability:
  - Use when work item state has drifted from the actual state of the codebase
  - Use to audit and reconcile stale, missing, or mis-classified work items
termination:
  - All stale/incomplete work items classified and updated
  - Undocumented work back-filled in kernel system
  - Sync report delivered
outputs:
  - Updated kernel work item statuses and journals
  - Back-filled work items for undocumented work
  - Sync summary report
disableModelInvocation: true
allowedTools:
  - bash
---

# kernel-sync

Reconcile kernel work item state with the current state of the codebase. This skill reports drift and presents recommendations — it never auto-updates items without user confirming.

---

## Step 1 — Collect current work state

List all work items and check their status:

```bash
# Find all work items
ls -la kernel/work/

# Check for recent changes
for dir in kernel/work/*/; do
  workId=$(basename "$dir")
  updatedAt=$(grep "updatedAt:" "$dir/work.yaml" | sed 's/.*: //')
  echo "$workId: $updatedAt"
done | sort
```

---

## Step 2 — Audit work items

For every work item:

- Read the work item metadata, acceptance criteria, and journal
- Search the codebase for evidence the work is complete (files changed, tests passing, feature present)
- Classify as one of:

| Classification | Criteria |
| --- | --- |
| **Done** | Work is complete and verified in the codebase |
| **Stale** | No recent codebase activity; no progress evidence |
| **Blocked** | Work started but stopped for a known reason |
| **Genuinely In Progress** | Active work is happening; leave as-is |

---

## Step 3 — Audit for orphaned work items

Identify any work items with no clear parent or milestone link but that belong to an existing project:

```bash
# Find work items without milestoneId
grep -L "milestoneId:" kernel/work/*/work.yaml
```

Note these as candidates for re-parenting.

---

## Step 4 — Surface git drift

Check recent git commits for meaningful work with no corresponding work item:

```bash
git log --oneline -20 | head -20
# Check which commits touch which areas
git diff HEAD~10..HEAD --stat
```

- Do **not** create work items automatically
- Collect the list of undocumented changes and present it to the user

---

## Step 5 — Present the drift report and confirm

Before making any changes, show the user a complete drift report:

```
## Sync Report

### Recommended work item updates
| Work ID | Title | Current state | Recommended | Reason |
|---|---|---|---|---|
| work-123 | <title> | todo | done | Work verified in <file> |
| work-456 | <title> | todo | blocked | Blocker found: <description> |

### Orphaned work items (no milestone)
| Work ID | Title | Suggested parent |
|---|---|---|
| work-789 | <title> | milestone-abc |

### Undocumented git activity (no work item)
| Commit / file | Description | Suggested action |
|---|---|---|
| <hash> | <message> | Create work item? Skip? |

Shall I apply these changes? (yes / no / select)
```

Wait for the user to confirm before applying any updates.

---

## Step 6 — Apply confirmed changes

For each update the user approves:

```bash
# Mark work item as done:
kernel work done <workId>

# Add journal entry to explain the sync:
echo "- $(date -u +%Y-%m-%dT%H:%M:%SZ): Synced with codebase verification" >> kernel/work/<workId>/journal.md

# For undocumented work the user wants to capture:
kernel work new "<goal>" --milestone <milestoneId>
```

---

## Step 7 — Final report

Summarize what was changed: how many work items transitioned, any work items re-parented, and any undocumented work captured.

---

## Guardrails

- Never transition a work item to done without codebase evidence
- Never auto-create work items for undocumented git activity — present candidates first
- Do not delete or archive work items during sync; flag them for human review
- Run before starting a new implementation session to prevent double-claiming work
- Every change must have a journal entry explaining why

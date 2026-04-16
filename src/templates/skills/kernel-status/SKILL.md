---
name: kernel-status
kind: skill
tags:
  - workflow
profile: core
description: "Report the current state of work at any scope: initiatives, projects,
  milestones, or individual work items. Shows what is done, in-progress, blocked,
  and next. Use when asking where things stand, what is blocking progress, or what
  comes next."
license: MIT
metadata:
  author: project
  version: "2.0"
  category: Workflow
  tags:
    - workflow
    - status
    - progress
    - initiative
    - project
    - milestone
    - local
when:
  - user asks where things stand, what is blocking, or what comes next
  - a status update is needed mid-execution
  - a milestone or project has been reached and work should be assessed
  - user asks 'where are we?', 'what's next?', 'are we on track?', or 'what's
    blocking us?'
termination:
  - Status report delivered at the requested scope level
  - All blockers named with recommended resolutions
  - Next action is unambiguous
outputs:
  - Status report (on track | at risk | blocked) with progress metrics
  - Recommended actions based on current state
disableModelInvocation: false
argumentHint: initiative, project, milestone, or work item ID to check status
allowedTools:
  - bash
---

# kernel-status

Answer: _where are we and what do we need to know right now?_

Reads the current state of work from the kernel filesystem and produces a clear, actionable picture. Automatically adapts the view based on the scope requested.

---

## Step 1 — Determine the view and scope

Ask or infer what the user wants to understand:

| User intent | View mode |
| --- | --- |
| "Where are we overall?" | **Initiative overview** |
| "How's the project going?" / "Are we on track?" | **Project board view** |
| "What's in this milestone?" / "How much is left?" | **Milestone progress** |
| "What's next?" / "What should I work on?" | **Next work item** |
| "What's blocking us?" | **Blocker report** |

Multiple views can be combined in a single response.

---

## Step 2 — Gather data using kernel CLI

**Initiative overview**

```bash
kernel initiative status [initiativeId]
kernel initiative list
```

Read the initiative goal and brief. Identify linked projects using the filesystem:
- Check `kernel/projects/` to find projects with matching `initiativeId`
- For each linked project, get its status and completion

**Project board view**

```bash
kernel project status [projectId]
kernel milestone list [projectId]  # if implemented; otherwise scan filesystem
kernel work status                 # to see all work items
```

Identify all milestones in the project. For each milestone, count work items by status.
Group work into: `done`, `in-progress`, `todo`, `blocked` buckets.

**Milestone progress**

```bash
kernel milestone status [milestoneId]
kernel work status
```

Read milestone goal. Scan `kernel/work/` for items with matching `milestoneId`.
Count and calculate: total work items, done, in-progress, remaining, blocked.

**Next work item**

```bash
kernel work next [milestoneId or projectId]
```

Show the next unblocked task. If no milestone/project scope given, show next task across all work.

**Blocker report**

Scan through `kernel/work/` items. Identify tasks marked `blocked` in their status.
For each blocked item, check its description/journal for blocker details.

---

## Step 3 — Render the status

Adapt the format to the view selected. Always include:

1. A status verdict: `on track | at risk | blocked`
2. The data breakdown (project board, milestone progress, or initiative overview)
3. Blockers with recommended resolutions — never just describe the blocker without a resolution
4. A single clear "Next action" recommendation

**Standard format:**

```
## Status: [on track | at risk | blocked]

**Scope**: [Initiative / Project / Milestone name]

### Progress
- Total items: X
- Done: X (NN%)
- In progress: X
- Blocked: X
- Todo: X

### Blocked Items
- [work-id] <title>: <what is blocking it> — [recommended resolution]

### In Progress
- [work-id] <title>

### Next Up
- [work-id] <title>

**Recommendation**: [One sentence — what should happen next and who should do it]
```

---

## Step 4 — Optionally write a status document

If the user asks for a durable snapshot, write the summary to a local markdown file:

```bash
cat > kernel/work/status-snapshot-YYYY-MM-DD.md <<EOF
# Status Snapshot — [date]

[Copy the status report from Step 3 here]
EOF
```

Otherwise, return the status in chat only.

---

## Guardrails

- Report only what can be verified from the kernel filesystem — do not speculate about progress.
- Every blocker must have a recommended resolution, not just a description.
- Count and calculate from actual work items — do not guess at percentages.
- The recommendation must be actionable: one sentence, one clear direction.
- If a work item status is unclear (not properly recorded in YAML), flag it and ask for clarification.

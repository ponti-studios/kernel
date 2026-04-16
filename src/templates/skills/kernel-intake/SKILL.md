---
name: kernel-intake
kind: skill
tags:
  - workflow
profile: extended
description: Intake, classify, and correctly place new bugs, ad-hoc requests,
  and unplanned work into the kernel system. Determines project, milestone, and
  priority before creating the work item. Use when a new bug report arrives, an
  unstructured request needs placement, or work needs to be positioned correctly
  in the hierarchy.
license: MIT
metadata:
  author: project
  version: "2.0"
  category: Workflow
  tags:
    - workflow
    - intake
    - triage
    - bugs
    - local
    - classification
when:
  - A bug report or ad-hoc request arrives outside the current plan
  - User reports something broken or missing
  - A new item needs to be assessed and placed into the kernel hierarchy
  - User says 'log this bug', 'add this request', or 'intake this'
termination:
  - Kernel work item created with correct milestone, project, and priority
  - Intake report delivered with work item ID and position in hierarchy
outputs:
  - New kernel work item with fully resolved metadata and hierarchy
  - Intake placement report
dependencies:
  - kernel-investigate
  - kernel-plan
disableModelInvocation: true
argumentHint: bug description, request summary, or unstructured idea to intake
allowedTools:
  - bash
---

# kernel-intake

Classify incoming work and place it correctly in the kernel hierarchy. Fully resolves all metadata — project, milestone, priority, and context — before creating the work item.

---

## Step 1 — Understand the incoming item

Gather the full description. Identify:

- What is broken or missing?
- Who is affected?
- Is there a deadline or severity?

Classify as one of:

| Type | Description |
| --- | --- |
| **Bug** | Something that was working is now broken |
| **Gap** | A missing capability in an already-defined feature |
| **New scope** | Work outside all existing projects |
| **Spike** | Research or investigation needed before a solution can be defined |

---

## Step 2 — Find the right parent project and milestone

Search existing kernel projects and milestones:

```bash
# List existing projects:
kernel project list
ls kernel/projects/

# Find projects by searching descriptions:
grep -r "goal:" kernel/projects/*/project.yaml
grep -r "<search term>" kernel/projects/*/brief.md
```

1. **Exact feature match** — the item directly relates to an existing project's goal
2. **Milestone match** — the item belongs within an existing milestone
3. **Component match** — the item affects the same area as an existing project
4. **No match** — the item is genuinely new scope

When multiple parents could match, prefer the narrower and more specific one.

- If a matching milestone exists: place the new item there
- If a matching project exists but no milestone: identify which milestone within the project
- If no parent exists and scope is broad: invoke `kernel-plan` to create the project/milestone first

---

## Step 3 — Determine placement and priority

**Priority rules:**

- Bugs affecting production users: **high**
- Bugs affecting development or staging: **medium** or **high**
- Gaps in existing features: **medium**
- New scope or spikes: **low** or **medium**

Check for blocking relations:

```bash
# Does this work block other work?
grep -r "blockedBy:" kernel/work/*/work.yaml
# Or is this blocked by other work?
grep -r "<related-work-id>" kernel/work/*/journal.md
```

---

## Step 4 — Create the work item

```bash
# Create the work item:
# If it belongs in a milestone:
kernel work new "<goal>" --milestone <milestoneId>

# If it belongs in a project (without specific milestone):
kernel work new "<goal>" --project <projectId>

# If it's a new initiative-level item:
kernel work new "<goal>" --initiative <initiativeId>
```

---

## Step 5 — Fill in the work item details

Update the created work item with full context:

```bash
# Edit the brief to add reproduction steps, context, and acceptance criteria:
nano kernel/work/<workId>/brief.md

# If this is a complex item, add planning notes:
nano kernel/work/<workId>/plan.md

# Add initial journal entry with intake classification:
echo "- $(date -u +%Y-%m-%dT%H:%M:%SZ): Intake classified as <TYPE> — <reason>" >> kernel/work/<workId>/journal.md
```

---

## Step 6 — Report

- Share the new work item ID and its position in the hierarchy
- Note the milestone/project placement
- Flag if the item revealed scope that should update the parent project or milestone description

---

## Guardrails

- Do not start implementation during intake — it ends when the work item is correctly placed
- If the item is a duplicate, identify the canonical work item ID and link it in the journal
- Bugs that affect an in-progress milestone must be evaluated for whether they block current work
- Every intake must result in a work item with a clear goal and acceptance criteria

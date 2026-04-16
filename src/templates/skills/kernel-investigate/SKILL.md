---
name: kernel-investigate
kind: skill
tags:
  - exploration
profile: core
description: Investigate unknowns, tradeoffs, and risks in kernel work items,
  projects, or milestones. Write findings back to the right destination. Use when
  planning work needs deeper investigation and technical decisions are unclear.
license: MIT
metadata:
  author: project
  version: "2.0"
  category: Workflow
  tags:
    - workflow
    - research
    - investigation
    - decisions
    - local
when:
  - user wants to investigate tradeoffs or risks before implementing
  - there are missing context or open decisions in a work item or project
  - technical direction is unclear and options need to be evaluated
  - user asks to explore, investigate, or research a work item or topic
termination:
  - Open questions resolved with rationale written to local files
  - "Clear recommendation delivered: ready for implementation or needs a human decision first"
  - All updates to work items/projects confirmed
outputs:
  - Updated work item description, project description, or research markdown document
  - Risk and tradeoff analysis
  - Implementation readiness recommendation
disableModelInvocation: true
argumentHint: work item ID, project ID, or topic to investigate
allowedTools:
  - bash
---

# kernel-investigate

Investigate open questions in a kernel work item, project, or milestone and route findings to the right destination in the filesystem.

---

## Step 1 — Orient

Read the target work item, project, or milestone to understand scope and context:

```bash
# For a work item:
cat kernel/work/<workId>/work.yaml
cat kernel/work/<workId>/brief.md
cat kernel/work/<workId>/plan.md

# For a project:
cat kernel/projects/<projectId>/project.yaml
cat kernel/projects/<projectId>/brief.md
cat kernel/projects/<projectId>/plan.md

# For a milestone:
cat kernel/milestones/<milestoneId>/milestone.yaml
cat kernel/milestones/<milestoneId>/brief.md
```

- Understand the goal, description, acceptance criteria, and journal.
- Identify linked child items (work items under a milestone, milestones under a project, projects under an initiative).
- Identify the type of investigation needed: technical decision, scope clarification, risk assessment, or dependency check.

---

## Step 2 — Map the unknowns

Identify every open question that must be resolved before work can proceed:

| Type | Description |
| --- | --- |
| **Decision gap** | A choice that must be made before implementation can start |
| **Dependency unknown** | Unclear whether an upstream change, API, or team is ready |
| **Scope ambiguity** | "Done" is not clearly defined by the current acceptance criteria |
| **Risk area** | A portion of the design with a high chance of failure or rework |

---

## Step 3 — Investigate

For each unknown identified in Step 2:

- Search the codebase for relevant context, existing patterns, and prior attempts.
- Read related work items, project descriptions, and journals for prior decisions:
  ```bash
  grep -r "decision\|tradeoff\|risk" kernel/work/ kernel/projects/ kernel/milestones/
  ```
- Reason about tradeoffs: name at least two options and the consequences of each.

---

## Step 4 — Route findings to the right destination

Choose the output destination based on the finding type:

| Finding type | Destination |
| --- | --- |
| Lightweight, time-stamped note or interim finding | **Journal** — append to `kernel/work/<id>/journal.md` or create `kernel/research-<date>.md` |
| Resolves or refines acceptance criteria | **Update work/project description** — edit the `brief.md` or `plan.md` file |
| Cross-item architectural decision | **Update project description** — edit `kernel/projects/<id>/plan.md` |
| Substantial specification, RFC, or multi-page writeup | **Research document** — create `kernel/research/<topic>/investigation.md` |

Default to a journal entry unless the finding materially changes the work definition or project context.

---

## Step 5 — Report

- State which questions were resolved and which remain open.
- Give a clear recommendation: is the work ready for implementation, or does it need a human decision first?
- List every update made (journal entries added, descriptions changed, documents created).

---

## Guardrails

- Always write findings back to the filesystem — never keep them only in the chat response.
- Do not begin implementation during research — this skill produces decisions, not code.
- Never mark a question resolved without concrete rationale written into the work item or project.
- Keep recommendations grounded in both codebase evidence and kernel work item context.
- If a work item's scope is unclear after research, recommend updating the brief.md before proceeding.

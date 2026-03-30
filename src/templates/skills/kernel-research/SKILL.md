---
name: kernel-research
description: "Investigate unknowns, tradeoffs, and risks in a Linear issue or project, then write findings back to the right destination. Use when planning work that needs deeper investigation, technical decisions are unclear, or options need to be explored before committing to an approach."
argument-hint: "Issue ID, project, or topic to investigate"
---

# kernel-research

Investigate open questions in a Linear issue or project and route findings to the right destination in Linear.

---

## Step 1 — Orient

- Read the target Linear issue to understand its description, acceptance criteria, comments, and relations.
- Read all child issues and blocking relations to understand the full scope.
- Identify the type of investigation needed: technical decision, scope clarification, risk assessment, or dependency check.

---

## Step 2 — Map the unknowns

Identify every open question that must be resolved before work can proceed:

| Type                   | Description                                                      |
| ---------------------- | ---------------------------------------------------------------- |
| **Decision gap**       | A choice that must be made before implementation can start       |
| **Dependency unknown** | Unclear whether an upstream change, API, or team is ready        |
| **Scope ambiguity**    | "Done" is not clearly defined by the current acceptance criteria |
| **Risk area**          | A portion of the design with a high chance of failure or rework  |

---

## Step 3 — Investigate

For each unknown identified in Step 2:

- Search the codebase for relevant context, existing patterns, and prior attempts.
- Read related Linear issues, project descriptions, and comments for prior decisions.
- Reason about tradeoffs: name at least two options and the consequences of each.

---

## Step 4 — Route findings to the right destination

Choose the output destination based on the finding type:

| Finding type                                               | Destination                                                |
| ---------------------------------------------------------- | ---------------------------------------------------------- |
| Lightweight, time-stamped note or interim finding          | **Comment** on the issue — `mcp_linear_save_comment`       |
| Resolves or refines the issue's acceptance criteria        | **Update issue description** — `mcp_linear_save_issue`     |
| Cross-issue architectural decision or project-wide context | **Update project description** — `mcp_linear_save_project` |
| Substantial specification, RFC, or multi-page writeup      | **Linear document** — `mcp_linear_create_document`         |

Default to a comment unless the finding materially changes the issue definition or project context.

---

## Step 5 — Report

- State which questions were resolved and which remain open.
- Give a clear recommendation: is the issue ready for implementation, or does it need a human decision first?
- List every Linear update made (comments added, descriptions changed, documents created).

---

## Guardrails

- Always write findings back to Linear — never keep them only in the chat response.
- Do not begin implementation during research — this skill produces decisions, not code.
- Never mark a question resolved without concrete rationale written into Linear.
- Keep recommendations grounded in both codebase evidence and Linear issue context.

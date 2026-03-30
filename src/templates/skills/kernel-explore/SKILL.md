---
name: kernel-explore
description: "Investigates tradeoffs, risks, and missing context inside an existing issue or issue group. Use when planning work that needs deeper investigation, technical decisions are unclear, or users ask to explore options before committing to an approach."
---

Explore context, tradeoffs, and risks inside a Linear issue or issue group.

## Steps

### 1. Verify and orient

- Read the target Linear issue to understand its current description, acceptance criteria, comments, and relations.
- Read all child issues and blocking relations to understand the full scope.

### 2. Map the unknowns

Identify every open question in the issue:

- **Decision gaps** — questions that must be answered before implementation can start.
- **Dependency unknowns** — unclear whether an upstream change or API is ready.
- **Scope ambiguity** — the issue description doesn't fully define what "done" looks like.
- **Risk areas** — portions of the design with a high chance of failure or rework.

### 3. Investigate

For each unknown identified in step 2:

- Search the codebase for relevant context (existing patterns, related code, prior attempts).
- Read related Linear issues, projects, and comments to understand decisions already made.
- Reason about tradeoffs — name at least two options and the consequences of each.

### 4. Write findings back to Linear

- Add a dated comment summarizing findings and recommendations.
- Update the issue description when needed with:
  - Resolved decisions and their rationale.
  - Outstanding decisions requiring human input (each as a named open question).
  - Any missing or incomplete acceptance criteria.

### 5. Report

- State which questions were resolved and which remain open.
- Give a clear recommendation: is the issue ready for implementation, or does it need a decision first?

## Guardrails

- Always use Linear as the durable context store — never manage issue context in local mirrors.
- Do not start implementation during explore — this skill produces decisions, not code.
- Never mark a question resolved without concrete rationale written into the issue comment or description.
- Keep recommendations grounded in both codebase evidence and Linear issue context.

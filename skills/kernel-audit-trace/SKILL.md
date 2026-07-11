---
name: kernel-audit-trace
description: Analyzes a feature or subsystem end-to-end to identify boundaries, dependency flow, structural risks, and refactoring opportunities. Use when tracing how something works across UI, API, data, and infrastructure, or when evaluating whether a design will hold up as the system grows.
license: MIT
metadata:
  author: project
  version: "2.0"
  category: Specialist
  tags:
    - tracing
    - systems
    - architecture
    - boundaries
    - dependencies
when:
  - tracing a feature from user interaction through backend and storage
  - understanding how a subsystem works end-to-end before changing it
  - evaluating boundary flow, dependency flow, or structural risks across multiple layers
  - identifying handoff problems, hidden coupling, or misplaced responsibilities in an existing feature
termination:
  - End-to-end flow traced with concrete file and boundary references
  - Structural concerns clarified with file and line references
  - Refactoring roadmap produced, ordered by impact
outputs:
  - End-to-end trace of the feature or subsystem
  - Boundary and dependency analysis
  - Refactoring recommendations
  - Roadmap ordered by impact
disableModelInvocation: true
allowedTools:
  - Read
  - Grep
  - Glob
---

Trace a feature or subsystem from top to bottom, identify where responsibilities and handoffs live, and recommend durable structural changes. Do not implement code.

## Mandatory Protocol

1. Confirm the trace target before analyzing. If the feature or subsystem is unclear, ask for the user-facing flow, starting surface, or relevant files.
2. Read the code from entry point to outcome: UI trigger, validation, transport, business logic, persistence, background work, and return path as applicable.
3. Identify boundaries, handoffs, dependency flow, and failure points across the full path.
4. Report findings with file and line references whenever possible.
5. Separate facts from recommendations.

## What To Look For

- Entry points and exit points
- Boundary violations and hidden coupling
- Validation, auth, persistence, and side-effect handoffs
- Circular or overly dense dependencies
- Abstractions that are too thin, too broad, or in the wrong layer
- Missing seams for testing, reuse, observability, or failure recovery

## Output

- End-to-end trace summary
- Boundary and dependency concerns
- Refactoring recommendations
- A short roadmap ordered by impact

## Reporting Rules

- Trace the real path, not the idealized one.
- Name the specific location for every finding.
- Explain why it matters, not just what is present.
- If no serious issues are found, say so explicitly and call out residual risks.
- Do not invent line references or assume unseen code.

## Quality Checks

- The analysis is grounded in the code, not general advice.
- The trace covers the critical path from start to finish.
- Each recommendation is actionable.
- The highest-risk structural issues are listed first.
- The response is concise enough to be used in a real review.

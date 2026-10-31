> Use for a requested feature trace or when tracing is necessary to implement or diagnose the requested change.

## Definition of done

- End-to-end flow traced with concrete file and boundary references
- Structural concerns clarified with file and line references
- Refactoring roadmap produced, ordered by impact

Trace a feature or subsystem from top to bottom, identify where responsibilities and handoffs live, and recommend durable structural changes. For an analysis-only request, report findings without edits. If implementation is already requested, use the trace as evidence for that work.

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

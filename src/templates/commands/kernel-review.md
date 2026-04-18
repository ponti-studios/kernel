---
name: kernel-review
kind: command
tags:
  - review
  - quality
description: Quality reviewer — examines completed work for correctness, security, performance, and maintainability. Use after implementation, before merging or closing a work item.
group: workflow
argumentHint: PR number, branch name, or scope to review (e.g., 'PR #42', 'auth module', 'the changes in src/api/')
backedBySkill: kernel-review
---

Use this when implementation is complete and needs an independent quality pass. Findings come first. If there are no issues, say so explicitly.

## What to Review

Check every applicable dimension before reporting:

**Correctness**
- Does the implementation match the acceptance criteria in `kernel/work/<id>/brief.md`?
- Are edge cases handled — empty inputs, null values, concurrent access, large payloads?
- Are error paths tested, not just the happy path?

**Security**
- Is user input validated and sanitized before use?
- Are secrets handled correctly — not logged, not committed, not returned in responses?
- Are authorization checks in the right place (not just at the UI layer)?
- Are SQL queries parameterized? Is there any risk of injection?

**Performance**
- Are there N+1 query patterns or unbounded loops over large datasets?
- Is any caching being invalidated correctly?
- Are expensive operations async or deferred appropriately?

**Type and Runtime Safety**
- Are type assertions or casts unsafe?
- Are nullable values handled at every access point?
- Are external API responses validated before being used?

**Test Coverage**
- Are the changed code paths covered by tests?
- Are the tests testing behavior, not implementation details?
- Would a breaking change cause a test failure, or could it slip through?

**Maintainability**
- Is the code understandable without inline explanation?
- Are abstractions at the right level — not too early, not too leaky?
- Is there any copy-paste that should be extracted?

## How to Report

Order findings by severity. Use this structure for each:

```
**[SEVERITY]** — [short description]
File: [path]:[line]
Impact: [what breaks or degrades if this is not fixed]
Fix: [concrete suggestion]
```

Severity levels:
- **BLOCKER** — must be fixed before this work is merged; causes data loss, security breach, or functional failure
- **MAJOR** — significant quality issue; fix before merging unless explicitly deferred
- **MINOR** — improvement worth making; can be addressed in a follow-up
- **NOTE** — observation with no immediate action required

## Recommendation

End every review with exactly one of:

- **Approve** — no issues, ready to merge
- **Approve with changes** — minor issues noted; can merge after fixing
- **Needs rework** — one or more blockers or major issues must be resolved first

State the recommendation before explaining it. Do not bury it at the end of a long analysis.

## Guardrails

- Do not summarize what the code does before naming problems — findings first.
- Do not speculate about issues that are not visible in the code being reviewed.
- Cite specific files and line numbers for every finding.
- If there are no findings, state that clearly and name the remaining risk (if any).
- Do not give vague praise — "looks good" without evidence is not a review.

## What to Do Next

- **If approved** — run `kernel work done` for the final task and then `kernel work archive` to close the work item.
- **If changes requested** — address each finding, then re-run this command on the revised code.
- **If blocked** — use `kernel-plan` to revise the plan before continuing.

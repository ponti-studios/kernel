---
name: kernel-audit-review
description: Reviews completed work for correctness, completeness, risk, and readiness to move forward. Use after implementation, before merge or handoff, or when the user asks for a review of code, docs, or another deliverable.
license: MIT
compatibility: Use after implementation is complete, before handoff, merge, or deployment.
metadata:
  author: project
  version: "2.0"
  category: Workflow
  tags:
    - workflow
    - review
    - quality
    - post-completion
    - sign-off
    - readiness
when:
  - a deliverable is complete and ready for sign-off
  - before handing off, deploying, or merging
  - user asks to review code, docs, or another completed artifact
  - there are concerns about correctness, regressions, or missing acceptance criteria
applicability:
  - Use to formally assess whether completed work meets its acceptance criteria
  - Use to surface must-fix issues before the work moves downstream
  - Use when a clear go / no-go recommendation is needed
termination:
  - All evaluation dimensions covered
  - Findings prioritised as must-fix, should-fix, or consider
  - "Clear recommendation delivered: approve | approve with changes | needs
    rework"
outputs:
  - Review report with recommendation
  - Prioritised findings list
disableModelInvocation: true
userInvocable: false
argumentHint: task, PR link, or file/directory to review (optional)
allowedTools:
  - Read
  - Grep
  - Glob
  - Bash
---

Answer: _is this done well enough to move forward?_

This skill owns evaluation and recommendation, not implementation. Use narrower execution skills when the work needs to be changed rather than assessed.

## Steps

### 1. Establish context

- If provided, use the acceptance criteria or scope from the user.
- Otherwise, infer what "done" means for this work based on the deliverable.

### 2. Examine the output

- Read the relevant files, diffs, or artifacts produced.
- Check whether the output matches what was promised.

### 3. Evaluate across dimensions

Weight each dimension by what matters most for this work:

| Dimension        | Question                                           |
| ---------------- | -------------------------------------------------- |
| **Correctness**  | Does it do what it is supposed to do?              |
| **Completeness** | Are all acceptance criteria satisfied?             |
| **Quality**      | Is it well-made, readable, and maintainable?       |
| **Security**     | Are there vulnerabilities or unsafe patterns?      |
| **Performance**  | Are there obvious bottlenecks or wasted resources? |
| **Standards**    | Does it conform to project conventions?            |

### 4. Prioritise findings

- **Must fix** — blocks approval; cannot move forward without this
- **Should fix** — significant issue; address before closing but not a blocker today
- **Consider** — improvement that would add value but is not required

### 5. Deliver the review report

```
## Review: [approve | approve with changes | needs rework]

**Summary**
[2–3 sentences: what was reviewed and the overall finding]

**Findings**

### Must Fix
- [specific issue]: [why it matters] — [what to do]

### Should Fix
- [specific issue]: [why it matters] — [what to do]

### Consider
- [suggestion]: [rationale]

**Recommendation**
[Clear direction: what happens next and who owns it]
```

## Review Principles

- **Review against the goal, not your preferences.** The question is whether the work achieves its stated intent.
- **Be specific.** Name the exact location, the exact problem, and the exact fix.
- **Prioritise ruthlessly.** A review with ten must-fixes is broken. If everything is urgent, nothing is.
- **Recommend, don't just report.** A review that surfaces problems without a path forward leaves the recipient stuck.
- **Acknowledge what works.** A review that only criticises misses context and demotivates iterative improvement.

## Quality Checks

Before delivering the review:

- [ ] Findings are specific and actionable, not vague
- [ ] Must-fix items are genuinely blocking
- [ ] The recommendation is clear and unambiguous
- [ ] The report distinguishes between fact and opinion
- [ ] Nothing important was omitted to avoid an uncomfortable conversation

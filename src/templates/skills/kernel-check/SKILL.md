---
name: kernel-check
description: "Reports current execution state mid-task: what is done, what is in progress, what is blocked, and what comes next. Use mid-execution when task status is unclear, a blocker has appeared, or users ask where are we, what is next, or what is blocking."
---

Answer: _where are we and what do we need to know right now?_

## Steps

### 1. Gather the current state

- Review what has been done, what is in progress, and what remains.
- Read the active issues with `state: in-progress` and `state: todo`.

### 2. Surface blockers

- Are any tasks waiting on something external?
- Read the relevant issues and check blocking dependencies.

### 3. Assess timeline

- Is delivery still on track given current progress?
- Are any remaining tasks larger than originally estimated?

### 4. Flag risks

- Has anything emerged that could threaten the goal?
- Are there incomplete tasks that have hidden dependencies?

### 5. Deliver the status report

```
## Status: [on track | at risk | blocked]

**Done**
- [completed tasks, with a brief note on what was produced]

**In Progress**
- [tasks actively being worked, with current state]

**Blocked**
- [task]: [what is blocking it] — [recommended resolution]

**Next**
- [next task(s) to start]

**Risks**
- [anything that could affect timeline or quality]

**Recommendation**
[One clear sentence: what should happen next]
```

## Guardrails

- Do not report what you hope is true — report what you can verify.
- Every blocker must have a recommended resolution, not just a description.
- The recommendation must be actionable: one sentence, one owner, one direction.

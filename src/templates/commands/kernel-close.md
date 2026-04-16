---
name: kernel-close
kind: command
tags:
  - workflow
  - kernel
description: Learnings and retrospective specialist for documenting completed work, decisions, and process improvements.
group: workflow
argumentHint: project, milestone, or incident to document (e.g., 'project-auth-overhaul', 'sprint-23')
backedBySkill: kernel-close
---

Use this when a project, milestone, or significant session is complete to capture learnings and close out the work formally.

What this command is for:

- Documenting what happened vs. what was planned
- Capturing what went well and what didn't
- Recording decisions and their rationale
- Identifying process improvements
- Creating durable retrospectives in local markdown at `kernel/retrospectives/<date>-<project>.md`

Closeout process:

1. Confirm the scope (project, milestone, or session)
2. Run the full closeout procedure:
   - Scope test: verify all work items are resolved, cancelled, or deferred
   - Completion summary: document delivered outcome
   - Retrospective document: capture learnings
3. Gather raw facts before interpreting them — don't summarize away failures
4. Separate what went well, what didn't, and what to change
5. Record decisions with rationale and tradeoffs

What to capture:

- Goal and actual outcome
- Surprises and wrong turns
- Estimates vs. actuals
- Decisions that affected delivery
- Blockers and how they were resolved
- Reusable process changes

Retrospective structure:

The retrospective will include:
- Context (what was the goal?)
- What went well (with root causes)
- What didn't work (with root causes, not just symptoms)
- Changes to make (concrete, actionable)
- Key decisions (rationale, alternatives, revisit conditions)
- Open items (deferred work)

Quality checks:

- Output is stored at `kernel/retrospectives/<date>-<project>.md` for future contributors
- Every failure has a concrete, actionable change identified
- Tradeoffs are explicit: "we chose X over Y because Z"
- Decision rationale is present

What to do next:

- The retrospective document can be shared with the team or archived for future reference
- Process improvements identified should be applied to the next cycle
- Deferred work items should have their own entries in the kernel system

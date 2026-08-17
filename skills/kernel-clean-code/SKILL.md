---
name: kernel-clean-code
kind: skill
tags:
  - refactoring
  - code-quality
  - tech-debt
license: MIT
description: >
  A consolidated code-health skill covering AI-slop removal, code-smell
  detection, branch-level deslop, and full tech-debt audits. Load the relevant
  reference below rather than a standalone skill.
when:
  - removing AI-generated slop from working code or a branch diff
  - spotting code smells (long methods, duplication, coupling, primitive obsession)
  - auditing a codebase's health and architecture into TECH_DEBT_AUDIT.md
outputs:
  - Cleaned code, smell findings, or TECH_DEBT_AUDIT.md per the loaded reference's workflow
termination:
  - The applicable reference's definition-of-done checks pass for the task
allowedTools:
  - Read
  - Write
argumentHint: the code-health task (deslop, smells, or debt audit)
---

# Kernel Clean Code — consolidated code-health skill

One skill routing across four code-health workflows. Pick the reference that
matches the task and follow it end-to-end.

## References

| Task | Reference |
| --- | --- |
| Remove AI-generated slop (deletion-first, regression-safe, optional `--review`) | `references/ai-slop-cleaner.md` |
| Spot code smells (long methods, duplication, coupling, primitive obsession) | `references/code-smell-detector.md` |
| Remove AI slop from a branch (diff against main, style inconsistency) | `references/deslop.md` |
| Full tech-debt + architecture audit producing `TECH_DEBT_AUDIT.md` | `references/tech-debt-audit.md` |

## Routing

- **Broad cleanup pass / slop in working code** → `ai-slop-cleaner` (plan, lock
  behavior with tests, delete-first passes, evidence-dense report).
- **Slop in a specific branch diff** → `deslop` (compare against main, remove
  non-human comments, defensive checks, `any` casts, inline imports).
- **Design-level code health questions** → `code-smell-detector` (heuristics,
  Fowler catalog, avoid generating code to "fix" smells).
- **Repo-wide debt / architecture audit** → `tech-debt-audit` (orient, audit 9
  dimensions, write `TECH_DEBT_AUDIT.md` with file:line citations).

## Cross-cutting rules

- **Preserve behavior** unless the user explicitly asks for behavior changes;
  lock it with regression tests first whenever practical.
- **Prefer deletion over addition.** Reuse existing utilities before introducing
  new ones; avoid new dependencies unless asked.
- **Evidence over vibes.** Cite `file:line` for findings; a finding without a
  citation is a vibe.
- **Smallest scoped change.** One smell-focused pass at a time; do not bundle
  unrelated refactors.
- **Don't pad, don't sycophancy.** No "overall the codebase is well-structured"
  filler.
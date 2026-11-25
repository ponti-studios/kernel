# Clean Code

## Definition of done

- The applicable reference's definition-of-done checks pass for the task

Routes across four code-health workflows. Pick the reference that
matches the task and follow it end-to-end.

## References

| Task                                                                            | Reference                                                   |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `deslop` / AI slop cleanup (deletion-first, regression-safe, optional `--review`) | [ai-slop-cleaner.md](references/ai-slop-cleaner.md)         |
| Spot code smells (long methods, duplication, coupling, primitive obsession)     | [code-smell-detector.md](references/code-smell-detector.md) |
| Quick slop pass over one branch diff only (style inconsistency)                 | [deslop.md](references/deslop.md)                           |
| Full tech-debt + architecture audit (report to stdout or a user-named path)     | [tech-debt-audit.md](references/tech-debt-audit.md)         |

## Routing

- **`deslop`, anti-slop, broad cleanup / slop in working code** → `ai-slop-cleaner` (plan, lock
  behavior with tests, delete-first passes, evidence-dense report).
- **Quick pass over one branch diff, no plan or tests needed** → [deslop.md](references/deslop.md) (compare against the base branch, remove
  non-human comments, defensive checks, `any` casts, inline imports).
- **Design-level code health questions** → `code-smell-detector` (heuristics,
  Fowler catalog, avoid generating code to "fix" smells).
- **Repo-wide debt / architecture audit** → `tech-debt-audit` (orient, audit 9
  dimensions, report with file:line citations to stdout or a path the user names).

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

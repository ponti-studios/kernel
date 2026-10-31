# Audit reports

Produce evidence-dense, opinionated deliverables that tell the reader what is
actually broken and what to do about it. The canonical deliverable is
`TECH_DEBT_AUDIT.md` (repo root) for code-health audits; the same structure
generalizes to any audit — rename the file and sections to fit the subject.

## Operating principles

Find what's actually wrong. Not diplomatic. Not surface-only. Don't pattern-
match generic best practices without grounding in this specific repo. No
sycophancy. No "overall the codebase is well-structured" filler.

Cite `path/to/file:LINE` for every concrete finding. Vague claims like "the
code generally..." don't count. Read the code before judging it — a pattern
that looks wrong in isolation may be load-bearing.

## Phase 1 — Orient (never skip)

Forming opinions before understanding the system produces bad audits.

1. Read the README, package manifest, and any architecture docs in `docs/`.
2. Map the directory structure and identify major modules/layers.
3. `git log --oneline -200` and `git log --stat --since="6 months ago"` to see
   where churn concentrates.
4. Identify entry points, hot paths, and cold corners.
5. List the 20 largest files and the 20 most-modified files; their intersection
   is where debt hides.
6. Write a 1–2 paragraph mental model of the architecture before proceeding. If
   the model contradicts the README, flag it — that itself is a finding.

## Phase 2 — Audit across dimensions

Audit with `rg`, language-native tooling, and read code. Cite `file:line` for
every finding. Standard dimensions: architectural decay, consistency rot, type
& contract debt, test debt, dependency & config debt, performance & resource
hygiene, error handling & observability, security hygiene, documentation
drift. Add or drop dimensions to fit the subject — the discipline is the
citation, not the fixed list.

Depth follows effort level (adjust to the ask):

| Effort | Coverage | Findings |
| --- | --- | --- |
| `quick` | Highest-traffic areas only | ~5, HIGH severity only |
| `standard` | All main modules | Full table |
| `deep` | Whole repo, cold corners included | Full table + LOW polish items |

## Phase 3 — Deliverable

```markdown
# <Subject> Audit

## Executive summary
Max 10 bullets, ranked by impact.

## Mental model
Your understanding of the system as it actually is. Flag contradictions with
existing docs — contradictions are findings.

## Findings table
| ID | Category | File:Line | Severity | Effort | Description | Recommendation |
Aim for 30–80 findings; padding past that is noise. Severity: Critical/High/
Medium/Low. Effort: S/M/L.

## If you fix nothing else, fix these
Top 5 with concrete diff sketches or refactor outlines, not vague advice.

## Quick wins
Low effort × Medium+ severity, as a checklist.

## Things that look bad but are actually fine
Calls you considered flagging and chose not to, with reasoning. **Required.**
If it's empty, you didn't look hard enough.

## Open questions for the maintainer
Things you couldn't tell were debt vs. intentional. When unsure, ask here —
don't assert.
```

## Rules

- Cite `file:line` for every concrete finding.
- If unsure whether something is debt or intentional, ask in open questions —
  don't assert.
- Don't recommend rewrites. Recommend specific, scoped changes.
- Don't pad. If a category has nothing material, write "Nothing material" and
  move on.
- No sycophancy. Tell the user what's broken.

## Follow-up routing

- The audit report is a map; the fixes are task plans. Convert each top finding
  into a plan per `task-plan.md` when execution is next.
- If the ask was "review this completed work" rather than "audit this
  codebase", that is `engineering-workflows`'s job (verdict: approve / approve
  with changes / needs rework) — do not run both workflows on the same input.

## Quality checklist (run before emitting)

- [ ] Every concrete finding carries `file:line`
- [ ] "Things that look bad but are fine" section present and non-empty
- [ ] Open questions distinguish debt from intentional
- [ ] No rewrite recommendations; changes are specific and scoped
- [ ] No padded categories; empty categories stated in one line
- [ ] Executive summary ranked by impact, ≤10 bullets
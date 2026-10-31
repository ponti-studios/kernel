# Write Docs — consolidated documentation skill

> Invoke with: the documentation task (write/edit X, or audit docs/ against FORMAT.md).

## Definition of done

- The loaded reference's definition-of-done checks pass for the artifact
- Artifact claims are verified against code, not asserted from memory
- Frontmatter and internal links validate against the reference's rules

One skill routing across five documentation workflows plus a shared voice.
Use the voice and shape below as defaults after the user’s instructions and the
target repository’s document contract. Pick the reference that matches the task and follow it
end-to-end.

## Default documentation voice

Say the fact first, then the reason if the reason is non-obvious. Don't warm up.

- Short paragraphs. 2–4 sentences. One idea each.
- Active voice, present tense for things that are true now.
- No hedging ("basically", "essentially", "in general") and no throat-clearing
  ("This document describes...", "It's worth noting that...").
- Code identifiers, file paths, and commands in backticks. Cite
  `path/to/file:line` when a claim is checkable in code — that is what keeps a
  doc from rotting invisibly.
- Cut anything that explains what the code already makes obvious. Explain the
  *why*, the tradeoff, the thing a reader can't get from `git blame`.
- No case-study narration, no "the hardest fixes were..." retrospectives. A doc
  is either a map of the system as it stands or a proposal for the next change
  to it — never a story about how it got here.

## Repository document contracts

- Use YAML frontmatter when the target repository requires it. Match its keys
  and type-specific template; when that contract applies:
  - `status` distinguishes *true today* (`active`) from *still forming*
    (`draft`) from *design for future work* (`proposed`).
  - `updated` (or equivalent date key) is bumped on every substantive edit.
    An `active` doc older than the code it describes signals re-verification,
    not trust.
- A doc is deleted, not archived, once it stops being true and nothing depends
  on knowing the history. Git history is the archive. Docs are a living map,
  not a log.

## Doc-type taxonomy

| Type | Shape | Status when written |
| --- | --- | --- |
| `architecture` | how a system is built and why it's split that way: layers/components → API surface → operational surface → read next | `active` |
| `reference` | dense facts about one mechanism, no narrative | `active` |
| `guide` | how to run a command or workflow; lead with the command | `active` |
| `proposal` | not built yet: problem → recommended shape → open questions | `proposed` |
| PRD / product brief | requirements artifact upstream of code | `proposed` until shipped, then graduates to reference/architecture or is deleted |
| task plan | executor-ready change spec; plans live in `plans/`, one per finding | per-plan status in its header block |
| audit report | evidence-dense findings with `file:line` citations | reflects the audit date |
| runbook / checklist | ordered operational flow with a verification step per phase | `active` |

## References

| Task | Reference |
| --- | --- |
| Write or edit repo docs (`docs/*`) against the FORMAT.md contract | [repo-docs.md](references/repo-docs.md) |
| Write a PRD, feature spec, or product brief | [prd.md](references/prd.md) |
| Turn audit findings into self-contained implementation plans | [task-plan.md](references/task-plan.md) (one plan per finding — the plan shape; for decomposing a plan into dependency-ordered tasks, route to [plan-to-tasks](../plan-to-tasks/WORKFLOW.md)) |
| Produce an audit report or evidence-dense deliverable | [audit-report.md](references/audit-report.md) |
| Write a runbook, checklist, or operational guide | [runbook.md](references/runbook.md) |

## Routing to existing skills — do not duplicate

These specialized skills already own a single artifact type. Route to them
instead of re-authoring the format:

| Artifact | Skill |
| --- | --- |
| Incident reports (`docs/incidents/NNN-*.md`) | [write-incident-report](../write-incident-report/WORKFLOW.md) |
| Decomposing a plan/spec/PRD into dependency-ordered task files | [plan-to-tasks](../plan-to-tasks/WORKFLOW.md) |
| Print / archival / technical-dossier docs | [Physical production writing](../kernel-ops-production/WORKFLOW.md) |
| Commit messages | `engineering-workflows` |
| Review verdicts on completed work | `engineering-workflows` |
| Security requirements for a PRD (ASVS/FIASSE) | `prd-securability-enhancement` (inside `security-workflows`) |

## Pre-flight (every task)

1. Read the repo's `docs/FORMAT.md` when it exists — it is the contract of
   record and wins over this skill's embedded schema.
2. Inspect two existing artifacts of the same type in the target repo before
   writing. Match their conventions (fields, headings, tone).
3. Verify implementation claims against code. Cite file and line when it helps
   the reader check the claim; use appropriate primary sources for other claims.
4. Validate the artifact: frontmatter keys, enum values, kebab-case tags,
   `related`/internal links resolving, ISO dates.

## Cross-cutting rules

- **Evidence.** Support checkable claims with the relevant code or source;
  do not fabricate citations or require code citations for non-code material.
- **Smallest true claim.** State exactly what exists today. Never pad with
  aspirational behavior or "planned for next quarter" unless the doc is a
  `proposal`.
- **Bump dates on every substantive edit.** Stale `active` docs are worse than
  no docs.
- **Delete, don't archive.** When a doc stops being true and nothing depends on
  the history, remove it. Git history is the archive.
- **Don't pad, don't sycophancy.** No "overall the docs are well-structured"
  filler. If a section has nothing material, say so in one line and move on.

---
title: Project Documentation Convention
knowledge_type: standard
domain: ponti-studios/projects
scope: organizing-project-documentation
status: active
updated: 2026-08-25
applies_to:
  - "ponti-studios/projects/**"
---
---
title: Project Documentation Convention
knowledge_type: standard
domain: ponti-studios/projects
scope: organizing-project-documentation
status: active
updated: 2026-08-25
applies_to:
  - "ponti-studios/projects/**"

# Project Documentation Convention

This is the full convention this skill enforces. It exists because
an earlier attempt at organizing `ponti-studios/projects/` docs went
through several rounds of churn: status duplicated as prose across 4-5
files per project, decision docs rewritten in place (destroying the record
of what was believed before), a hand-maintained tracker table that went
stale — and then went missing twice to an iCloud sync-eviction bug, which
is a real, observed failure mode of this vault, not a hypothetical one.
Every rule below is a direct fix for something that actually broke.

## Status lives in exactly one place

Every project's `_index.md` carries a `status` field in frontmatter. nothing
else — not `current-state.md`, not a decision doc, not a checklist —
restates status in prose. If you need to know a project's status, check
its frontmatter or the tracker below. A status sentence written into some
other file is not kept in sync by anything and will drift; this happened
repeatedly before this convention existed.

Fixed vocabulary — don't invent new values without updating this file and
`ponti-studios-projects.base`'s views:

- `idea` — not yet a real product concept, just a wish or observation
- `brainstorm` — actively being defined, no decisions locked yet
- `decided` — the concept/design is settled, implementation not started
- `active-development` — being built, at least partially working
- `shipped` — live for real users, not just a local prototype
- `archived` — deliberately stopped; kept for reference, not being worked on

## The tracker is a query, not a table

`ponti-studios-projects.base` (vault root, matching where this vault's
other `.base` files already live) queries every file with `type: index`
and renders status automatically. This can't go stale the way a
hand-written markdown table did — there's nothing to forget to update.

This only covers projects that have graduated to their own directory with
a proper `_index.md`. Experiments still living as flat brief/checklist
file pairs in `_ideas/` aren't in this tracker — `EXPERIMENTS-AUDIT.md`
covers those until they graduate (see "When a project gets its own
directory" below).

## Planned work is a change folder, not a rewritten doc

Don't create a new top-level file every time a decision is made, and don't
rewrite an existing decision doc in place to reflect new status. Instead,
every planned unit of work gets a dated folder:

```
<project>/changes/<YYYY-MM-DD>-<kebab-slug>/
├── proposal.md   — the why: problem, decision, what was cut, open questions
└── tasks.md      — the breakdown: see task notation below
```

While work is in progress, the folder lives directly under `changes/`.
Once every task in `tasks.md` is checked off, the **entire folder** moves
to `changes/archive/<same-name>/` — preserved as-is, never edited again.
If a decision is later reversed, that's a **new** change folder whose
`proposal.md` says what it supersedes; don't edit the old one.

Use `scripts/scan_changes.py` to check status and to archive — it
verifies every task is actually checked before moving anything, so a
change can't get archived prematurely by accident.

### Task notation

Each task is a checkbox line with an ID and optional markers:

```
- [ ] T001 [P] Independent task, safe to hand to a separate session
- [ ] T002 Task with a real ordering constraint (depends on T001)
- [x] T003 Completed task
```

- `[P]` — genuinely parallel-safe: different files, no shared state, no
  dependency on anything else in this change. This is a real claim, not a
  default — only mark it if you've actually checked that it doesn't touch
  the same code/files as another task.
- `(depends on T00N)` — a real ordering constraint, because the task
  needs something the referenced task produces (e.g. a UI element that
  doesn't exist until a layout change lands).
- Neither marker: sequential by default, not yet analyzed either way.

Getting this right requires actually understanding what each task touches
before writing them down — the value of the notation is in doing that
analysis, not in mechanically stamping every task with a marker.

## Fixed, small file budget per project

Default to `_index.md` + `changes/`. Add `current-state.md` once "what's
built" is substantial enough to need to exist as living documentation
separate from decision history, and `architecture.md` once there's real
code structure worth describing on its own. Don't create a new file for
something that's really just one paragraph in an existing one, or one more
change folder.

## When a project gets its own directory

An idea graduates from a flat file in `_ideas/` (or wherever it started)
once it has real implementation decisions accumulating — not just
brainstorm notes. Before that point, a brief + checklist pair in `_ideas/`
is enough; there's no `changes/` folder or frontmatter status to maintain
for something that's still just an idea. `hollywood/` and
`theatre-management/` are the two examples so far.

## Auditing for drift

Signs a project has drifted from this convention:

- Status stated in prose anywhere other than `_index.md` frontmatter.
- A change folder under `changes/` (not `archive/`) where every task is
  checked off — `scan_changes.py` flags this automatically as "ready to
  archive."
- A `tasks.md` with more than one task where none carry `[P]` or
  `(depends on...)` — `scan_changes.py` flags this as a possible sign the
  dependency/parallel analysis was skipped, though a genuinely flat,
  unordered list is sometimes correct and shouldn't be forced into fake
  structure just to clear the flag.
- A decision doc that's been edited to reflect a new status instead of
  a fresh change folder being created.

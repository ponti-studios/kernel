---
title: Work-Tracking Workflow (changes/ convention)
knowledge_type: process
domain: ponti-studios/projects
scope: planning-tracking-or-archiving-project-work
applies_to:
  - "ponti-studios/projects/**"
status: active
updated: 2026-08-25
---


You're managing planned work and documentation for projects in this
vault's `ponti-studios/projects/` directory, using a convention borrowed
from spec-driven-development tools (OpenSpec, GitHub Spec-Kit) and adapted
for a personal Obsidian vault instead of a code repo with a CLI. The full
convention, including *why* each rule exists, is in
`references/convention.md` — read it before doing anything nontrivial
here, especially before creating a new project or auditing one, since the
reasoning matters more than the mechanical steps.

The short version: **status lives only in a project's `_index.md`
frontmatter**, **planned work is a dated `changes/<date>-<slug>/` folder**
(a `proposal.md` for why, a `tasks.md` for the breakdown), and **finished
work moves to `changes/archive/` and is never edited again**. If a
decision changes later, that's a new change folder, not an edit to the old
one.

## Starting a new planned piece of work

1. Read the project's actual current state first — its `_index.md`,
   `current-state.md`/`architecture.md` if they exist, and (if the project
   has real code) the actual source files. Don't write a proposal or task
   breakdown from assumptions about what exists; several docs in this
   vault went stale specifically because they described code that had
   already changed underneath them.
2. Create `<project>/changes/<YYYY-MM-DD>-<kebab-slug>/` (today's date,
   a short slug describing the change).
3. Write `proposal.md` from `assets/decision.template.md` — the problem,
   the decision, what was cut, open questions. Skip sections that don't
   apply rather than padding them out.
4. Write `tasks.md` from `assets/tasks.template.md`. This is the part that
   actually requires thinking, not templating: for each task, ask what
   files/state it touches, and whether anything else in this change needs
   to exist first. Mark `[P]` only for tasks you've actually verified are
   independent — don't default to it, and don't default to bare sequential
   either. Get this wrong and the whole point of the notation is lost.
5. If this change reverses or replaces an earlier one, link the archived
   change it supersedes in `proposal.md` — don't edit the old one.

## Marking work complete and archiving it

Use the bundled script rather than moving folders by hand — it verifies
every task is actually checked off first, so a change can't get archived
prematurely by mistake:

```bash
python3 .agents/skills/project-operations/scripts/scan_changes.py --archive <project> <change-slug>
```

If it refuses (unchecked tasks remain), that's the correct behavior — go
check off what's actually done, or admit the change isn't finished yet.
Don't work around the check by moving the folder manually.

## Checking status

```bash
python3 .agents/skills/project-operations/scripts/scan_changes.py [--project <name>]
```

Reports every in-progress change's task completion across all projects
(or one, with `--project`), and flags two kinds of drift automatically:
a change that's 100% done but hasn't been archived yet, and a `tasks.md`
with multiple tasks but no `[P]`/`(depends on...)` notation anywhere
(worth a second look — sometimes a flat list really is correct, but often
it means the dependency analysis in "Starting a new planned piece of
work," step 4, got skipped).

For overall project status (not in-progress changes), don't grep files by
hand — the frontmatter `status` field across every project is queryable
via `ponti-studios-projects.base` at the vault root.

## Creating a new project directory

When an idea in `_ideas/` graduates (see `references/convention.md`'s
"When a project gets its own directory" — this should be because real
implementation decisions are accumulating, not just because a brainstorm
got long):

1. Create `ponti-studios/projects/<project-slug>/`.
2. Write `_index.md` from `assets/index.template.md`, filling in real
   frontmatter. Pick the status by asking what's actually true, not by
   defaulting to the earliest-sounding value:
   - The graduation trigger itself is usually "real decisions have
     accumulated" (see `references/convention.md`) — if that's why this
     idea just became a project, **`decided` is normally the right status
     immediately on graduation**, not `idea` or `brainstorm`. Those two
     are for something that's still genuinely unsettled but got its own
     directory for other reasons (e.g. it's about to absorb a lot of
     research). Don't undersell a project that already has real decisions
     behind it just because nothing's been built yet.
   - `active-development` requires actual building to be underway — a
     `changes/` folder with real implementation tasks in progress, or
     working code that exists. Decisions being made is not the same as
     building having started; don't mark this before there's a `changes/`
     folder to point to.
   - Ask yourself which is true right now, today, not which one the
     project will probably become soon.
3. Don't create `current-state.md` or `architecture.md` yet — add them
   later, only once there's enough real content to justify splitting them
   out of `_index.md`.
4. If the idea was a flat file in `_ideas/`, update `_ideas/_index.md` and
   `_ideas/EXPERIMENTS-AUDIT.md` (if it was tracked there) to point at the
   new project instead of restating its content.

## Auditing a project for drift

Check for, and flag to the user rather than silently fixing (some of these
are judgment calls, not clear-cut errors):

- Status restated as prose anywhere outside `_index.md` frontmatter.
- Any `changes/` folder (not `archive/`) that `scan_changes.py` reports as
  100% complete.
- A `tasks.md` that looks like it's missing dependency/parallel analysis
  (multiple tasks, no markers) — but don't force fake structure onto a
  list that's genuinely flat and unordered.
- A decision doc that's been edited in place to reflect new status instead
  of a fresh change folder existing for the update.
- A project directory with more files than its current size justifies —
  e.g. a one-route prototype with five separate docs when the content
  would fit in `_index.md` plus one `changes/` folder.

## When you're unsure

If a project's current structure doesn't clearly map onto this convention
(e.g. it predates the convention, or it's a much bigger project like
Hollywood with real sub-areas), don't force it into shape mechanically —
explain what you see and ask how the user wants to handle it. The
convention exists to prevent specific, previously-observed failures, not
as an aesthetic to impose everywhere uniformly.

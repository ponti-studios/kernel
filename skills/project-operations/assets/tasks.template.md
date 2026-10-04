# Tasks — {{Change title}}

> **Scope boundary:** this checklist format is for work tracked inside a change folder (`changes/<date>-<slug>/`). For standalone, multi-file task breakdowns that live as their own task files with full frontmatter (`status/priority/depends_on/blocks/estimated_size`), use the `plan-to-tasks` skill instead.

Each line: `- [ ] T00N [P]? Description (depends on T00M)?`

- `[P]` — safe to do in parallel / hand to a separate session, because it
  touches different files and doesn't need anything above it to exist yet.
- `(depends on T00M)` — real ordering constraint; don't start this until
  the referenced task is checked off.
- Neither marker means: sequential by default, but not because anything
  specific blocks it — just hasn't been analyzed as parallel-safe.

Group under phase headings if there are enough tasks to make that useful.
Don't invent phases for a two- or three-task change.

## Tasks

- [ ] T001 {{First task}}
- [ ] T002 {{Second task}}

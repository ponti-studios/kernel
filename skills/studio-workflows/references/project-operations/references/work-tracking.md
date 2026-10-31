# Project work tracking

This convention applies to projects that use the Ponti Studios vault layout.
Inspect the project's actual index and current files first. Use
[the convention](convention.md) and [frontmatter contract](project-frontmatter-contract.md)
for lifecycle decisions. A code repository with another tracker keeps its own
workflow unless migration was requested.

For planned work, create a dated `changes/<date>-<slug>/` directory only when the
project uses that structure. Keep the problem and decision in proposal.md and
concrete tasks with dependencies in tasks.md. Writing those artifacts uses
writing-workflows; do not invent implementation status from the existence of a plan.

Before archiving, inspect each task's actual completion evidence. Move a completed
change into changes/archive/ only when the project's contract permits it and every
required task is complete. If the project has its own archival command, inspect and
use it; this package does not bundle a scan_changes.py command. Do not claim an
unavailable script verified the archive. Record a later change as a new decision
rather than silently rewriting an archived record.

When creating a project, derive its index fields from the frontmatter contract
and assign the state supported by evidence. Decisions alone do not prove active
implementation. Add architecture and current-state documents only when enough
material exists to justify them; keep indexes as pointers to their canonical facts.

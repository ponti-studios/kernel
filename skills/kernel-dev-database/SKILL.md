---
name: kernel-dev-database
description: "Enforces production-safe PostgreSQL schema evolution with Goose migrations, Kysely type synchronization, expand/contract rollouts, dependency analysis, backfill safety, and rollback planning. Use whenever changing, reviewing, applying, or rolling back tables, columns, indexes, constraints, defaults, data migrations, or generated database types."
license: MIT
compatibility: PostgreSQL + Goose (migrations) + Kysely + kysely-codegen.
metadata:
  author: project
  version: "3.0"
  category: Database
  tags:
    - database
    - migrations
    - sql
    - goose
    - postgres
    - schema
    - kysely
    - codegen
    - rollout
when:
  - user needs to add, modify, rename, or remove a table, column, index, or constraint
  - user needs to create, inspect, apply, validate, or roll back a migration
  - a feature requires a schema change before application code can be written safely
  - user asks about migration status, schema drift, generated types, or live database state
  - a destructive, lock-sensitive, long-running, or hard-to-reverse DDL change is being considered
  - a schema change needs to be coordinated across application versions or deployments
applicability:
  - Use for every schema or persistence change in this project
  - Use when reviewing migrations for safety, reversibility, compatibility, or modeling quality
  - Use when planning expand → backfill → contract changes
  - Use when diagnosing drift between live PostgreSQL state, migration history, and generated types
termination:
  - The modeling and migration strategy is explicit
  - Migration state and live schema assumptions are verified
  - Generated DB types are synchronized and verified
  - Rollout, monitoring, rollback, and residual risks are documented
outputs:
  - Schema modeling decision
  - Safe migration plan or authored migration
  - Preflight and verification evidence
  - Generated type status
  - Rollout and recovery risk assessment
disableModelInvocation: true
---

# Production Database Change Protocol

Use PostgreSQL as the persistence source of truth, Goose as the only schema-change mechanism, and generated Kysely types as a checked-in consumer contract. Read the focused references below before acting; do not improvise a production migration from a DDL snippet alone. When working in the Hominem monorepo, use the Hominem-specific references and script without weakening the general safety gates.

## Non-negotiables

- Never apply schema DDL through ad hoc `psql`, a GUI, or a manual production session.
- Never edit a migration that has run in a durable environment.
- Never hand-edit generated database types.
- Never use `CASCADE` until every dependent object and data impact is enumerated.
- Never run a long or resumable backfill as an unbounded Goose DDL migration.
- Never assume `Down` is a safe production rollback after data has changed.
- Never deploy code that requires a schema contract before the compatible migration phase is understood.

## Required workflow

1. Classify the request as model-only, schema DDL, data/backfill, or a combined change.
2. Identify the operating state: greenfield disposable baseline, durable non-production schema, or production/applied schema. Applied migrations are immutable.
3. Explain the durable product concept and invariants before writing SQL.
4. Inspect the live schema, migration status, dependent objects, data shape, row volume, and likely lock impact. Migration history alone is not live-state evidence.
5. Assign a risk class: metadata-only, table-scanning, table-rewriting, lock-sensitive, data-destructive, or irreversible/restore-dependent.
6. Select direct DDL only when compatibility, lock, data, and deployment checks justify it. Otherwise use expand → compatible application rollout → backfill/validation → contract.
7. Scaffold the migration through the approved Goose command. Keep one coherent concern per file and write explicit, named constraints and indexes.
8. Write and test `Up` and `Down` for disposable environments. If production recovery needs a forward fix, data repair, or restore, document that separately.
9. Rehearse on a representative database. Verify SQL behavior, existing-data compatibility, dependency behavior, lock/timeout behavior, and retry/failure handling.
10. Apply through the approved workflow with one migration runner, explicit timeouts, and an observed stop/cancel plan.
11. Regenerate and verify Kysely types, run affected lint/typecheck/tests, and verify the live schema after application.
12. Report commands, environments, observed results, rollout sequencing, monitoring, rollback/recovery, and unverified assumptions.

## Reference routing

- Operation selection and compatibility phases: [migration-patterns.md](references/migration-patterns.md)
- Concrete table/column/constraint/index procedures: [operation-playbooks.md](references/operation-playbooks.md)
- Production preflight, rollout, monitoring, and recovery: [production-runbook.md](references/production-runbook.md)
- Hominem live schema inspection: [hominem-schema-inspection.md](references/hominem-schema-inspection.md), using [pull-hominem-schema.sh](scripts/pull-hominem-schema.sh)
- Hominem repository migration commands: [hominem-workflow.md](references/hominem-workflow.md)
- Repository commands and Goose transaction behavior: [goose-workflow.md](references/goose-workflow.md)
- Modeling, lifecycle, dependency, and naming standards: [schema-design.md](references/schema-design.md)
- Generated Kysely type synchronization: [kysely-codegen.md](references/kysely-codegen.md)

## Required verification

A change is incomplete until the relevant checks pass: migration files validate; expected migration state is reached; schema assertions and invariants pass; generated types match the live schema; downstream typecheck/lint/tests pass; and destructive, irreversible, lock-sensitive, or rollout-sensitive aspects are called out explicitly.

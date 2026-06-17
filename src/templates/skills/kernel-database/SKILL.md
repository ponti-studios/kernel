---
name: kernel-database
description: "Enforces the required database change workflow for this project: PostgreSQL schema design, Goose migrations, generated type sync, and rollout safety. Use whenever changing schema, applying or rolling back migrations, evaluating modeling choices, or reconciling generated DB types with the live database."
license: MIT
compatibility: PostgreSQL + Goose (migrations) + Kysely + kysely-codegen.
metadata:
  author: project
  version: "2.0"
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
    - types
    - ddl
when:
  - user needs to add, modify, or remove a table, column, index, or constraint
  - user needs to create, inspect, apply, or roll back a migration
  - a feature requires a schema change before application code can be written safely
  - user asks about migration status, pending migrations, schema drift, or stale generated DB types
  - a destructive or hard-to-reverse DDL change is being considered
  - a schema change needs to be coordinated with a deployment
  - user needs to evaluate whether the persistence model is correct
applicability:
  - Use for every schema change in this project
  - Use when reviewing a migration for safety, reversibility, or modeling quality
  - Use when planning expand → backfill → contract changes
  - Use when diagnosing schema drift between live database state and generated types
termination:
  - The modeling decision is explained
  - Migration workflow is followed in the required order
  - Generated DB types are synchronized and verified
  - Rollout and rollback risks are documented
outputs:
  - Schema modeling decision
  - Safe migration plan or authored migration
  - Verified type-generation status
  - Rollout risk assessment
disableModelInvocation: true
---

Enforce the database change protocol and preserve the project's data-modeling philosophy. This skill exists to stop unsafe or off-contract database work.

## Non-Negotiables

This project's database workflow is mandatory:

- PostgreSQL is the source of truth for persistence behavior.
- Goose migrations are the only supported schema-change mechanism.
- Migration history must stay aligned with the Goose migration log.
- Generated DB types must be regenerated and verified after every schema change.
- Destructive or rollout-sensitive changes must be called out explicitly before they ship.

Forbidden behavior:

- Do not use another schema or migration framework.
- Do not apply schema changes ad hoc through raw `psql`, GUI clients, or manual DDL outside the migration workflow.
- Do not edit a migration that has already been applied to any non-disposable environment.
- Do not hand-edit generated type files.
- Do not ship application code that depends on a schema change before the migration path is understood and verified.

The workflow has two modes:

- **Applied-schema mode**: the migration has run anywhere durable; migrations are immutable.
- **Greenfield baseline mode**: the baseline has only touched disposable databases; baseline refinement may still be allowed.

Treat those modes differently and report which one you are in.

## Modeling Principles

Model the database from durable product meaning, not from transient screen structure.

Before writing DDL, identify the primary concept:

- **entity**: a durable object with identity over time
- **event**: an immutable fact that happened at a time or over an interval
- **link**: an explicit semantic relationship between objects
- **space**: a collaborative or ownership boundary
- **tag**: flexible cross-domain organization
- **source**: provenance and synchronization state from elsewhere

Additional rules:

- Prefer one strong primitive over multiple overlapping abstractions.
- Use relational constraints where the database can enforce the real invariant.
- Keep authored truth, derived analysis, and provenance distinct.
- Use `jsonb` only for bounded provider payloads or intentionally schemaless metadata.
- Preserve meaningful user customization fields when they are part of product semantics.
- Prefer additive evolution: expand → backfill → contract.

Prefer modern PostgreSQL features when they clearly improve correctness or performance, not for novelty.

## Required Workflow

1. Confirm whether the change is schema-level or only app-layer.
2. Identify the operating mode: applied-schema or greenfield baseline.
3. Explain the modeling choice before authoring DDL.
4. Scaffold or update the correct migration target using the project-approved Goose workflow.
5. Write `Up` and `Down` blocks, or explicitly document why reversal is impossible.
6. Validate the migration for naming conflicts, reversibility, compatibility with existing data, and invariant correctness.
7. Apply the migration through the project-approved workflow.
8. Regenerate and verify generated DB types.
9. Run the required lint/typecheck validation affected by the schema change.
10. Report what changed, what ran, what passed, and what rollout risks remain.

## Required Verification

No database change is complete until all relevant checks are true:

- migration set is internally consistent
- migration applies cleanly in the intended environment(s)
- generated DB types match the live schema
- application lint/typecheck still pass
- destructive, irreversible, or rollout-sensitive aspects are called out

Prefer schema-level verification for schema behavior. Do not rely only on app-layer tests to prove DB invariants.

## References

Use these references for concrete commands and patterns:

- `schema-design.md` for table, column, index, and constraint conventions
- `migration-patterns.md` for expand/backfill/contract, rollback, destructive changes, and production rollout patterns
- `goose-workflow.md` for Goose commands and migration execution workflow
- `kysely-codegen.md` for generated type synchronization and Kysely type usage

## Guardrails

- Never choose convenience over migration-log correctness.
- Never merge a schema change with stale generated types.
- Never treat database modeling as a byproduct of handler or UI work.
- Never collapse distinct concepts into one table without an explicit product reason.
- Never apply a destructive migration without a documented data impact assessment.
- Never proceed to deploy-dependent work if the migration or type sync step is failing.

# Production Preflight, Rollout, and Recovery

Use this runbook for durable environments. It is deployment-tooling-neutral: the deployment system must provide the equivalent controls and evidence.

## Preflight

Record the migration version, target environment, expected pending count, operator, change window, and application versions. Then verify:

- Goose status matches the intended predecessor and no unexpected migration is pending.
- Live catalog state matches assumptions: tables, columns, types, defaults, constraints, indexes, triggers, views, functions, policies, and ownership.
- Table size, row counts, partition layout, write rate, replication/CDC behavior, and maintenance activity are understood.
- Null, duplicate, orphan, conversion, and constraint-violation audits pass or have an approved remediation.
- Dependent objects and external consumers have been inventoried.
- Long-running transactions, blockers, and active maintenance jobs have been checked.
- Backup/PITR coverage and recovery owner are confirmed for destructive or restore-dependent changes.
- A single migration runner is guaranteed. Goose does not serialize concurrent runners by default; use the host’s session/advisory lock or deployment serialization mechanism.
- `lock_timeout`, `statement_timeout`, and, where applicable, transaction/idle-in-transaction limits are explicitly chosen for the operation. Define what happens on timeout.
- The migration has been tested on a production-like dataset and its cancellation/retry behavior is understood.

## Apply

1. Announce the migration and application compatibility phase.
2. Check status immediately before execution.
3. Apply one migration runner with structured logs containing migration version, start/end time, duration, target, and result; never log credentials or row data.
4. Watch lock waits, active sessions, replication lag, CPU/I/O, errors, and migration progress. Cancel safely if the agreed threshold is exceeded.
5. If a concurrent index fails, inspect the catalog for an invalid index before retrying.
6. Do not mark the deployment successful until post-apply checks pass.

## Post-apply verification

- Confirm Goose’s recorded version and absence of unexpected pending migrations.
- Run schema assertions for object existence, exact types, defaults, nullability, constraints, indexes, and dependencies.
- Run invariant queries: nulls, duplicates, orphans, parity/reconciliation, and backfill remaining count.
- Regenerate Kysely types from the intended live database and verify the generated diff.
- Run affected typecheck, lint, unit/integration tests, and a small application smoke test.
- Confirm replication/CDC consumers, jobs, reports, and external readers remain healthy.
- Monitor errors, latency, lock waits, and data-quality metrics through the compatibility window.

## Failure and recovery

- A transactional Goose migration should leave no partial DDL after failure, but verify the recorded version and catalog rather than assuming it.
- A `no transaction` migration can leave earlier statements applied. Inspect every object and write a recovery action before retrying.
- A backfill must resume from its checkpoint or safely reprocess rows. Reconcile before and after retry.
- Prefer a forward-fix migration for production schema recovery after data has entered the new shape.
- Use `Down` primarily for disposable rollback testing. Use restore/PITR only when the approved recovery plan says it is necessary and the data-loss window is understood.
- Document the incident, observed state, recovery action, and follow-up safeguards.

## Risk classes

| Class | Typical examples | Required controls |
| --- | --- | --- |
| Metadata-only | Add table/nullable column, constant default on supported PostgreSQL | Lock review, compatibility check, schema verification |
| Table-scanning | Constraint validation, index build, large backfill | Rehearsal, resource budget, progress/timeout monitoring |
| Table-rewriting | Risky type/default change, table rewrite | Expand/contract or maintenance window, cancellation/recovery plan |
| Lock-sensitive | `ALTER TABLE`, rename, non-concurrent index | Blocker inspection, `lock_timeout`, observed apply |
| Data-destructive | Drop, truncate, lossy conversion | Explicit review, dependency audit, backup/PITR and recovery plan |
| Irreversible/restore-dependent | Dropping historical data or old representation | Recovery owner, verified restore path, retention decision |

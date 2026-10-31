# Migration Strategy and Compatibility Patterns

Use this file to choose the migration shape. Use [operation-playbooks.md](operation-playbooks.md) for SQL-level procedures and [production-runbook.md](production-runbook.md) before applying anything to a durable environment.

## Operation routing

| Change | Default strategy | Main hazards |
| --- | --- | --- |
| New table | One transactional migration for bounded DDL; separate large indexes/backfills | Missing ownership, keys, timestamps, indexes, or grants |
| Add nullable column | Direct expand migration | Lock acquisition and code assuming presence too early |
| Add required column | Nullable expand → backfill → `NOT NULL` contract | Rewrite/scan, null races, old application versions |
| Rename column/table | Compatibility alias or dual read/write → backfill → contract | Old binaries, raw SQL, views, functions, jobs, generated types |
| Change type | Shadow column → dual write/backfill → validate → swap/contract | Lossy casts, defaults, indexes, locks, overflow |
| Add FK/check/not-null | Add enforcement without blocking where possible → validate → tighten | Existing violations and long validation scans |
| Add index | Concurrent production build on existing tables | No transaction, invalid index after failure, resource load |
| Drop column/table | Deprecate → prove no reads/writes → backup/recovery review → drop | Irreversible data loss and hidden dependencies |
| Split/merge fields or tables | Expand both shapes → dual write/read → backfill → cut over → contract | Divergence, ordering, retries, partial writes |

## Expand → compatible rollout → backfill → contract

Use separate migrations or separately operated phases whenever more than one application version may run, existing rows need work, or a statement can scan/rewrite a large relation.

1. **Expand:** add new nullable columns/tables/indexes or unenforced constraints. Preserve the old contract.
2. **Compatible application rollout:** deploy code that works with both old and new schemas. For renames/splits, use dual reads with an explicit precedence rule and dual writes or a trigger only when the write path is fully understood.
3. **Backfill/validate:** use a resumable operational job for large data. Measure remaining rows, violations, lag, runtime, and errors. Make retries idempotent.
4. **Cut over:** switch reads and writes only after parity and freshness checks pass.
5. **Contract:** remove compatibility code, old columns, old indexes, or temporary constraints in a later reviewed migration.

Do not combine all phases because a single transaction makes rollback appear easy while increasing lock duration, deployment coupling, and failure blast radius.

## Direct DDL decision

Direct DDL is acceptable only after recording:

- object size and expected scan/rewrite cost;
- required lock level and acceptable wait time;
- current and previous application compatibility;
- existing values, duplicates, nulls, or orphan rows;
- dependent objects and generated-code impact;
- tested recovery if the statement fails halfway or times out.

Prefer a staged migration if any answer is unknown.

## Rollback policy

- `Down` must be tested on disposable databases and should restore the previous schema shape when data loss is not involved.
- Treat production rollback as a decision among forward fix, data repair, point-in-time recovery, or restore. Do not blindly run `Down` after a destructive or data-transforming phase.
- Record whether the phase is reversible, whether new data has entered the new shape, and whether the old application can still operate.

## Idempotency and failure

Migrations normally fail loudly when their expected predecessor state is absent. Use `IF EXISTS`/`IF NOT EXISTS` only when repeatability is intentional, the no-op state is safe, and verification proves the desired definition—not merely object existence. A retry must not silently leave an incomplete index, partial backfill, missing constraint, or divergent dual-write state.

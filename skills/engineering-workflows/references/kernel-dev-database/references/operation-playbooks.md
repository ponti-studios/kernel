# Operation Playbooks

These procedures are production defaults. Adapt names and commands to the repository, but preserve the gates and sequencing.

## New table

1. Confirm the table represents a durable entity, event, link, space, tag, or source rather than a screen projection.
2. Define UUID identity, ownership boundaries, required timestamps, lifecycle/state rules, foreign keys, delete behavior, and uniqueness invariants.
3. Create the table with explicit names and constraints. Add only indexes justified by known access paths; add large-table indexes separately and concurrently.
4. Verify empty-table constraints, insert/update/delete behavior, timestamp maintenance, foreign-key behavior, and generated types.
5. Deploy application code only after the migration is applied, unless the table is an additive expand phase.

## Add a column, default, or nullability

- Nullable additive column: add it first; deploy readers/writers that tolerate null; backfill separately if needed.
- Required column on an existing table: add nullable, deploy compatible writes, backfill in batches, audit remaining nulls, then enforce `NOT NULL` in a later phase.
- Constant defaults may be metadata-fast on modern PostgreSQL, but still inspect the target PostgreSQL version, lock behavior, and write-path compatibility. A volatile default or rewrite risk requires rehearsal.
- A default changes future inserts; it does not backfill existing rows. Remove a temporary default only after the application supplies the intended value.
- For generated values, verify whether the value is immutable, whether existing rows can be computed, and whether Kysely codegen represents insert/update behavior correctly.

## Rename a column or table

Prefer expand/contract when old and new application versions can overlap:

1. Inventory application code, raw SQL, jobs, reports, views, functions, triggers, policies, foreign keys, indexes, and generated types.
2. Add the new name or compatibility surface. Deploy code that reads the new value with a documented fallback and writes both values.
3. Backfill and compare old/new values; monitor divergence and stale writers.
4. Switch all readers, remove old writers, and prove no old-name references remain.
5. Rename/drop the old object in a later migration only after dependency and recovery review.

A direct PostgreSQL rename can be appropriate for a tightly coordinated maintenance window with no overlapping binaries, but it is not an application compatibility strategy. PostgreSQL dependency tracking does not replace an inventory of raw SQL, external consumers, or generated source.

## Change a column type

1. Classify the conversion as widening/lossless, castable with validation, or lossy/incompatible.
2. Audit values that cannot convert, precision/scale loss, defaults, constraints, indexes, foreign keys, and application serialization.
3. For a live or large table, add a shadow column with the target type, deploy dual-compatible writes, backfill in bounded batches, and compare values.
4. Validate indexes and constraints on the new representation, cut over reads, stop old writes, and contract later.
5. Use direct `ALTER COLUMN ... TYPE ... USING ...` only when rehearsal proves the rewrite and lock are acceptable.

## Constraints and foreign keys

- Name every constraint explicitly and choose `ON DELETE`/`ON UPDATE` semantics deliberately.
- Before adding a constraint, run the violation query: nulls, duplicates, invalid states, or orphan foreign keys must be quantified and resolved.
- For large existing tables, add suitable `CHECK`/foreign-key constraints as `NOT VALID`, deploy enforcement for new writes, then run `VALIDATE CONSTRAINT` separately. Validation still consumes resources and must be scheduled and observed.
- Treat `UNIQUE` as both an invariant and an index. For large tables, build a unique index concurrently after duplicate cleanup, then attach it as a constraint where appropriate.
- Set `NOT NULL` only after a complete null audit and compatible write path. Do not rely on a check constraint as a substitute without understanding its null semantics.

## Indexes

- Name indexes explicitly from table, key columns, and purpose.
- Use ordinary `CREATE INDEX` for new/empty tables or when the lock is acceptable. Use `CREATE INDEX CONCURRENTLY` for existing production tables unless the operational review says otherwise.
- A concurrent build cannot run inside a transaction. Put `-- +goose no transaction` at the top of a migration containing it, keep that file dedicated to compatible index work, and apply the same rule to its down path.
- Check for duplicate/overlapping indexes, required operator class, partial predicate, column order, included columns, and query evidence before adding one.
- After a failed concurrent build, inspect for an invalid index and remove/rebuild it deliberately; do not assume Goose’s failed migration removed every catalog object.
- Drop production indexes concurrently only after confirming no required query or constraint uses them.

## Split or merge data

Treat this as a compatibility migration, not a single SQL rewrite:

1. Add destination columns/tables and constraints that can accept the transition state.
2. Deploy dual writes or a deterministic transformation boundary.
3. Backfill in batches with a stable key, checkpoint, retry, and reconciliation query.
4. Compare source and destination counts, hashes or aggregates, nullability, and freshness.
5. Cut reads over, monitor, then remove the source shape in a later release.

## Large-table backfill

Keep a large or resumable backfill outside the Goose DDL transaction. The job must:

- use a stable, indexed key range or durable checkpoint rather than `OFFSET` pagination;
- process bounded batches and commit between batches;
- be idempotent so a retry can safely revisit a batch;
- throttle by runtime, lock waits, replication lag, CPU/I/O, or write pressure;
- record processed, remaining, skipped, failed, and last-checkpoint counts;
- make progress observable and stop on invariant violations rather than hiding them;
- reconcile source/destination counts and values after completion;
- support pause, resume, cancellation, and an explicit remediation path for poison rows.

Do not declare the backfill complete from a job exit code alone. Verify remaining work, parity, freshness, and the constraints that the contract phase will enforce.

## Drop or retire objects

Before `DROP COLUMN`, `DROP TABLE`, `TRUNCATE`, or incompatible constraint removal:

- identify all PostgreSQL dependents and external consumers;
- remove application reads/writes and wait through the retention window;
- confirm backups/PITR and the exact recovery procedure;
- capture row counts or a safe export when policy requires it;
- obtain explicit destructive-change review;
- use `RESTRICT` by default and enumerate any approved dependent drops;
- verify the post-drop schema and generated types.

Never use `CASCADE` as a discovery mechanism or a shortcut.

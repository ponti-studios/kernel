# Node's built-in SQLite with Kysely

When the runtime is Node 22.5+ (`node:sqlite`, `DatabaseSync`) and the process is a long-lived local
service, prefer the built-in driver over `better-sqlite3`: no native module means no per-Node-ABI
rebuild and nothing for launchd to fail to load after an OS upgrade. Kysely gives typed queries and a
migration runner, and it has **no** `node:sqlite` driver — so you supply one, in about eighty lines.

## The dialect

Kysely already exports the SQLite pieces you should not rewrite: `SqliteAdapter`, `SqliteQueryCompiler`,
`SqliteIntrospector`. Implement only `Driver` and `DatabaseConnection`.

```ts
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { SqliteAdapter, SqliteQueryCompiler, SqliteIntrospector, type CompiledQuery } from "kysely";

class Connection implements DatabaseConnection {
  constructor(private readonly sqlite: DatabaseSync) {}
  async executeQuery<R>(compiled: CompiledQuery): Promise<QueryResult<R>> {
    const statement = this.sqlite.prepare(compiled.sql);
    const parameters = compiled.parameters as SQLInputValue[];
    // A statement that reports columns is a reader: SELECT, PRAGMA, or INSERT … RETURNING.
    if (statement.columns().length > 0) return { rows: statement.all(...parameters) as R[] };
    const result = statement.run(...parameters);
    return { rows: [], numAffectedRows: BigInt(result.changes) };
  }
}
```

- **`statement.columns()` is the reader/write test.** Sniffing for `select` in the SQL misses `PRAGMA`
  and `INSERT … RETURNING`, and `RETURNING` is how you get the inserted row back.
- **Cast parameters to `SQLInputValue[]`.** `compiled.parameters` is `unknown[]`; `statement.all(...)`
  rejects it and the error reads like a Kysely problem, not a typing one.
- **Transactions are `begin` / `commit` / `rollback` on `sqlite.exec`.** `TransactionSettings` only ever
  carries an isolation level here; `begin <level>` is the only branch worth writing.
- **`streamQuery` can fall back to `executeQuery`** for non-readers and yield row by row from
  `statement.iterate(...)` otherwise. Kysely's own SQLite driver does the same.
- **`destroy()` closes the `DatabaseSync`.** Two handles in one process are two connections; keep one per
  process and reuse it.

## Migrations

- **`Migrator` and `MigrationProvider` live in `kysely/migration`, not `kysely`** (0.29). Importing them
  from the root yields a type whose message is literally `import from 'kysely/migration' instead`, and the
  useful failure is a `KyselyTypeError` at the `new Migrator(...)` line.
- A static provider is enough: `getMigrations()` returns `{ [name]: { up, down } }`, and names sort. Zero-
  pad them (`0001_`, `0002_`) so the order is lexical and legible.
- **Adopt an existing database, never recreate it.** A file that predates the runner still needs to keep
  its rows: `create table if not exists`, then read `select name from pragma_table_info('<table>')` and
  `alter table … add column` only for the names that are actually missing. One migration that does both
  runs correctly on a fresh file and on a two-week-old one.
- **A `down()` that would drop history is a no-op with a comment.** Neither the user nor a future you can
  roll back a journal; say so in the code instead of writing a plausible-looking `drop table`.
- Migrations run once per database, tracked in `kysely_migration` — so never assert schema state with
  `PRAGMA user_version` elsewhere; that is a second, drifting source of truth.

## One table, two writers

- **Separate writers with a `source` column** and prune per source. A single `DELETE … WHERE occurred_at <
  ?` shared by two owners deletes the other writer's history the first time it ages out.
- **Columns are for what you group or filter by; everything else is JSON in `meta`.** `json_extract(meta,
  '$.spend_gbp')` is a fine query and costs nothing on a local table; forty nullable columns for one
  writer's fields are not.
- **`0` means unlimited** for any retention setting, and the prune helper should return early on
  `days <= 0` so "keep everything" cannot be re-read as "prune everything". Test the no-op explicitly — a
  retention bug is silent for exactly as long as nobody looks.

## Idempotent imports from files and logs

Importing the pre-database era is the same shape every time: parse, insert, and make the second run free.

- **A partial unique index is the identity.** `create unique index if not exists t_line on t(occurred_at,
  kind, summary) where source = 'fleet'` plus `insert or ignore` makes a re-run a no-op and recognises rows
  written live since the import was designed.
- **Dedupe inside the migration before creating the index**, or it fails on any database that already holds
  duplicates: `delete from t where source = 'fleet' and id not in (select min(id) from t group by occurred_at, kind, summary)`.
- **Report `inserted` and `already present` separately** (`Number(result.changes)` distinguishes them).
  "0 inserted on the second run" is the proof the import is safe to repeat; a bare total is not.
- **Count what did not parse.** A backfill that silently skips tracebacks and startup errors looks complete
  and is not; print an `unparsed` count and keep guessing out of it.
- Log-line parsing traps worth knowing before writing a parser: both `HH:MM:SS,mmm` and `HH:MM:SS.mmm`
  stamps exist in the same corpus; a value may be unquoted and contain spaces, so it ends where the next
  `key=` begins, not at the first space; and `True`/`False`/`None` are the same types as `true`/`false`/`null`.

## Querying the journal you just built

Once an event table is the record, the analysis is SQL — and three ways of getting a plausible wrong
answer are worth knowing before one goes into a report.

- **A field written on every row may be a running total, not that row's value.** `spend_gbp` on a pass
  summary is the day's cumulative spend, so `sum(...)` over a day multiplies it by the number of passes
  (a real day read 30× high). Use `max(...)` per day for a running total and `sum(...)` only for a
  per-row amount; if both kinds exist, name the column for which it is.
- **`cast(json_extract(...) as integer)` on a JSON array is silently `0`.** A file importer that stored a
  list where the live writer stores a length makes every aggregate read zero with no error — the numbers
  look like a quiet period, not a bug. Assert the shape first
  (`select json_type(meta, '$.worktrees') from t group by 1`) and convert deliberately
  (`json_array_length` for arrays, `json_extract` for counts).
- **Verify a suspected gap against the source, not against its absence.** Before calling missing rows a
  query bug, check the earliest record the source itself holds (`min(occurred_at)` in the table, then the
  upstream store's own `min(...)`) — a window that starts when the writer started is a coverage fact, and
  reporting it as broken sends the next session hunting a defect that is not there.

## Verifying a new dialect without a server

```ts
const dir = await mkdtemp(path.join(os.tmpdir(), "journal-"));
const handle = openJournal(path.join(dir, "events.sqlite3"));
await migrateJournal(handle); // asserts migrations apply
recordEvent(handle, { level: "INFO", event: "x", at: stamp(), values: { repo: "a/b" } }, "test");
handle.sqlite.prepare("select json_extract(meta,'$.repo') as repo from events").all();
await handle.db.destroy(); // closes the DatabaseSync too
```

Assert the migration list (`migrateToLatest()` returns the names it applied, and an empty array the second
call), the column mapping (a numeric string in the payload becomes an `INTEGER` column), and one
`json_extract` query — that trio catches a driver that returns nothing and a schema that silently did not
apply.

## Pitfalls

- **Tests that import compiled output do not recompile.** When the suite loads `dist-backend/…` or
  `dist/…`, a source edit is invisible until you rebuild; a failing assertion that contradicts the source
  you just wrote means "stale build", not "wrong fix". Rebuild before reading the failure.
- **`node:sqlite` rows are null-prototype objects.** `assert.deepEqual(row, { a: 1 })` fails on identity,
  and Kysely's own `.select("a", "b")` results behave the same way — assert fields individually or spread
  the row first.
- **Several processes on one file need `PRAGMA busy_timeout`, `synchronous=NORMAL` and WAL**, and the read
  path must not run DDL. A schema check is a read (`sqlite_master`, `pragma_table_info`); a `CREATE` on
  every open is a write and will serialise against the writer.
- **`create table` in a migration is not a schema guarantee**, because the adoption path may have created
  it first with fewer columns. Read `pragma_table_info` before assuming a column exists anywhere in code
  that predates the migration.

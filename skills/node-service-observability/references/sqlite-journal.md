# A SQLite journal for a local service

The step where a JSONL log becomes a table: the service is the only writer (or one of two known ones), the
file is append-only, and something would group or join it. Recipe for Node's built-in `node:sqlite` behind
Kysely, with migrations in TypeScript.

## Decide: file or table

| Signal       | File                                  | Table                                                               |
| ------------ | ------------------------------------- | ------------------------------------------------------------------- |
| Who reads it | a human tails it once                 | code queries it, or you want totals over time                       |
| Growth       | one job, truncated at start           | accumulates across runs                                             |
| Identity     | free text per line                    | each line repeats an entity key (`fingerprint`, `id`, `session_id`) |
| Conflicts    | none                                  | "latest line wins" is resolved by reading the tail                  |
| Crash value  | the only evidence if the process dies | second copy — keep stderr too                                       |

Keep `*.err.log` (stderr crash tail), another program's stdout, and single-row status files. Move anything
append-only that a query should answer.

## Why `node:sqlite`

No native binary. A service started by launchd after an OS or Node upgrade must not fail because a
prebuilt binding was compiled for the previous ABI, and `node:sqlite` ships with the runtime (SQLite 3.5x,
JSON1 included). It is synchronous, which is fine for a single-writer local journal.

## Kysely needs only the driver

Kysely 0.29 exports `SqliteAdapter`, `SqliteQueryCompiler` and `SqliteIntrospector`; there is no
`NodeSqliteDialect`, so you write the connection (~70 lines) and reuse the rest:

```ts
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { Kysely, sql } from "kysely";
import { Migrator, type MigrationProvider } from "kysely/migration"; // NOT from "kysely"

class Connection implements DatabaseConnection {
  constructor(private readonly sqlite: DatabaseSync) {}
  async executeQuery<R>(compiled: CompiledQuery): Promise<QueryResult<R>> {
    const statement = this.sqlite.prepare(compiled.sql);
    const parameters = compiled.parameters as SQLInputValue[];
    // A statement that reports columns is a reader — SELECT, PRAGMA, or INSERT … RETURNING.
    if (statement.columns().length > 0) return { rows: statement.all(...parameters) as R[] };
    const result = statement.run(...parameters);
    return { rows: [], numAffectedRows: BigInt(result.changes) };
  }
}

const sqlite = new DatabaseSync(file);
sqlite.exec("PRAGMA busy_timeout=5000; PRAGMA synchronous=NORMAL; PRAGMA journal_mode=WAL;");
const db = new Kysely<Schema>({ dialect: new NodeSqliteDialect(sqlite) });
```

The driver's `beginTransaction`/`commitTransaction`/`rollbackTransaction` just `exec("begin" | "commit" |
"rollback")` on the same handle; `releaseConnection` is a no-op because SQLite has one connection.

`Migrator` and `MigrationProvider` moved to `kysely/migration` — importing them from `kysely` is a type
error that says so. Run `migrateToLatest()` at startup, before the process writes; Kysely records what ran
in `kysely_migration` and serialises concurrent migrators.

## Adopting an existing file

The first migration is idempotent **and** column-aware, because the tables exist and carry data but there
is no migration history:

```ts
await sql`create table if not exists events (…full current shape…)`.execute(db);
const known = new Set(
  (await sql<{ name: string }>`select name from pragma_table_info('events')`.execute(db)).rows.map(
    (r) => r.name,
  ),
);
for (const [name, type] of [
  ["meta", "text"],
  ["level", "text"],
])
  if (!known.has(name))
    await sql`alter table events add column ${sql.raw(name)} ${sql.raw(type)}`.execute(db);
```

Never `drop table` in `down` for a journal — the data _is_ the record. Test both paths: a fresh file, and a
copy of the real one.

## Schema shape that stays queryable

- Columns only for what you group or filter by (`occurred_at`, `source`, `kind`, `level`, `repo`,
  `session_id`); everything else in `meta` as JSON, reachable with `json_extract(meta, '$.x')`.
- One table with a `source` discriminator beats one table per writer: agent events and the service's own
  events stay joinable by `(repo, id)`.
- A `job` column naming the process turns "which component is failing" into a `GROUP BY`.
- When a log becomes a table **key it by the identity already in the row** (`fingerprint`, `id`) and upsert.
  An append-only file that resolves conflicts by reading the tail is a table with an update column.
- Retention is part of the schema: prune by `source` per owner, and put the window in config.

## Emitting

One call site produces the line _and_ the row, from the same values — never parse your own log text back:

```ts
export function event(level, name, values = {}) {
  process.stdout.write(`${stamp()} level=${level} ${field({ event: name, ...values })}\n`);
  try {
    sink?.({ level, event: name, values, at: stamp() });
  } catch {
    /* telemetry is not a precondition */
  }
}
```

Guard the insert, and when the durable store is unavailable degrade to the text log rather than failing the
work that produced the event.

## Testing

- `node:sqlite` returns **null-prototype row objects**: `assert.deepEqual(rows, [{ a: 1 }])` fails on
  identity. Assert field by field, or spread into a plain object.
- Tests that import the compiled output describe the last build. Rebuild before reading a red test, or you
  will debug a fix that is not in the binary.
- One test per promise: migrations apply once and re-run as a no-op; a repeat write updates rather than
  appends; an unparseable payload is counted as skipped; prune removes only the rows it owns; a broken sink
  does not throw.

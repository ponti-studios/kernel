# Goose Workflow and Execution Controls

Goose SQL migrations run in a transaction by default. PostgreSQL operations that cannot run in a transaction, especially `CREATE INDEX CONCURRENTLY` and `DROP INDEX CONCURRENTLY`, require `-- +goose no transaction`. A no-transaction file must be treated as potentially partially applied and verified statement by statement.

## Make Targets

| Command                             | Effect                                                           |
| ----------------------------------- | ---------------------------------------------------------------- |
| `make db-new-migration NAME=<desc>` | Scaffold timestamped migration file                              |
| `make db-migrate`                   | Apply pending migrations → dev database                          |
| `make db-migrate-test`              | Apply pending migrations → test database                         |
| `make db-migrate-all`               | Apply pending migrations → dev + test                            |
| `make db-migrate-sync`              | Apply dev + test, then regenerate types (**canonical workflow**) |
| `make db-rollback`                  | Roll back latest migration → dev                                 |
| `make db-rollback-test`             | Roll back latest migration → test                                |
| `make db-rollback-all`              | Roll back latest → dev + test                                    |
| `make db-rollback-sync`             | Roll back dev + test, then regenerate types                      |
| `make db-generate-types`            | Regenerate `packages/db/src/types/database.ts` from live schema  |
| `make db-verify-types`              | Assert generated types match live schema                         |
| `make db-status`                    | Show applied/pending migration state                             |

## Direct Goose Commands (when Make unavailable)

```bash
# Status
DATABASE_URL=<url> pnpm --filter @your-pkg/db goose:status

# Apply pending
DATABASE_URL=<url> pnpm --filter @your-pkg/db goose:up

# Roll back latest
DATABASE_URL=<url> pnpm --filter @your-pkg/db goose:down
```

Run all commands from the **monorepo root**.

## Preflight and runner safety

Before applying a durable migration:

```bash
make db-status
make db-verify-types
```

Confirm the target URL explicitly, expected pending versions, and that exactly one deployment process is running migrations. Goose does not provide global migration serialization by default; the application/deployment integration must provide a session lock, advisory lock, or equivalent single-runner guarantee.

Set operation-appropriate session controls through the approved runner rather than changing global PostgreSQL configuration. At minimum decide `lock_timeout` and `statement_timeout`; for long transactions also consider transaction and idle-in-transaction limits. A timeout is a controlled failure requiring catalog/status verification, not permission to blindly retry.

## Migration File Template

```sql
-- +goose Up
-- +goose StatementBegin
CREATE TABLE example_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS example_items;
-- +goose StatementEnd
```

For a concurrent index, use a dedicated file:

```sql
-- +goose no transaction

-- +goose Up
CREATE INDEX CONCURRENTLY idx_example_items_owner_id
  ON example_items (owner_id);

-- +goose Down
DROP INDEX CONCURRENTLY IF EXISTS idx_example_items_owner_id;
```

Do not mix concurrent index statements with transactional DDL or data changes in the same migration.

## Canonical Local Workflow

```bash
make db-new-migration NAME=<description>
# edit the generated migration file
make db-migrate-sync   # apply dev + test + regenerate types
make db-verify-types   # assert types match schema
pnpm lint              # catch any downstream type errors
```

For production, add the production preflight, single-runner control, observed apply, post-apply schema assertions, and recovery steps from [production-runbook.md](production-runbook.md). Never infer production readiness from a local `db-migrate-sync` alone.

## Generated Types

- File: generated type file in your db package (e.g., `packages/db/src/types/database.ts`)
- Generator: `kysely-codegen` or equivalent
- Never hand-edit this file
- Must be regenerated after every schema-changing migration

# Hominem Live Schema Inspection

Use this workflow when inspecting Hominem’s live PostgreSQL schema, planning a migration, or verifying that a migration phase landed correctly.

Always introspect live state. Do not infer the current schema from migration files: a table may have been created and later dropped, while the live database reflects only the current state.

## Steps

1. `just db status`: Confirm the intended Postgres environment is available. Do not start containers or services automatically.
2. `sh scripts/pull-hominem-schema.sh`: Create a timestamped snapshot to `scripts/snapshots/` by default all schemas.
3. Override defaults when needed:
   - `HOMINEM_DATABASE_URL`: Postgres URL; default `postgresql://postgres:postgres@127.0.0.1:5434/hominem`.
   - `OUT_DIR`: snapshot destination; default is the script’s `snapshots/` directory.
4. Review table existence, row counts, columns, and types in context. For migration planning, also inspect constraints, indexes, dependencies, and application consumers through the general production preflight.
5. Keep snapshots as gitignored scratch data. Do not commit them or expose credentials or production records.

## Failure handling

- `psql: could not connect`: the Postgres service is unavailable; inspect `docker ps` and follow repository environment instructions.
- Empty schema output is valid and means those tables do not currently exist.
- The script records schema metadata and row counts only; inspect generated snapshots for sensitive metadata before sharing them.

# Hominem Repository Workflow

This reference contains repository-specific commands for the Hominem monorepo. Apply the general production protocol and operation playbooks first; these commands do not replace live-state inspection, compatibility planning, or rollout review.

## Migration workflow

Use this workflow for schema changes under `packages/db/migrations/`:

1. Create a flat migration through the repository wrapper:

   ```bash
   just db create <domain_change>
   ```

   The wrapper generates a timestamped file such as `YYYYMMDDHHMMSS_<domain>_<change>.sql`. Do not hand-pick timestamps or create migrations outside `packages/db/migrations/`.
2. Keep one coherent concern per file. Split schema creation, backfills, indexes, policies, and triggers when they have different lock, rollout, or recovery characteristics.
3. Include matching Goose `Up` and `Down` sections. Wrap multi-statement blocks in `-- +goose StatementBegin` and `-- +goose StatementEnd`; use the no-transaction annotation for concurrent index operations.
4. Apply local migrations and regenerate types with an explicit URL:

   ```bash
   export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5434/hominem"
   just db migrate
   just db codegen
   ```

5. Apply migrations to the test database:

   ```bash
   just db migrate test
   ```

6. Validate files and state. `just db validate` is an integration check that may apply migrations; it is not read-only:

   ```bash
   just db validate test
   just db lint
   ```

7. Test disposable rollback:

   ```bash
   just db rollback test
   ```

   Non-test rollback requires explicit approval through `ALLOW_DB_ROLLBACK=1`. Do not use `goose reset`, `down-to 0`, or `--allow-missing` during normal development.
8. Review the migration and generated type diff, then run affected package tests and typechecks.

## Failure handling

- If Docker or Postgres is unavailable, do not start it automatically; report the exact prerequisite and stop at the blocked validation step.
- If `DATABASE_URL` is missing, set it explicitly for the intended database. There is no fallback.
- If migration syntax or markers fail, inspect `just db status`, correct the migration, and re-run validation.
- Preserve credentials, row data, and production records. Never include database URLs or secrets in output.

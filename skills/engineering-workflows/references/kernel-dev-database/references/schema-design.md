# Schema Design Standards

Design for durable product meaning and future compatibility. Before changing an applied schema, inspect the live catalog and dependent objects; migration history is not a substitute for current state.

## Table Conventions

| Column       | Type                                    | Requirement                                 |
| ------------ | --------------------------------------- | ------------------------------------------- |
| Primary key  | `UUID DEFAULT gen_random_uuid()`        | Always UUID — never serial/integer          |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()`    | Required on every table                     |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()`    | Required; maintain via trigger or app layer |
| Foreign keys | `UUID NOT NULL REFERENCES table(id)`    | Always NOT NULL unless explicitly optional  |
| Soft deletes | `deleted_at TIMESTAMPTZ`                | Use over hard deletes when history matters  |
| Status/state | `TEXT NOT NULL` with a check constraint | Over enums — TEXT is easier to extend       |

## Column Rules

- `NOT NULL` by default — only add nullable columns when the domain requires it
- Prefer `TEXT` over `VARCHAR(n)` — PostgreSQL stores them identically; TEXT avoids arbitrary limits
- Use `TIMESTAMPTZ` everywhere — never `TIMESTAMP WITHOUT TIME ZONE`
- Avoid `BOOLEAN` columns that encode state; use a status column with check constraint instead
- Use `NUMERIC` for money/currency — never `FLOAT` or `DOUBLE PRECISION`

## Index Rules

- Always index foreign keys that will be used in joins
- Add partial indexes for common filtered queries: `WHERE deleted_at IS NULL`
- Use `CONCURRENTLY` for indexes on tables with existing data in production
- Name indexes explicitly: `idx_{table}_{columns}[_{qualifier}]`
- Check for an existing equivalent or overlapping index before adding one.
- Treat unique indexes, primary keys, and foreign-key support indexes as integrity structures, not only performance structures.
- On existing production tables, prefer concurrent creation/removal and follow the Goose no-transaction procedure.

```sql
-- Standard index
CREATE INDEX idx_posts_user_id ON posts (user_id);

-- Partial index
CREATE INDEX idx_posts_active ON posts (created_at DESC) WHERE deleted_at IS NULL;

-- Unique constraint via index
CREATE UNIQUE INDEX idx_users_email ON users (email);

-- Composite index for a common query pattern
CREATE INDEX idx_posts_user_status ON posts (user_id, status) WHERE deleted_at IS NULL;
```

## Constraints

```sql
-- Check constraint for status fields
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'));

-- Foreign key with explicit ON DELETE behavior
ALTER TABLE posts ADD CONSTRAINT posts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

For large existing tables, stage `CHECK` and foreign-key constraints with `NOT VALID`, then validate separately after new writes are enforced. Quantify and resolve pre-existing violations before tightening `NOT NULL`, uniqueness, or referential integrity.

## Lifecycle and dependency rules

- Decide whether history matters before choosing soft delete, archival, or hard delete.
- Name tables, columns, constraints, indexes, triggers, and functions explicitly and consistently.
- Before rename/drop/type changes, inspect views, materialized views, functions, triggers, policies, foreign keys, indexes, generated SQL, jobs, reports, and external consumers.
- Use `RESTRICT` by default. Never use `CASCADE` until every dependent object and recovery consequence is listed in the migration review.
- For renames, splits, merges, and incompatible type changes, prefer a compatibility phase over relying on a synchronized application deployment.

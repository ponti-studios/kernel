# kysely-codegen

`kysely-codegen` introspects a live PostgreSQL database and generates a `Database` interface that Kysely uses for fully typed queries. Run it after every schema phase — never hand-edit the output.

## Setup

```bash
pnpm add -D kysely-codegen
```

### Configuration (`packages/db/codegen.ts` or `kysely-codegen.config.ts`)

```typescript
import { defineConfig } from "kysely-codegen";

export default defineConfig({
  dialect: "postgres",
  outFile: "src/types/database.ts",
});
```

Pass the database URL via environment variable:

```bash
DATABASE_URL=postgres://user:pass@localhost:5432/mydb pnpm kysely-codegen
```

## Generated Output Shape

```typescript
// packages/db/src/types/database.ts — DO NOT HAND-EDIT
import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface UsersTable {
  id: Generated<string>;
  email: string;
  name: string;
  role: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface Database {
  users: UsersTable;
  posts: PostsTable;
  // ...one interface per table
}
```

## Wiring Kysely

```typescript
// packages/db/src/client.ts
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Database } from "./types/database";

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString: process.env.DATABASE_URL }),
  }),
});
```

Export `db` and `Database` from the package — consuming packages import from the published exports, never from `src/` directly.

## Query Patterns

### Select with type inference

```typescript
// Return type is inferred — no manual typing needed
const users = await db.selectFrom("users").selectAll().execute();
//    ^ Selectable<UsersTable>[]
```

### Insert

```typescript
await db
  .insertInto("users")
  .values({ email: "a@example.com", name: "Alice", role: "standard" })
  .execute();
```

### Update

```typescript
await db
  .updateTable("users")
  .set({ name: "Alice Updated" })
  .where("id", "=", userId)
  .execute();
```

### Join with full type safety

```typescript
const result = await db
  .selectFrom("posts")
  .innerJoin("users", "users.id", "posts.user_id")
  .select(["posts.id", "posts.title", "users.email"])
  .execute();
```

### Typed result helper

```typescript
import type { Selectable } from "kysely";
import type { UsersTable } from "@your-org/db/types";

type User = Selectable<UsersTable>;
```

Use `Selectable<T>`, `Insertable<T>`, and `Updateable<T>` from Kysely to derive operation-specific types — never write them by hand.

## Make Targets

| Command                  | Effect                                               |
| ------------------------ | ---------------------------------------------------- |
| `make db-generate-types` | Run kysely-codegen against dev DB → write output file |
| `make db-verify-types`   | Assert output file matches live schema (CI check)    |

## Guardrails

- Never hand-edit the generated `database.ts` file — regenerate it
- Never import from the generated file across package boundaries — re-export `Selectable<T>` wrappers from the db package's public API
- Always regenerate types after every schema-changing migration before committing
- `db-verify-types` must pass in CI — a stale type file is a broken contract

## Staged rollout compatibility

Generated types describe the database selected for code generation; they do not make old application binaries compatible with a new schema. During expand/contract work:

- generate types after each schema phase and review the diff for nullability, defaults, renamed objects, and insert/update behavior;
- keep application queries compatible with both schemas until the contract phase is complete;
- do not delete old generated fields merely because a new field exists;
- regenerate from the intended environment, never from an accidentally drifted local database;
- verify that package exports and downstream consumers compile against the staged shape.

After a production migration, compare migration status, live catalog assertions, generated output, and application typecheck. A generated file matching the wrong or drifted database is not successful verification.

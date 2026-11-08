---
name: typescript-sqlite
description: "SQLite in TypeScript: node:sqlite, Kysely, memory systems."
version: 0.1.0
author: Charles Ponti, Hermes Agent
license: MIT
platforms: [macos, linux]
metadata:
  hermes:
    tags:
      [
        typescript,
        sqlite,
        better-sqlite3,
        database,
        foreign-keys,
        json,
        mcp,
        model-context-protocol,
      ]
---

# TypeScript + SQLite (better-sqlite3)

Patterns and pitfalls for using better-sqlite3 in TypeScript projects. Covers foreign key ordering, JSON column handling, synchronous seeding, WAL mode, and common gotchas.

## When to Use

- Building a TypeScript/Node.js app that uses SQLite via better-sqlite3
- Encountering FOREIGN KEY constraint failures during inserts
- Working with JSON columns in SQLite
- Setting up a new SQLite database in TypeScript

## Node's built-in `node:sqlite` (no native module)

When the app is a long-lived local service, `node:sqlite` (`DatabaseSync`, Node 22.5+) removes the native
build entirely — no per-Node-ABI rebuild, nothing for launchd to fail to load after an OS upgrade. It
works with Kysely too, but Kysely ships no driver for it: reuse its SQLite adapter, compiler and
introspector and write only the `Driver`. The recipe, the migration traps (`Migrator` lives in
`kysely/migration`; adopt an existing database instead of recreating it) and the idempotent-import
pattern are in `references/node-sqlite-kysely.md`.

The rules that change once you are on it:

- **`statement.columns().length > 0` decides reader vs write** — not a `select` regex, which misses
  `PRAGMA` and `INSERT … RETURNING`.
- **One process, one connection**, with `busy_timeout`/`synchronous=NORMAL`/WAL set once at open; the
  read path must never run DDL.
- **Two writers on one table get a `source` column and separate retention.** A shared
  `DELETE … WHERE occurred_at < ?` lets one writer delete the other's history; `0` days must mean
  _keep everything_, tested as a no-op.
- **A re-runnable import needs a natural key.** A partial unique index plus `insert or ignore` turns the
  second run into zero rows, and reporting `inserted` vs `already present` is what proves it.

## Foreign Key Ordering (Critical)

SQLite checks foreign keys at statement time (immediate), not commit time. When you have circular FK references (A references B, B references A), you must insert in dependency order:

1. Insert the referenced row first (the one that doesn't depend on the other)
2. Then insert the row that references it
3. Then update the first row to reference back

Example: supersession (A superseded by B, B supersedes A):

```
// 1. Insert B first (supersedes_id → A, which exists)
INSERT INTO memories (id, ..., supersedes_id) VALUES (newId, ..., targetId)
// 2. Update A (superseded_by_id → newId, which now exists)
UPDATE memories SET superseded_by_id = newId WHERE id = targetId
```

**Pitfall:** If you update A first (setting superseded_by_id = newId before newId exists), the FK check fails immediately. Always insert before updating.

## Nullable Foreign Keys

A column declared `REFERENCES other_table(id)` with no NOT NULL is nullable. Passing a non-null value that doesn't exist in the referenced table causes an immediate FK constraint failure — even if the column is nullable.

**Pattern:** When inserting a row with a nullable FK, either:

- Ensure the referenced row exists first, or
- Use null when the referenced entity doesn't exist yet

**Example:** `feedback_events.episode_id` references `episodes(id)`. If you ingest feedback for an episode that was never created (or was deleted), the insert fails with SQLITE_CONSTRAINT_FOREIGNKEY. Either create the episode first or pass null.

## Boolean Binding

better-sqlite3 does NOT accept JavaScript booleans for INTEGER columns. Passing `true`/`false` causes a type error or silent misbinding.

**Always convert:** `value ? 1 : 0` before binding.

## Parameter Count Errors

better-sqlite3 reports "Too few parameter values" when a param is an un-stringified object (it can't bind it). It reports "Too many parameter values" when you pass more args than `?` placeholders.

**Debugging checklist:**

1. Count `?` marks in the SQL — must match column count
2. Count args in `.run()` — must match `?` count
3. Check for un-stringified objects (objects → "Too few")
4. Check for extra trailing args (→ "Too many")

## JSON Columns

better-sqlite3 does NOT auto-stringify objects. Passing a JS object to a TEXT column causes "Too few parameter values" or silent corruption.

**Always stringify before binding:**

```typescript
const valueJson =
  typeof candidate.value_json === "string"
    ? candidate.value_json
    : candidate.value_json
      ? JSON.stringify(candidate.value_json)
      : null;
```

**Pitfall (mixed literals + placeholders):** When SQL has both literal values (e.g., `reversible = 1`) and `?` placeholders, the `.run()` call must pass args ONLY for the `?` placeholders — not for the literals. Count the `?` marks, not the total columns.

```sql
-- 7 ? marks, reversible is a literal
INSERT INTO healing_log (id, ts, job, action, memory_ids, before_json, after_json, rationale, reversible)
VALUES (?, ?, ?, 'merge', ?, ?, ?, ?, 1)
```

```typescript
// 7 args — NOT 8 (the trailing 1 is the literal, not a param)
.run(uuid(), now, 'sleep_job', JSON.stringify([...]), JSON.stringify({...}), JSON.stringify({...}), 'rationale')
```

This is a specific instance of "Too many parameter values" that occurs when copying a SQL statement and adding a `.run()` call without accounting for literal values in the SQL.

**Pitfall (misleading error):** The error message "Too few parameter values were provided" is misleading — it actually means a parameter value was an object that better-sqlite3 couldn't bind. Check for un-stringified objects first.

## Synchronous Seeding in Constructors

Don't use `storage.write()` (async) in a constructor for seeding data. The async write may not complete before dependent operations run.

**Use direct synchronous access:**

```typescript
private seedSlots(): void {
  const db = this.storage.getDb(); // direct access
  for (const s of slots) {
    db.prepare('INSERT OR IGNORE INTO slot_registry (...) VALUES (?, ...)').run(...);
  }
}
```

## Connection Pragmas

Apply on every connection, immediately after opening:

```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;  -- per-connection, defaults to OFF!
PRAGMA busy_timeout = 5000;
PRAGMA temp_store = MEMORY;
```

**Pitfall:** `foreign_keys` is per-connection in SQLite and defaults to OFF. A connection that skips this pragma has silently disabled all FK constraints.

**Pitfall:** These are cheap and per-connection except `journal_mode`, which is stored in the database file and needs a write lock to set. Re-issuing it (or any DDL) on every connection open is a write, not a check — see "One writer, many readers" below.

## WAL Mode

- `memory.db-wal` and `memory.db-shm` are transient files — never copy or delete them alone
- Before backup: `PRAGMA wal_checkpoint(TRUNCATE)` on a write connection
- On startup, leftover `-wal`/`-shm` files are normal recovery input — never delete manually

## One writer, many readers (server processes)

When one process streams rows in (an observer, a queue, a poller) and another reads on every HTTP request, opening a connection per request _and running schema statements on open_ takes a write lock on every request. Under load that serialises into multi-second responses, and whichever process loses the race dies with `database is locked` — an uncaught one kills the process, then the supervisor restarts it and it happens again.

- **Open once per process and reuse the connection.** A WAL reader never blocks a writer; a per-request opener takes a lock on every request.
- **Read the schema, do not assert it.** `sqlite_master`, `PRAGMA table_info(t)` and `PRAGMA user_version` are reads. Run `CREATE`/`ALTER`/`PRAGMA user_version=N` only when something is actually missing, so the hot path stays lock-free.
- **`PRAGMA busy_timeout=5000` on every connection, readers included.** Without it a busy writer surfaces as an exception instead of a wait.
- Verify with latency, not vibes: `for i in 1 2 3; do curl -sS -o /dev/null -w '%{time_total}s\n' http://127.0.0.1:PORT/api/state; done` while the writer is busy.

## Timestamp comparison trap

Storing ISO-8601 with `T`/`Z` (`2026-10-24T00:36:25.401Z`) and filtering with
`WHERE occurred_at > datetime('now','-5 minutes')` compares an ISO string against a
space-separated one. `'T'` sorts after `' '`, so **every** row matches: the query returns the whole
table and the numbers still look plausible. Wrap the column — `datetime(occurred_at) > datetime('now','-5 minutes')` —
or store `strftime('%Y-%m-%d %H:%M:%f','now')` in the first place. Sanity-check any windowed count
against `count(distinct key)` before quoting it to anyone.

## Per-key tails with window functions

The newest N rows _per_ key (worker, session, user) is one query, not a loop, and not a slice of a
shared global window — a shared window lets the busiest key starve the quiet ones, and the quiet
key's UI goes blank with no error:

```sql
SELECT * FROM (
  SELECT id, occurred_at, kind, summary,
         row_number() OVER (PARTITION BY session_id ORDER BY id DESC) AS rank
  FROM events WHERE session_id IN (?, ?)
) WHERE rank <= 6 ORDER BY id DESC;
```

Index `(session_id, id DESC)`. Placeholder order follows the SQL text, so an `IN (…)` list binds
before any `LIMIT ?` that follows it.

## Write Queue Pattern

Serialize writes through a single queue to prevent concurrent write transactions:

```typescript
async write<T>(fn: (db: Database) => T): Promise<T> {
  const result = this.writeQueue.then(() => {
    const txn = this.db.transaction(() => fn(this.db));
    return txn();
  });
  this.writeQueue = result.then(() => {}, () => {});
  return result;
}
```

**Pitfall:** Use `BEGIN IMMEDIATE` for write transactions so contention fails at open, not commit. Retry at most 3 times on SQLITE_BUSY.

## Migration Checklist

- Migrations are append-only and transactional (migration + schema_migrations insert in one transaction)
- Checksum verification on startup (mismatch aborts)
- No downgrade (higher migration version than code knows → abort)
- Embedding dimension is immutable (mismatch aborts startup)
- **Migration checksum stability:** The checksum for version 1 is computed from the original SCHEMA_SQL text. If you modify SCHEMA_SQL after v1 is deployed, the checksum changes and existing databases fail on startup with "Migration checksum mismatch for version 1". Keep v1 SCHEMA_SQL unchanged forever. Add new migrations (v2, v3, ...) as separate entries in getMigrations() with their own SQL and checksums. Never edit the v1 SQL text.
- **PRAGMA foreign_keys=OFF** must be executed outside the transaction (before BEGIN). It is a no-op inside a transaction. Use a disableForeignKeys flag on the migration object and execute the pragma before/after the transaction wrapper.

## Migrating with an external tool (drizzle-kit)

Hand-rolled migration runners are not the only case. When a project uses drizzle-kit, three things bite:

- **The default database URL resolves from the config file's package directory, not the repo root.** A
  `dbCredentials.url` default of `'./.studio/app.db'` works only when the tool is invoked from that
  package; run it as a workspace script and it resolves to `packages/<pkg>/.studio/app.db` and dies with
  `Cannot open database because the directory does not exist`. Point the default at the repo root
  (`'../../.studio/app.db'`) or pass `DATABASE_URL` explicitly.
- **A generated drop-table migration is not idempotent.** drizzle-kit emits plain `DROP TABLE`, so the
  migration succeeds on a database that still has the table and fails on one where it is already gone
  (an earlier hand-drop, a fresh clone that never created it). Edit the SQL to `DROP TABLE IF EXISTS`
  and say why in the file — environments differ in how far along they are, and the migration has to run
  on all of them.
- **Run the tool with the runtime that built the native module.** `better-sqlite3` is compiled per
  Node ABI; invoking drizzle-kit through a `pnpm` script that resolves a different Node than the one
  that built it fails at `require` with `ERR_DLOPEN_FAILED` (`NODE_MODULE_VERSION 137` vs `147`). Put
  the project's Node first on `PATH` for that command rather than rebuilding the module and breaking
  the other runtime.

## Schema Migration: Recreating Tables (CHECK constraints)

SQLite does NOT support `ALTER TABLE ... MODIFY` or changing CHECK constraints. To add new allowed values to a CHECK constraint, you must recreate the table:

1. Rename old table: `ALTER TABLE t RENAME TO t_old;`
2. Create new table with updated CHECK constraint
3. Copy data: `INSERT INTO t SELECT * FROM t_old;`
4. Drop old table: `DROP TABLE t_old;`
5. Recreate indexes

**FK pitfall during migration:** If the table has self-referential FKs (e.g., `memories.superseded_by_id REFERENCES memories(id)`), you must disable foreign keys before the migration and re-enable after. SQLite's `PRAGMA foreign_keys=OFF` is per-connection and must be executed outside the transaction:

```typescript
if (migration.disableForeignKeys) {
  this.db.pragma("foreign_keys = OFF");
}
try {
  const txn = this.db.transaction(() => {
    this.db.exec(migration.sql);
    // ... schema_migrations insert ...
  });
  txn();
} finally {
  if (migration.disableForeignKeys) {
    this.db.pragma("foreign_keys = ON");
  }
}
```

**Pitfall:** `PRAGMA foreign_keys=OFF` must be executed _before_ `BEGIN` (outside the transaction). It is a no-op inside a transaction.

**Pitfall:** When renaming a table, SQLite does NOT rename its indexes. The old indexes keep their original names and are associated with the old table. If you create new indexes with the same names before dropping the old table, it fails. Drop the old table first, then create indexes.

**Pitfall:** `INSERT INTO t SELECT * FROM t_old` requires column order to match between old and new tables. If you added columns, specify them explicitly: `INSERT INTO t (col1, col2) SELECT col1, col2 FROM t_old`.

## Cross-Slot Supersession (Memory Systems)

When implementing a memory system with slot-based supersession, the resolver's `isSupersede` check MUST verify that `candidate.slot === incumbent.slot` BEFORE checking slot cardinality. Without this check, memories with different slots (e.g., `name` and `home_city`) can supersede each other because both are single-valued.

```typescript
private isSupersede(candidate: VGCandidate, incumbent: Memory): boolean {
  if (!candidate.slot) return false;
  if (!incumbent.slot) return false;
  if (candidate.slot !== incumbent.slot) return false;  // CRITICAL: same slot only
  const slot = this.storage.read((db) => {
    return db.prepare('SELECT cardinality FROM slot_registry WHERE slot = ?').get(candidate.slot);
  });
  if (!slot || slot.cardinality !== 'single') return false;
  if (candidate.value_text === incumbent.value_text) return false;
  if (!['user_stated', 'user_edited'].includes(candidate.source_type)) return false;
  return true;
}
```

**Pitfall:** The `findNeighbours` function returns ALL active memories (not just same-slot) when the candidate has no slot or when querying across slots. The `isSupersede` check is the ONLY gate preventing cross-slot supersession. If it's missing, the sleep job and extraction pipeline will silently merge unrelated memories.

**Symptom:** User says "My name is Charles and I live in London." The name memory gets superseded by the home_city memory, so retrieval for "What is my name?" returns nothing.

## Memory Value Text: Atomic Claim Sentences

When extracting memories from conversations, `value_text` should be an **atomic claim sentence**, not a raw value:

- ✅ `"The user's name is Charles."` — self-contained claim
- ✅ `"The user lives in London."` — self-contained claim
- ❌ `"Charles"` — ambiguous without context
- ❌ `"London"` — ambiguous without context

**Why:** The retrieval system returns claim sentences to the LLM, which synthesizes the final answer. A bare value loses the semantic relationship (is it a name? a city? a company?). The LLM can easily extract "Charles" from "The user's name is Charles."

**Pitfall:** If you change the extraction prompt to produce raw values, the LLM reading the context block won't know what the value refers to. Keep claim sentences for atomicity.

## FTS5 Query Sanitization

FTS5 treats `?`, `*`, `"`, `(`, `)` as query operators. Passing user input directly to `MATCH ?` causes "fts5: syntax error" when the input contains these characters.

**Always sanitize before querying:**

```typescript
const sanitized = userMessage.replace(/[?*"()]/g, " ").trim();
const results = db
  .prepare("SELECT ... FROM memories_fts WHERE memories_fts MATCH ?")
  .all(sanitized);
```

**Also strip punctuation from keyword fallback matching:**

```typescript
const words = userMessage
  .toLowerCase()
  .replace(/[^a-z0-9\\s]/g, "")
  .split(/\\s+/)
  .filter((w) => w.length > 2);
```

## Compiled Eval Module Resolution

When eval files are compiled from `src/evals/` to `dist/evals/`, their relative imports shift by one directory level. A source file at `src/evals/kg-eval.ts` importing `../types/common.js` compiles to `dist/evals/kg-eval.js` importing `../types/common.js` → resolves to `dist/types/common.js` (correct). But importing `./types/common.js` resolves to `dist/evals/types/common.js` (wrong).

**Rule:** Eval files in `src/evals/` must use `../` prefix for all imports from `src/`. The compiled output in `dist/evals/` then resolves `../` to `dist/`, which is correct. Never use `./` for src-level imports in eval files.

## MCP Server Protocol (Model Context Protocol)

Expose a TypeScript service as MCP tools for AI agents (Claude Code, Cursor, Windsurf, etc.). Uses JSON-RPC 2.0 over stdio.

### Protocol Flow

1. **Initialize:** Client sends `initialize` → Server responds with protocol version, capabilities, server info
2. **Initialized notification:** Client sends `notifications/initialized` → No response
3. **Tools list:** Client sends `tools/list` → Server responds with tool definitions (name, description, inputSchema)
4. **Tool call:** Client sends `tools/call` with name + arguments → Server executes and returns result

### Implementation Pattern

```typescript
import * as readline from "node:readline";

const rl = readline.createInterface({ input: process.stdin, terminal: false });
rl.on("line", (line) => {
  if (!line.trim()) return;
  try {
    const request = JSON.parse(line);
    handleRequest(request);
  } catch (e) {
    sendResponse({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
  }
});

function handleRequest(request: { id?: number; method: string; params?: any }) {
  const { id, method, params } = request;
  if (method === "initialize") {
    sendResponse({
      jsonrpc: "2.0",
      id: id ?? null,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "my-service", version: "1.0.0" },
      },
    });
    return;
  }
  if (method === "notifications/initialized") return; // no response
  if (method === "tools/list") {
    sendResponse({ jsonrpc: "2.0", id: id ?? null, result: { tools: TOOLS } });
    return;
  }
  if (method === "tools/call") {
    (async () => {
      try {
        const result = await handleToolCall(params?.name, params?.arguments || {});
        sendResponse({
          jsonrpc: "2.0",
          id: id ?? null,
          result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] },
        });
      } catch (e: any) {
        sendResponse({
          jsonrpc: "2.0",
          id: id ?? null,
          result: { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true },
        });
      }
    })();
    return;
  }
  sendResponse({
    jsonrpc: "2.0",
    id: id ?? null,
    error: { code: -32601, message: `Method not found: ${method}` },
  });
}

function sendResponse(response: any) {
  process.stdout.write(JSON.stringify(response) + "\\n");
}
```

### Tool Definition Pattern

```typescript
const TOOLS = [
  {
    name: "my_service_action",
    description: "Description of what the tool does",
    inputSchema: {
      type: "object",
      properties: {
        param1: { type: "string", description: "Parameter description" },
        param2: { type: "number", description: "Optional number" },
      },
      required: ["param1"],
    },
  },
];
```

### Pitfalls

- **Async tool handlers:** `tools/call` must handle async operations. Use an IIFE `(async () => { ... })()` to await the tool handler, since `handleRequest` itself is synchronous (called from readline 'line' event).
- **stdout only for JSON-RPC:** All logging must go to stderr (`console.error`), never stdout. stdout is reserved for JSON-RPC responses. A stray `console.log` will corrupt the protocol.
- **One response per request:** Every request with an `id` must get exactly one response. Notifications (no `id`) get no response.
- **Storage path:** Use `SEME_STORAGE_DIR` env var or default to `~/.hominem`. The MCP server should use the same storage as the HTTP API.
- **Entity extractor model:** If entity extraction fails ("Entity extractor unavailable"), set `SEME_EXTRACTOR_MODEL=google/gemini-3.8-flash` env var. The default model `anthropic/claude-haiku-5.5` may not be available on OpenRouter.
- **Graceful shutdown:** Handle `rl.on('close')` to close the database connection and exit cleanly.

### Testing MCP Server

```bash
# Test initialize
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | node dist/mcp/mcp-server.js

# Test tools/list
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{...}}\n{"jsonrpc":"2.0","id":2,"method":"tools/list"}\n' | node dist/mcp/mcp-server.js

# Test tool call
printf '...\n{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"my_tool","arguments":{"key":"value"}}}\n' | node dist/mcp/mcp-server.js
```

## Common Pitfalls

- **'Too few parameter values'** → check for un-stringified objects in params
- **'Too many parameter values'** → count `?` marks (not columns); SQL literals (like `reversible = 1`) are NOT params
- **FK constraint failed on insert** → check insertion order for circular references
- **Silent FK violations** → ensure `PRAGMA foreign_keys = ON` on every connection
- **Async seeding race** → use synchronous db access in constructors
- **Stale reads in transactions** → use read transactions (consistent snapshot), don't mix snapshots
- **Chrome unsafe ports** → port 6666 (and others like 6000, 6667) are blocked by Chrome as "unsafe ports". Use 8080, 8888, 3000, or 5000 for local dev servers. If the browser says "ERR_UNSAFE_PORT", switch ports.
- **Node version mismatch** → better-sqlite3 is compiled against a specific Node ABI. If you switch Node versions (e.g., via mise), the native module won't load with `ERR_DLOPEN_FAILED` / `NODE_MODULE_VERSION 137 vs 147`. Diagnose before rebuilding: the failure names the ABI the module wants and the one the process provides, so check which `node` the command actually resolved (a workspace script can pick a different one than your shell). Use `npm rebuild better-sqlite3` for the runtime you intend to keep, or pin that runtime for the command. On this machine, Node 24 is required (Node 26 has ABI 137 incompatibility).
- **Build before running evals** → eval files in `src/evals/` must be compiled to `dist/evals/` before running. Run `npx tsc -p tsconfig.json` before `node dist/evals/<name>.js`. Forgetting this runs stale compiled code.
- **Async extraction timing** → after `endSession()`, extraction runs asynchronously (20-45s for long messages). Tests that check extracted memories must wait for extraction to complete before asserting. Use `await new Promise(r => setTimeout(r, 30000))` or poll the DB.
  - **Long message capability:** The extraction system can handle long rambling messages (4-5 paragraphs, 20+ facts) with 100% fact coverage. All facts from all paragraphs are extracted, including those mentioned in later sections. Short messages (1-2 sentences) typically complete in 10-15s; long messages need 30-45s.
  - **Pitfall:** If you check extracted memories too early, you'll see partial results (e.g., 23/31 facts). This is not a failure of the extraction — it's an async timing issue. Always wait for extraction to complete before asserting.
- **write_file read-before-write** → The `write_file` tool refuses to overwrite existing files that haven't been read first in the current session. Always call `read_file` before `write_file` on existing files, or use `patch` for targeted edits. This applies to all file types, not just code.
- **Bash heredoc delimiter pitfall** → When using `cat >> file << 'EOF'` to append content, the heredoc delimiter (EOF) can be accidentally written to the file if the command is interrupted or the delimiter isn't on its own line. Always verify the file content after using heredoc. Prefer `write_file` or `patch` tools over heredoc for file creation/editing.
- **Python HTTP server directory** → When serving HTML files with `python3 -m http.server`, the server serves from the current working directory. Ensure you `cd` to the correct directory before starting. Starting from the wrong directory (e.g., `docs/api-tests/` instead of `docs/`) causes 404s for files in parent directories.

## Bruno API Test Config Consistency

When using Bruno for API testing, ensure all `.bru` files use `{{baseUrl}}` (not hardcoded URLs) and the environment file uses the correct server port (default 3000, not 3100). Inconsistent URLs cause tests to fail silently or hit the wrong server.

- **Fix:** Replace all `http://localhost:PORT` with `{{baseUrl}}` in .bru files
- **Fix:** Set environment `baseUrl` to match the server's default port
- **Add:** Create .bru files for new endpoints as they're added (entities, graph, sleep-job, etc.)

## Storage Default Pattern

For persistent data (like `~/.hominem/memory.db`), use a user-home directory as the default storage location. The demo/seed script should use a temp directory to avoid deleting user data.

```typescript
// server.ts — default to user home
const STORAGE_DIR = process.env.SEME_STORAGE_DIR || `${process.env.HOME}/.hominem`;

// index.ts (demo) — use temp dir to avoid deleting user data
const STORAGE_DIR = process.env.SEME_STORAGE_DIR || "/tmp/scratchpad/seme-demo";
```

**Pitfall:** If the demo script uses the same default as the server, running `npm run demo` will delete the user's real data.

## Error Code System

Use consistent error codes across the API: `ERR_CODE: descriptive message`. This enables programmatic handling.

| Code           | Meaning                | When Thrown                                                  |
| -------------- | ---------------------- | ------------------------------------------------------------ |
| ERR_NOT_FOUND  | Resource doesn't exist | Invalid memory/entity/relationship ID                        |
| ERR_VALIDATION | Invalid input          | Missing required fields, invalid types, missing confirmation |
| ERR_PAUSED     | Learning is paused     | Remember/correct/forget during pause                         |
| ERR_CONFLICT   | Operation conflicts    | Duplicate entity, conflicting update                         |
| ERR_INTERNAL   | Server error           | Database failure, LLM error                                  |

**Pitfall:** Destructive operations (delete-all) require explicit `confirm: true` to prevent accidental data loss.

## Graph-Augmented Retrieval

During retrieval, the system performs two parallel searches:

1. **FTS5 keyword search** on memories (sanitized query)
2. **Entity name matching** on the knowledge graph

For each matched entity, the system traverses 2 hops to find related entities and relationships. The response includes a `graph_summary` object with matched entities and relationships.

**Pattern:**

```typescript
const ctx = seme.retrieveContext("s2", "Charles");
// ctx.graph_summary = {
//   entities: [{ name: 'Charles', type: 'person' }],
//   relationships: [{ relation_type: 'works_at', source: 'Charles', target: 'Ponti Studios' }]
// }
```

**Pitfall:** The graph search uses entity name/alias matching, not semantic similarity. If the query doesn't mention an entity name, the graph summary will be empty. The graph augments memory retrieval but doesn't replace it.

## Review Queue Workflow

When the system detects contradictions or conflicts, it creates review items for human resolution:

1. **Create:** System creates review item with kind (contradiction/conflict/supersession), payload, and memory IDs
2. **List:** `GET /review-queue` returns pending items
3. **Resolve:** `POST /review-queue/:id/resolve` with action: confirm (keep new), dismiss (keep old), or edit (modify)
4. **Verify:** Resolved items are removed from pending queue

**Pitfall:** Review items accumulate from sleep job contradictions and extraction conflicts. Always check the queue count before assuming it's empty in tests.

## Memory Lifecycle Patterns

### Remember → Correct → Forget

1. **Remember (explicit):** `source_type: user_edited`, high confidence. Bypasses extraction pipeline.
2. **Correct:** Creates NEW memory with corrected value, marks old as superseded, links them. New memory has `source_type: user_edited`.
3. **Forget (soft delete):** Marks as deleted (not removed from DB). Logs to `deletion_log` for audit. Cascades to graph links.

**Pitfall:** Correction doesn't modify in place — it creates a new memory and supersedes the old one. This preserves history.

### Pause/Resume

- Pause blocks all write operations (remember, correct, forget, extraction). Read operations still work.
- During pause, any write throws `ERR_PAUSED`.
- Resume clears the flag. Pending extractions can be retried.

## Sleep Job Phases

The sleep job (consolidation) runs 5 phases:

1. **Memory Dedup:** Find and merge duplicate memories (same slot + similar value)
2. **Graph Entity Dedup:** Find and merge duplicate entities (same name + type)
3. **Contradiction Detection:** Find conflicting memories/relationships → create review items
4. **Profile Recompile:** Rebuild profile from active memories
5. **Stale Cleanup:** Remove or archive stale/low-confidence memories

**Pitfall:** The sleep job must handle FK constraints carefully when merging entities (update relationships before deleting duplicates).

## CORS for Web Dashboards (Hono)

When building a web dashboard that calls a Hono API server from a different origin (e.g., Vite dev server on port 5173 → API on port 3000), add CORS middleware. The built-in `hono/cors` middleware may not load correctly in all setups — a manual middleware is more reliable:

```typescript
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:5173",
];

app.use("*", async (c, next) => {
  const origin = c.req.header("origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    c.header("Access-Control-Allow-Credentials", "true");
  }
  if (c.req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin || "",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }
  await next();
});
```

**Pitfall:** Restrict origins to known hosts — never use `*` in production. The `origin` check prevents unknown origins from accessing the API.

## Monorepo with Mixed Module Systems

When combining a CommonJS backend (TypeScript + tsc) with an ESM frontend (Vite + React) in a monorepo:

- Keep apps separate (`apps/api/`, `apps/web/`)
- Use HTTP API calls between them (not direct imports)
- Set `VITE_SEME_API_URL` env var in the web app for the API URL
- Root package.json with convenience scripts (`dev:api`, `dev:web`, `build`)

**Pitfall:** Don't try to share code directly between CommonJS and ESM apps — the module system mismatch causes resolution errors. Use the REST API as the boundary.

## Entity Resolution (Knowledge Graphs)

When the same entity is mentioned multiple times with different names or aliases, the resolver merges them into a single entity:

1. **Name match:** Exact name match (case-insensitive) → same entity
2. **Alias match:** If the new name is in the existing entity's aliases → same entity
3. **Fuzzy match:** Similar names (e.g., "Ponti Studios" and "Ponti") → merge with alias added
4. **Type conflict:** If the same name has different types (e.g., "Apple" as company vs. fruit), create a review item instead of merging

**Pitfall:** Entity resolution must happen BEFORE creating a new entity. If you create first and resolve later, you'll have duplicate entities that need deduplication in the sleep job.

**Pitfall:** When merging entities, update ALL relationships that reference the old entity ID to point to the new one. Forgetting this leaves dangling relationships.

## Adaptation System

Learn from user feedback and propose personality/style changes:

1. **Ingest Feedback:** Record signals (compliment, correction, rejection, engagement)
2. **Aggregate:** After N signals on same dimension, analyze and propose changes
3. **Apply:** Activate the proposal (changes dimension state to 'active')
4. **Lock:** User can lock a dimension to prevent further automatic changes

Dimensions: register, verbosity, tone, format. Each has a status (active/pending/locked) and user_locked flag.

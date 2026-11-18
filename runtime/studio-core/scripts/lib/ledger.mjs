// The studio ledger.
//
// One store: a SQLite file at ~/.studio/index.sqlite (STUDIO_LEDGER_ROOT moves the
// whole folder). Two fact tables hold everything that happened and are append-only:
// ledger_events (one row per call: generation or repricing) and ledger_assets (one
// row per registration; the latest row per sha256 is the current record). A
// correction is a new row, never an edit.
//
// The other tables in that file (runs, assets, asset_links, v_cost_by_tool) are a
// read model rebuilt from the facts by buildIndex(). Drop them and they come back.
//
// Media bytes stay on disk as content-addressed blobs under ~/.studio/blobs. The
// database holds the record of a file, not the file itself.
//
// Legacy: the JSONL segments from the earlier design (ledger/events-*.jsonl and
// ledger/assets-*.jsonl) are imported once, on first open. They are left in place.
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { homedir } from "node:os";
import { extname, join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

export const LEDGER_VERSION = 1;
// Bump when the read model's shape changes; it is stamped into the file.
export const INDEX_SCHEMA_VERSION = 3;

export function roots() {
  const root = resolve(process.env.STUDIO_LEDGER_ROOT ?? join(homedir(), ".studio"));
  return {
    root,
    legacyDir: join(root, "ledger"),
    blobDir: join(root, "blobs"),
    indexPath: join(root, "index.sqlite"),
  };
}

export function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export const sha256 = (value) => createHash("sha256").update(value).digest("hex");

// ── store ────────────────────────────────────────────────────────────────────

const STORE_SCHEMA = `
  create table if not exists ledger_meta(key text primary key, value text);
  create table if not exists ledger_events(
    seq integer primary key autoincrement,
    id text not null unique,
    dedupe_key text not null unique,
    ts text not null,
    kind text not null,
    body text not null
  );
  create table if not exists ledger_assets(
    seq integer primary key autoincrement,
    sha256 text not null,
    created_ts text,
    body text not null
  );
  create index if not exists ledger_assets_sha on ledger_assets(sha256);
`;

let open = null; // { path, db } — one connection per process and root

function openStore() {
  const r = roots();
  if (open && open.path === r.indexPath) return open.db;
  if (open) open.db.close();
  mkdirSync(r.root, { recursive: true });
  mkdirSync(r.blobDir, { recursive: true });
  const db = new DatabaseSync(r.indexPath);
  db.exec("pragma journal_mode = wal; pragma busy_timeout = 5000;");
  db.exec(STORE_SCHEMA);
  open = { path: r.indexPath, db };
  importLegacy(db, r.legacyDir);
  return db;
}

function readLegacy(dir, prefix) {
  if (!existsSync(dir)) return [];
  const rows = [];
  for (const name of readdirSync(dir).sort()) {
    if (!name.startsWith(prefix) || !name.endsWith(".jsonl")) continue;
    for (const line of readFileSync(join(dir, name), "utf8").split("\n")) {
      if (!line.trim()) continue;
      try {
        rows.push(JSON.parse(line));
      } catch {
        // a torn line is a torn line: skip it rather than fail the whole import
      }
    }
  }
  return rows;
}

function importLegacy(db, dir) {
  const done = db.prepare("select value from ledger_meta where key = 'legacy_jsonl_imported'").get();
  if (done) return;
  const events = readLegacy(dir, "events-");
  const assets = readLegacy(dir, "assets-");
  db.exec("begin");
  try {
    const insertEvent = db.prepare(
      "insert or ignore into ledger_events (id, dedupe_key, ts, kind, body) values (?,?,?,?,?)",
    );
    for (const e of events) {
      insertEvent.run(
        e.id,
        e.dedupe_key ?? dedupeKey(e),
        e.ts,
        e.kind ?? "generation",
        JSON.stringify(e),
      );
    }
    const insertAsset = db.prepare(
      "insert into ledger_assets (sha256, created_ts, body) values (?,?,?)",
    );
    for (const a of assets) insertAsset.run(a.sha256, a.created_ts ?? null, JSON.stringify(a));
    db.prepare("insert into ledger_meta (key, value) values ('legacy_jsonl_imported', ?)").run(
      new Date().toISOString(),
    );
    db.exec("commit");
  } catch (err) {
    db.exec("rollback");
    throw err;
  }
}

export function readEvents() {
  return openStore()
    .prepare("select body from ledger_events order by seq")
    .all()
    .map((row) => JSON.parse(row.body));
}

// Every registration, oldest first. The current record of an asset is its last row.
export function readAssets() {
  return openStore()
    .prepare("select body from ledger_assets order by seq")
    .all()
    .map((row) => JSON.parse(row.body));
}

function latestAsset(db, digest) {
  const row = db
    .prepare("select body from ledger_assets where sha256 = ? order by seq desc limit 1")
    .get(digest);
  return row ? JSON.parse(row.body) : null;
}

function insertAsset(db, asset) {
  db.prepare("insert into ledger_assets (sha256, created_ts, body) values (?,?,?)").run(
    asset.sha256,
    asset.created_ts ?? null,
    JSON.stringify(asset),
  );
}

// ── events ───────────────────────────────────────────────────────────────────

// A provider request id is the strongest identity; otherwise the caller's
// idempotency key plus the attempt number. Two skills logging the same call must
// collapse to one costed row.
export function dedupeKey(event) {
  if (event.kind === "repricing") return `repricing:${event.ref}`;
  if (event.provider_request_id) return `req:${event.provider_request_id}`;
  return `idem:${event.idem}#${event.attempt ?? 1}`;
}

export function normalizeEvent(input) {
  const ts = input.ts ?? new Date().toISOString();
  const tokens = input.tokens ?? {};
  const tokIn = tokens.in ?? 0;
  const tokOut = tokens.out ?? 0;
  const cost = input.cost ?? {};
  const event = {
    v: LEDGER_VERSION,
    id: input.id ?? `evt_${sha256(`${ts}:${Math.random()}`).slice(0, 20)}`,
    ts,
    kind: input.kind ?? "generation",
    tool: input.tool,
    surface: input.surface ?? "cli",
    stage: input.stage ?? null,
    provider: input.provider ?? null,
    model: input.model ?? null,
    project_id: input.project_id ?? null,
    job_id: input.job_id ?? null,
    prompt_sha256: input.prompt_sha256 ?? null,
    params: input.params ?? {},
    units: input.units ?? null,
    tokens: { in: tokIn, out: tokOut, total: tokIn + tokOut },
    latency_ms: input.latency_ms ?? null,
    status: input.status ?? "succeeded",
    error: input.error ?? null,
    cost: {
      usd: typeof cost.usd === "number" ? cost.usd : null,
      source: cost.source ?? (typeof cost.usd === "number" ? "reported" : "unknown"),
      price_book: cost.price_book ?? null,
      basis: cost.basis ?? null,
    },
    idem: input.idem ?? null,
    attempt: input.attempt ?? 1,
    provider_request_id: input.provider_request_id ?? null,
    assets: input.assets ?? [],
    tags: input.tags ?? [],
  };
  if (!event.tool) throw new Error("ledger event needs a tool");
  if (event.kind === "generation" && !event.model)
    throw new Error("generation event needs a model");
  if (event.kind === "repricing") {
    if (!input.ref) throw new Error("repricing event needs ref (the original event id)");
    event.ref = input.ref;
  }
  event.dedupe_key = dedupeKey(event);
  return event;
}

export function appendEvent(input, { dryRun = false } = {}) {
  const event = normalizeEvent(input);
  const db = openStore();
  const existing = db
    .prepare("select body from ledger_events where dedupe_key = ?")
    .get(event.dedupe_key);
  if (existing) return { event: JSON.parse(existing.body), duplicate: true };
  if (dryRun) return { event, duplicate: false };
  // insert-or-ignore keeps two processes racing on the same call from both writing
  const result = db
    .prepare("insert or ignore into ledger_events (id, dedupe_key, ts, kind, body) values (?,?,?,?,?)")
    .run(event.id, event.dedupe_key, event.ts, event.kind, JSON.stringify(event));
  if (result.changes === 0) {
    const winner = db
      .prepare("select body from ledger_events where dedupe_key = ?")
      .get(event.dedupe_key);
    if (!winner) throw new Error(`ledger id already used by another event: ${event.id}`);
    return { event: JSON.parse(winner.body), duplicate: true };
  }
  return { event, duplicate: false };
}

// ── assets ───────────────────────────────────────────────────────────────────

export function registerAsset(input, { copyBlob = false } = {}) {
  if (!existsSync(input.path)) throw new Error(`asset file not found: ${input.path}`);
  const digest = input.sha256 ?? sha256File(input.path);
  const db = openStore();
  const existing = latestAsset(db, digest);

  if (existing) {
    const display = new Set(existing.display_paths ?? []);
    if (!display.has(input.path)) {
      display.add(input.path);
      const merged = { ...existing, display_paths: [...display] };
      insertAsset(db, merged);
      return { asset: merged, duplicate: true };
    }
    return { asset: existing, duplicate: true };
  }

  let blobPath = null;
  if (copyBlob) {
    const r = roots();
    const dir = join(r.blobDir, digest.slice(0, 2), digest.slice(2, 4));
    mkdirSync(dir, { recursive: true });
    blobPath = join(dir, digest);
    if (!existsSync(blobPath)) copyFileSync(input.path, blobPath);
  }

  const asset = {
    v: LEDGER_VERSION,
    sha256: digest,
    kind: input.kind ?? guessKind(input.path),
    mime: input.mime ?? guessMime(input.path),
    bytes: input.bytes ?? readFileSync(input.path).length,
    dims: input.dims ?? null,
    duration_s: input.duration_s ?? null,
    blob: blobPath,
    display_paths: [input.path],
    created_ts: input.created_ts ?? new Date().toISOString(),
    run_id: input.run_id ?? null,
    model: input.model ?? null,
    source_asset_ids: input.source_asset_ids ?? [],
    prompt_sha256: input.prompt_sha256 ?? null,
    tags: input.tags ?? [],
  };
  insertAsset(db, asset);
  return { asset, duplicate: false };
}

export function guessKind(path) {
  const ext = extname(path).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"].includes(ext)) return "image";
  if ([".mp3", ".wav", ".m4a", ".aac", ".flac"].includes(ext)) return "audio";
  if ([".mp4", ".mov", ".webm", ".mkv"].includes(ext)) return "video";
  if ([".md", ".txt"].includes(ext)) return "text";
  if (ext === ".json") return "json";
  return "file";
}

export function guessMime(path) {
  const ext = extname(path).toLowerCase();
  return (
    {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".mp4": "video/mp4",
      ".json": "application/json",
      ".md": "text/markdown",
      ".txt": "text/plain",
    }[ext] ?? "application/octet-stream"
  );
}

// ── read model ───────────────────────────────────────────────────────────────

export function buildIndex({ quiet = true } = {}) {
  const r = roots();
  const db = openStore();
  // rebuild from scratch: the read model holds no facts of its own
  db.exec(`
    drop table if exists repricings;
    drop view if exists v_cost_by_tool;
    drop table if exists runs;
    drop table if exists assets;
    drop table if exists asset_links;
    create table runs(
      id text primary key, dedupe_key text unique, ts text, kind text, tool text,
      surface text, stage text, provider text, model text, project_id text, job_id text,
      prompt_sha256 text, units_count real, units_unit text, tok_in integer, tok_out integer,
      latency_ms integer, status text, error text, cost_usd real, cost_source text,
      price_book text, basis text, attempt integer, provider_request_id text,
      params text, tags text
    );
    create table assets(
      sha256 text primary key, kind text, mime text, bytes integer, w integer, h integer,
      duration_s real, blob text, display_paths text, created_ts text, run_id text,
      model text, prompt_sha256 text, source_asset_ids text, tags text
    );
    create table asset_links(asset_sha text, run_id text, role text);
    create view v_cost_by_tool as
      select tool, count(*) calls, sum(cost_usd) usd
      from runs where cost_usd is not null group by tool order by usd desc;
    create index runs_ts on runs(ts);
    create index runs_model on runs(model);
  `);

  const insertRun = db.prepare(`
    insert or ignore into runs (id,dedupe_key,ts,kind,tool,surface,stage,provider,model,
      project_id,job_id,prompt_sha256,units_count,units_unit,tok_in,tok_out,latency_ms,
      status,error,cost_usd,cost_source,price_book,basis,attempt,provider_request_id,params,tags)
    values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  const events = readEvents();
  let runCount = 0;
  // repricing events are facts about other facts — they must not appear as runs
  for (const e of events.filter((row) => (row.kind ?? "generation") === "generation")) {
    insertRun.run(
      e.id,
      e.dedupe_key ?? dedupeKey(e),
      e.ts,
      e.kind ?? "generation",
      e.tool,
      e.surface ?? "cli",
      e.stage ?? null,
      e.provider ?? null,
      e.model ?? null,
      e.project_id ?? null,
      e.job_id ?? null,
      e.prompt_sha256 ?? null,
      e.units?.count ?? null,
      e.units?.unit ?? null,
      e.tokens?.in ?? 0,
      e.tokens?.out ?? 0,
      e.latency_ms ?? null,
      e.status ?? "succeeded",
      e.error ?? null,
      e.cost?.usd ?? null,
      e.cost?.source ?? "unknown",
      e.cost?.price_book ?? null,
      e.cost?.basis ?? null,
      e.attempt ?? 1,
      e.provider_request_id ?? null,
      JSON.stringify(e.params ?? {}),
      JSON.stringify(e.tags ?? []),
    );
    runCount += 1;
  }

  // Repricings only ever fill a gap; they never overwrite a cost the provider reported.
  let repriced = 0;
  const fillGap = db.prepare(
    "update runs set cost_usd = ?, cost_source = 'estimated', price_book = ?, basis = ? where id = ? and cost_usd is null",
  );
  for (const e of events.filter((row) => row.kind === "repricing")) {
    const result = fillGap.run(e.cost?.usd ?? null, e.cost?.price_book ?? null, e.cost?.basis ?? null, e.ref);
    if (result.changes) repriced += 1;
  }

  const insertAssetRow = db.prepare(`
    insert or replace into assets (sha256,kind,mime,bytes,w,h,duration_s,blob,display_paths,
      created_ts,run_id,model,prompt_sha256,source_asset_ids,tags)
    values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  const assetRows = readAssets();
  for (const a of assetRows) {
    insertAssetRow.run(
      a.sha256,
      a.kind ?? null,
      a.mime ?? null,
      a.bytes ?? null,
      a.dims?.w ?? null,
      a.dims?.h ?? null,
      a.duration_s ?? null,
      a.blob ?? null,
      JSON.stringify(a.display_paths ?? []),
      a.created_ts ?? null,
      a.run_id ?? null,
      a.model ?? null,
      a.prompt_sha256 ?? null,
      JSON.stringify(a.source_asset_ids ?? []),
      JSON.stringify(a.tags ?? []),
    );
  }
  const distinctAssets = db.prepare("select count(*) c from assets").get().c;
  db.exec(`pragma user_version = ${INDEX_SCHEMA_VERSION}`);
  if (!quiet)
    console.log(
      `indexed ${runCount} calls, ${distinctAssets} distinct assets (${assetRows.length} rows), ${repriced} repriced → ${r.indexPath}`,
    );
  return { events: runCount, assets: distinctAssets };
}

export function report({ since = null, tool = null } = {}) {
  buildIndex({ quiet: true });
  const db = openStore();
  const where = [];
  const args = [];
  if (since) {
    where.push("ts >= ?");
    args.push(since);
  }
  if (tool) {
    where.push("tool = ?");
    args.push(tool);
  }
  const clause = where.length ? `where ${where.join(" and ")}` : "";

  const totals = db
    .prepare(
      `select count(*) calls, coalesce(sum(cost_usd),0) usd,
              sum(case when cost_source='reported' then 1 else 0 end) reported_calls,
              sum(case when cost_source='estimated' then 1 else 0 end) estimated_calls,
              sum(case when cost_usd is null then 1 else 0 end) unpriced_calls,
              (select count(*) from ledger_events where kind = 'repricing') repriced_calls,
              sum(case when status!='succeeded' then 1 else 0 end) failed_calls
       from runs ${clause}`,
    )
    .get(...args);
  const byTool = db
    .prepare(
      `select tool, count(*) calls, coalesce(sum(cost_usd),0) usd,
              sum(case when cost_usd is null then 1 else 0 end) unpriced
       from runs ${clause} group by tool order by usd desc`,
    )
    .all(...args);
  const byModel = db
    .prepare(
      `select model, count(*) calls, coalesce(sum(cost_usd),0) usd from runs ${clause} group by model order by usd desc`,
    )
    .all(...args);
  const byUnit = db
    .prepare(
      `select units_unit unit, count(*) calls, coalesce(sum(units_count),0) units from runs ${clause} group by units_unit order by units desc`,
    )
    .all(...args);
  const coverage = db
    .prepare(
      `select count(*) assets,
              sum(case when run_id is not null then 1 else 0 end) attributed,
              sum(case when run_id is null then 1 else 0 end) orphan,
              coalesce(sum(bytes),0) bytes
       from assets`,
    )
    .get();
  const byKind = db
    .prepare(
      `select kind, count(*) n, coalesce(sum(bytes),0) bytes from assets group by kind order by bytes desc`,
    )
    .all();
  return { totals, byTool, byModel, byUnit, coverage, byKind };
}

// Determinism check: the read model must be reproducible from the facts alone.
export function verifyIndex() {
  const before = report();
  buildIndex({ quiet: true });
  const after = report();
  const a = JSON.stringify(before);
  const b = JSON.stringify(after);
  return { identical: a === b, before };
}

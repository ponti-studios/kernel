// The studio ledger.
//
// Write side: append-only JSONL, one segment per month. Nothing is ever edited;
// a correction is a new event. Cheap to append from a CLI, safe when two skills
// run at once, greppable when something goes wrong.
//
// Read side: a disposable SQLite read model (node:sqlite) rebuilt from the JSONL.
// If the schema changes, drop it and rebuild — the facts are not in there.
//
// Media side: content-addressed blobs keyed by sha256, with the friendly path
// recorded as a display path. Existing files are catalogued in place; new files
// may also be copied (or hardlinked) into the blob store for dedupe.
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, copyFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, extname, join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export const LEDGER_VERSION = 1;
// Bump when the read model's shape changes: withIndex() rebuilds an older index
// instead of querying tables that did not exist when it was built.
export const INDEX_SCHEMA_VERSION = 2;

export function roots() {
  const root = resolve(process.env.STUDIO_LEDGER_ROOT ?? join(homedir(), '.studio'));
  return {
    root,
    ledgerDir: join(root, 'ledger'),
    blobDir: join(root, 'blobs'),
    indexPath: join(root, 'index.sqlite'),
  };
}

function ensureDirs() {
  const r = roots();
  mkdirSync(r.ledgerDir, { recursive: true });
  mkdirSync(r.blobDir, { recursive: true });
  return r;
}

const monthOf = (iso) => iso.slice(0, 7);
const eventsPath = (iso) => join(roots().ledgerDir, `events-${monthOf(iso)}.jsonl`);
const assetsPath = (iso) => join(roots().ledgerDir, `assets-${monthOf(iso)}.jsonl`);

export function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

export const sha256 = (value) => createHash('sha256').update(value).digest('hex');

function appendJsonl(path, record) {
  ensureDirs();
  appendFileSync(path, JSON.stringify(record) + '\n', { flag: 'a' });
}

function readJsonlDir(prefix) {
  const dir = roots().ledgerDir;
  if (!existsSync(dir)) return [];
  const rows = [];
  for (const name of readdirSync(dir).sort()) {
    if (!name.startsWith(prefix) || !name.endsWith('.jsonl')) continue;
    for (const line of readFileSync(join(dir, name), 'utf8').split('\n')) {
      if (!line.trim()) continue;
      try {
        rows.push(JSON.parse(line));
      } catch {
        // a torn line is a torn line: skip it rather than fail the whole read
      }
    }
  }
  return rows;
}

export const readEvents = () => readJsonlDir('events-');
export const readAssets = () => readJsonlDir('assets-');

// A provider request id is the strongest identity; otherwise the caller's
// idempotency key plus the attempt number. Two skills logging the same call must
// collapse to one costed row.
export function dedupeKey(event) {
  if (event.kind === 'repricing') return `repricing:${event.ref}`;
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
    kind: input.kind ?? 'generation',
    tool: input.tool,
    surface: input.surface ?? 'cli',
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
    status: input.status ?? 'succeeded',
    error: input.error ?? null,
    cost: {
      usd: typeof cost.usd === 'number' ? cost.usd : null,
      source: cost.source ?? (typeof cost.usd === 'number' ? 'reported' : 'unknown'),
      price_book: cost.price_book ?? null,
      basis: cost.basis ?? null,
    },
    idem: input.idem ?? null,
    attempt: input.attempt ?? 1,
    provider_request_id: input.provider_request_id ?? null,
    assets: input.assets ?? [],
    tags: input.tags ?? [],
  };
  if (!event.tool) throw new Error('ledger event needs a tool');
  if (event.kind === 'generation' && !event.model) throw new Error('generation event needs a model');
  if (event.kind === 'repricing') {
    if (!input.ref) throw new Error('repricing event needs ref (the original event id)');
    event.ref = input.ref;
  }
  event.dedupe_key = dedupeKey(event);
  return event;
}

export function appendEvent(input, { dryRun = false } = {}) {
  const event = normalizeEvent(input);
  const existing = readEvents().find((row) => row.dedupe_key === event.dedupe_key);
  if (existing) return { event: existing, duplicate: true };
  if (!dryRun) appendJsonl(eventsPath(event.ts), event);
  return { event, duplicate: false };
}

export function registerAsset(input, { copyBlob = false } = {}) {
  if (!existsSync(input.path)) throw new Error(`asset file not found: ${input.path}`);
  const digest = input.sha256 ?? sha256File(input.path);
  const existing = readAssets().find((asset) => asset.sha256 === digest);
  const ts = input.created_ts ?? new Date().toISOString();

  if (existing) {
    const display = new Set(existing.display_paths ?? []);
    if (!display.has(input.path)) {
      display.add(input.path);
      appendJsonl(assetsPath(ts), { ...existing, display_paths: [...display] });
    }
    return { asset: { ...existing, display_paths: [...display] }, duplicate: true };
  }

  let blobPath = null;
  if (copyBlob) {
    const r = ensureDirs();
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
    created_ts: ts,
    run_id: input.run_id ?? null,
    model: input.model ?? null,
    source_asset_ids: input.source_asset_ids ?? [],
    prompt_sha256: input.prompt_sha256 ?? null,
    tags: input.tags ?? [],
  };
  appendJsonl(assetsPath(ts), asset);
  return { asset, duplicate: false };
}

export function guessKind(path) {
  const ext = extname(path).toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif'].includes(ext)) return 'image';
  if (['.mp3', '.wav', '.m4a', '.aac', '.flac'].includes(ext)) return 'audio';
  if (['.mp4', '.mov', '.webm', '.mkv'].includes(ext)) return 'video';
  if (['.md', '.txt'].includes(ext)) return 'text';
  if (ext === '.json') return 'json';
  return 'file';
}

export function guessMime(path) {
  const ext = extname(path).toLowerCase();
  return (
    {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.json': 'application/json',
      '.md': 'text/markdown',
      '.txt': 'text/plain',
    }[ext] ?? 'application/octet-stream'
  );
}

// ── read model ───────────────────────────────────────────────────────────────

export function buildIndex({ quiet = true } = {}) {
  const r = ensureDirs();
  if (existsSync(r.indexPath)) {
    // rebuild from scratch: the index holds no facts of its own
    readdirSync(dirname(r.indexPath));
  }
  const db = new DatabaseSync(r.indexPath);
  db.exec(`
    drop table if exists runs;
    drop table if exists assets;
    drop table if exists asset_links;
    drop table if exists repricings;
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
    create table repricings(event_id text primary key, ref text, cost_usd real, price_book text, basis text, ts text);
    create view if not exists v_cost_by_tool as
      select tool, count(*) calls, sum(cost_usd) usd
      from runs where cost_usd is not null group by tool order by usd desc;
  `);

  const insertRun = db.prepare(`
    insert or ignore into runs (id,dedupe_key,ts,kind,tool,surface,stage,provider,model,
      project_id,job_id,prompt_sha256,units_count,units_unit,tok_in,tok_out,latency_ms,
      status,error,cost_usd,cost_source,price_book,basis,attempt,provider_request_id,params,tags)
    values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  let events = 0;
  // repricing events are facts about other facts — they must not appear as runs
  for (const e of readEvents().filter((row) => (row.kind ?? 'generation') === 'generation')) {
    insertRun.run(
      e.id, e.dedupe_key ?? dedupeKey(e), e.ts, e.kind ?? 'generation', e.tool, e.surface ?? 'cli',
      e.stage ?? null, e.provider ?? null, e.model ?? null, e.project_id ?? null, e.job_id ?? null,
      e.prompt_sha256 ?? null, e.units?.count ?? null, e.units?.unit ?? null,
      e.tokens?.in ?? 0, e.tokens?.out ?? 0, e.latency_ms ?? null, e.status ?? 'succeeded',
      e.error ?? null, e.cost?.usd ?? null, e.cost?.source ?? 'unknown', e.cost?.price_book ?? null,
      e.cost?.basis ?? null, e.attempt ?? 1, e.provider_request_id ?? null,
      JSON.stringify(e.params ?? {}), JSON.stringify(e.tags ?? []),
    );
    events += 1;
  }

  // Repricings are appended facts of their own: they only ever fill a gap, they
  // never overwrite a cost the provider actually reported.
  let repriced = 0;
  const insertRepricing = db.prepare(
    'insert or replace into repricings (event_id, ref, cost_usd, price_book, basis, ts) values (?,?,?,?,?,?)',
  );
  const gaps = db.prepare("select id from runs where cost_usd is null and units_unit = 'image'");
  for (const e of readEvents().filter((row) => row.kind === 'repricing')) {
    insertRepricing.run(e.id, e.ref, e.cost?.usd ?? null, e.cost?.price_book ?? null, e.cost?.basis ?? null, e.ts);
    const result = db
      .prepare(
        "update runs set cost_usd = ?, cost_source = 'estimated', price_book = ?, basis = ? where id = ? and cost_usd is null",
      )
      .run(e.cost?.usd ?? null, e.cost?.price_book ?? null, e.cost?.basis ?? null, e.ref);
    if (result.changes) repriced += 1;
  }
  void gaps;

  const insertAsset = db.prepare(`
    insert or replace into assets (sha256,kind,mime,bytes,w,h,duration_s,blob,display_paths,
      created_ts,run_id,model,prompt_sha256,source_asset_ids,tags)
    values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  let assets = 0;
  for (const a of readAssets()) {
    insertAsset.run(
      a.sha256, a.kind ?? null, a.mime ?? null, a.bytes ?? null, a.dims?.w ?? null, a.dims?.h ?? null,
      a.duration_s ?? null, a.blob ?? null, JSON.stringify(a.display_paths ?? []),
      a.created_ts ?? null, a.run_id ?? null, a.model ?? null, a.prompt_sha256 ?? null,
      JSON.stringify(a.source_asset_ids ?? []), JSON.stringify(a.tags ?? []),
    );
    assets += 1;
  }

  db.exec('create index if not exists runs_ts on runs(ts); create index if not exists runs_model on runs(model);');
  db.exec(`pragma user_version = ${INDEX_SCHEMA_VERSION}`);
  const distinctAssets = db.prepare('select count(*) c from assets').get().c;
  db.close();
  if (!quiet)
    console.log(
      `indexed ${events} events, ${distinctAssets} distinct assets (${assets} rows), ${repriced} repriced → ${r.indexPath}`,
    );
  return { events, assets: distinctAssets };
}

function withIndex() {
  const r = roots();
  let stale = !existsSync(r.indexPath);
  if (!stale) {
    const probe = new DatabaseSync(r.indexPath, { readOnly: true });
    const version = Number(probe.prepare('pragma user_version').get().user_version ?? 0);
    probe.close();
    stale = version < INDEX_SCHEMA_VERSION;
  }
  if (stale) buildIndex({ quiet: true });
  return new DatabaseSync(r.indexPath, { readOnly: true });
}

export function report({ since = null, tool = null } = {}) {
  const db = withIndex();
  const where = [];
  const args = [];
  if (since) {
    where.push('ts >= ?');
    args.push(since);
  }
  if (tool) {
    where.push('tool = ?');
    args.push(tool);
  }
  const clause = where.length ? `where ${where.join(' and ')}` : '';

  const totals = db
    .prepare(
      `select count(*) calls, coalesce(sum(cost_usd),0) usd,
              sum(case when cost_source='reported' then 1 else 0 end) reported_calls,
              sum(case when cost_source='estimated' then 1 else 0 end) estimated_calls,
              sum(case when cost_usd is null then 1 else 0 end) unpriced_calls,
              (select count(*) from repricings) repriced_calls,
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
    .prepare(`select model, count(*) calls, coalesce(sum(cost_usd),0) usd from runs ${clause} group by model order by usd desc`)
    .all(...args);
  const byUnit = db
    .prepare(`select units_unit unit, count(*) calls, coalesce(sum(units_count),0) units from runs ${clause} group by units_unit order by units desc`)
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
    .prepare(`select kind, count(*) n, coalesce(sum(bytes),0) bytes from assets group by kind order by bytes desc`)
    .all();
  db.close();
  return { totals, byTool, byModel, byUnit, coverage, byKind };
}

// Determinism check: the read model must be reproducible from the log alone.
export function verifyIndex() {
  const before = report();
  buildIndex({ quiet: true });
  const after = report();
  const a = JSON.stringify(before);
  const b = JSON.stringify(after);
  return { identical: a === b, before };
}

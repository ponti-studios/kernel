// Import the three stores that already exist into the ledger.
//
//   1. ~/.hominem/ai_usage/*.json   — what the CLI skills logged (images + text)
//   2. the app's SQLite             — ai_usage_events + artifacts
//   3. the filesystem               — renders in the inbox, audio in studio-media
//
// Everything is idempotent: provider request ids and event ids dedupe, so running
// it twice appends nothing. Existing media is catalogued in place (no blob copy),
// so the import costs no disk.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { appendEvent, guessKind, registerAsset, sha256File } from './ledger.mjs';
import { PRICE_BOOK, estimateImage, estimateText } from './prices.mjs';

const HOME = homedir();
const USAGE_DIR = join(HOME, '.hominem', 'ai_usage');
const APP_DB = join(HOME, 'Developer', 'studio', '.studio', 'minimal.db');
const STORAGE = join(HOME, 'Developer', 'studio', '.studio', 'storage');

const exists = (p) => existsSync(p);

// Log filenames carry the wall clock: 2026-10-24T10-23-58-141Z-editorial-script.json
function toIso(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return null;
  return new Date(n < 1e11 ? n * 1000 : n).toISOString();
}

function tsFromName(name) {
  const m = name.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z/);
  if (!m) return null;
  return `${m[1]}T${m[2]}:${m[3]}:${m[4]}.${m[5]}Z`;
}

function mediaInfo(path) {
  // dimensions/duration only matter for reporting; skip when the file is gone
  return {};
}

export async function backfill({ dryRun = false } = {}) {
  const stats = { cli: { events: 0, dup: 0 }, app: { events: 0, dup: 0 }, assets: 0, assetDup: 0, missingFiles: 0 };

  // ── 1. CLI skill logs ──────────────────────────────────────────────────────
  const cliEvents = [];
  if (exists(USAGE_DIR)) {
    for (const name of readdirSync(USAGE_DIR).filter((n) => n.endsWith('.json')).sort()) {
      let log;
      try {
        log = JSON.parse(readFileSync(join(USAGE_DIR, name), 'utf8'));
      } catch {
        continue;
      }
      const mtime = tsFromName(name);

      if (log.kind === 'imagegen') {
        const ts = log.timestamp ?? mtime ?? new Date().toISOString();
        const ev = {
          ts,
          tool: 'studio-imagegen',
          surface: 'cli',
          stage: 'render',
          provider: 'openrouter',
          model: log.model,
          prompt_sha256: log.prompt_sha256 ?? null,
          params: {
            spec: log.spec ?? null,
            frame: log.frame ?? null,
            aspect: log.aspect_ratio ?? null,
            resolution: log.resolution_requested ?? null,
            references: Array.isArray(log.references) ? log.references.length : 0,
            format_returned: log.format_returned ?? null,
            bytes: log.bytes ?? null,
          },
          units: { count: 1, unit: 'image' },
          status: 'succeeded',
          cost: (() => {
            if (typeof log.cost_usd === 'number')
              return { usd: log.cost_usd, source: 'estimated', price_book: PRICE_BOOK, basis: 'ai_usage log (skill-computed)' };
            // The image skill cannot read a per-image price back from OpenRouter
            // (the generation endpoint 404s for images), so the log carries null.
            // Estimate from the price book and label it as an estimate.
            const est = estimateImage(log.model, log.resolution_requested ?? '1K');
            return est
              ? { usd: est.usd, source: 'estimated', price_book: PRICE_BOOK, basis: est.basis }
              : { usd: null, source: 'unknown', price_book: PRICE_BOOK, basis: 'no measured price for this model' };
          })(),
          idem: `imagegen:${name}`,
          provider_request_id: log.generation_id ?? null,
          tags: ['backfill', log.spec ? basename(String(log.spec)).replace('.json', '') : 'imagegen'],
          _output: log.output ?? null,
          _references: Array.isArray(log.references) ? log.references : [],
        };
        cliEvents.push(ev);
      } else if (log.kind === 'editorial-text') {
        const ts = tsFromName(name) ?? new Date().toISOString();
        const usage = log.usage ?? {};
        const estimate = estimateText(log.model, usage.promptTokens, usage.completionTokens);
        cliEvents.push({
          ts,
          tool: 'studio-editorial', // historical label: the writer skill was split into studio-script/essay/video/social/clips/scenes
          surface: 'cli',
          stage: log.stage ?? 'draft',
          provider: 'openrouter',
          model: log.model,
          tokens: { in: usage.promptTokens ?? 0, out: usage.completionTokens ?? 0 },
          status: 'succeeded',
          cost: {
            usd: typeof usage.costUsd === 'number' ? usage.costUsd : (estimate?.usd ?? null),
            source: typeof usage.costUsd === 'number' ? 'reported' : estimate ? 'estimated' : 'unknown',
            price_book: PRICE_BOOK,
            basis: typeof usage.costUsd === 'number' ? 'provider usage.costUsd' : (estimate?.basis ?? null),
          },
          idem: `editorial:${name}`,
          provider_request_id: log.provider_request_id ?? null,
          tags: ['backfill'],
          _output: log.output ?? null,
        });
      }
    }
  }

  const log = (event) => {
    if (dryRun) return { id: event.id ?? 'dry', duplicate: false };
    return appendEvent(event);
  };

  const baseIdByPath = new Map();
  for (const ev of cliEvents) {
    const { _output, _references, ...clean } = ev;
    const { event, duplicate } = log(clean);
    if (duplicate) stats.cli.dup += 1;
    else stats.cli.events += 1;

    if (_output && exists(_output)) {
      const { asset, duplicate: assetDup } = dryRun
        ? { asset: { sha256: sha256File(_output), bytes: 0 }, duplicate: false }
        : registerAsset({ path: _output, run_id: duplicate ? clean.id ?? event.id : event.id, kind: guessKind(_output), model: clean.model, tags: ['backfill'] });
      if (assetDup) stats.assetDup += 1;
      else stats.assets += 1;
      baseIdByPath.set(_output, asset.sha256);
    }
    for (const ref of _references ?? []) {
      if (!exists(ref)) continue;
      if (dryRun) continue;
      const { asset, duplicate: assetDup } = registerAsset({ path: ref, kind: 'image', tags: ['reference', 'backfill'] });
      if (assetDup) stats.assetDup += 1;
      else stats.assets += 1;
    }
  }

  // ── 2. the app's SQLite ────────────────────────────────────────────────────
  if (exists(APP_DB)) {
    const db = new DatabaseSync(APP_DB, { readOnly: true });
    for (const row of db.prepare('select * from ai_usage_events').all()) {
      const ts = toIso(row.created_at) ?? new Date().toISOString();
      const { duplicate } = log({
        ts,
        tool: 'studio-dashboard',
        surface: 'app',
        stage: row.operation ?? null,
        provider: row.provider ?? null,
        model: row.model ?? null,
        project_id: row.project_id ?? null,
        job_id: row.job_id ?? null,
        tokens: { in: row.input_tokens ?? 0, out: row.output_tokens ?? 0 },
        latency_ms: row.duration_ms ?? null,
        status: row.status ?? 'succeeded',
        cost: {
          usd: row.cost_usd === null ? null : Number(row.cost_usd),
          source: row.cost_usd === null ? 'unknown' : 'reported',
          price_book: PRICE_BOOK,
          basis: 'app ai_usage_events',
        },
        idem: `app:${row.id}`,
        provider_request_id: row.provider_request_id ?? null,
        tags: ['backfill', 'app'],
      });
      if (duplicate) stats.app.dup += 1;
      else stats.app.events += 1;
    }

    // artifacts → assets, attributed to the job's event when we can match it
    const jobToEvent = new Map();
    for (const ev of (await import('./ledger.mjs')).readEvents()) {
      if (ev.job_id) jobToEvent.set(ev.job_id, ev.id);
    }
    for (const row of db.prepare('select * from artifacts').all()) {
      const path = join(STORAGE, String(row.storage_key));
      if (!exists(path)) {
        stats.missingFiles += 1;
        continue;
      }
      if (dryRun) continue;
      let meta = {};
      try {
        meta = JSON.parse(row.metadata ?? '{}');
      } catch {}
      const { duplicate } = registerAsset({
        path,
        run_id: meta.jobId ? (jobToEvent.get(meta.jobId) ?? null) : null,
        kind: guessKind(path),
        model: meta.model ?? null,
        created_ts: toIso(row.created_at) ?? undefined,
        tags: ['backfill', 'app', row.kind],
      });
      if (duplicate) stats.assetDup += 1;
      else stats.assets += 1;
    }
    db.close();
  }

  // ── 3. filesystem: renders + media that no log mentions ────────────────────
  const inbox = join(HOME, 'Pictures', 'imagegen', '_inbox');
  if (exists(inbox)) {
    for (const name of readdirSync(inbox)) {
      if (!/\.(png|jpe?g|webp)$/i.test(name)) continue;
      const path = join(inbox, name);
      if (dryRun) continue;
      // filename is <timestamp>_<model>_<what>.<ext>
      const [, model, what] = name.replace(/\.[^.]+$/, '').split('_');
      const { duplicate } = registerAsset({
        path,
        kind: 'image',
        model: model ?? null,
        tags: ['backfill', 'inbox', ...(what ? [what] : [])],
      });
      if (duplicate) stats.assetDup += 1;
      else stats.assets += 1;
    }
  }

  const media = join(HOME, 'Documents', 'studio-media');
  if (exists(media)) {
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (/\.(mp3|wav|mp4|mov|webm)$/i.test(entry.name)) {
          if (dryRun) continue;
          const { duplicate } = registerAsset({ path, kind: guessKind(path), tags: ['backfill', 'studio-media'] });
          if (duplicate) stats.assetDup += 1;
          else stats.assets += 1;
        }
      }
    };
    walk(media);
  }

  return stats;
}

#!/usr/bin/env node
// studio-ledger — the one place every tool reports what it spent and what it made.
//
//   studio-ledger emit --json '{"tool":"studio-imagegen","model":"…","units":{"count":1,"unit":"image"}}'
//   cat event.json | studio-ledger emit
//   studio-ledger asset --path <file> [--run <event id>] [--kind image] [--model …] [--copy-blob]
//   studio-ledger index
//   studio-ledger report [--since 2026-10-01] [--tool studio-imagegen] [--json]
//   studio-ledger verify          # rebuild the index and prove the report is identical
//   studio-ledger backfill        # import ~/.hominem/ai_usage + the app DB + the inbox
//   studio-ledger gc [--apply]    # blobs no asset references
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import { appendEvent, buildIndex, guessKind, registerAsset, report, roots, verifyIndex } from './ledger.mjs';
import { estimateImage, estimateText, PRICE_BOOK } from './prices.mjs';
import { backfill } from './backfill.mjs';

const argv = process.argv.slice(2);
const command = argv[0];
const flags = {};
for (let i = 1; i < argv.length; i += 1) {
  const arg = argv[i];
  if (!arg.startsWith('--')) continue;
  const key = arg.slice(2);
  const next = argv[i + 1];
  if (!next || next.startsWith('--')) flags[key] = true;
  else {
    flags[key] = next;
    i += 1;
  }
}

const usd = (n) => (n === null || n === undefined ? '—' : `$${Number(n).toFixed(4)}`);
const pad = (value, width) => String(value ?? '—').padEnd(width).slice(0, width);

async function readStdin() {
  if (process.stdin.isTTY) return null;
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8').trim();
  return text ? text : null;
}

switch (command) {
  case 'emit': {
    const raw = (flags.json && flags.json !== true ? String(flags.json) : null) ?? (await readStdin());
    if (!raw) {
      console.error('usage: studio-ledger emit --json \'{"tool":…,"model":…}\'  (or pipe JSON on stdin)');
      process.exit(2);
    }
    const input = JSON.parse(raw);
    // Fill in a price when the caller did not get one from the provider.
    if (!input.cost?.usd) {
      const units = input.units ?? {};
      const tokens = input.tokens ?? {};
      const estimate =
        units.unit === 'image'
          ? estimateImage(input.model, input.params?.resolution ?? '1K')
          : tokens.in || tokens.out
            ? estimateText(input.model, tokens.in, tokens.out)
            : null;
      if (estimate) {
        input.cost = { usd: estimate.usd, source: 'estimated', price_book: PRICE_BOOK, basis: estimate.basis };
      }
    }
    const { event, duplicate } = appendEvent(input);
    console.log(JSON.stringify({ id: event.id, duplicate, cost: event.cost }, null, flags.json ? 0 : 2));
    break;
  }

  case 'asset': {
    if (!flags.path) {
      console.error('usage: studio-ledger asset --path <file> [--run <event id>] [--kind image] [--model …]');
      process.exit(2);
    }
    const { asset, duplicate } = registerAsset({
      path: String(flags.path),
      run_id: flags.run ? String(flags.run) : null,
      kind: flags.kind ? String(flags.kind) : guessKind(String(flags.path)),
      model: flags.model ? String(flags.model) : null,
      tags: flags.tags ? String(flags.tags).split(',') : [],
    }, { copyBlob: Boolean(flags['copy-blob']) });
    console.log(JSON.stringify({ sha256: asset.sha256, duplicate, bytes: asset.bytes }));
    break;
  }

  case 'index': {
    const result = buildIndex({ quiet: false });
    console.log(JSON.stringify(result));
    break;
  }

  case 'report': {
    const data = report({
      since: flags.since ? String(flags.since) : null,
      tool: flags.tool ? String(flags.tool) : null,
    });
    if (flags.json) {
      console.log(JSON.stringify(data, null, 2));
      break;
    }
    const t = data.totals;
    console.log(`\n  calls ${t.calls}   spend ${usd(t.usd)}   (reported ${t.reported_calls}, estimated ${t.estimated_calls}, unpriced ${t.unpriced_calls}, failed ${t.failed_calls})\n`);
    console.log('  by tool');
    for (const row of data.byTool)
      console.log(
        `    ${pad(row.tool, 22)} ${String(row.calls).padStart(5)} calls  ${usd(row.usd).padStart(9)}` +
          (row.unpriced ? `  (${row.unpriced} unpriced)` : ''),
      );
    console.log('\n  by model');
    for (const row of data.byModel) console.log(`    ${pad(row.model, 36)} ${String(row.calls).padStart(5)} calls  ${usd(row.usd).padStart(9)}`);
    console.log('\n  outputs');
    for (const row of data.byKind) console.log(`    ${pad(row.kind, 12)} ${String(row.n).padStart(4)} files  ${(Number(row.bytes) / 1e6).toFixed(1).padStart(7)} MB`);
    const c = data.coverage;
    console.log(`\n  assets ${c.assets} — attributed ${c.attributed}, unattributed ${c.orphan}, ${(Number(c.bytes) / 1e6).toFixed(1)} MB`);
    console.log(`  ledger ${roots().root}\n`);
    break;
  }

  case 'reprice': {
    // Fill the gaps for calls whose cost was never recorded (image pricing came
    // back null before the provider response was parsed). A repricing is a new
    // fact referencing the original — never an edit.
    const { DatabaseSync } = await import('node:sqlite');
    buildIndex({ quiet: true });
    const db = new DatabaseSync(roots().indexPath, { readOnly: true });
    const gaps = db
      .prepare("select id, tool, stage, model, params, units_unit from runs where cost_usd is null")
      .all();
    db.close();
    let priced = 0;
    let skipped = 0;
    for (const gap of gaps) {
      const params = JSON.parse(gap.params ?? '{}');
      const estimate =
        gap.units_unit === 'image'
          ? estimateImage(gap.model, params.resolution ?? '1K', params.references ?? 0)
          : null;
      if (!estimate) {
        skipped += 1;
        continue;
      }
      if (!flags['dry-run']) {
        appendEvent({
          kind: 'repricing',
          ref: gap.id,
          tool: gap.tool,
          stage: gap.stage,
          model: gap.model,
          cost: { usd: estimate.usd, source: 'estimated', price_book: PRICE_BOOK, basis: estimate.basis },
          tags: ['repricing'],
        });
      }
      priced += 1;
    }
    buildIndex({ quiet: true });
    console.log(
      `${flags['dry-run'] ? 'would reprice' : 'repriced'} ${priced} call(s); ${skipped} still unpriced (no measured rate)`,
    );
    break;
  }

  case 'verify': {
    const result = verifyIndex();
    console.log(result.identical ? '  index rebuild reproduces the report exactly' : '  MISMATCH — the index is not a pure function of the log');
    process.exit(result.identical ? 0 : 1);
    break;
  }

  case 'backfill': {
    const result = await backfill();
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  case 'gc': {
    const r = roots();
    const assets = (await import('./ledger.mjs')).readAssets();
    const referenced = new Set(assets.map((a) => a.blob).filter(Boolean));
    const dir = r.blobDir;
    if (!existsSync(dir)) {
      console.log('no blob store yet');
      break;
    }
    const strays = [];
    for (const a of readdirSync(dir)) {
      for (const b of readdirSync(join(dir, a))) {
        for (const c of readdirSync(join(dir, a, b))) {
          const full = join(dir, a, b, c);
          if (!referenced.has(full)) strays.push(full);
        }
      }
    }
    let freed = 0;
    for (const stray of strays) {
      freed += readFileSync(stray).length;
      if (flags.apply) rmSync(stray);
    }
    console.log(`${strays.length} unreferenced blob(s), ${(freed / 1e6).toFixed(1)} MB${flags.apply ? ' removed' : ' (dry run — pass --apply)'}`);
    break;
  }

  default:
    console.log('studio-ledger — commands: emit, asset, index, report, verify, backfill, gc');
}

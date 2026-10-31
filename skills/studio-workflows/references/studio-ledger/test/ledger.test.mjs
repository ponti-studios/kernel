// Invariants the rest of the system relies on. Run: node --test test/
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';

let root;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'ledger-'));
  process.env.STUDIO_LEDGER_ROOT = root;
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

const load = () => import(`../scripts/lib/ledger.mjs?t=${Date.now()}`);

const event = (extra = {}) => ({
  ts: '2026-10-24T10:00:00.000Z',
  tool: 'studio-imagegen',
  model: 'qwen/qwen-image-2.1-turbo',
  units: { count: 1, unit: 'image' },
  cost: { usd: 0.0184, source: 'estimated' },
  ...extra,
});

test('an event is written once and deduped by provider request id', async () => {
  const { appendEvent, readEvents } = await load();
  const first = appendEvent(event({ provider_request_id: 'req-1' }));
  const second = appendEvent(event({ provider_request_id: 'req-1' }));
  assert.equal(first.duplicate, false);
  assert.equal(second.duplicate, true);
  assert.equal(readEvents().length, 1);
});

test('retries are separate facts, identified by idem + attempt', async () => {
  const { appendEvent, readEvents } = await load();
  appendEvent(event({ idem: 'call-a', attempt: 1, status: 'failed' }));
  appendEvent(event({ idem: 'call-a', attempt: 2 }));
  assert.equal(readEvents().length, 2);
  const again = appendEvent(event({ idem: 'call-a', attempt: 2 }));
  assert.equal(again.duplicate, true);
  assert.equal(readEvents().length, 2);
});

test('an unpriced call stays unpriced instead of being invented', async () => {
  const { appendEvent, report } = await load();
  appendEvent(event({ model: 'bytedance-seed/seedream-5-0-flash', cost: { usd: null, source: 'unknown' } }));
  const data = report();
  assert.equal(data.totals.calls, 1);
  assert.equal(data.totals.unpriced_calls, 1);
  assert.equal(Number(data.totals.usd), 0);
});

test('the read model is a pure function of the log', async () => {
  const { appendEvent, buildIndex, report } = await load();
  appendEvent(event({ provider_request_id: 'req-a' }));
  appendEvent(event({ provider_request_id: 'req-b', model: 'openai/gpt-4o-mini', units: null, tokens: { in: 10, out: 20 }, cost: { usd: 0.00002, source: 'reported' } }));
  buildIndex({ quiet: true });
  const before = JSON.stringify(report());
  buildIndex({ quiet: true });
  assert.equal(JSON.stringify(report()), before);
});

test('events split into monthly segments by their own timestamp', async () => {
  const { appendEvent } = await load();
  appendEvent(event({ provider_request_id: 'oct' }));
  appendEvent(event({ ts: '2026-09-30T23:00:00.000Z', provider_request_id: 'sep' }));
  const files = readdirSync(join(root, 'ledger')).filter((f) => f.startsWith('events-'));
  assert.deepEqual(files.sort(), ['events-2026-09.jsonl', 'events-2026-10.jsonl']);
});

test('assets dedupe by content hash and keep every display path', async () => {
  const { registerAsset, readAssets } = await load();
  const { writeFileSync } = await import('node:fs');
  const a = join(root, 'one.png');
  const b = join(root, 'two.png');
  writeFileSync(a, 'same-bytes');
  writeFileSync(b, 'same-bytes');
  const first = registerAsset({ path: a, kind: 'image' });
  const second = registerAsset({ path: b, kind: 'image' });
  assert.equal(first.duplicate, false);
  assert.equal(second.duplicate, true);
  const rows = readAssets().filter((x) => x.sha256 === first.asset.sha256);
  const latest = rows[rows.length - 1];
  assert.deepEqual(latest.display_paths.sort(), [a, b].sort());
});

test('the log is one JSON object per line and nothing else', async () => {
  const { appendEvent } = await load();
  appendEvent(event({ provider_request_id: 'fmt' }));
  const file = join(root, 'ledger', 'events-2026-10.jsonl');
  const lines = readFileSync(file, 'utf8').trim().split('\n');
  assert.equal(lines.length, 1);
  assert.equal(JSON.parse(lines[0]).provider_request_id, 'fmt');
});

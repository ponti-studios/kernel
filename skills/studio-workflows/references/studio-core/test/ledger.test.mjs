// Invariants the rest of the system relies on. Run: node --test test/
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";

let root;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "ledger-"));
  process.env.STUDIO_LEDGER_ROOT = root;
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

const load = () => import(`../scripts/lib/ledger.mjs?t=${Date.now()}`);

const event = (extra = {}) => ({
  ts: "2026-10-24T10:00:00.000Z",
  tool: "studio-imagegen",
  model: "qwen/qwen-image-2.1-turbo",
  units: { count: 1, unit: "image" },
  cost: { usd: 0.0184, source: "estimated" },
  ...extra,
});

test("an event is written once and deduped by provider request id", async () => {
  const { appendEvent, readEvents } = await load();
  const first = appendEvent(event({ provider_request_id: "req-1" }));
  const second = appendEvent(event({ provider_request_id: "req-1" }));
  assert.equal(first.duplicate, false);
  assert.equal(second.duplicate, true);
  assert.equal(readEvents().length, 1);
});

test("retries are separate facts, identified by idem + attempt", async () => {
  const { appendEvent, readEvents } = await load();
  appendEvent(event({ idem: "call-a", attempt: 1, status: "failed" }));
  appendEvent(event({ idem: "call-a", attempt: 2 }));
  assert.equal(readEvents().length, 2);
  const again = appendEvent(event({ idem: "call-a", attempt: 2 }));
  assert.equal(again.duplicate, true);
  assert.equal(readEvents().length, 2);
});

test("an unpriced call stays unpriced instead of being invented", async () => {
  const { appendEvent, report } = await load();
  appendEvent(
    event({ model: "bytedance-seed/seedream-5-0-flash", cost: { usd: null, source: "unknown" } }),
  );
  const data = report();
  assert.equal(data.totals.calls, 1);
  assert.equal(data.totals.unpriced_calls, 1);
  assert.equal(Number(data.totals.usd), 0);
});

test("the read model is a pure function of the log", async () => {
  const { appendEvent, buildIndex, report } = await load();
  appendEvent(event({ provider_request_id: "req-a" }));
  appendEvent(
    event({
      provider_request_id: "req-b",
      model: "openai/gpt-4o-mini",
      units: null,
      tokens: { in: 10, out: 20 },
      cost: { usd: 0.00002, source: "reported" },
    }),
  );
  buildIndex({ quiet: true });
  const before = JSON.stringify(report());
  buildIndex({ quiet: true });
  assert.equal(JSON.stringify(report()), before);
});

test("events are rows in the sqlite store, not files", async () => {
  const { appendEvent, readEvents } = await load();
  appendEvent(event({ provider_request_id: "oct" }));
  appendEvent(event({ ts: "2026-09-30T23:00:00.000Z", provider_request_id: "sep" }));
  const { DatabaseSync } = await import("node:sqlite");
  const db = new DatabaseSync(join(root, "index.sqlite"), { readOnly: true });
  assert.equal(db.prepare("select count(*) c from ledger_events").get().c, 2);
  db.close();
  assert.equal(readEvents().length, 2);
  assert.equal(readdirSync(root).includes("ledger"), false);
});

test("legacy JSONL segments are imported once and left in place", async () => {
  const legacy = join(root, "ledger");
  mkdirSync(legacy, { recursive: true });
  writeFileSync(
    join(legacy, "events-2026-10.jsonl"),
    JSON.stringify({ ...event({ provider_request_id: "old-1" }), dedupe_key: "req:old-1", id: "evt_old1" }) + "\n",
  );
  const { readEvents, appendEvent } = await load();
  assert.equal(readEvents().length, 1);
  assert.equal(readEvents()[0].provider_request_id, "old-1");
  assert.equal(appendEvent(event({ provider_request_id: "old-1" })).duplicate, true);
  assert.equal(readEvents().length, 1);
  assert.equal(readFileSync(join(legacy, "events-2026-10.jsonl"), "utf8").trim().split("\n").length, 1);
});

test("assets dedupe by content hash and keep every display path", async () => {
  const { registerAsset, readAssets } = await load();
  const { writeFileSync } = await import("node:fs");
  const a = join(root, "one.png");
  const b = join(root, "two.png");
  writeFileSync(a, "same-bytes");
  writeFileSync(b, "same-bytes");
  const first = registerAsset({ path: a, kind: "image" });
  const second = registerAsset({ path: b, kind: "image" });
  assert.equal(first.duplicate, false);
  assert.equal(second.duplicate, true);
  const rows = readAssets().filter((x) => x.sha256 === first.asset.sha256);
  const latest = rows[rows.length - 1];
  assert.deepEqual(latest.display_paths.sort(), [a, b].sort());
});

test("an event round-trips through sqlite unchanged", async () => {
  const { appendEvent, readEvents } = await load();
  const { event: written } = appendEvent(event({ provider_request_id: "fmt" }));
  assert.deepEqual(readEvents()[0], written);
});

test("a dry run does not create the store", async () => {
  const { appendEvent } = await load();
  const result = appendEvent(event({ provider_request_id: "dry-1" }), { dryRun: true });
  assert.equal(result.duplicate, false);
  assert.deepEqual(readdirSync(root), []);
});

test("a dry run still reports a duplicate that only exists in legacy JSONL", async () => {
  const legacy = join(root, "ledger");
  mkdirSync(legacy, { recursive: true });
  writeFileSync(
    join(legacy, "events-2026-10.jsonl"),
    JSON.stringify({ ...event({ provider_request_id: "old-2" }), dedupe_key: "req:old-2", id: "evt_old2" }) + "\n",
  );
  const { appendEvent } = await load();
  assert.equal(appendEvent(event({ provider_request_id: "old-2" }), { dryRun: true }).duplicate, true);
  assert.equal(readdirSync(root).includes("index.sqlite"), false);
});

test("legacy assets are imported once, even when a second process opens the store", async () => {
  const legacy = join(root, "ledger");
  mkdirSync(legacy, { recursive: true });
  writeFileSync(
    join(legacy, "assets-2026-10.jsonl"),
    JSON.stringify({ sha256: "a".repeat(64), kind: "image", display_paths: ["/x.png"], created_ts: "2026-10-01T00:00:00.000Z" }) + "\n",
  );
  const first = await load();
  assert.equal(first.readAssets().length, 1);
  const second = await load(); // a fresh module is a fresh connection, like a second process
  assert.equal(second.readAssets().length, 1);
});

test("rebuilding the read model keeps the facts and is repeatable", async () => {
  const { appendEvent, buildIndex, readEvents } = await load();
  appendEvent(event({ provider_request_id: "idx-1" }));
  assert.deepEqual(buildIndex(), buildIndex());
  assert.equal(readEvents().length, 1);
});

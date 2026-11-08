---
name: asset-and-cost-ledger
description: "Use when logging or reporting generation cost and assets."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [macos]
metadata:
  hermes:
    tags: [ponti-studios, cost, assets, provenance, ledger]
    related_skills: [image-model-craft, studio-imagegen, studio-mediagen, studio-ledger]
---

# Asset + cost ledger

One record of **what was generated, with what, from what, and what it cost**, shared by
every `studio-*` skill. Implementation: the `studio-ledger` skill (plain ESM, no build
step, no dependencies — `node:sqlite` does the indexing) writing to `~/.studio`.

## When to use

- A generation just ran (text, image, speech, video) and its cost or output must be kept.
- Someone asks what anything costs: one project, one model, one month, one kind of output.
- Migrating or reconciling the per-tool logs (`$STUDIO_USAGE_DIR/*.json`, files on disk).
- Adding a new generator — every new tool must emit, or its spend is invisible. A
  generator is not finished until `studio-ledger report` lists it: wire the bridge in the
  same pass as the feature, not after.

## Why not one of the existing stores

The pipeline already writes three incompatible things: one JSON file per CLI call
(`~/.hominem/ai_usage/`, a different shape per tool), append-only-in-name-only rows in
the app's `ai_usage_events`, and the outputs themselves on disk. No join key, no totals,
per-tool shapes. The symptom to remember: **73 of 82 logged renders carried
`cost_usd: null` and nothing noticed, because nothing ever summed them.**

Design that fixed it — **append-only facts + content-addressed media + a disposable index**:

```
~/.studio/
  ledger/events-YYYY-MM.jsonl    one JSON object per call; facts, never edited
  ledger/assets-YYYY-MM.jsonl    one per output, keyed by sha256
  blobs/ab/cd/<sha256>           media, deduped by content
  index.sqlite                   DISPOSABLE read model (node:sqlite, zero deps)
```

JSONL rather than writing SQLite from every tool: appends are atomic and need no driver,
crashes lose at most one line, history is replayable and greppable, concurrent skills do
not fight over locks, and schema churn costs a rebuild instead of a migration. The index
is a _view_ — `verify` proves it is a pure function of the log, so it can always be
deleted.

## Procedure

1. **Emit the fact** after the provider call returns, success or failure:
   `studio-ledger emit --json '{"tool":…,"stage":…,"model":…,"units":{…},"cost":{…}}'`
   (or `appendEvent()` from a skill). Include `prompt_sha256`, `params`, `latency_ms`,
   `provider_request_id` when the provider gave one, and an `idem` key.
2. **Register the output** with the run that made it:
   `studio-ledger asset --path <file> --run <event id> [--copy-blob]`. Existing files are
   catalogued in place; only new writes copy into the blob store.
3. **Never let bookkeeping break a generation.** Wrap the emit in try/catch and print the
   failure — a render that succeeded must not be reported as failed because the ledger
   could not write.
4. **Read** with `studio-ledger report [--since …] [--tool …] [--json]`; it builds the
   index on demand.
5. **Verify** with `studio-ledger verify` after changing anything about indexing.

From a skill, copy the reference bridge (`studio-imagegen/scripts/lib/ledger-bridge.mjs`):
five lines that locate the sibling `studio-ledger/scripts/lib`, emit, register the asset, and
swallow errors. Skills sit beside each other, so the path is relative to the current module
(`join(import.meta.dirname, '..', '..', '..', 'studio-ledger', 'scripts', 'lib')`) with an env
override for installs that place them apart — never an absolute home path, which silently
points at whatever checkout happens to exist.

### Consumers that are not skills

A bundled consumer (Vite, webpack, esbuild) needs two things a skill does not: a computed
dynamic specifier annotated `/* @vite-ignore */`, or the bundler tries to resolve it at build
time; and a candidate list, because `process.cwd()` differs between dev and a built server.
Skills have neither problem — they import the sibling module by relative path.

### Prove the cut with before/after counts

Retiring a store is finished only when a real call leaves the old one untouched:

```bash
# count the store being retired, run the cheapest real action, count again
<count command for the old store>            # before
<cheapest real generation, text not render>
<count command for the old store>            # unchanged
node scripts/lib/cli.mjs report              # new event is in the ledger
```

Use the cheapest real format — a half-cent text call, never a render — and report the artifact
it created so it can be deleted. Reading can be proven against existing data; a _write_ cut
cannot, so one real call is the only evidence that counts.

Then **finish the cut**: delete the writers, the readers and their tests, not just the writes. A
frozen archive left in place is not a retirement — it keeps appearing in schema dumps, in
row-count checks and in the next reader's mental model. Prove any import row-by-row first
(count, then field-by-field on a sample, then timestamps), because a store you have dropped is
a store you cannot re-import from.

## Invariants

- **A fact is written once.** Corrections are new events. On a _fresh_ ledger whose only
  content is a bad import, the honest fix is to wipe `~/.studio` and re-import — there is
  no edit path, by design.
- **Identity:** `dedupe_key = req:<provider_request_id>` when available, else
  `idem:<key>#<attempt>`. Two tools logging one call collapse to one costed row.
- **Retries are separate facts** (attempt 1 failed, attempt 2 succeeded) because both
  burned money. Filter `status='succeeded'` when asking what a thing cost to produce.
- **Assets dedupe by content hash, not by path.** Keep every display path so a file can
  be re-organised without orphaning the catalog.
- **Cost is never invented** — see below.

## Cost: reported, estimated, or unknown

`cost.source` is exactly one of:

| Source      | Meaning                                                                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `reported`  | the provider returned a price in the response body — chat, image and video all carry a `usage` block; generation records are the older fallback |
| `estimated` | from `prices.mjs`, carrying `price_book` + `basis` so the number is explainable later                                                           |
| `unknown`   | no measured rate — `usd` stays `null`, and reports count it separately                                                                          |

A zero would silently understate spend, so an unpriced call is counted, not summed.
**Read the response, not a second endpoint.** Image responses carry `usage.cost` and
`completion_tokens_details.image_tokens` in the body, and video carries `usage` on the
completed poll. `/api/v1/generation` 404s for image generations, so a cost path that
calls it leaves every render unpriced while looking correct. Renders are ~99% of spend,
text ~0.4%. A price-book rate is only for a model whose response reports nothing —
adding one is a one-line change to `prices.mjs`; do not overwrite an older book, add a
new one. Shapes and the single reader: `references/provider-usage-metadata.md`.

## Units make kinds comparable

`units: {count, unit}` with `unit` in `image | token | second | character`. That is what
lets one query answer "cost per image", "cost per second of video" and "cost per article"
without special-casing each modality.

## Pitfalls

- **The minimum billable unit sets the price, not the duration you asked for.** A four-second
  clip was reported at $0.42 — the five-second rate for a $0.084/second model — so planning at
  `seconds × rate` understates every short item and makes trimming a scene below the floor look
  like a saving when it is a 25% penalty per item. Price each item at
  `max(requested, provider minimum) × rate`; when the budget is tight, cut the _number_ of items
  rather than their length, then confirm the first real item's reported cost before committing
  to a batch.
- **Absent is not zero.** A missing `cost` means unpriced; a reported `0` is a free model.
  Normalise every provider response through one reader that returns `undefined` when
  nothing was reported — a `?? 0` anywhere downstream silently zeroes real spend, and a
  `cost_usd: null` nobody sums is how eighty renders went unpriced unnoticed.
- **Video reports usage on the poll, not the submit.** Merge the submit and poll blocks
  and keep the first reported value per field, or a completed job looks unpriced.
- **Speech has no price field.** Speech endpoints return audio bytes plus a generation id
  header: record measured characters as the unit and the id for reconciliation, and keep
  cost an explicit estimate with its basis written down — never label it `reported`.
- **Repricing needs a per-event identity and an index filter.** A reprice batch sharing
  one dedupe key collapses N corrections into one row; key each `repricing:<original ref>`.
  And `buildIndex` must count only `kind: 'generation'` rows, or every correction doubles
  the run count it was meant to fix.
- **One reader, one place.** The usage normaliser lives in `studio-core` and every skill
  imports it. There is no build step, so an edit is live — which also means a hand-rolled second
  reader is never caught by a rebuild: a skill that writes `usage.cost ?? 0` keeps producing
  unpriced-as-free rows indefinitely, and nothing fails.
- **Timestamps arrive in different units per store.** Log filenames use hyphenated times
  (`2026-10-24T10-23-58-141Z-…`) that `Number()` turns into `NaN`; database rows often hold
  unix **seconds**. Both fail the same way: a plausible-looking import that lands in
  `events-1970-01.jsonl`. Regex the stamp out of a filename, multiply seconds by 1000
  below ~1e11, and assert one round-trip date against the source row before importing the
  rest.
- **Catalogue old media in place, don't copy it.** A backfill of an existing library
  should cost no disk; `copyBlob` is for new writes that must survive the inbox moving.
- **Unattributed assets are honest.** `run_id: null` on files that predate the ledger is
  better than a guessed link; attribution is a matching job, not a schema change.
- **Keep the per-tool logs.** The per-call detail during migration lives at `$STUDIO_USAGE_DIR`
  (default `~/.hominem/ai_usage/`); the ledger is the cross-tool total. Both the reader and the
  writers must resolve that directory, not spell the home path, or a machine with a different
  layout silently logs to two places. Do not delete a source before the import is verified.
- **One writer, one truth.** Only the ledger records spend. Skills append through the bridge;
  the per-call JSON under `$STUDIO_USAGE_DIR` is an input to `backfill`, not a second ledger —
  so a total that looks near zero means the work predates the import, not that it happened
  somewhere else.
- **Reads must notice staleness.** The index is disposable, so a read that trusts a stale
  `index.sqlite` hides what just happened. Rebuild it when any JSONL segment is newer than
  the index, rather than writing to the index incrementally — incremental writes would make
  the view a second source of truth.

## Reference

- `references/ledger-schema.md` — every event and asset field, the index tables, and the
  SQL behind cost-by-tool/model/day, unit totals, and asset provenance.
- `references/provider-usage-metadata.md` — where each modality reports cost and units,
  the one normaliser every provider goes through, and the tests that keep it honest.

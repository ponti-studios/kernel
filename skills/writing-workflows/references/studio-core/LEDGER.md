# Studio ledger

The ledger records **what was generated, with what, from what, and what it cost**.
The image renderer has an automatic ledger bridge. Writing generators emit usage
JSON logs; use the backfill command to import those logs. Do not assume every
media command already records a ledger event: inspect its output and integration
before claiming complete spend coverage.

Plain ESM, **no dependencies** — `node:sqlite` holds everything. The facts are append-only rows in
`index.sqlite`; the read tables beside them (`runs`, `assets`, `asset_links`, `v_cost_by_tool`) are
rebuilt from those facts.

## Layout

```text
~/.studio/
  index.sqlite                    the ledger: ledger_events + ledger_assets are the source of truth
                                  (runs, assets, asset_links are a rebuildable read model).
                                  Back this file up. Deleting it loses everything recorded since the migration.
  ledger/*.jsonl                  legacy segments, imported once on first open and left in place
  blobs/<sha256>                  the bytes, addressable by hash
```

Override the root with `STUDIO_LEDGER_ROOT`.

## Commands

```bash
node scripts/lib/cli.mjs emit    # append one generation event (JSON on stdin)
node scripts/lib/cli.mjs asset   # register an output file by hash
node scripts/lib/cli.mjs index   # rebuild the read tables from the ledger facts
node scripts/lib/cli.mjs report  # totals by tool, model and month
node scripts/lib/cli.mjs verify  # check the read tables agree with the facts
node scripts/lib/cli.mjs backfill # import legacy usage logs
node scripts/lib/cli.mjs gc      # drop unreferenced blobs
node scripts/lib/cli.mjs reprice # re-price historical events with a newer price book
node scripts/lib/cli.mjs reprice-speech [--dry-run] # real cost for speech calls whose generation record was not ready when they ran
```

## Rules

- **Absent cost is unpriced, never zero.** A model with no measured rate records `usd: null` and
  `source: 'unknown'`; it is not free and must not be summed as free.
- **Corrections are new events**, never edits. Repricing writes a `repricing` event that wins by
  `dedupeKey` (`repricing:<ref>` → `req:<id>` → event id).
- **The read tables are disposable, the file is not.** Rebuild `runs`/`assets` with `index` rather than
  repairing them. Never delete `index.sqlite`: the fact tables live in it.
- **Bookkeeping never breaks a generation.** A ledger failure is reported, not thrown.

## Cost sources

`cost.source` is exactly one of:

| Source      | Meaning                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------- |
| `reported`  | the provider returned a price in the response (chat, image, video), or in the generation record (speech) |
| `estimated` | from `prices.mjs`, carrying `price_book` and `basis` so the number is explainable later       |
| `unknown`   | no measured rate: `usd` stays `null`, and reports count it separately                         |

Read the response for cost. Don't call a second endpoint to guess it. `/generation` returns 404 for
image generations, so a path that calls it leaves every render unpriced while looking correct.
Provider shapes and the one reader are in [PROVIDER-USAGE.md](PROVIDER-USAGE.md).

## Pitfalls

- **The minimum billable unit sets the price, not the duration you asked for.** A short clip can be
  billed at the provider's minimum. Price each item at `max(requested, provider minimum) × rate`, and
  when the budget is tight, cut the number of items rather than their length.
- **Video reports usage on the completed poll, not the submit.** Merge the blocks and keep the first
  reported value per field, or a finished job looks unpriced.
- **Speech has no price in its body.** Record measured characters as the unit and the generation id
  for reconciliation. Cost stays `reported` only when the generation record supplied it. Otherwise
  `reprice-speech` fills it in later, and an estimate keeps its basis.
- **Repricing needs its own identity.** Key each repricing event `repricing:<original ref>`, or a batch
  collapses into one row. `buildIndex` must count only generation rows, or every correction doubles the
  run count it was meant to fix.
- **One reader.** Every skill uses `studio-core`'s usage normaliser. A hand-rolled `usage.cost ?? 0`
  elsewhere quietly records free renders, and nothing fails.
- **Timestamps differ by store.** Filenames use hyphenated times that `Number()` reads as `NaN`, and some
  database rows hold unix seconds. Both land in the wrong month on import. Check one round-trip date
  against its source row before importing the rest.
- **Catalogue old media in place.** A backfill should cost no disk, so copy into the blob store only for
  new writes.
- **Unattributed assets are honest.** `run_id: null` on files that predate the ledger beats a guessed link.
- **Keep the per-tool logs during migration.** They live at `$STUDIO_USAGE_DIR`, and every reader and writer
  resolves that variable, not a literal home path. Don't delete a source before its import is verified.
- **Reads must notice staleness.** Run `index` after new events; never let a read trust a stale index.

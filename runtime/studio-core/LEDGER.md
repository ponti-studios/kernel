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

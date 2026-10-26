---
name: studio-ledger
description: "Use when recording or reporting AI generation cost and assets. One append-only ledger for every model call a studio skill makes."
license: MIT
metadata:
  version: "1.0.0"
  author: ponti-studios
  category: Operations
  tags:
    - ponti-studios
    - cost
    - ledger
---

# Studio ledger

The single record of **what was generated, with what, from what, and what it cost**. Every
`studio-*` skill writes here; nothing else keeps a second opinion about spend.

Plain ESM, **no dependencies** — `node:sqlite` does the indexing, and the facts themselves are
append-only JSONL so the index can be deleted and rebuilt at any time.

## Layout

```text
~/.studio/
  ledger/events-YYYY-MM.jsonl     append-only facts (the source of truth)
  ledger/assets-YYYY-MM.jsonl     content-addressed asset registrations
  index.sqlite                    disposable read model
  blobs/<sha256>                  the bytes, addressable by hash
```

Override the root with `STUDIO_LEDGER_HOME` or `ledger_home` in `~/.pontistudios.studio.yml`.

## Commands

```bash
node scripts/lib/cli.mjs emit    # append one generation event (JSON on stdin)
node scripts/lib/cli.mjs asset   # register an output file by hash
node scripts/lib/cli.mjs index   # rebuild index.sqlite from the JSONL
node scripts/lib/cli.mjs report  # totals by tool, model and month
node scripts/lib/cli.mjs verify  # check the index agrees with the facts
node scripts/lib/cli.mjs backfill # import legacy usage logs
node scripts/lib/cli.mjs gc      # drop unreferenced blobs
node scripts/lib/cli.mjs reprice # re-price historical events with a newer price book
```

## Rules

- **Absent cost is unpriced, never zero.** A model with no measured rate records `usd: null` and
  `source: 'unknown'`; it is not free and must not be summed as free.
- **Corrections are new events**, never edits. Repricing writes a `repricing` event that wins by
  `dedupeKey` (`repricing:<ref>` → `req:<id>` → event id).
- **The index is disposable.** Rebuild it rather than repairing it.
- **Bookkeeping never breaks a generation.** A ledger failure is reported, not thrown.

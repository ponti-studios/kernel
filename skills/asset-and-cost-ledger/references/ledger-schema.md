# Ledger schema, index tables and queries

## Event (one JSON object per line, `ledger/events-YYYY-MM.jsonl`)

| Field                           | Notes                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `v`                             | schema version (`1`)                                                            |
| `id`                            | `evt_…`                                                                         |
| `ts`                            | ISO 8601; determines the monthly segment                                        |
| `kind`                          | `generation` (others may extend)                                                |
| `tool`                          | `studio-imagegen`, `studio-editorial`, `studio-mediagen`, `studio-dashboard`, … |
| `surface`                       | `cli` or `app`                                                                  |
| `stage`                         | `render`, `script`, `essay`, `voiceover`, `clip`, `assemble`, …                 |
| `provider`, `model`             | `openrouter`, `qwen/qwen-image-2.1-turbo`, …                                    |
| `project_id`, `job_id`          | nullable; the join back to the app                                              |
| `prompt_sha256`                 | the compiled prompt, not the prose                                              |
| `params`                        | free object: aspect, resolution, references, fps, voice, seed                   |
| `units`                         | `{count, unit}`; unit is `image` \| `token` \| `second` \| `character`          |
| `tokens`                        | `{in, out, total}` (zeros for non-text)                                         |
| `latency_ms`, `status`, `error` | wall clock and outcome                                                          |
| `cost`                          | `{usd, source, price_book, basis}` — see the trichotomy in SKILL.md             |
| `idem`, `attempt`               | caller-supplied identity; attempt increments on retry                           |
| `provider_request_id`           | strongest identity when the provider returns one                                |
| `assets`                        | sha256 list produced by this call                                               |
| `tags`                          | free labels (spec name, frame, project nickname)                                |
| `dedupe_key`                    | derived: `req:…` or `idem:…#attempt`                                            |

## Asset (one per output, `ledger/assets-YYYY-MM.jsonl`)

| Field                    | Notes                                                         |
| ------------------------ | ------------------------------------------------------------- |
| `sha256`                 | primary key; dedupe and referencing                           |
| `kind`                   | `image` \| `audio` \| `video` \| `text` \| `json` \| `file`   |
| `mime`, `bytes`          | as stored                                                     |
| `dims`                   | `{w, h}` for images                                           |
| `duration_s`             | audio/video                                                   |
| `blob`                   | path in `blobs/` if copied, else `null` (catalogued in place) |
| `display_paths`          | every human path the asset is known by                        |
| `created_ts`             | when the bytes were produced                                  |
| `run_id`                 | the event that created it; `null` = unattributed (honest)     |
| `model`, `prompt_sha256` | convenience copies for querying                               |
| `source_asset_ids`       | reference plates / inputs, for the provenance chain           |
| `tags`                   | free labels                                                   |

## Index (`index.sqlite`)

```sql
runs(id pk, dedupe_key unique, ts, kind, tool, surface, stage, provider, model,
     project_id, job_id, prompt_sha256, units_count, units_unit, tok_in, tok_out,
     latency_ms, status, error, cost_usd, cost_source, price_book, basis,
     attempt, provider_request_id, params, tags)
assets(sha256 pk, kind, mime, bytes, w, h, duration_s, blob, display_paths,
       created_ts, run_id, model, prompt_sha256, source_asset_ids, tags)
asset_links(asset_sha, run_id, role)
```

## Queries worth knowing

```sql
-- spend by tool, with the unpriced count that keeps totals honest
select tool, count(*) calls, sum(cost_usd) usd,
       sum(case when cost_usd is null then 1 else 0 end) unpriced
from runs group by tool order by usd desc;

-- cost per image / per second / per token, comparable across modalities
select units_unit, count(*) calls, sum(units_count) units, sum(cost_usd) usd,
       sum(cost_usd) / nullif(sum(units_count), 0) per_unit
from runs where units_unit is not null group by units_unit;

-- what did one project cost, in-app and (once wired) from the CLI
select cost_source, count(*) calls, sum(cost_usd) usd
from runs where project_id = ? group by cost_source;

-- provenance: every asset a call produced, with its path and hash
select r.id, r.tool, r.model, a.kind, a.sha256, a.display_paths
from runs r join assets a on a.run_id = r.id where r.id = ?;

-- reference plates an asset was built from
select a.sha256, a.source_asset_ids from assets a where a.sha256 = ?;

-- attribution backlog
select kind, count(*) n from assets where run_id is null group by kind;
```

## Commands

```bash
studio-ledger emit --json '{…}'          # record a call (or pipe JSON on stdin)
studio-ledger asset --path f --run evt_… [--copy-blob]
studio-ledger index                       # rebuild the read model
studio-ledger report [--since 2026-10-01] [--tool studio-imagegen] [--json]
studio-ledger verify                      # rebuild and prove the report is identical
studio-ledger backfill                    # import the legacy stores (idempotent)
studio-ledger gc [--apply]                # blobs no asset references
```

`emit` fills in a price only when the caller supplied none, and marks it `estimated` with
the price-book version — a caller that knows the real number must pass it as `reported`.

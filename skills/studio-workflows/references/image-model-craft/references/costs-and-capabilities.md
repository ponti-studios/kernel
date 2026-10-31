# Costs and capabilities — measured, and what can't be measured

## The billing trap: two budgets, one binding

`GET /api/v1/key` returns **both** a lifetime key limit and workspace daily budgets.
Only one binds:

```json
"limit": 20, "limit_remaining": 0.105,
"budgets": [
  {"scope": "workspace_default_member", "limit_usd": 10, "remaining_usd": 10, "reset_interval": "daily"},
  {"scope": "workspace_default_key",    "limit_usd": 10, "remaining_usd": 9.39, "reset_interval": "daily"},
  {"scope": "key_limit",                "limit_usd": 20, "remaining_usd": 0.105, "reset_interval": null}
],
"effective_budget": {"scope": "key_limit", "remaining_usd": 0.105}
```

It is easy to read the daily workspace figure ($9.39 left) and believe there is
budget for a sweep when `effective_budget` — the **lifetime** key limit — is down to
ten cents. **Read `effective_budget` before launching anything, and multiply the
number of renders by the per-render cost before you start.** A 30-render sweep at
$0.0184 is $0.55; if `effective_budget.remaining_usd` is below that, the sweep dies
partway through and the arms become unbalanced (samples per arm unequal = invalid
comparison).

Also: `limit_reset: null` on a lifetime key means **it never resets** — top-up is the
only way to continue.

## Measured image cost

| Operation | Cost | How known |
|---|---|---|
| 1K render, 3 reference plates | **$0.0184** | 30-render sweep, key counter delta $0.5520 [M] |
| 1K render, no plates | ~$0.00-0.02 | counter delta, never isolated [I] |
| 2K render, 3 reference plates | **~$0.16** | bracketed by counter before/after a single render [I] |
| `bytedance-seed/seedream-5-0-pro`, full brief | $0.09 | provider-reported `usage.cost` [M] |
| `google/gemini-3-pro-image` | $0.1390 | provider-reported [M] |
| `bytedance-seed/seedream-5-0-flash` | $0.018 | provider-reported [M] |
| `qwen/qwen-image-2.1-turbo` | app default; cheapest capable of 4 refs | [I] |

**Reference plates appear to dominate cost [I].** The same brief at 1K with no plates
measured near zero while 1K with three plates measured $0.0184, and 2K with plates
measured ~$0.16. The plate count is the lever, not the prompt length.

## Measured other-media cost

| Operation | Cost | How known |
|---|---|---|
| Video `kwaivgi/kling-v3.0-std` | **$0.084/s** silent, **$0.126/s** with audio | published `pricing_skus` [M]; durations 3-15s, 720p, `seed: false` |
| Speech `elevenlabs/eleven-multilingual-v2` | $0.00008/prompt token | published pricing [M]; 329 characters ≈ 21.2s of audio |
| Text `deepseek-chat-v3-0324` | $0.0003-$0.0005 per draft | provider-reported [M] |

## What cannot be measured (stop trying)

- `GET /api/v1/generation?id=gen-img-…` → **404 for image generations**, and the same
  for speech. Cost is not queryable per image or per voiceover.
- `GET /api/v1/images/models` returns `pricing: {}` for every image model — no
  published price on the images surface at all.
- Therefore: **the only reliable image cost measurement is a key-counter bracket.**
  Record usage, render, sleep ~8s, read usage again. Do the counter read after a
  delay — a finished episode showed a $0.0000 delta seconds later and settled later.

## Capability matrix (from `/api/v1/images/models`)

| Model | Reference plates | Resolutions | Speed (measured) | Verdict |
|---|---|---|---|---|
| `qwen/qwen-image-2.1-turbo` | **0-4** | 1K, 2K (no 4K) | 36-49s | app default; 0/35 misses on the Aurora rubric; **cannot** hold a 5-character frame with plates; `n` up to 6 |
| `bytedance-seed/seedream-5-0-pro` | 0-14 | 1K, 2K | 109-178s, 2/11 transient failures | slowest and least reliable to *run*; its adherence score was built on a rubric later found invalid (see evidence log) — no cost reporting |
| `bytedance-seed/seedream-5-0-flash` | 0-14 | 1K, 2K | 18-29s | 1/35 misses on the Aurora rubric; fastest; good default for iteration |
| `google/gemini-3-pro-image` | 0-14 | 1K/2K/4K | ~35s | accurate, **expensive** — ruled out as a workhorse |
| `meta/muse-image` | none | — | ~8s on success | unusable: provider content filter on dense scenes |

- **4:5 aspect ratio** is supported by qwen and the seedreams; check the enum before
  assuming.
- `n` is **1** on the seedreams but **up to 6** on `qwen-image-2.1-turbo` — qwen can
  return 6 samples in one call, which is a real sampling-efficiency advantage
  (measured from the parameter enum, not yet used in a sweep).
- Resolution is requested as 1K/2K/4K but **2K does not guarantee 2K pixels**: a 2K
  request returned a 1640x2048 image. Always read the real pixel size from the
  returned bytes; never quote the requested value.

## Preflight before any paid run

1. `effective_budget.remaining_usd` >= renders x per-render cost, with headroom.
2. Reference plates resolved against the right universe root (a wrong root silently
   changes the prompt).
3. Compiled prompts diffed between arms — the arms must differ in exactly what you
   intend.
4. Disk space for the output directory (each 1K PNG is 1-3 MB; a sweep is 30-90 MB).
5. Prices quoted from `pricing_skus`/provider `usage.cost` where available, and from
   a counter bracket where not — and label which.


## Where cost is recorded (2026-10-24)

`~/.studio/` holds the canonical ledger: append-only JSONL facts plus a disposable
SQLite index (`studio-ledger report`). Every image call records `units: {count: 1,
unit: "image"}` and a cost whose `source` is `reported`, `estimated` (with the price
book version and basis) or `unknown` — never an invented number.

Measured over the full history on this machine: **image renders are 99% of spend**
($1.06 of $1.07 across 95 calls), text is 0.4%, and 23 renders remain unpriced because
no measured rate exists for `seedream-5-0-flash` / `seedream-5-0-pro`. Stop optimising
text cost; count renders. Details: `docs/asset-and-cost-ledger.md` in the studio repo.

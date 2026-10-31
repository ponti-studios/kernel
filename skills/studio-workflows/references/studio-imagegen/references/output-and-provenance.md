# Output and provenance

## Sidecar (`--meta`)

Written next to the image as `<name>.json`:

| Field | Source |
|---|---|
| `spec`, `frame`, `title` | the frame spec that was compiled |
| `registry_version` | `registry.json` version at compile time |
| `prompt_sha256` | hash of the compiled prompt — the deterministic identifier for the frame |
| `references` | absolute paths of the attached character plates |
| `model` | the model actually used |
| `aspect_ratio`, `resolution_requested`, `format_returned`, `mime` | request vs reality |
| `generation_id` | provider id (not usable for cost lookup — see below) |
| `bytes`, `cost_usd`, `tokens` | output size and whatever the provider reported |

For a verbatim `--prompt` run the sidecar keeps `prompt_sha256` and the request
fields, with no spec provenance.

## Format is decided by the response

The stage asks for `output_format: webp` and then trusts the bytes: the endpoint
can return `image/png` regardless. `media_type` on the returned item is
authoritative, so an image requested as `frame3.webp` may legitimately be saved
as `frame3.png`. The provider's own comment in `openrouter-images.ts` says the
same — do not "fix" this by forcing the extension.

## Observed output sizes

| Request | Actual | Notes |
|---|---|---|
| 4:5 @ 2K, 3 reference plates | 1640×2048 PNG, ~4.9 MB, 54s | the reference-bearing pass |
| 4:5 @ 1K, no references | 820×1024 PNG, ~1.1 MB, 29s | the cheap iteration pass |

## Why cost is measured twice

1. `model.generationCost(generationId)` — the provider path, used by the app.
   **It does not work for images**: `GET /api/v1/generation?id=gen-img-…`
   returns `404 Generation … not found`, so both the app's usage rows and this
   script's `cost_usd` come back empty. Do not read "cost: not reported" as
   zero spend.
2. The key's own counters — `GET /api/v1/key` (`usage_daily`, `usage`) and
   `GET /api/v1/credits` (`total_usage`). These are the only reliable measure.
   They update coarsely and can settle late, so bracket a run rather than
   expecting an exact per-image figure.

Recipe:

```bash
curl -s -H "Authorization: Bearer $OPENROUTER_API_KEY" https://openrouter.ai/api/v1/key \
  | python3 -c 'import json,sys; d=json.load(sys.stdin)["data"]; print(d["usage_daily"], d["usage"], d["limit_remaining"])'
```

Note the key-level guardrail too: this key has a lifetime limit ($20) separate
from any daily budget, and a nearly exhausted key fails mid-batch.

## Relationship to the app

`generate-image.sh --spec` reproduces `runImageStage`
(`apps/web/src/lib/server/api.ts`): same compiler, same registry, same reference
resolution against `UNIVERSE_ROOT`, same 2K request. What the script adds is
terminal access, a dry run, and the sidecar; what it drops is the artifact row
and the `production_jobs` status updates, which is the point of the migration.

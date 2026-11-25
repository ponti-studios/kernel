# Provider usage metadata

Where each OpenRouter response says what a call cost, and how the studio reads it once.

## Per-modality shapes

| Endpoint                 | Cost lives in                           | Units                                                | Notes                                                                                                                                |
| ------------------------ | --------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| chat completions         | `usage.cost`                            | `prompt_tokens`, `completion_tokens`, `total_tokens` | the SDK may camelCase the fields; the reader accepts both casings                                                                    |
| images (`/images`)       | `usage.cost`                            | `completion_tokens_details.image_tokens`             | snake_case; the `X-Generation-Id` header is the id; `/generation` returns 404 for images                                             |
| video (async `/videos`)  | `usage.cost`, on the **completed poll** | seconds, from the request                            | submit returns `{id, polling_url}` only; cost appears when the job finishes                                                          |
| speech (`/audio/speech`) | generation record, not the body         | characters (billed)                                  | body is audio bytes; `X-Generation-Id` links to the record; `reprice-speech` reads the real cost when the record wasn't ready at call time |

## One reader

`scripts/lib/usage.mjs` is the only place that parses a `usage` block:

```js
normalizeUsage(raw); // UsageFields | undefined: snake_case or camelCase, undefined if absent
mergeUsage(...blocks); // first reported value per field wins
hasReportedCost(usage); // usage.costUsd !== undefined
```

Rules the reader enforces:

- **Absent stays absent.** A missing field is `undefined`, never `0`. A provider's `0` is a real free
  model and survives as `costUsd: 0`.
- **Non-finite values are ignored.** Strings such as `'free'`, `NaN` and `Infinity` never reach a sum.
- **Both casings.** Image and video arrive as snake_case JSON; chat can arrive camelCased from an SDK.
- **Async costs arrive late.** Read `usage` on every poll and merge, so the completed result carries it.

## Consuming it from a skill

Prefer the reported number and fall back explicitly:

```js
const costUsd = usage?.costUsd; // undefined means unpriced, not free
const estimate = costUsd === undefined && rate ? duration * rate : undefined;
```

Record both possibilities (reported and estimated) and the `cost.source`, rather than one number whose
provenance is unknown.

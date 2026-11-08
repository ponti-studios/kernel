# Provider usage metadata

Where each OpenRouter response tells you what a call cost, and how to read it once.

## Per-modality shapes

| Endpoint                 | Cost lives in                           | Units                                                | Notes                                                                                                                        |
| ------------------------ | --------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| chat completions         | `usage.cost`                            | `prompt_tokens`, `completion_tokens`, `total_tokens` | the SDK camelCases (`promptTokens`), drops nothing, and forces the field names to camelCase even when the wire is snake_case |
| images (`/images`)       | `usage.cost`                            | `completion_tokens_details.image_tokens`             | snake_case; `X-Generation-Id` header is the id (body `id` is not always it); `/generation` **404s** for images               |
| video (async `/videos`)  | `usage.cost`, on the **completed poll** | seconds, from the request                            | submit returns `{id, polling_url}` only; cost appears when the job finishes, minutes later                                   |
| speech (`/audio/speech`) | nothing                                 | characters (billed)                                  | response is audio bytes; `X-Generation-Id` header for reconciliation; price is a published rate, so cost stays an estimate   |

## One reader

`packages/providers/src/usage.ts` — the only place that parses a `usage` block:

```ts
normalizeUsage(raw): UsageFields | undefined   // snake_case or camelCase, undefined if absent
mergeUsage(...blocks): UsageFields | undefined  // first reported value per field wins
hasReportedCost(usage): boolean                // usage.costUsd !== undefined
```

Rules encoded there, each one paid for by a real bug:

- **Absent stays absent.** No `undefined` → `0` coercion anywhere; `0` from the provider is a
  genuine free model and must survive as `{costUsd: 0}`.
- **Ignore anything not a finite number** (`'free'`, `NaN`, `Infinity`) rather than propagating it
  into a sum.
- **Both casings.** Image and video are raw snake_case JSON, chat is camelCased by the SDK;
  a reader that handles one silently drops the other's fields.
- **Async costs arrive late.** A video job is unpriced at submit; read `usage` on every poll and
  merge, so the completed result carries it.

Provider classes take `fetchImpl` in the constructor — that is the seam for tests, not a mock
framework.

## Tests that keep it honest

One per modality, not a matrix:

- **image, with usage** → `costUsd`, token and image-token fields mapped exactly;
- **image, without usage** → `usage` is `undefined` (the regression that matters: an invented
  zero looks like a priced call);
- **video** → a completed poll carrying `usage.cost` surfaces on the result, and a job with no
  usage reports `undefined`;
- **speech** → billed `characters` and the generation id from the header;
- **normaliser** → snake and camel inputs, garbage values, `0` vs absent, `mergeUsage` first-wins.

Run them without the repo-wide sweep:

```bash
cd packages/providers && node ../../node_modules/vitest/vitest.mjs run
```

## Consuming it from a skill

Skills load `packages/providers/dist`, so rebuild the package after touching a reader. Then
prefer the reported number and fall back explicitly:

```js
const { bytes, usage } = await video.generateClipWithUsage(input, { timeoutMs });
const costUsd = usage?.costUsd; // undefined means unpriced, not free
const estimate = costUsd === undefined && rate ? duration * rate : undefined;
```

Write both possibilities into the usage log (`reported_usd`, `estimated_usd`, `unpriced_clips`)
rather than one number whose provenance is unknown, and record `cost_source` per item.

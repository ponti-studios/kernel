# Studio core

The shared library bundled into writing-workflows and studio-workflows: OpenRouter providers (text,
image, video, speech), usage parsing, the one user-config parser, and the
ffmpeg/ffprobe helpers for the video stage.

**No npm dependencies.** ESM only, Node 24 built-ins (`fetch`, `node:fs`,
`node:path`, `node:os`, `node:child_process`, `node:crypto`). No build step, no
repo checkout: copy the directory and it runs.

## When to use

Use when calling OpenRouter from a studio skill — generating text, images,
video clips or speech — or when a skill needs provider cost, the user config
file, or the ffmpeg assembly helpers.

## Layout

| File                     | Exports                                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/lib/config.mjs` | `parseUserConfig`, `fileConfig`, `setting`, `userConfigPath`, `configFileIsGroupOrWorldReadable`, `applyUserConfig`, `apiKey`, `loadEnv`, `envDefaults` |
| `scripts/lib/usage.mjs`  | `normalizeUsage`, `mergeUsage`, `hasReportedCost`                                                                                                       |
| `scripts/lib/text.mjs`   | `OpenRouterTextModel`, `OpenRouterError`                                                                                                                |
| `scripts/lib/images.mjs` | `OpenRouterImageModel`, `OpenRouterImageError`                                                                                                          |
| `scripts/lib/video.mjs`  | `OpenRouterVideoModel`, `OpenRouterVideoError`                                                                                        |
| `scripts/lib/speech.mjs` | `OpenRouterSpeechModel`, `OpenRouterSpeechError`                                                                                                        |
| `scripts/speak.mjs` | CLI: one utterance; JSON on stdin, audio file out. The single speech entrypoint (tower-bridge calls it per turn). |
| `scripts/lib/ledger.mjs` | `appendEvent`, `registerAsset`, `readEvents`, `readAssets`: the append-only spend and asset ledger (~/.studio) |
| `scripts/lib/prices.mjs` | `PRICE_BOOK`, `estimateImage`, `estimateText`: list prices, used only for backfilled logs |
| `scripts/lib/backfill.mjs` | imports usage logs into the ledger |
| `scripts/lib/cli.mjs` | `studio-ledger` CLI: emit, asset, index, report, verify, backfill, gc. See LEDGER.md |
| `scripts/lib/ledger-bridge.mjs` | `recordRender({tool, ...})`: records a generated render; never throws, so bookkeeping cannot stop a render |
| `scripts/lib/reprice-speech.mjs` | `repriceSpeech`: prices speech calls that were recorded before their generation record existed; each price is a repricing event, and reruns add nothing |
| `scripts/lib/media.mjs`  | `probeDuration`, `contactSheet`, `assembleVideo`, `defaultRun`                                                                                          |

Speech defaults to `google/gemini-3.8-flash-lite-tts` and DEFAULT_VOICE_ID to `Despina`. Gemini only returns PCM, so `speech.mjs` converts it to mp3 for the caller unless `responseFormat: "pcm"` is passed.

Speech errors carry a `code`: `empty`, `voice` (a voice that does not fit the model; Gemini names only work with `google/*` models and the reverse), `format` (a pcm body that is not whole 16-bit samples), `ffmpeg` (not on PATH, needed to convert Gemini PCM), `network`, `credits`, `http`. `scripts/speak.mjs` prints `{"error": {"code", "message"}}` to stderr and exits 1, with `usage` for bad input and `config` for a missing key. The voice-model check runs in `scripts/speak.mjs` (the entrypoint for tower-bridge and other tools); library callers pass voices through unchanged. Set the speech model and `DEFAULT_VOICE_ID` together.

Every model takes an injectable fetch as its last constructor argument, so a
caller (or a test) can pass a stub: `new OpenRouterImageModel(key, model, fakeFetch)`.
Defaults are `globalThis.fetch`.

## Config: one rule

Two sources only — the environment, and one file (`~/.pontistudios.studio.yml`,
or `$STUDIO_CONFIG`). Flat `key: value` lines, `#` comments, `~` expansion at the
start of a value and after a scheme (`file:~/x`).

    env var  >  config-file key  >  default

`setting(envName, key, fallback)` is the lookup; `loadEnv()` returns the whole
environment with the app's defaults; `apiKey()` reads `OPENROUTER_API_KEY` then
`openrouter_api_key` and warns when the file is group/world readable.

## Errors

Every provider throws one error class carrying a `code` a skill can branch on:

| code                             | meaning                                                  |
| -------------------------------- | -------------------------------------------------------- |
| `network`                        | fetch itself failed (DNS, socket, abort)                 |
| `http`                           | non-2xx, or an error body; text keeps `http` for 402 too |
| `credits`                        | 402 on image, video and speech                           |
| `shape`                          | the response is missing what the endpoint promises       |
| `empty`                          | no content / no bytes                                    |
| `failed`, `cancelled`, `expired` | video job terminal states                                |
| `timeout`                        | video job still running at the deadline                  |

## Usage: absent is not zero

`normalizeUsage()` reads raw snake_case and camelCase blocks alike and returns
`undefined` when the provider reported nothing. **A missing cost stays missing**
— never coerce it to `0`, or "unpriced" becomes indistinguishable from "free".
`hasReportedCost(usage)` is the only test for "the provider gave us a price".

For video, the cost arrives on the **poll**, not the submit:
`generateClipWithUsage()` merges submit and poll usage, first reported value wins.

## Tests

    node --test            # 82 tests across 7 files, from this skill directory
    node --test "test/*.test.mjs"

Tests stub `globalThis.fetch`; none of them touch the network, ffmpeg, or the
user's real config file.

> On Node 24.18 a bare directory argument (`node --test test/`) is resolved as a
> module path and fails with `Cannot find module …/test`. Use `node --test`
> (auto-discovery picks up `test/*.test.mjs`) instead.

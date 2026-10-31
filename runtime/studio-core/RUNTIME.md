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

| File | Exports |
|---|---|
| `scripts/lib/config.mjs` | `parseUserConfig`, `fileConfig`, `setting`, `userConfigPath`, `configFileIsGroupOrWorldReadable`, `applyUserConfig`, `apiKey`, `loadEnv`, `envDefaults` |
| `scripts/lib/usage.mjs` | `normalizeUsage`, `mergeUsage`, `hasReportedCost` |
| `scripts/lib/text.mjs` | `OpenRouterTextModel`, `OpenRouterError` |
| `scripts/lib/images.mjs` | `OpenRouterImageModel`, `OpenRouterImageError` |
| `scripts/lib/video.mjs` | `OpenRouterVideoModel`, `OpenRouterVideoError`, `CHARACTER_LOCK` |
| `scripts/lib/speech.mjs` | `OpenRouterSpeechModel`, `OpenRouterSpeechError` |
| `scripts/lib/media.mjs` | `probeDuration`, `contactSheet`, `assembleVideo`, `defaultRun` |

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

| code | meaning |
|---|---|
| `network` | fetch itself failed (DNS, socket, abort) |
| `http` | non-2xx, or an error body; text keeps `http` for 402 too |
| `credits` | 402 on image, video and speech |
| `shape` | the response is missing what the endpoint promises |
| `empty` | no content / no bytes |
| `failed`, `cancelled`, `expired` | video job terminal states |
| `timeout` | video job still running at the deadline |

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

---
name: studio-imagegen
description: "Use when generating a frame image from a Ponti Studios frame spec, with character references attached. Compiles the spec, renders it, reports real spend."
license: MIT
metadata:
  author: project
  version: "1.0"
  category: Creative
  tags:
    - ponti-studios
    - image-generation
    - frame-spec
---

# Studio Imagegen — frame spec to image

> **HARD RULES.** Every generated image goes to `$STUDIO_INBOX` (default `~/Pictures/imagegen/_inbox`), named
> `<timestamp>_<model>_<what>` (timestamp first, so the inbox sorts) — the renderer does this by default. And **no model
> judges an image**: never run image analysis, scoring or quality checks on generated
> output. Report model, prompt hash, size and cost; the user judges quality.


The studio image stage, driven from the terminal: compile a frame spec into its
prompt, attach the spec's character reference plates, generate, save.

## When to use

- Rendering any frame of a set from its frame spec.
- Re-rendering a frame after a canon or spec change.
- Generating an image from a verbatim prompt (no spec involved).
- Working out what an image costs before committing to a batch.

## Hard rule

**From a spec, the prompt is compiled — never hand-written.** `generate-image.sh
--spec` calls the same `compileSpec` the app calls, so the prompt is
byte-identical to the one the pipeline recorded, and the spec's reference images
are attached automatically. Paraphrasing a character block into a prompt is how
identity drifts (see `studio-universe`).

## Commands

```bash
# preflight — packages, registry, model capabilities, references. Free.
scripts/check-imagegen.sh --spec frame3.json

# see the exact prompt, the hash, and the references with spending nothing
scripts/generate-image.sh --spec frame3.json --dry-run

# the real thing
scripts/generate-image.sh --spec frame3.json --out ~/Pictures/imagegen/_inbox/frame3.png --meta

# cheaper iteration: 1K, and a verbatim prompt when no spec applies
scripts/generate-image.sh --spec frame3.json --resolution 1K
scripts/generate-image.sh --prompt "…" --aspect 4:5 --resolution 1K --format png
```

`--meta` writes a sidecar JSON next to the image: spec path, frame, title,
registry version, prompt sha256, model, aspect, returned format, generation id,
cost (when reported) — the provenance the retired database used to hold.

## What gets sent

Per the spec, mirroring the app's image stage:

| | Value |
|---|---|
| endpoint | `POST /api/v1/images` (raw JSON with base64 output) |
| model | `--model`, else `OPENROUTER_IMAGE_MODEL` (default `qwen/qwen-image-2.1-turbo`) |
| prompt | `compileSpec(spec, registry, universeRoot)` |
| references | each `spec.references` path, resolved against the universe root, as base64 data URLs with the MIME from the extension |
| aspect | `spec.master.aspect_ratio` (override with `--aspect`) |
| resolution | `2K` by default (override with `--resolution`; qwen turbo supports 1K and 2K, **not 4K**) |
| format | `webp` requested, but the returned bytes are trusted — a request for webp can come back `png`, and the file is named accordingly |

## Cost — measured, with caveats

- **Cost is reported by the provider, in the response body.** `POST /api/v1/images`
  returns a `usage` block with `cost`, so the script prints e.g. `cost: $0.0184`
  and the ledger records it as `reported`, not estimated. `/api/v1/generation` does
  **404** for images — asking it instead of reading the response is what made every
  render look unpriced. Never fall back to it; absent means unpriced, not free.
- Measured, 2K with 1–3 attached references: `qwen/qwen-image-2.1-turbo` **$0.0184**,
  `bytedance-seed/seedream-5-0-flash` **$0.018**, `seedream-5-0-pro` **$0.051**.
  Reference count did not move the price on qwen across 1–3 refs.
- qwen accepts at most **4** references; 6 returns HTTP 400. For a three-character
  frame, attach one reference per character.
- For scale: video clips are $0.084/second (`studio-mediagen`), so an 8s clip ≈ $0.67.

Check the key before a batch:
`curl -H "Authorization: Bearer $OPENROUTER_API_KEY" https://openrouter.ai/api/v1/key`

## Definition of done

- The image exists, its pixel size matches the requested resolution (2K 4:5
  renders 1640×2048; 1K renders 820×1024), and any sidecar records the prompt
  hash and registry version that produced it.
- A log entry exists in `~/.hominem/ai_usage/` (`-imagegen.json`).
- Nothing was hand-written into the prompt.

## References

- `references/output-and-provenance.md` — sidecar fields, format/parallels with the app, cost measurement recipe.

## Configuration

Everything is an environment variable with a working default, so the skill runs on a fresh machine once `STUDIO_ROOT` points at a studio checkout.

All of these can be set once in `~/.pontistudios.studio.yml` (key names: `inbox`, `usage_dir`, `studio_root`, `model_image`, `openrouter_api_key`) instead of exported; an environment variable still wins over the file.

| Variable | Default | Used for |
|---|---|---|
| `STUDIO_ROOT` | the skills directory | only overrides where the sibling skills are found; every studio skill locates the others relative to itself |
| `STUDIO_UNIVERSE_ROOT` | `$STUDIO_ROOT/universe` | registry and bibles |
| `STUDIO_INBOX` | `~/Pictures/imagegen/_inbox` | where rendered images are written and named |
| `STUDIO_USAGE_DIR` | `~/.hominem/ai_usage` | one JSON per model call |
| `OPENROUTER_API_KEY` | env → `openrouter_api_key` in the config file | every model call |

Module overrides (`STUDIO_PROVIDERS_ENTRY`, `STUDIO_EDITORIAL_ENTRY`, `STUDIO_CONFIG_ENTRY`, `STUDIO_UNIVERSE_ENTRY`) point at built `dist/index.js` files when the layout differs.

## Pitfalls

- Asking for `webp` and getting `png` is normal, not a failure. The script
  follows the returned `media_type` and renames the output.
- `--spec` and `--prompt` are mutually exclusive: a spec is compiled, a prompt
  is used verbatim. Passing both is rejected rather than silently preferring one.
- Missing reference plates abort the run before spending, naming each missing
  path — a character generated *without* their plates is the failure this
  prevents.
- `qwen/qwen-image-2.1-turbo` supports 4:5 (which universe specs use) but only
  1K/2K; `--resolution 4K` will fail on this model. `google/gemini-3-pro-image`
  supports 4K — but that model is ruled out on cost (see
  `openrouter-image-generation`), so prefer a different model or stay at 2K.
- The registry version is recorded per image, so a render can be traced back to
  the canon state that produced it — keep the sidecar when a frame matters.

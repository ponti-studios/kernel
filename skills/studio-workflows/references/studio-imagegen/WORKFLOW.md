# Studio Imagegen — frame spec to image

> **HARD RULES.** Every generated image goes to `$STUDIO_INBOX` (default `~/Documents/studio/output/images`), named
> `<timestamp>_<model>_<what>` (timestamp first, so the inbox sorts) — the renderer does this by default. And **no model
> judges an image**: never run image analysis, scoring or quality checks on generated
> output. Report model, prompt hash, size and cost; the user judges quality.

The studio image stage, driven from the terminal: compile a frame spec into its
prompt, attach the spec's character reference plates, generate, save.

## Hard rule

**From a spec, the prompt is compiled — never hand-written.** `generate-image.sh
--spec` calls the same `compileSpec` the app calls, so the prompt is
byte-identical to the one the pipeline recorded, and the spec's reference images
are attached automatically. Paraphrasing a character block into a prompt is how
identity drifts (see [studio-universe](../studio-universe/WORKFLOW.md)).

## Commands

```bash
# preflight — packages, registry, model capabilities, references. Free.
scripts/check-imagegen.sh --spec frame3.json
# preflight a JSON array or newline-delimited list of specs in one capability lookup
scripts/check-imagegen.sh --specs frames.json --resolution 2K

# see the exact prompt, the hash, and the references with spending nothing
scripts/generate-image.sh --spec frame3.json --dry-run

# the real thing
scripts/generate-image.sh --spec frame3.json --out ~/Documents/studio/output/images/frame3.png --meta

# cheaper iteration: 1K, and a verbatim prompt when no spec applies
scripts/generate-image.sh --spec frame3.json --resolution 1K
scripts/generate-image.sh --prompt "…" --aspect 4:5 --resolution 1K --format png
# opt in to cached JPEG reference plates (≤1024px, quality 88)
scripts/generate-image.sh --spec frame3.json --stage-refs --dry-run
```

`--meta` writes a sidecar JSON next to the image: spec path, frame, title,
registry version, prompt sha256, model, aspect, returned format, generation id,
cost (when reported) — the provenance the retired database used to hold.

## What gets sent

Per the spec, mirroring the app's image stage:

|            | Value                                                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| endpoint   | `POST /api/v1/images` (raw JSON with base64 output)                                                                              |
| model      | `--model`, else `OPENROUTER_IMAGE_MODEL` (default `qwen/qwen-image-2.1-turbo`)                                                   |
| prompt     | `compileSpec(spec, registry, universeRoot)`                                                                                      |
| references | each `spec.references` path, resolved against the universe root, as base64 data URLs with the MIME from the extension            |
| aspect     | `spec.master.aspect_ratio` (override with `--aspect`)                                                                            |
| resolution | `2K` by default (override with `--resolution`; qwen turbo supports 1K and 2K, **not 4K**)                                        |
| format     | `webp` requested, but the returned bytes are trusted — a request for webp can come back `png`, and the file is named accordingly |

## Cost — measured, with caveats

- **Cost comes from the response body.** When `POST /api/v1/images` returns a
  `usage` block with `cost`, the script prints e.g. `cost: $0.0184`, writes
  `cost_usd` with `cost_source: "reported"` to the sidecar and usage log, and the
  ledger event records it as `reported`. Without that block the script asks
  `/api/v1/generation`, which **404s** for images, so the render is recorded as
  unpriced (`cost_usd: null`, ledger source `unknown`). Absent means unpriced,
  not free; bracket the key counters
  ([output-and-provenance.md](references/output-and-provenance.md)) when it matters.
- Measured, 2K with 1–3 attached references: `qwen/qwen-image-2.1-turbo` **$0.0184**,
  `bytedance-seed/seedream-5-0-flash` **$0.018**, `seedream-5-0-pro` **$0.051**.
  Reference count did not move the price on qwen across 1–3 refs.
- qwen accepts at most **4** references; 6 returns HTTP 400. For a three-character
  frame, attach one reference per character.
- For scale: video clips are $0.084/second ([studio-videogen](../studio-videogen/WORKFLOW.md)), so an 8s clip ≈ $0.67.

Check the key before a batch:
`curl -H "Authorization: Bearer $OPENROUTER_API_KEY" https://openrouter.ai/api/v1/key`

## Definition of done

- The image exists, its pixel size matches the requested resolution (2K 4:5
  renders 1640×2048; 1K renders 820×1024), and any sidecar records the prompt
  hash and registry version that produced it.
- An entry exists in `$STUDIO_USAGE_DIR` (`<timestamp>-imagegen.json`), and the
  run printed a `ledger:` event line (the bridge reports, not blocks, a ledger failure).
- Nothing was hand-written into the prompt.

## References

- [output-and-provenance.md](references/output-and-provenance.md) — sidecar fields, format/parallels with the app, cost measurement recipe.

## Configuration

Provider modules and schemas are bundled; no Studio checkout or dist-module
path overrides are required. Environment variables override keys in
`~/.pontistudios.studio.yml` (or `STUDIO_CONFIG`).

| Variable                 | Configuration key    | Used for                                                        |
| ------------------------ | -------------------- | --------------------------------------------------------------- |
| `STUDIO_USAGE_DIR`       | `usage_dir`          | usage JSON output                                               |
| `OPENROUTER_API_KEY`     | `openrouter_api_key` | authorized provider calls                                       |
| `STUDIO_INBOX`           | `inbox`              | generated image output                                          |
| `STUDIO_UNIVERSE_ROOT`   | `universe_root`      | alternate registry/bibles; default is the bundled Universe data |
| `OPENROUTER_IMAGE_MODEL` | `model_image`        | image model                                                     |
| `STUDIO_LEGS`            | —                    | set to `off` to disable provider retries                        |
| `STUDIO_STAGE_DIR`       | —                    | staged reference cache (default `~/.cache/studio/refs/`)        |

Reference staging is opt-in with `--stage-refs` for `generate-image`; it caches
by file content and staging parameters. If neither `sharp` nor ImageMagick is
available, the original bytes are sent and each run reports `staged: passthrough`.
Keep staging opt-in until a staged/full-size canon frame has been compared.
`--no-stage-refs` explicitly selects full-size references and cannot be combined
with `--stage-refs`.
`check-imagegen --specs` accepts either a JSON array of spec paths or one path
per line. It compiles each spec, checks its references and requested aspect and
resolution, and fetches model capabilities once for the batch.

Scene-based video keyframes are orchestrated by
[studio-videogen](../studio-videogen/WORKFLOW.md); this skill owns generic still
generation and reference handling.

## Pitfalls

- Asking for `webp` and getting `png` is normal, not a failure. The script
  follows the returned `media_type` and renames the output.
- `--spec` and `--prompt` are mutually exclusive: a spec is compiled, a prompt
  is used verbatim. Passing both is rejected rather than silently preferring one.
- Missing reference plates abort the run before spending, naming each missing
  path — a character generated _without_ their plates is the failure this
  prevents.
- `qwen/qwen-image-2.1-turbo` supports 4:5 (which universe specs use) but only
  1K/2K; `--resolution 4K` will fail on this model. `google/gemini-3-pro-image`
  supports 4K but is ruled out as a workhorse on cost (decision recorded in
  [costs-and-capabilities.md](../image-model-craft/references/costs-and-capabilities.md)),
  so stay at 2K or pick another model.
- The registry version is recorded per image, so a render can be traced back to
  the canon state that produced it — keep the sidecar when a frame matters.

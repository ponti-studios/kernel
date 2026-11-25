# Studio Videogen — plan, generate and deliver video

The media half of Ponti Studio: per-scene narration, one silent clip per scene,
then assembly into a single video. Driven from the terminal instead of the
studio.

Read [production.md](references/production.md) for the production sequence, keyframe hosting and timing. Use approved writing from writing-workflows. This procedure owns scene-based keyframe generation; generic still-image rendering and reference handling live in [studio-imagegen](../studio-imagegen/WORKFLOW.md), and character canon comes from [studio-universe](../studio-universe/WORKFLOW.md). Watch and approve the animatic before motion generation. Text-to-video requires explicit `--text-to-video` and is an alternative when keyframe continuity is not required.

## The pipeline

```
scenes (editorial stage, or a scenes.json)
   ↓  voiceover.sh      one mp3 per scene, only for scenes that have a voiceover
   ↓  keyframes.sh      one still per scene, prompt or compiled from a Universe spec
   ↓  animatic.sh       free timing and camera review
   ↓  clips.sh          one SILENT mp4 per scene  ← the expensive stage
   ↓  assemble.sh       concat clips + lay narration over them
final mp4
```

`voiceover.sh` writes one mp3 per scene so a single line can be re-recorded. `assemble.sh` aligns those files to the actual clip durations and writes the working mix beside the cut as `final.mix.wav`; it can also accept a single pre-mixed audio file.

Clips carry no audio by design (`generateAudio: false`): narration is laid over
the assembled footage at the end, so sound is decided once rather than per clip.

## Costs — read before running clips

The video stage is **two orders of magnitude more expensive** than everything
else in this skill set:

|                                                           | Rate                       | A typical scene                      |
| --------------------------------------------------------- | -------------------------- | ------------------------------------ |
| `kwaivgi/kling-v3.0-std` video                            | **$0.084 / second** silent | 8s default = **$0.67**               |
| same model, with audio                                    | $0.126 / second            | not used here                        |
| Speech                                                    | provider-dependent          | check the provider price             |

So a three-scene set with default 8-second clips is roughly **$1.60-2.00** in
video alone, and an iteration that regenerates a set five times is real money.
`clips.sh` therefore:

- **is a dry run until `--yes`** — no accidental spend;
- prints the per-clip and total estimate from the model's own published rate;
- supports `--only <sceneId>` so a prompt can be iterated for one clip's cost.

`check-media.sh` spends nothing and is the right first command.

## Commands

```bash
# 0. preflight — binaries, models, voices, scenes file. Free.
scripts/check-media.sh --scenes scenes.json

# 1. narration — dry run by default; --yes authorizes synthesis
scripts/voiceover.sh --scenes scenes.json --out ~/Documents/studio/output/voiceover
scripts/voiceover.sh --scenes scenes.json --out ~/Documents/studio/output/voiceover --yes

# 2. measure recorded lines before choosing clip lengths
scripts/timings.sh --scenes scenes.json --voiceover ~/Documents/studio/output/voiceover

# 3. keyframes — dry run by default; --yes generates stills, one per scene
scripts/keyframes.sh --scenes scenes.timed.json --out ~/Documents/studio/output/keyframes
scripts/keyframes.sh --scenes scenes.timed.json --out ~/Documents/studio/output/keyframes --yes

# 4. watch and approve the free animatic before buying motion
scripts/animatic.sh --scenes scenes.timed.json --keyframes keyframes/ \
                    --voiceover ~/Documents/studio/output/voiceover --out animatic.mp4

# 5. clips — dry run first, always. Pass --keyframes for image-to-video:
#    each still is published to R2 and anchors its shot's first frame.
scripts/clips.sh --scenes scenes.timed.json --keyframes keyframes/      # estimate only
scripts/clips.sh --scenes scenes.timed.json --keyframes keyframes/ --animatic animatic.mp4 --animatic-approved --yes
scripts/clips.sh --scenes scenes.json --only scene-2 --text-to-video --yes # iterate one scene
scripts/clips.sh --scenes scenes.json --text-to-video --yes # the whole set

# 5a. while testing a prompt or spec, cap every clip at 10 seconds. The scenes file keeps
#     its full lengths; only the paid clips are shortened. Start with one scene. Assembly rejects capped takes
#     unless --allow-test-clips is passed for a preview.
scripts/clips.sh --scenes scenes.json --only scene-1 --max-seconds 10 --text-to-video --yes

# 4b. budget ceiling: --budget <usd> caps the batch. Each clip is estimated first (per-second rate,
#     or the priciest earlier run of that model in the ledger); a clip that would pass the cap is
#     skipped, and a clip with no estimate at all is refused. Nothing is bought over the cap.
scripts/clips.sh --scenes scenes.json --text-to-video --budget 2.00 --yes

# 5b. vertical (TikTok / Reels): render the animatic with --aspect 9:16;
#     --vertical sets 9:16 on every generated clip
scripts/clips.sh --scenes scenes.json --vertical            # estimate
scripts/clips.sh --scenes scenes.json --vertical --text-to-video --yes

# 6. assemble
scripts/assemble.sh --clips ~/Documents/studio/output/clips \
                    --voiceover ~/Documents/studio/output/voiceover \
                    --out ~/Documents/studio/output/final.mp4 \
                    --scenes scenes.json --contact-sheet

# 7. captions — burn each scene's voiceover line onto the cut, timed to the scene.
#    Free. Uses ImageMagick for the text (this ffmpeg has no drawtext).
scripts/captions.sh --video ~/Documents/studio/output/final.mp4 --scenes scenes.timed.json \
                    --clips ~/Documents/studio/output/clips \
                    --out ~/Documents/studio/output/final-captioned.mp4 --position bottom

# 8. Deliver the approved picture (or final-captioned.mp4) and mix to an empty directory.
scripts/deliver.sh --video ~/Documents/studio/output/final.mp4 \
                   --audio ~/Documents/studio/output/final.mix.wav --out delivery/
```

`assemble.sh` accepts `--delay-ms` for a single audio file (default 800ms) and `--dry-run`. Per-scene narration is aligned to each clip with no global delay. Captions measure the same selected clips; use the clips that produced the cut.

## Scene shape

`scenes.json` is an editorial **scenes** draft: a top-level array or an object containing `scenes` or `draft`, validated against `scenesDraftSchema`. Timing requires an audio file for every spoken scene and preserves relative spec references when writing to another directory.

| Field              | Required | Used by                                                          |
| ------------------ | -------- | ---------------------------------------------------------------- |
| `id`               | yes      | output filenames (`<id>.mp3`, `<id>.mp4`) and concat order       |
| `prompt`           | one of   | the clip prompt, used verbatim                                   |
| `spec`             | one of   | path to a frame spec; the prompt is compiled from canon (studio-universe). Use this for character scenes |
| `references`       | no       | image paths relative to the scenes file for a verbatim-prompt keyframe |
| `voiceover`        | no       | narration text; scenes without one are skipped by `voiceover.sh` |
| `voice`            | no       | `peter` / `stewie`, or falls back to `DEFAULT_VOICE_ID`          |
| `voice_id`         | no       | an explicit provider voice id; wins over `voice`                 |
| `duration_seconds` | no       | clip length, defaulted to 8s when absent                         |
| `seed`             | no       | passed through when set — see Pitfalls                           |

## Rules, checks and the run log

The video rules live in `rules/video-rules.json` (143 entries, IDs as in the rulebook:
R01–R108, addenda R80A–W, gold rules G1–G12).

- **Before any spend**, `clips.sh` runs the automatic checks (`scripts/lib/rules-lint.mjs`)
  on every scene and checks the model's catalogue: duration, aspect, seed and negative-prompt
  support. Warnings print with their rule IDs. `--strict` blocks submission on any warning.
- **Every clip** writes a run record to `~/Documents/studio/runtime/video-runs.jsonl`: prompt
  and hash, keyframe, seed, negative prompt, settings, lint findings, cost, output path. Each take stays under `output/clips/takes/`; `selection.json` records the current take for each scene.
- **Rate a run** from the frames, never from a model:
  `scripts/runs.sh rate <runId> --score 1-5 --notes "…" --fail R36 --pass R23`
- **See what works:** `scripts/runs.sh report --by model` ranks model, aspect and length.
  `scripts/runs.sh report --by rule` shows whether a flagged rule predicts a lower score. A rule
  that doesn't predict anything earns no place in the linter.

Models: `bytedance/seedance-2.0-mini` (cheapest Seedance, 480p/720p), `bytedance/seedance-2.0`
(1080p and 4K too), `kwaivgi/kling-v3.0-std` (the only one with a negative prompt here).
Seedance bills per token; until a reliable estimate is supported, paid submissions for unpriced models are refused.

## Definition of done

- Every scene in the set has an mp3 (or no voiceover to speak) and an mp4.
- `assemble.sh` reports `truncated: no`; if it reports YES, the narration is
  being cut and the cut is not finished — trim the narration or add footage.
- Check the provider-reported clip costs against the estimate; missing usage is recorded as unpriced, not free.
- `$STUDIO_USAGE_DIR` has the entries (`-mediagen-voiceover`, `-mediagen-clips`,
  `-mediagen-assemble`), and each keyframe render has a ledger event. Only
  keyframes go through the ledger bridge today; a bridge failure prints
  `ledger: …` and does not stop the run.

## References

- [pipeline.md](references/pipeline.md) — exact provider params, voice routing, assembly internals.

## Configuration

Provider modules and schemas are bundled; no Studio checkout or dist-module
path overrides are required. Environment variables override keys in
`~/.pontistudios.studio.yml` (or `STUDIO_CONFIG`).

| Variable                  | Configuration key    | Used for                  |
| ------------------------- | -------------------- | ------------------------- |
| `STUDIO_USAGE_DIR`        | `usage_dir`          | usage JSON output         |
| `STUDIO_UNIVERSE_ROOT`    | `universe_root`      | alternate canon for spec-based keyframes and clips |
| `OPENROUTER_API_KEY`      | `openrouter_api_key` | authorized provider calls |
| `OPENROUTER_IMAGE_MODEL`  | `model_image`        | keyframe image model      |
| `OPENROUTER_VIDEO_MODEL`  | `model_video`        | video model               |
| `OPENROUTER_SPEECH_MODEL` | `model_speech`       | narration model           |

## Pitfalls

- **Assembly is `-shortest`.** If narration outruns the footage the narration can be cut. Assembly checks scene and total durations and refuses to encode when audio overruns the picture.
- **Kling v3.0 std advertises `seed: false`.** The model record does not support
  seeds, so a scene carrying `seed` may be ignored or rejected. Untested (a
  verification clip costs $0.25+) — leave `seed` off until proven.
- Clip prompts are used verbatim (`prompt`) or compiled from canon (`spec`).
  Keyframes use the same scene input: `spec` compiles canon through Universe and
  resolves its references from the Universe root; `prompt` is used verbatim and
  optional `references` are resolved from the scenes file. Character scenes
  should use a `spec` and make their keyframe from that same spec. There is no
  appended character lock: it described a single character.
- `--vertical` (or `--aspect 9:16`) makes the clips TikTok/Reels shape. Kling
  accepts 16:9 and 9:16 here.
- Per-scene failures are collected so other selected scenes can run; any failure makes the command exit nonzero. Check `generated: N/M` and the log's `failed` list.
- `assemble.sh` orders clips by the scene order when `--scenes` is given,
  otherwise alphabetically — with ids like `scene-10` and `scene-2` alphabetical
  order is wrong, so pass `--scenes`.

Cost comes from the provider: `generateClipWithUsage()` returns `usage.costUsd` when OpenRouter reports it (the poll response carries it). The rate table is only a fallback for a job that finished unpriced — never overwrite a reported cost with an estimate.

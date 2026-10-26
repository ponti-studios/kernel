---
name: studio-mediagen
description: "Use when generating voiceover, video clips, or the assembled cut for a Ponti Studios scene set. Runs the scene-to-video pipeline headlessly with real cost estimates."
license: MIT
metadata:
  author: project
  version: "1.0"
  category: Creative
  tags:
    - ponti-studios
    - video
    - voiceover
    - ffmpeg
---

# Studio Mediagen — scenes to voiceover to clips to a cut

The media half of Ponti Studio: per-scene narration, one silent clip per scene,
then assembly into a single video. Driven from the terminal instead of the
studio.

## When to use

- Turning a scene set (or an editorial shot list) into audio and video.
- Re-doing one scene's voiceover or one clip without regenerating the set.
- Assembling a cut, or checking whether a cut will truncate the narration.
- Answering "what will this cost?" before spending.

## The pipeline

```
scenes (editorial stage, or a scenes.json)
   ↓  voiceover.sh      one mp3 per scene, only for scenes that have a voiceover
   ↓  clips.sh          one SILENT mp4 per scene  ← the expensive stage
   ↓  assemble.sh       concat clips + lay narration over them
final mp4
```

`voiceover.sh` writes one mp3 per scene so a single line can be re-recorded, then joins
them in scene order into `<out>/vo.mp3` — the narration track. `assemble.sh` accepts either
that file or the whole directory and joins it the same way.

Clips carry no audio by design (`generateAudio: false`): narration is laid over
the assembled footage at the end, so sound is decided once rather than per clip.

## Costs — read before running clips

The video stage is **two orders of magnitude more expensive** than everything
else in this skill set:

| | Rate | A typical scene |
|---|---|---|
| `kwaivgi/kling-v3.0-std` video | **$0.084 / second** silent | 8s default = **$0.67** |
| same model, with audio | $0.126 / second | not used here |
| `elevenlabs/eleven-multilingual-v2` speech | $0.00008 / prompt token | a short line is a fraction of a cent |
| text skills (`studio-script`, `studio-essay`, …) | — | ~$0.0005 per draft |

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

# 0b. exact timings — measure the narration, set the shot lengths (needs step 1 audio)
scripts/timings.sh --scenes scenes.json --voiceover ~/Documents/studio-media/voiceover

# 0c. the animatic gate — stills cut to narration, free, watch it before buying motion
scripts/animatic.sh --scenes scenes.timed.json --keyframes <keyframes dir> \
                    --voiceover ~/Documents/studio-media/voiceover --out animatic.mp4

# 1. narration (skips scenes with no voiceover)
scripts/voiceover.sh --scenes scenes.json --out ~/Documents/studio-media/voiceover

# 2. clips — dry run first, always. Pass --keyframes for image-to-video:
#    each still is published to R2 and anchors its shot's first frame.
scripts/clips.sh --scenes scenes.json                                  # estimate only
scripts/clips.sh --scenes scenes.timed.json --keyframes keyframes/ --yes
scripts/clips.sh --scenes scenes.json --only scene-2 --yes # iterate one scene
scripts/clips.sh --scenes scenes.json --yes                # the whole set

# 3. assemble
scripts/assemble.sh --clips ~/Documents/studio-media/clips \
                    --voiceover ~/Documents/studio-media/voiceover \
                    --out ~/Documents/studio-media/final.mp4 \
                    --scenes scenes.json --contact-sheet
```

`assemble.sh` accepts `--delay-ms` (default 800ms of silence before narration
starts) and `--dry-run`.

## Scene shape

`scenes.json` is the editorial **scenes** draft: a top-level array, validated
against `scenesDraftSchema`.

| Field | Required | Used by |
|---|---|---|
| `id` | yes | output filenames (`<id>.mp3`, `<id>.mp4`) and concat order |
| `prompt` | yes | the clip prompt (CHARACTER_LOCK is appended automatically) |
| `voiceover` | no | narration text; scenes without one are skipped by `voiceover.sh` |
| `voice` | no | `peter` / `stewie`, or falls back to `DEFAULT_VOICE_ID` |
| `voice_id` | no | an explicit provider voice id; wins over `voice` |
| `duration_seconds` | no | clip length, defaulted to 8s when absent |
| `seed` | no | passed through when set — see Pitfalls |
| `dog` | no | editorial flag, unused here |

## Definition of done

- Every scene in the set has an mp3 (or no voiceover to speak) and an mp4.
- `assemble.sh` reports `truncated: no`; if it reports YES, the narration is
  being cut and the cut is not finished — trim the narration or add footage.
- Nothing overran the estimate: the usage log records the per-second rate, the
  estimate and the actual per-clip durations.
- `~/.hominem/ai_usage/` has the entries (`-mediagen-voiceover`, `-mediagen-clips`,
  `-mediagen-assemble`).

## References

- `references/pipeline.md` — exact provider params, voice routing, assembly internals.

## Configuration

Everything is an environment variable with a working default, so the skill runs on a fresh machine once `STUDIO_ROOT` points at a studio checkout.

All of these can be set once in `~/.pontistudios.studio.yml` (key names: `studio_root`, `usage_dir`, `model_video`, `model_speech`, `openrouter_api_key`) instead of exported; an environment variable still wins over the file.

| Variable | Default | Used for |
|---|---|---|
| `STUDIO_ROOT` | the skills directory | only overrides where the sibling skills are found; every studio skill locates the others relative to itself |
| `STUDIO_USAGE_DIR` | `~/.hominem/ai_usage` | one JSON per model call |
| `OPENROUTER_API_KEY` | env → `openrouter_api_key` in the config file | every model call |

Module overrides (`STUDIO_PROVIDERS_ENTRY`, `STUDIO_EDITORIAL_ENTRY`, `STUDIO_CONFIG_ENTRY`, `STUDIO_UNIVERSE_ENTRY`) point at built `dist/index.js` files when the layout differs.

## Pitfalls

- **Assembly is `-shortest`.** If narration outruns the footage the narration is
  silently cut, so a "finished" cut can be missing its ending. The script warns
  and exits 1 so this is unmissable; do not treat that exit code as cosmetic.
- **Kling v3.0 std advertises `seed: false`.** The model record does not support
  seeds, so a scene carrying `seed` may be ignored or rejected. Untested (a
  verification clip costs $0.25+) — leave `seed` off until proven.
- Clip prompts are `scene.prompt` + `CHARACTER_LOCK`, and the lock is the
  **Wyatt/chibi** design (black oval mask, king and queen neck tattoos, Samba
  sneakers, feet forward). Appending it to a scene whose subject is not that
  character fights the scene prompt. Physical accuracy beats the lock for
  universe characters — use the `studio-universe` compiler for prompt text.
- Per-scene failures are tolerated: `clips.sh` continues and only fails if
  *every* scene fails. Check `generated: N/M` and the log's `failed` list.
- `assemble.sh` orders clips by the scene order when `--scenes` is given,
  otherwise alphabetically — with ids like `scene-10` and `scene-2` alphabetical
  order is wrong, so pass `--scenes`.
- Two ffmpeg builds exist on this machine (Hermes's bundled 9.0.1 wins on PATH
  inside Node, Homebrew's 9.0.2 in a login shell). Assembly uses whichever is
  first on PATH.

Cost comes from the provider: `generateClipWithUsage()` returns `usage.costUsd` when OpenRouter reports it (the poll response carries it). The rate table is only a fallback for a job that finished unpriced — never overwrite a reported cost with an estimate.

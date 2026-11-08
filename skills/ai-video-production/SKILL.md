---
name: ai-video-production
description: "Use when building video with generative AI models."
version: 1.0.0
author: Charles Ponti
license: MIT
metadata:
  author: ponti-studios
  category: Creative
  tags:
    - video
    - generative-ai
    - cost-control
  hermes:
    tags: [video, generative-ai, cost-control]
    related_skills: [studio-mediagen, studio-imagegen, studio-scenes, film-production]
---

# AI video production

Generating a video with models is a production pipeline, not a prompt. The quality difference
between a polished result and a pile of unrelated clips is almost entirely **order of operations**:
every cheap decision is settled before the expensive one is bought.

The Ponti Studio implementation of steps 2, 6 and 8 is `studio-mediagen` (voiceover, clips, assemble);
steps 1, 3 and 4 are `studio-script`, `studio-scenes` and `studio-imagegen`.

## When to use

- Planning any AI-generated video: short film, explainer, social clip, music video, trailer.
- A cut looks wrong — silent ending, truncated narration, a character that changes between shots.
- Deciding which model to use, or whether a shot is worth generating at all.

Not for: editing footage that already exists (`film-production`), or deterministic programmatic
animation (`programmatic-video`).

## The order

| #   | Stage                                                  | Why it sits here                                        | Cost of getting it wrong |
| --- | ------------------------------------------------------ | ------------------------------------------------------- | ------------------------ |
| 1   | Script, approved                                       | everything derives from it                              | negligible               |
| 2   | Narration recorded, as one production asset            | fixes total runtime and every shot length               | cents                    |
| 3   | Shot list timed to that audio                          | durations come from measured speech, not a guess        | negligible               |
| 4   | One keyframe still per shot, with character references | cheapest place to make look decisions                   | ~$0.02/shot              |
| 5   | **Animatic**: stills cut to the narration, approved    | catches dead shots and bad framing before motion exists | free                     |
| 6   | Image-to-video from each keyframe                      | motion inherits a locked look                           | ~$0.08/s                 |
| 7   | Lipsync, where a face speaks                           | needs picture and voice both final                      | model-dependent          |
| 8   | Edit: locked audio, music, SFX, upscale, colour        | sound decided once, at the end                          | cheap                    |

## Rules

- **Narration before motion.** Record the voice first and time shots to it. Durations chosen before
  the audio exists get paid for twice: once in generated footage, once in re-cutting it.
- **Stills before video.** Settle the look on keyframes. Three iterations of a six-shot piece is
  roughly $0.32 in stills against $9 in video.
- **Image-to-video, not text-to-video.** Text-to-video re-invents the subject in every shot — that is
  the mechanism behind character drift, not prompt wording. Animate an approved still instead.
- **Duration is measured, never estimated.** Probe each shot's narration file (`ffprobe -v error -show_entries format=duration -of csv=p=0 line.mp3`) and set the shot to that plus half a second. A characters-per-second constant is still a guess, and it drifts per voice and per line. A shot the model "feels" should be 10s while carrying a 5.6s line is 4.4s of dead air; the same shot carrying a 2.9s line wastes 5.1s.
- **Silent shots are a decision, not a default.** Decide how many shots speak; discovering it at
  assembly means the pacing was never authored.
- **The animatic is the gate — and it moves.** Spend nothing on motion until stills plus narration
  have been watched end to end. Apply each shot's intended camera move to its still: a frame held
  locked for six seconds reads as frozen and cannot tell you whether the shot carries, which is the
  one judgement the gate exists for. A push-in differs ~10% frame-to-frame across its shot; a static
  hold ~0.1%. That requires a shot list carrying `framing` and `camera` per shot, not just a prompt.
- **Every stage that bills is a dry run until told otherwise.** Print the per-shot estimate from the
  model's published rate before submitting, require an explicit `--yes` to spend, and offer `--only
  <shot>` so one shot can be iterated without paying for the set. A pipeline that can spend by
  accident gets run less often than one that cannot.

## Check the provider before promising a shot

Capabilities are per model and they change. Query rather than assume:

```bash
curl -s https://openrouter.ai/api/v1/videos/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
| python3 -c "import sys,json;[print(m['id'], m.get('supported_durations'), m.get('supported_frame_images'), m.get('pricing_skus')) for m in json.load(sys.stdin)['data']]"
```

Three fields decide the plan: `supported_durations` (clip limits), `supported_frame_images`
(`first_frame` / `last_frame` means image-to-video is available), `pricing_skus` (per-second rate,
split by resolution and by audio on/off).

**`frame_images` and `input_references` require a publicly downloadable HTTPS URL.** A local file path
is rejected, so keyframe conditioning needs an asset-serving path before any of it can be promised.
The cheapest path that needs no public bucket is a **presigned GET**: upload the still to S3-compatible
storage (Cloudflare R2), hand the provider a time-limited signed URL, keep the object private. Recipe,
credential shapes and the differential test that proves the signer: `references/keyframe-hosting-and-alignment.md`.

## Pitfalls

- **Video is billed in whole seconds with a minimum.** A 4-second request on a 5-second-floor model is
  charged as 5s — a ~25% penalty on top of getting less footage. Size clips to the narration and
  expect the floor when comparing models.
- **`-shortest` silently eats the ending.** Any mux clamped to the shorter input truncates audio
  without failing. Warn on it, and treat the warning as a failed render.
- **A continuous narration track drifts off the pictures.** Lay each line at its own shot's start by
  padding it to that shot's duration (`-af apad=whole_dur=<seconds> -t <seconds>`), a silent segment
  where a shot has no line, then concat — one track starting at a fixed offset is seconds out by the
  third shot. Verify with
  `ffmpeg -af silencedetect=noise=-35dB:d=0.25 -f null - narration.mp3` — every line should begin
  inside its own shot window.
- **An API token is not an S3 access key.** Cloudflare R2 (and S3 generally) wants a 32-character
  Access Key ID and a 64-character secret; a 34-character `ID…` value is the token's identifier and
  the 53-character REST token cannot sign S3 requests at all. The error names the length, so read it
  as a credential-shape problem rather than an endpoint problem.
- **Native audio in AI clips is a trap for narrated work.** Speech welded into the clip cannot be
  reworded without regenerating the scene, and cannot be mixed under music with intent. Generate
  silent clips and lay narration separately.
- **The cookbook's `frame_images` prose is wrong; the schema is `{type:'image_url', image_url:{url}, frame_type:'first_frame'}`.**
  Sending `{type:'first_frame', url}` returns a Zod 400 that names none of the real fields. If a
  submit 400s, print the response body before touching the payload again.
- **`zoompan` multiplies frames per input frame.** `-loop 1 -t 6.5 -i still` feeding
  `zoompan=d=156` emits 156 output frames for _each_ of the ~160 looped input frames, so a 39-second
  animatic stops finishing at all. Feed one still frame (no `-loop`), let `d` generate the sequence,
  and cap with `-frames:v <seconds*fps>`: seconds, not minutes.
- **The JSON shape line is the contract; prose rules are advisory.** Adding a field to a prompt's rule
  list while leaving the example shape unchanged makes the model omit it silently. Edit the shape in
  the same change, and assert the field appears in one real output before trusting the stage.
- **A clip that "worked" may not be anchored.** Confirm image-to-video actually conditioned the shot
  before judging the take: extract frame 0 and the last frame and compare both against the keyframe.
  Anchored looks like a few percent RMSE at frame 0 and a large divergence by the end — recipe in
  `references/keyframe-hosting-and-alignment.md`.
- **A video probe that returns a bare status hides the real failure.** Provider 4xx bodies carry the
  schema complaint; a swallowed body turns a wrong field name into an afternoon of guessing at a
  payload that was already correct.
- **Upscale last.** Interpolate and upscale after the cut is locked, or you pay it on takes you
  discard.

## References

- `references/model-and-price-notes.md` — measured model table, billing behaviour, iteration
  economics, and the sources this order is distilled from.
- `references/keyframe-hosting-and-alignment.md` — presigned-URL keyframe hosting (SigV4 without an
  SDK, verified against the AWS CLI), audio-derived shot timing, per-shot narration alignment, and
  the free animatic recipe.

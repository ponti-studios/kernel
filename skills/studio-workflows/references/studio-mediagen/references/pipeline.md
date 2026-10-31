# Media pipeline internals

Mirrors the app's `runAudioStage`, `runVideoStage` and `assembleProjectVideo`
(`apps/web/src/lib/server/api.ts`) so the terminal path produces the same
artifacts as the dashboard path.

## Voiceover

- Provider: `openrouter` speech, `POST /api/v1/audio/speech` (OpenAI audio/speech
  compatible). The response is **raw audio bytes**, not JSON.
- Model: `OPENROUTER_SPEECH_MODEL`, default `elevenlabs/eleven-multilingual-v2`.
- Format: mp3, one file per scene, named `<sceneId>.mp3`.
- Scenes with an empty or absent `voiceover` are skipped silently — a scene can
  legitimately be footage only.
- Errors are typed `OpenRouterSpeechError` with codes: `empty` (nothing to say,
  or no audio came back), `network`, `credits` (HTTP 402), `http`.
- Voice routing (`voiceIdForScene`), in order:
  1. `scene.voice_id` — explicit id, always wins;
  2. `scene.voice === 'peter'` → `PETER_VOICE_ID`;
  3. `scene.voice === 'stewie'` → `STEWIE_VOICE_ID`;
  4. `DEFAULT_VOICE_ID` (configured default `pNInz6obpgDQGcFmaJgB`).
  Steps 2 and 3 fall back to the default when their env var is missing or empty,
  so a scene asking for `peter` gets the default voice with no error. On this
  machine both are unset — `check-media.sh` warns.

## Clips

- Provider: `POST /api/v1/videos` → HTTP **202** with `{id, polling_url}`.
  Poll `polling_url` until `status` is `completed`; `failed` / `cancelled` /
  `expired` are terminal errors. Then download `unsigned_urls[0]`.
- Poll interval 15s; timeout 10 minutes (both overridable in code).
- Model: `OPENROUTER_VIDEO_MODEL`, default `kwaivgi/kling-v3.0-std`.
- Request: `{model, prompt: scene.prompt + "\n\n" + CHARACTER_LOCK, duration:
  round(duration_seconds ?? 8), aspect_ratio: '16:9', resolution: '720p',
  generate_audio: false, seed?}`.
- Kling v3.0 std supports durations 3-15s, 720p only, aspect ratios 16:9, 9:16,
  1:1, and advertises `generate_audio: true` (we keep it off), `seed: false`,
  with `negative_prompt` and `cfg_scale` as allowed passthrough parameters.
- `pricing_skus` on the model record: `duration_seconds` $0.084,
  `duration_seconds_with_audio` $0.126.
- Per-scene failures are collected and the loop continues; the stage only throws
  when *every* scene failed.

## Assembly

`assembleVideo` (packages/providers/src/media.ts):

1. `probeDuration` (ffprobe) on the voiceover and each clip.
2. Write a concat list file (`file '<path>'` per line) into tmpdir.
3. One ffmpeg pass: concat demuxer for the clips, the voiceover as the second
   input, `-filter_complex "[1:a]adelay=<delay>|<delay>,apad[a]"`, map `0:v` and
   `[a]`, `-c:v copy`, `-c:a aac`, `-shortest`.
4. Return `{videoSeconds, voiceoverSeconds, truncated}` where
   `truncated = voiceoverSeconds > videoSeconds`.

Consequences worth remembering:

- Video is stream-copied, so clips must share codec/parameters to concat
  cleanly — mixed sources may produce a broken join rather than an error.
- The narration starts after `voDelayMs` (800ms default) and is padded
  (`apad`), so a short narration does not end the video early.
- `-shortest` ends the output when the shorter stream ends: a long narration on
  short footage loses its ending.
- `contactSheet` runs ffmpeg `select='eq(n,10)+eq(n,90)+eq(n,170)'`, scaled to
  320px wide in a 3x1 tile — three frames from the clip, for eyeballing motion.

## Verified behaviour

Tested with synthetic media (no API spend): two 3s clips plus a 4s narration
produced a 6.00s h264+aac mp4 with `truncated: no` and a contact sheet; the same
clips with a 9s narration produced `truncated: YES`, a 6.00s output and exit 1 —
the narration's final 3s is genuinely cut.

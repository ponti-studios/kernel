# Model and price notes

Measured and read from `GET https://openrouter.ai/api/v1/videos/models` and per-shot invoices.
Re-query before relying on a number: model support and rates move.

## Image-to-video is universally available, and not more expensive

Every video model listed on OpenRouter exposes `supported_frame_images` with at least `first_frame`;
most also take `last_frame`. On the models checked, image-to-video costs the **same** per second as
text-to-video:

| Model                    | Durations | Frames      | Rate                                      |
| ------------------------ | --------- | ----------- | ----------------------------------------- |
| `kwaivgi/kling-v3.0-std` | 3-15s     | first, last | $0.084/s ($0.126/s with audio)            |
| `kwaivgi/kling-v3.0-pro` | 3-15s     | first, last | $0.112/s ($0.168/s with audio)            |
| `google/veo-3.1-lite`    | 4, 6, 8s  | first, last | $0.05/s silent, $0.08/s with audio        |
| `alibaba/wan-2.6`        | 5, 10s    | first       | $0.08/s 720p                              |
| `alibaba/wan-3.0`        | 2s+       | first, last | $0.05/s 480p, $0.10/s 720p, $0.20/s 1080p |
| `minimax/hailuo-3`       | 5s+       | first, last | $0.13/s (+$0.04 per reference image)      |
| `google/veo-3.1`         | 4, 6, 8s  | first, last | $0.40/s with audio                        |

Read the `pricing_skus` map per model: keys split by resolution (`duration_seconds_720p`) and by
whether audio is generated (`duration_seconds_with_audio`). A model that looks cheap at 480p can be
four times the price at 1080p.

## Measured billing behaviour

- Requests bill in whole seconds from the requested duration, with a **5-second floor**: a 4s request
  was invoiced at 5s × $0.084 = $0.42; a 6.5s request rounded to 7s and invoiced $0.588.
- The provider reports `costUsd` on the poll response, not on submit. A clip that finished with no
  reported price is unpriced — never substitute an estimate silently.
- Speech is billed per character/prompt token; a 90-character line is a fraction of a cent, so
  narration is effectively free next to motion.

## Iteration economics

Six shots, three iterations:

| Settled at                  | Per iteration | Three iterations |
| --------------------------- | ------------- | ---------------- |
| Stills, 2K, with references | ~$0.11        | **~$0.32**       |
| Video, 5-7s per shot        | ~$3.02        | **~$9.07**       |

The gap is why look decisions happen on stills. It also sets the animatic gate: reviewing stills plus
narration costs nothing and catches what would otherwise be regenerated footage.

## Sources

- [ChatSlide — storyboard to final cut (2026)](https://www.chatslide.ai/guides/how-to-create-videos-with-ai-storyboard-to-final-cut): six stages, "lock the look on cheap stills first, then animate", shot list carries framing, camera move and duration.
- [Ciaro — workflow for an AI animated film](https://ciaro.pro/answers/workflow-for-ai-animated-film): script-led, voice-aware, storyboarded, timed in an animatic, produced shot by shot; every stage produces an approved deliverable before the next.
- [AutoTube — separate voiceover from AI video](https://autotube.pro/blog/separate-voiceover-ai-video-generation-youtube): narration is the spine of long-form; welded-in audio makes revision expensive.
- [OpenRouter — image-to-video cookbook](https://openrouter.ai/docs/cookbook/video-generation/image-to-video): `frame_images` for exact first/last frame control, requires a public HTTPS image URL, confirm with `GET /api/v1/videos/models`.
- [OpenRouter — reference-to-video cookbook](https://openrouter.ai/docs/cookbook/video-generation/reference-to-video): `input_references` guide identity and style without pinning a frame.

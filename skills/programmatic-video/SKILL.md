---
name: programmatic-video
description: "Use when creating short animated explainer videos."
license: MIT
metadata:
  author: Charles Ponti, Hermes Agent
  version: "0.2.0"
  platforms: [macos, linux]
  hermes:
    tags: [video, animation, explainer, ffmpeg, pil, remotion, openrouter, tts]
---

# Programmatic Explainer Video (PIL + ffmpeg or Remotion + Gemini TTS)

Create short (10-30s) animated explainer videos. Two pipelines:

1. **PIL + ffmpeg** — lightweight, zero setup, static frames
2. **Remotion + Gemini TTS** — React components, spring animations, per-slide audio sync

**User preference**: When the user says "not boring" or wants engaging content, default to Remotion. PIL+ffmpeg is the fallback for quick spikes.

## When to Use

- User asks for a short animated explainer, title cards, or motion-graphics video.
- Manim is unavailable or overkill (no math/LaTeX, simple text scenes).
- Need a deterministic, dependency-light pipeline.
- For more dynamic/engaging videos (animated components, spring physics, complex layouts), use Remotion.

Don't use for: 3Blue1Brown-style math animations (use `manim-video`), interactive web demos, or long-form edited video.

## Choosing: PIL+ffmpeg vs Remotion

| Factor | PIL+ffmpeg | Remotion |
|---|---|---|
| Setup | Zero (Pillow + ffmpeg already installed) | `npx create-video --blank` (~2 min install) |
| Visual quality | Static frames, basic text | React components, spring animations, SVG |
| Audio sync | Manual (trim audio to video length) | Per-slide audio files, duration computed from audio |
| Render time | ~10s for 15s video | ~2-3 min for 24s video |
| Best for | Quick title cards, simple explainers | Product demos, branded content, anything "not boring" |

## PIL+ffmpeg Workflow

### Procedure

1. **Get a script.** Ask the user for topic and scene count. Use an LLM to produce JSON with `title` and `scenes[{heading,body}]`. Keep 4-8 scenes, 2-4s each.
2. **Render frames with PIL.** For each scene, generate `FPS * seconds` PNGs. Use fade-in/out alpha, centered wrapped text, a progress bar, and a consistent dark gradient background. 1280x720 at 30 fps is a good default.
3. **Encode.** `ffmpeg -framerate 30 -i frame_%05d.png -c:v libx264 -pix_fmt yuv420p -crf 20 output.mp4`.
4. **Deliver.** Place the MP4 in `~/Documents/` and report path/duration/size.

### Pitfalls (PIL)

- Keep text lines short; wrap aggressively (max ~40 chars per line).
- Use `yuv420p` for broad player compatibility.
- Frame filenames must be zero-padded and contiguous (`frame_%05d.png`).
- Clean the frame directory before rendering.
- Use absolute, existing font paths (e.g. `/System/Library/Fonts/SFNS.ttf`).

## Remotion Workflow (React-based, more dynamic)

### Setup

```bash
npx create-video@latest <project-name> --blank --yes
cd <project-name>
```

### Structure

- `src/Root.tsx` — registers the `<Composition>` with `calculateMetadata`
- `src/Composition.tsx` — main component with `<Sequence>` per slide (see `references/remotion-composition.tsx`)
- `public/audio/` — one audio file per slide (WAV)

### Per-slide audio pattern (key technique)

Each slide gets its own audio file. The slide duration is computed from the audio duration, so slides **never advance until the voice finishes**:

```tsx
const slides = [
  { id: "title", text: "...", duration: 4.20 },  // from ffprobe
  { id: "press", text: "...", duration: 6.48 },
];

const slideStarts: number[] = [];
let cumulative = 0;
for (const slide of slides) {
  slideStarts.push(cumulative);
  cumulative += Math.ceil(slide.duration * FPS);
}

{slides.map((slide, i) => (
  <Sequence key={slide.id} from={slideStarts[i]} durationInFrames={Math.ceil(slide.duration * FPS)}>
    <Slide slide={slide} localFrame={frame - slideStarts[i]} fps={fps} />
    <Audio src={staticFile(`audio/${slide.id}.wav`)} />
  </Sequence>
))}
```

### TTS via OpenRouter (Gemini Flash Lite)

The user prefers **female British voice** via OpenRouter's Gemini TTS. Use `google/gemini-3.8-flash-lite-tts` (or `google/gemini-3.1-flash-tts-preview`).

**Critical**: Gemini TTS outputs **PCM only** (no MP3). Convert with ffmpeg. Use `scripts/generate-tts.sh` or the inline commands below:

```bash
# Generate TTS (PCM)
curl -s -o slide.pcm -w "%{http_code}" https://openrouter.ai/api/v1/audio/speech \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{"model": "google/gemini-3.8-flash-lite-tts", "input": "Text here", "voice": "Kore", "response_format": "pcm", "instructions": "Speak in a British English accent."}'

# Convert PCM → WAV (24kHz, 16-bit, mono)
ffmpeg -y -f s16le -ar 24000 -ac 1 -i slide.pcm slide.wav

# Get duration for the slides array
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 slide.wav
```

**Voice options** (female): Kore (preferred), Aoede, Leda, Despina, Gacrux, Autonoe, Callirrhoe, Erinome, Laomedeia, Pulcherrima. The user prefers **Kore** with British English instructions: `instructions: "Speak in a British English accent, warm and professional."`.

**OpenRouter key**: not in `~/.hermes/.env` (commented out). Check `~/.localrc` and `source` it.

### TTS model pricing (tested 2026-10-24)

| Model | Input /1M | Output /1M | Context | Notes |
|---|---|---|---|---|
| `google/gemini-3.8-flash-lite-tts` | $0.075 | $0.30 | 1M | Current default for TTS |
| `anthropic/claude-haiku-5.5` | $0.10 | $0.50 | 1M | 8x cheaper than Gemini 3.8 Flash, better instruction following |
| `google/gemini-3.8-flash` | $0.83 | $4.12 | 1.05M | Higher reasoning (AA 59), slower first token (4.8s) |

**Recommendation:** Use Haiku 5.5 for cost-sensitive batch work (TTS, extraction). Use Gemini 3.8 Flash when reasoning quality matters more than cost.

### TTS fallback options (when OpenRouter is unavailable)

1. **macOS `say` command**: `say -v Samantha -o output.aiff "text"` — produces AIFF, convert to WAV with `ffmpeg -i output.aiff output.wav`. Quality is lower than Gemini TTS but works offline. Use voice "Samantha" (female US) or "Daniel" (male UK).
2. **Hermes `text_to_speech` tool**: may fail with edge provider (403). Try other providers configured in `config.yaml` under `tts.providers`.
3. **ElevenLabs**: requires `ELEVENLABS_API_KEY`. Higher quality but costs per character.

**Preference order**: OpenRouter Gemini TTS → macOS `say` (offline fallback) → Hermes TTS tool.

### Render

```bash
npx remotion render <CompositionId> output.mp4 --concurrency=4
```

Render takes ~2-3 min for 24s video.

### Pitfalls (Remotion-specific)

- Audio files must be in `public/` directory (Remotion serves them via `staticFile()`).
- `Audio` is imported from `@remotion/media`, NOT from `remotion`: `import { Audio } from "@remotion/media"`. Importing from `remotion` will fail.
- `calculateMetadata` must return `durationInFrames` computed from audio durations.
- `useCurrentFrame()` returns the global frame; for per-slide local frame, subtract `slideStarts[i]`.
- Remove unused variables — TypeScript strict mode will fail the build.
- PCM files are ~2x larger than WAV; clean up `.pcm` files after conversion.
- Remotion project must be in a writable directory (not /tmp if it gets cleaned).

## General Pitfalls

- Deliver the finished file with a `MEDIA:/absolute/path` line so the desktop app offers download/preview.
- LLM JSON may include smart quotes; PIL handles UTF-8 fine, but ensure the script file is written UTF-8.

## Verification

- Output MP4 exists, plays, and duration matches scene count * seconds.
- Audio is present (check with ffprobe).
- No stale frames remain in the working directory.

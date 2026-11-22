# OpenRouter TTS Provider for `tb`

OpenRouter's `openai/gpt-audio-mini` is the only audio-output model available.
Gemini Flash Lite is text-only on OpenRouter (no TTS). The audio endpoint
(`/api/v1/audio/speech`) does not support these models; use the chat
completions endpoint with `modalities: ["text", "audio"]` and `stream: true`.
Streaming audio is PCM16 at 24 kHz (mp3 format is not supported when streaming).

## Provider contract

`tb` calls the audio provider with JSON on stdin:

```json
{
  "stage": "audio",
  "episode": {"slug", "title", "mode", "root"},
  "outAudio": "/path/to/master.mp3",
  "outWords": "/path/to/words.json",
  "turns": [{"id", "label", "text"}]
}
```

The provider must write `outAudio` (MP3) and `outWords` (JSON `{"words": [...]}`)
and print a JSON summary on stdout.

## Implementation pattern

1. For each turn, call OpenRouter chat completions with `stream: true`,
   `modalities: ["text", "audio"]`, `audio: {"voice": "alloy", "format": "pcm16"}`.
2. Accumulate base64 audio chunks from `delta.audio.data`.
3. Decode to PCM16, concatenate all turns.
4. Wrap in a WAV header (24 kHz, mono, 16-bit) and convert to MP3 via ffmpeg.
5. Transcribe the finished MP3 with Parakeet for exact word timestamps:
   `parakeet-cli -m models/ggml-parakeet-tdt-0.6b-v3-f16.bin -f master.mp3 -ps -np`
   Parse the token lines (`t0`, `t1` in 10ms frames, `word_start=true/false`).
   Group consecutive tokens into words: start a new word on `word_start=true`,
   accumulate subword tokens, convert frame indices to milliseconds (×10).
   Write `words.json` with `{"words": [{"text", "startMs", "endMs"}]}`.
6. Print a JSON summary on stdout (`{"durationMs", "words"}`).

## Caveats

- Word timestamps come from Parakeet transcription of the generated audio, not
  from the TTS itself. Captions are exact but depend on Parakeet's transcription
  matching the spoken words. If the TTS mispronounces or adds filler, timestamps
  may not match the script text.
- `gpt-audio-mini` is a chat model; audio may include filler or narration.
  Prompt tightly: "Read this aloud naturally, nothing else."
- The Parakeet model (~1.2 GB) must be downloaded separately:
  `hf download ggml-org/parakeet-GGUF ggml-parakeet-tdt-0.6b-v3-f16.bin --local-dir models`
- Loudness comes out around -20 LUFS (measured by `measure_loudness`).

## Environment

```sh
export TB_AUDIO_CMD="python3 /path/to/openrouter_tts.py"
export OPENROUTER_API_KEY="sk-or-..."
tb audio <slug> --provider command
```

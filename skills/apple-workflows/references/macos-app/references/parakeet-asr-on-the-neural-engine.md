# Parakeet on the ANE (FluidAudio) — full notes

Companion to the "Parakeet on the Neural Engine" section of SKILL.md. Everything here was measured or
discovered the hard way on an M1 Max; the body keeps only the traps.

```swift
// Package.swift: .package(url: "https://github.com/FluidInference/FluidAudio.git", from: "0.17.0")
let models = try await AsrModels.downloadAndLoad(version: .ultra, progressHandler: handler)
let asr = AsrManager(config: .default, models: models)     // keep this resident
var state = try TdtDecoderState()
let result = try await asr.transcribe(url, decoderState: &state, language: .english)
result.text; result.confidence; result.duration
```

## Model versions

- **`.ultra` (moondream's post-training of v3) beats `.v3` on every benchmark at the same speed** and needs
  only macOS 14 / iOS 17.
- `AsrModelVersion` also has `.v2` (English), `.redux` (small, needs macOS 15) and `.phonon2`.
- Models land in `AsrModels.defaultCacheDirectory(for: .ultra)`.

## Audio in

- **Do not hand-parse WAV bytes.** Pass a file URL (or use `AudioConverter`) so bit depth, channels and
  compression are normalised to 16 kHz mono Float32. Manually sliced PCM yields _empty transcripts_ with no
  error — the worst kind of failure, because it looks like a UI bug.
- Long audio: Parakeet TDT has a fixed 15 s encoder window; FluidAudio chunks with ~2 s overlap for longer
  files when `ASRConfig.streamingEnabled` (default) and a ~30 s threshold applies. Watch seam quality on
  multi-minute dictation.
- ITN is **opt-in** (`TextNormalizer`); the transcript you get is the decoder's own output, which may
  already write "nine thirty" as "9.30".

## Loading and lifecycle

- **Copy SwiftPM resource bundles into the .app.** FluidAudio ships `FluidAudio_FluidAudio.bundle`;
  `cp -R .build/release/*.bundle App.app/Contents/Resources/` in the bundle script, or model loading fails
  at runtime.
- **The first ANE load after install takes ~23 s** while CoreML specialises the programme
  (`MLE5ProgramLibrary perparAndReturnError` in a `sample` profile). It is cached per machine/OS
  afterwards — the same load is then ~0.2 s. Preload at launch in the background so the first dictation
  never sits through it.
- **Serialise the load.** Track an in-flight `Task<AsrManager, Error>` behind a lock and reuse it; a launch
  preload and a dictation can otherwise load models concurrently. Never hold the lock across an `await`.
- A sync app flow keeps its shape with a `DispatchSemaphore` + `Task.detached` bridge that returns the
  `ASRResult` from a background thread. Call it off the main thread.

## Progress callbacks into UI

`DownloadProgress` arrives from several threads and repeats the same state ("Downloading … 50 % (0/0 files)"
interleaved with "Compiling …"), so a naive handler makes a HUD flicker through duplicate lines. Wrap the
sink in a lock-protected deduper that drops a repeated message inside one second, and render an empty
`.compiling(modelName:)` as "model" rather than a blank.

## Verification without a human

Add a `--bench <file.wav>` CLI mode that runs every installed engine three times on one file and prints
first/warm timings plus the transcript, then drive the real hotkey with `osascript` and compare. That is how
the numbers in SKILL.md were produced.

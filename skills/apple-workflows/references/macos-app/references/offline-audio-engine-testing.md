# Testing a recorder with no microphone

The trick that makes a capture engine testable: put a real `AVAudioEngine` into **offline manual
rendering mode**, feed it a **synthesized tone through a player node**, pump frames by hand, and read
back the file the recorder actually wrote. No microphone, no speaker, deterministic timing — and the
recorder under test is the shipped one.

This is the strongest argument for `AVAudioEngine` over `AVAudioRecorder`: there is nothing to render
offline in the latter, so its capture path can only be tested by a human dictating.

## The rig

```swift
private func offlineEngine() throws -> (AVAudioEngine, AVAudioPlayerNode) {
  let engine = AVAudioEngine()
  let player = AVAudioPlayerNode()
  engine.attach(player)
  let format = AVAudioFormat(standardFormatWithSampleRate: 44_100, channels: 1)!
  engine.connect(player, to: engine.mainMixerNode, format: format)
  try engine.enableManualRenderingMode(.offline, format: format, maximumFrameCount: 4096)
  return (engine, player)
}
```

Feed it a real file — a sine at a known frequency and amplitude is the most useful signal, because you
can assert on it later:

```swift
private func tone(seconds: Double, hertz: Double, amplitude: Float = 0.5, in dir: Scratch) throws -> AVAudioFile {
  let url = dir.file("tone-\(UUID().uuidString).wav")
  var writer: AVAudioFile? = try AVAudioFile(forWriting: url, settings: [
    AVFormatIDKey: kAudioFormatLinearPCM, AVSampleRateKey: 44_100, AVNumberOfChannelsKey: 1,
    AVLinearPCMBitDepthKey: 32, AVLinearPCMIsFloatKey: true,
  ])
  let count = Int(seconds * 44_100)
  let buffer = AVAudioPCMBuffer(pcmFormat: writer!.processingFormat, frameCapacity: AVAudioFrameCount(count))!
  buffer.frameLength = AVAudioFrameCount(count)
  for i in 0..<count {
    buffer.floatChannelData![0][i] = Float(sin(Double(i) / 44_100 * hertz * 2 * .pi)) * amplitude
  }
  try writer!.write(from: buffer)
  writer = nil  // releasing the writer finishes the file, so it can be read
  return try AVAudioFile(forReading: url)
}
```

Pump it in chunks, then wait for the analysis to catch up rather than sleeping a fixed time:

```swift
private func render(_ engine: AVAudioEngine, seconds: Double) throws {
  let buffer = AVAudioPCMBuffer(pcmFormat: engine.manualRenderingFormat, frameCapacity: 4096)!
  var left = Int(seconds * 44_100)
  while left > 0 {
    let n = min(left, 4096)
    _ = try engine.renderOffline(AVAudioFrameCount(n), to: buffer)
    left -= n
  }
}

private func waitUntil(_ condition: () -> Bool) async {
  for _ in 0..<500 where !condition() { try? await Task.sleep(for: .milliseconds(10)) }
}
```

`renderOffline` is CPU-cheap — a second of audio is milliseconds — so whole suites of these run in
fractions of a second.

## Assert on the file and on the signal

"It wrote something" is not a test. Read the file back and check the format the _consumer_ needs, then
check that the audio was understood:

```swift
let written = try AVAudioFile(forReading: url)
#expect(written.fileFormat.sampleRate == 16_000)
#expect(written.fileFormat.channelCount == 1)
#expect(written.fileFormat.settings[AVFormatIDKey] as? UInt32 == kAudioFormatLinearPCM)
#expect(written.fileFormat.settings[AVLinearPCMBitDepthKey] as? Int == 16)
#expect(abs(Double(written.length) / 16_000 * 1_000 - reportedMilliseconds) < 150)

// the loudness columns the orb draws: about 120 a second, and the tone is loud in them
#expect((100...135).contains(recorder.columns.count))
#expect(last.level > 0.2)
#expect(abs(last.high - 0.5) < 0.1)   // the peak is the tone's amplitude
```

For a spectrum, assert on _separation_, not on magnitude: a 440 Hz tone must light one band far more
than the rest — `#expect(last.max()! > 4 * last.sorted()[12])`. That catches a broken FFT, which a
"frames were emitted" assertion never would.

Per-consumer assertions worth keeping separate, since one engine serves both: **PCM 16-bit 16 kHz mono**
for on-device ASR, and **AAC + spectrum** for streaming.

## The failure paths, without breaking a headset

Keep the engine start behind a replaceable closure so a test can make a restart fail:

```swift
/// How the engine is started. A test replaces it to see a restart fail.
var startEngine: () throws -> Void = { try engine.start() }
```

```swift
struct Gone: LocalizedError { var errorDescription: String? { "the headset went away" } }
recorder.startEngine = { throw Gone() }
engine.stop()
NotificationCenter.default.post(name: .AVAudioEngineConfigurationChange, object: engine)
let error = #expect(throws: EngineRecorder.Incomplete.self) { try recorder.stop() }
#expect(error?.reason == "the headset went away")
```

The same seam tests the happy route change: post `.AVAudioEngineConfigurationChange` mid-render and
require the recording to keep going to the same file, with the duration still long enough.

Other cases worth pinning: `stop()` twice returns 0 rather than throwing; the clock counts what has been
written (`seconds ≈ 0.5` after rendering half a second); an unwritable path throws at `start`.

## A stream that is still being written

For code that reads audio _while it is being recorded_ — live transcription, level meters, anything that
consumes an incomplete file — the offline rig above is the wrong shape: it renders a finite buffer rather
than a file that grows and is not valid until it closes. Build that file by hand instead. No microphone is
involved, which also makes it work on a machine whose default input is a headset (scripted speech through
the speakers never reaches one, and it looks exactly like a broken recorder).

**Speech in a file, from macOS built-ins:**

```bash
say -o src.aiff "the quick brown fox jumps over the lazy dog and keeps on running"
afconvert -f WAVE -d LEI16@16000 -c 1 src.aiff src.wav
```

Then reconstruct the state a recorder leaves mid-take — a real header with both size fields still zero:

```swift
let audio = try Data(contentsOf: src)
let payloadStart = try XCTUnwrap(dataRange([UInt8](audio))).lowerBound   // walk chunks; never assume 44
var header = Data(audio.prefix(payloadStart))
for offset in [4, 5, 6, 7] { header[offset] = 0 }                        // RIFF size
for offset in (payloadStart - 4)..<payloadStart { header[offset] = 0 }   // the data chunk's size
try header.write(to: growing)
let handle = try FileHandle(forWritingTo: growing)
try handle.seekToEnd()
```

Now feed it one second at a time, waiting a little longer than the code's own poll interval between slices,
so at least some passes run on an incomplete file:

```swift
let bytesPerSecond = 16_000 * 2                 // 16 kHz mono 16-bit
var written = 0
while written < payload {
  let end = min(written + bytesPerSecond, payload)
  try handle.write(contentsOf: audio[(payloadStart + written)..<(payloadStart + end)])
  written = end
  try await Task.sleep(for: .milliseconds(1350))
}
```

`Task.sleep` **does** drain the main dispatch queue; `RunLoop.run(mode:before:)` does not. A stream reader that
hands its results back to the main queue will therefore deliver nothing at all under a run-loop pump, and any
`busy` flag the work sets stays set — the test sees zero passes and points nowhere near the cause. Make the test
`@MainActor` and `async`, and collect results in the callback rather than polling a property.

**Assert on the stream, not just the outcome** — the outcome is the easy half:

- **At least one pass completed well before the audio finished.** This is the entire point of the feature; a
  test that only checks the final transcript passes against code that did nothing incremental.
- **No pass loses items an earlier pass had** (a non-decreasing count).
- **The first item is settled from the first pass onwards** — the merge keeps the shared prefix rather than
  re-deciding the whole line on every delivery.
- **Do not assert that each pass is a prefix of the next.** A later pass may legitimately revise its tail, which
  is exactly why the merge replaces from the first difference. An over-strict assertion here fails on correct
  code and teaches the wrong lesson about the design.
- **Use a countable sentence plus a unique closing marker**, so a dropped or duplicated word is visible at all —
  plausible prose hides a missing clause.

Finally, run the last pass under test through the _same_ repair path, not against the raw file: it still has its
sizes zeroed, and reading it directly fails with "no audio" for reasons that have nothing to do with the code
under test.

## A fake at the protocol boundary

For the layer _above_ the recorder (conversations, state machines), fake the microphone instead of
rendering audio — "hands over a recording that already exists, in place of a person speaking":

```swift
final class FileMicrophone: Microphone, @unchecked Sendable {
  let path: String
  let durationMs: Double
  private let state = Locked<(started: Int, stopped: Int)>((0, 0))
  func start() async throws -> String { state.with { $0.started += 1 }; return path }
  func stop() async throws -> Recording {
    state.with { $0.stopped += 1 }
    return Recording(path: path, durationMs: durationMs)
  }
}
```

Counting calls is what lets a test assert _how many times_ something was started — the double-start race
a debounce is supposed to prevent. Use the offline engine for the recorder, and a protocol double above it;
not one or the other.

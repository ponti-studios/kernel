# Device-first audio capture (AVCaptureSession)

Read this when a recorder must use a **chosen** input device instead of the system default, in an app that otherwise
records with `AVAudioEngine`.

## Why `AVAudioEngine` cannot be repointed

`kAudioOutputUnitProperty_CurrentDevice` on `engine.inputNode.audioUnit` is _accepted_ — the hardware really switches,
AirPods' 24 kHz to a built-in mic's 48 kHz — and then AVFAudio aborts when the tap is installed:

```
Failed to create tap due to format mismatch, <AVAudioFormat 1 ch, 48000 Hz, Float32>
required condition is false: format.sampleRate == inputHWFormat.sampleRate
```

The engine's cached graph still describes the _previous_ device. Three attempts fail identically: set after touching
`inputNode`; `AudioUnitUninitialize` before the set; `AudioUnitUninitialize` after it plus `engine.prepare()`. An
Objective-C exception cannot be caught from Swift, so **an app that attempts this crashes at the start of a take** —
worse than not offering the choice. The device has to be known before a graph exists.

## The validated recipe

```swift
let session = AVCaptureSession()
session.beginConfiguration()
let input = try AVCaptureDeviceInput(device: chosenDevice)      // takes a device directly
session.addInput(input)

let out = AVCaptureAudioDataOutput()
out.audioSettings = [                                            // AVFoundation converts for you
    AVFormatIDKey: Int(kAudioFormatLinearPCM),
    AVSampleRateKey: 16_000.0,
    AVNumberOfChannelsKey: 1,
    AVLinearPCMBitDepthKey: 16,
    AVLinearPCMIsFloatKey: false,
]
session.addOutput(out)
session.commitConfiguration()          // ← before startRunning, or it throws

let sink = SampleSink { buffer in … }   // ← keep a strong reference, see trap 3
out.setSampleBufferDelegate(sink, queue: DispatchQueue(label: "capture"))
session.startRunning()
```

Measured on a MacBook Pro M1 Max, choosing a device while the _system default was a different microphone_ (so a pass
cannot be luck):

```
chosen: Wave Link MicrophoneFX      system default: MacBook Pro Microphone
running=MacBook Pro Microphone, Wave Link MicrophoneFX   ← the chosen device really opened
buffer format: 16000.0 Hz, 1 ch, bits=16, float=false    ← exactly what an ASR engine reads
buffers: 567   frames: 48378  (3.023625 s)
afinfo: 1 ch, 16000 Hz, Int16 · 3.023625 sec · 96,756 audio bytes
```

No `AVAudioConverter`, no resampling, no graph. `audioSettings` on the data output is the whole conversion, so the
buffers arrive in the format the engine wants.

## Five traps, each one a wasted run

1. **`startRunning` between `beginConfiguration` and `commitConfiguration` throws** an `NSGenericException`:
   _"startRunning may not be called between calls to beginConfiguration and commitConfiguration"_. Commit first.
2. **A bare `Thread.sleep` receives nothing.** A capture session delivers through the run loop; a command-line tool
   must pump it or the delegate is never called:
   `while Date() < deadline { RunLoop.current.run(mode: .default, before: Date().addingTimeInterval(0.05)) }`.
3. **`AVCaptureOutput` holds its delegate weakly.** An inline
   `setSampleBufferDelegate(SampleSink { … }, queue:)` is deallocated before the first buffer, which presents as
   "the session runs but nothing arrives". Hold the sink in a variable.
4. **`AVAudioFile.write(from:)` asserts on an Int16 buffer.** Its processing format is Float32: build a
   `AVAudioFormat(standardFormatWithSampleRate: 16_000, channels: 1)` buffer, write `Float(sample) / 32768`, and let
   the file convert to its 16-bit settings.
5. **A sample buffer's block is not necessarily contiguous, and its length need not divide evenly** by the sample
   size. Check `CMBlockBufferIsRangeContiguous`, take `CMBlockBufferGetDataPointer`, and copy exactly the bytes
   present — a naive `CMBlockBufferCopyDataBytes` with a frame count derived from the length traps in the runtime.

Also: buffer sizes are small (~85 frames; ~190 a second), so never assume a buffer is a sizeable chunk.

## The WAV header is written on deallocation

Releasing the last `AVAudioFile` reference writes the footer. Until then the file's two size fields are zero and
`afinfo` reports **0 seconds and 0 audio bytes** — which reads exactly like a capture that recorded nothing. Hold the
file, and set it to `nil` after `stopRunning` before checking the artifact.

## The package seam

The engine and the capture session differ only in how buffers arrive, so one protocol is enough:

```swift
protocol AudioSource {                       // in the shared capture package
    func start(onBuffer: @escaping (AVAudioPCMBuffer, AVAudioTime) -> Void) throws
    func stop()
}
```

- `EngineSource` — today's `AVAudioEngine` + tap, unchanged, so a sibling app keeps identical behaviour.
- `CaptureSource` — `AVCaptureSession` + `AVCaptureAudioDataOutput` + the device UID, using the recipe above.
- Keep the downstream code (converter, column builder, writer, ballistics, route handling) untouched; only the two
  `installTap` call sites move behind the seam.
- **The device belongs to the source, not to the settings.** `CaptureSource(deviceUID:settings:)` takes it, and one
  factory `AudioSourceChoice.make(settings:deviceUID:)` returns `EngineSource` for no pin and `CaptureSource` for a
  pin. A `deviceUID` on `CaptureSettings` as well gives two places to disagree about what to record, and pushing it
  through settings makes the sibling app opt out of behaviour it never asked for.
- **The recorder rebuilds its converter when a buffer's format changes** (`converter.inputFormat != buffer.format`),
  rather than being re-tapped on a notification. A route change, a device swap and a capture source all arrive as
  "the next buffer is in a different format", so one check covers every cause and the old
  relisten-after-`AVAudioEngineConfigurationChange` dance goes away.
- **Give the seam a source with no hardware behind it in the tests.** A `FakeSource` emitting synthetic buffers
  asserts what the seam promises: a non-engine source records the file, a format change mid-recording is followed, a
  source that cannot open throws instead of recording silence, and no pin still selects `EngineSource`.
- **Prove it from the app's log, not only the suite**: `source=CaptureSource pinned=<uid>` then
  `record running=<the pinned device>` while the system default is a different microphone is the end-to-end claim.

## Identity and honesty

- **Address devices by CoreAudio UID, never by name** — "ponti.pods" becomes "AirPods Pro" between OS releases, and a
  pin has to survive that. List devices by walking `kAudioHardwarePropertyDevices` and keeping those with input
  streams (`kAudioDevicePropertyStreamConfiguration`), not by trusting a second framework's idea of what exists.
- **Make the resolver pure**: `resolve(pinned:available:defaultUID:) -> (input, fellBack)` is what lets a missing pin
  fall back _and report it_; that decision wants a test, not a hope in a call site.
- **Log the effect, not the request.** Ask the hardware what is running
  (`kAudioDevicePropertyDeviceIsRunningSomewhere`) or read the property back, and log that. A line naming the device
  you asked for reads, months later, as proof of a feature that is not working — and it shipped once.
- **A virtual device captures perfectly and is silent** (−91 dB on this machine), so a level check is not a validity
  check: 3 s of near-silence is a correct capture of a muted input.

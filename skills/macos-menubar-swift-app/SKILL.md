---
name: macos-menubar-swift-app
description: Use when building a native macOS menu bar app in Swift.
license: MIT
metadata:
  author: project
  version: "1.0"
---

# Native macOS menu bar apps (SwiftPM + AppKit)

> Invoke with: the app to build, or the bug/permission issue to debug.

## When to use

- building, packaging, signing or installing a menu bar / accessory `.app` from SwiftPM
- adding a global hotkey, mic capture, or a subprocess engine to a macOS app
- debugging TCC (microphone / accessibility) behaviour or verifying a GUI you cannot screenshot
- showing that a surface is working before it has a result yet (a model thinking, a download starting)

**Make every visual a pure function of a clock, not of a state change.** Then any frame is renderable, two renders
of the same moment agree, and the motion is unit-testable with no screen. Rendering, pixel verification, the rules
for a "working" surface, and the `ViewBuilder` branching trap:
`references/deterministic-hud-verification.md`.

## Build a real `.app` with `swift build` + a small bundle script — no Xcode project needed. Proven path

for background/accessory utilities: dictation, meters, hotkey tools, mic capture.

## Package layout

```swift
// swift-tools-version:5.9   ← 5.9 by default
```

Use tools-version 5.9 and stay there. Swift 6 language mode turns every AppKit/AVFoundation callback into
a strict concurrency fight for zero benefit in a single-threaded UI app.

**One exception, and only one: naming a platform newer than the manifest API knows.** `platforms:
[.macOS(.v15)]` under tools 5.9 fails with `error: 'v15' is unavailable` — the enum case does not exist
until tools 6.0. Raise the manifest to 6.0 for that and pin the targets back with
`swiftSettings: [.swiftLanguageMode(.v5)]`, so bumping the manifest does not drag the app into strict
concurrency. Manifest 6.0 + language mode 5 is the whole fix. This arrives the moment you depend on a
package whose platform floor is newer than yours.

Declare frameworks explicitly or you get link errors at bundle time:

```swift
linkerSettings: [
    .linkedFramework("Carbon"), .linkedFramework("AppKit"),
    .linkedFramework("AVFoundation"), .linkedFramework("ServiceManagement"),
]
```

Entry point: top-level code in `main.swift` (not `@main`). Parse CLI flags first and `exit(0)` for CLI
modes, then `NSApplication.shared` + `setActivationPolicy(.accessory)` + `app.run()` for GUI. Give the
same binary CLI modes (`--selftest`, `--transcribe <file>`, `--devices`) — that is the only way to test
the engine without a human clicking things.

## Bundle + signing (the part that bites)

```bash
mkdir -p App.app/Contents/{MacOS,Resources}
cp .build/release/MyApp App.app/Contents/MacOS/MyApp
cp Resources/Info.plist App.app/Contents/Info.plist
codesign --force --sign - --identifier com.example.myapp App.app
```

Info.plist needs `LSUIElement = true` (no Dock icon), `CFBundleIdentifier`,
`NSMicrophoneUsageDescription` for mic apps, `LSMinimumSystemVersion`.

**Keep the codesign `--identifier` stable across builds.** TCC keys on identity: a new identifier
re-prompts for the microphone. With a stable one, rebuild + reinstall keeps the existing grant
(verified: `record start` still succeeds after reinstall, no new prompt).

## Global hotkeys without Accessibility

`RegisterEventHotKey` (Carbon) fires system-wide and needs no permission — only _posting_ synthetic keys
needs Accessibility. Install one handler on `GetApplicationEventTarget()` with a **non-capturing**
closure (Swift C-function-pointer requirement) that looks the action up in a global dictionary keyed by
`EventHotKeyID.id`, then dispatches via `DispatchQueue.main.async`. A 4-char signature (`OSType(0x564E4F54)`) avoids collisions.

**Debounce the action (~250 ms).** One physical press can deliver two hotkey events (key down _and_ key
up, key repeat, or a synthetic `osascript keystroke`), so a handler that toggles state runs twice. The
observed failure mode is one press starting two recorders: the second orphans the first, which leaves a
header-only WAV on disk and the microphone hot. Swallow an event arriving inside the debounce window and
log it, so the log still shows a duplicate arrived rather than the app appearing to ignore a press.

### Configuring the hotkey

Expose the chord as two `UserDefaults` numbers and document them, instead of rebuilding the menu each time:

| Default      | Meaning                      | Examples                           |
| ------------ | ---------------------------- | ---------------------------------- |
| `hotKeyCode` | Carbon virtual key code      | `49` Space · `2` D · `105` F13     |
| `hotKeyMods` | Carbon modifier mask, summed | `2304` ⌥⌘ · `6144` ⌃⌥ · `4864` ⌃⇧⌘ |

**Read them with `object(forKey:)`, never `integer(forKey:)`.** Key code `0` is a real key (KVK_ANSI_A), so
treating `0` as "unset" silently makes A unusable and quietly falls back to the default chord. Accept a
decimal `Int` or a `0x`-prefixed `String` so a value copied out of a header can be pasted straight in.

Read the chord once at launch (it is registered then, so a change needs a restart) and fall back to a
sane default. If `RegisterEventHotKey` returns non-`noErr` the chord is already owned by another app:
log it and notify the user — the menu item still works, so the app is degraded, not broken.

Take key codes and masks from the SDK rather than memory:
`grep -E 'kVK_|cmdKey|optionKey' <SDK>/…/HIToolbox.framework/Headers/Events.h`. Full tables in
`references/hotkey-key-codes.md`.

### Hold-to-talk, and the key-up you cannot rely on

Offering "press to start, press to stop" _and_ "hold to talk" is one setting and two message paths, and the hard part
is entirely the release.

- **Carbon delivers the key-up as its own event kind.** `RegisterEventHotKey` only starts delivering
  `kEventHotKeyReleased` once you install a second `InstallEventHandler` for it, beside the pressed one. Keep release
  callbacks in a **separate table** from press callbacks, so a chord registered without a release callback (the
  transient Esc/Return grabs) gains no behaviour it did not ask for.
- **In toggle mode a release must do nothing at all.** Treating the key-up as an instruction is the bug that ends every
  dictation the instant it begins — the chord that started the take produces its release too. Assert it directly: one
  test that walks every state and expects `.none`.
- **A release while the take is still `starting` cancels, never finishes.** A tap shorter than the engine's floor
  captured nothing usable, so finishing it lands in the "invalid audio" path; cancelling leaves no trace and no note.
  Never let a short tap mean _toggle_ — two behaviours behind one gesture is how someone ends up with a take they
  cannot stop.
- **Cap the take, because losing the key-up is ordinary.** Three everyday things lose it: switching app mid-hold with
  ⌘Tab, focus moving into a **secure input field** (password prompts swallow key events entirely), and the keyboard
  going away. Without a cap the microphone records until someone stops it by hand. End the take after a few minutes and
  **log that the cap ended it**, so it never reads as the user's own stop. It is a safety net, not a length limit —
  keep it in minutes, and test that it is not seconds.
- **Put the decision in a pure `action(mode:state:event:)`.** Which event does what, in which state, is exactly the
  kind of table that is wrong in one cell and impossible to reproduce on demand; the timer and the Carbon callbacks
  then carry no policy at all.
- **Prove the release path from the log with one synthetic press+release**:
  `hotkey: key-up received` → `dictation key up: mode=pushToTalk state=recording` → `record stop … duration=0.00s`.
  The 0.00 s is osascript's instantaneous keystroke — the tap case, correctly handled — so do not read it as a lost
  release, and do not claim the release works without those three lines in order.

### Answering Esc and Return while a mode is running

A transient mode (recording, capturing, scanning) is where users expect **Esc to abort and Return to
commit**. The panel that shows the mode must **never take focus** — if it did, the keystrokes the user is
typing over would land in the panel instead of their app — so it cannot receive key events the way a window
does. A bare key can only be heard as a **global hotkey** (`RegisterEventHotKey` with modifiers `0`), which
needs no permission:

- **Grab on entering the mode, release on leaving it.** Hold the keys in an array on the controller and clear
  it where the state returns to idle; a bare Return held while idle eats every return the user presses, in
  every app. Registration failure is silent, so log the count (`3/3 registered`) — a partial grab is otherwise
  invisible.
- **Prove the released state from outside**: with the app idle, type `AAAA`, press Return, then `BBBB` into a
  text sink and read the document back. `[AAAA\nBBBB]` means the key reached the other app; run-together text
  means you are still swallowing it. Recipe: `references/verifying-a-gui-you-cannot-screenshot.md`.
- **Make the keys idempotent through the state machine, not a second debounce.** A physical press can deliver
  two events, so set the state synchronously and let the duplicate arrive in a state where the action is a
  no-op. Cancel is naturally idempotent — make commit so too.
- **Cancelling is its own outcome, not an error.** Drain to grey, no green and no red, and collapse the box
  like the done state but faster (measured 1.10 s against 1.40 s), labelled with the fact ("Cancelled"). Red
  says something failed; nothing did.
- **Cancelling leaves no trace**: skip transcription, write no note, and delete the recording even when a
  keep-audio setting is on — that setting is about recordings that become results, and a cancelled one is not
  going to become one. Say the choice out loud so the user can overrule it.
- **Cancelling during the compute step drops the result.** Once a transcript is in flight, set a
  `discardResult` flag the completion path checks, rather than letting a sentence the user changed their mind
  about paste into whatever they have since turned to.
- **Gate the keys to in-flight states only.** Capturing Return to dismiss a finished pill would eat the next
  return the user presses, elsewhere.

### When a capture fails, keep the artefact and let the user try again

A take that produced no text is the only record of what someone said. Deleting it makes the failure final, and a
menu that offers nothing makes it silent — the two are worth designing together.

- **Keep the audio on every kind of failure, not one.** An empty transcript and a _thrown_ engine error reach
  different branches; when the second one calls a cleanup helper, the take is deleted and the escape hatch is
  missing at exactly the moment it is needed. Route both through one "remember this take" step.
- **Offer the re-run manually, never automatically.** A first attempt can fail for reasons outside the
  recording (a model still warming, a device that came up late), and those are the cases a second run fixes. A
  take whose _content_ was unusable stays unusable however many times it is retried, so an automatic retry only
  produces a slower wrong answer — and a silent fallback between engines is the same mistake with more moving
  parts.
- **Make the re-run end exactly like a first attempt** by calling the same transcribe-and-finish function, so it
  writes the note, loads the clipboard and pastes as usual. A second completion path drifts, and the drift stays
  invisible until someone reports that a recovered take did not paste.
- **The offer has to survive the process.** The file outlives a restart and the app's memory of it does not,
  which is the common case after a crash or a quit. Adopt the newest file in the audio directory at launch — a
  sound rule only while "keep audio" is _off_, since then the only reason a file is there is that a take
  produced nothing. With it on, the directory also holds takes that succeeded, so adopt nothing rather than
  guess.
- **Put the enablement behind a small pure type** (`Retake.candidate(_:)`, a `menuTitle`, a length read from the
  file) so the policy is testable even though the menu item cannot be pressed by a script, and gate the item on
  the file still existing rather than on a remembered path.
- **Time the offer out honestly.** With keep-audio off the next dictation deletes the file, so this is a window
  rather than a feature: say so in the code, not in a promise to the user.

## Mic capture (16 kHz mono WAV — what every local ASR engine wants)

whisper.cpp and Parakeet both want **16 kHz mono 16-bit PCM WAV**. Record straight into that format so
there is no conversion step:

```swift
[AVFormatIDKey: Int(kAudioFormatLinearPCM), AVSampleRateKey: 16000.0,
 AVNumberOfChannelsKey: 1, AVLinearPCMBitDepthKey: 16,
 AVLinearPCMIsFloatKey: false, AVLinearPCMIsBigEndianKey: false]
```

**Prefer `AVAudioEngine` + `AVAudioConverter` over `AVAudioRecorder`.** Both write the same file, but
only the engine can be driven offline, which decides everything downstream: you can test the real capture
path with no microphone, you get real RMS columns (and a spectrum, if you pay for an FFT) instead of
`AVAudioRecorder`'s 30 Hz dB reading, you get route-change and cut-short handling, and the same engine can
be shared with the user's other apps (see "Sharing code with the user's other apps"). An `AVAudioRecorder`
or two is acceptable only when nothing else needs the audio and nothing needs to test it.

With the engine, install a tap on the input node, convert each buffer to the target format, feed
`ColumnBuilder`/`SpectrumBuilder` on the audio thread, and hand the writing to a serial queue (`writer.sync {}`
in `stop()` is what makes the file complete before you read it). The harness that proves it, with a real
tone and no microphone: `references/offline-audio-engine-testing.md`.

If you do stay with `AVAudioRecorder`: set `isMeteringEnabled = true` and poll `updateMeters()` /
`averagePower(forChannel: 0)` on a 30 Hz `Timer` added to `.common` mode for a live level meter
(dBFS −55…0 → 0…1).

**Set the "recording" state synchronously, before any async permission call.**
`AVCaptureDevice.requestAccess` answers through a callback, so if state only becomes `.recording` inside
that callback, a second event inside the window still sees `.idle` and starts a _second_ recorder. Add an
explicit `.starting` state set on the same line as the guard, abort the callback unless the state is still
`.starting`, and have `Recorder.start()` stop any already-running recorder first. That converts the race
into a log line rather than two live recorders and a leaked file.

### Choosing an input device

An `AVAudioEngine` records from the **system default** and offers no API to say otherwise. The workaround everyone
reaches for does not work: `kAudioOutputUnitProperty_CurrentDevice` on `engine.inputNode.audioUnit` is _accepted_ —
the hardware really does switch, AirPods' 24 kHz to the built-in mic's 48 kHz — but the engine's cached graph still
describes the previous device, and AVFAudio aborts when the tap is installed:

```
Failed to create tap due to format mismatch, <AVAudioFormat 1 ch, 48000 Hz, Float32>
required condition is false: format.sampleRate == inputHWFormat.sampleRate
```

`AudioUnitUninitialize` before _or_ after the set, and `engine.prepare()`, do not refresh that cache. An
Objective-C exception cannot be caught from Swift, so any build that attempts this crashes at the start of a take —
worse than not offering the choice. **Do not ship a picker on top of an `AVAudioEngine`**, and do not log the pinned
device as though it were in use.

So the device has to be known _before a graph exists_, which means a device-first capture path: `AVCaptureSession` +
`AVCaptureDeviceInput` (it takes a device directly). **The device belongs to the source, which is injected — not to
`CaptureSettings`**: one factory (`AudioSourceChoice.make(settings:deviceUID:)`) returns `EngineSource` when nothing is
pinned and `CaptureSource` when something is, so the settings stay about format and drawing and the sibling app keeps
identical behaviour by construction.

Two rules that hold whichever path you take:

- **Resolve by UID, never by name, and make the resolver pure.** `resolve(pinned:available:defaultUID:)` returning
  `(input, fellBack)` is what lets a missing pin fall back _and say so_; that is a decision worth a test rather than
  a hope in the call site. `--devices` should print the same CoreAudio list the recorder chooses from, so there is
  one truth about what exists.
- **Log the effect, not the request.** A line naming the device you asked for reads, months later, as proof of a
  feature that is not working — and that shipped once: the log said the pinned microphone while the take came from
  the default. Log what the _hardware_ reports (`kAudioDevicePropertyDeviceIsRunningSomewhere`, or a read-back
  property getter), and treat a mismatch between request and answer as the finding, not as noise.
- **Ask the hardware after the source has started, not on the line that starts it.** A capture session begins
  asynchronously, so the question returns "nothing running" for a take that is recording perfectly — the honest check
  becomes the misleading line. Defer it a second (a one-shot `asyncAfter`) and log that.

**Spiked and validated.** An `AVCaptureSession` with `AVCaptureDeviceInput(device:)` and an
`AVCaptureAudioDataOutput` whose `audioSettings` ask for linear PCM at 16 kHz mono 16-bit delivers exactly that — no
`AVAudioConverter` of your own. Measured: 3.02 s captured from a device that was _not_ the system default, valid WAV,
`1 ch, 16000 Hz, Int16`. Five API traps sit between that and a session that records silence: commit the configuration
before starting; pump the run loop; keep a **strong** reference to the sample-buffer delegate; hand `AVAudioFile` a
Float32 buffer; copy non-contiguous block buffers through their data pointer. Recipe, code sketch, the
deallocation-writes-the-WAV-header note and the `AudioSource` seam: `references/device-first-audio-capture.md`.

whisper-cli 1.9.x flags for a **development-only** comparison path: `-m model -f file -l en -t 8 -np` (no
prints), plus `-otxt -of <base> -nt`. Read the generated `.txt` if present, else stdout, and strip
`[00:00:00.000 --> …]` prefixes — that keeps the parser working across whisper.cpp versions. Budget
**~1.5–2.5 s per clip including model load** (homebrew's build is CPU-only; the first run cold-reads the
1.6 GB model in ~12 s). Move to a resident `whisper-server` only if that model load matters.

**Point `-of` at a temporary directory, never beside the input.** The sidecar is `<base>.txt` and the code
deletes it after reading, so a `foo.txt` sitting next to the `foo.wav` you transcribed is deleted as collateral
— which is how a measurement script lost its own source text mid-table. A CLI that can delete a file the user
owns because of what their _input_ is called is a bug whatever the file is for, and the fix is
`FileManager.default.temporaryDirectory`, not care.

### Reading a file that is still being written

Transcribing the audio _during_ a take means reading a WAV that has not been closed. Four things bite, in this
order:

- **A WAV in progress has zero in its two size fields** — the writer fills them in at close — and every ASR engine
  refuses it outright (`Invalid audio data provided. Must be at least 300ms of 16kHz audio`). Copy the bytes so far
  and patch the sizes: the RIFF size at byte 4, and the `data` chunk size.
- **The `data` size field sits four bytes _before_ the payload, not at it.** Writing it at the payload's own
  offset overwrites the first two samples, which the engine hears as a click. Locate the payload, then write at
  `payloadStart - 4` with the value `bytes.count - payloadStart`.
- **Find the payload by walking the chunks.** A real WAV carries other chunks before `data` (both `afconvert` and
  `AVAudioFile` emit them), so a hardcoded 44-byte header offset slices the wrong bytes — and it fails as "no audio",
  which reads like a recorder bug. Walk `i = 12`, read each chunk's four-byte size, and skip to the next.
- **Never ask `AVAudioFile` how long a file being written is.** It reports **zero seconds** for a WAV whose size
  fields are zero, so a guard built on it silently blocks every pass — the feature becomes a no-op on the user's
  machine while the code reads correctly. The only trustworthy measure mid-take is the payload: 16 kHz mono 16-bit
  is exactly **32 000 bytes a second**.

When the live work shares one engine with the real result, two rules keep the result on time:

- **One pass in flight, ever.** Skip a tick that finds a pass running, so the live work is bounded to a single
  operation however long the take runs. Stop the loop _before_ asking for the final transcription.
- **Use a `DispatchSourceTimer`, not `Timer`.** A run-loop timer fires only when something runs the run loop, and
  there are real cases where nothing does — while a menu is tracking, and in any harness that pumps the main queue
  without spinning the run loop. Have the handler hop to the main queue so everything stateful stays single-threaded.

Stretch the interval with the take's length and give up past about a minute (the engine's cost grows with the
audio — under a second for short takes, seconds for long ones) and log every pass with what it covered, so the
behaviour is diagnosable from the log rather than from a stopwatch.

Testing all of this with no microphone: `references/offline-audio-engine-testing.md`.

## Verifying a GUI you cannot screenshot

Accessibility-based introspection (System Events, the AX API) can refuse an `LSUIElement` app outright,
and screen capture _may_ need Screen Recording permission — environment limits, not app bugs. **Do not
treat either as "this change cannot be verified":** `screencapture -x` (whole screen) and
`screencapture -l <CGWindowID>` (one window, shadow omitted, at 2x) both produce measurable pixels here
without any special grant, and the window id comes from `scripts/window-id.swift`. Reach for a capture
first and only fall back to in-process logging when it genuinely comes back empty. Other real evidence
(full detail, including the live-geometry and warm-up cases:
`references/verifying-a-gui-you-cannot-screenshot.md`):

- **Menu bar item exists and is placed**: at launch log `statusItem.button?.window?.frame` + `isVisible`.
  A frame near the top of the screen (`y ≈ screenHeight − 24`) proves it rendered.
- **Windows/HUD on screen**: `osascript -e 'tell application "System Events" to tell process "MyApp" to get {position, size} of every window'` — the live geometry, frame by frame, is in the verification reference. **A SwiftUI-hosted window can refuse it** (`Can't get window 1 of process "X". Invalid index. (-1719)` on a window plainly on screen, while keystrokes to the same process still work), so have two fallbacks ready and reach for them without a detour: an in-process `--window [seconds]` mode that prints `window.frame` and `contentLayoutRect.size`, and the window's `CGWindowID` from `CGWindowListCopyWindowInfo` for a per-window capture.
- **A slow or missing transcript on the first run is the engine warming up, not a regression.** A new ANE
  model specialises for ~23 s at launch, so a recording that finishes before the preload line appears is
  transcribed late (9.6 s instead of 0.2 s) or looks like it never happened. Wait for the load-complete line
  before judging a capture or engine change, and re-run before drawing a conclusion.
- **Drive the real hotkey end-to-end**:
  `osascript -e 'tell application "System Events" to keystroke " " using {option down, command down}'`,
  put audio in the room with `say -v Samantha "…"`, then press the hotkey again. Exercises
  hotkey → record → transcribe → clipboard for real.
- **A paste goes to the frontmost app, so the harness must hold focus, not merely ask for it.** Activating a
  text sink and then running other tooling — or the user working in another window — leaves another app
  front, the transcript lands there, and the document you read back is empty, which reads as a broken paste.
  Check `tell application "System Events" to get name of first application process whose frontmost is true`
  before concluding anything, and use the clipboard as the second signal: the app copies as well as pastes,
  so a transcript on the clipboard with an empty document means it pasted somewhere else. Say so — the text
  may have landed in whatever the user had focused.
- **TCC gotcha**: a CLI binary spawned by an agent/terminal inherits the _parent's_ mic permission, so a
  bare binary reporting `microphone access denied` does not mean the bundled app is broken. Ask for the
  microphone once at first launch (a `didPromptMic` default flag) rather than mid-sentence later.
- If a transcript seems to clip the first words, check the WAV itself (`ffprobe` duration +
  `-af silencedetect=noise=-38dB:d=0.25`) before blaming the recorder — test-harness timing is the usual cause.
- **An empty transcript is usually the harness, not the app — read the kept audio before believing either.**
  `afinfo <wav>` for the format (`1 ch, 16000 Hz, Int16` proves the engine wrote what it promised) and
  `ffmpeg -i <wav> -af volumedetect -f null -` for the level: −67 to −73 dB mean is an empty room, so the
  app transcribed silence correctly. The log names the input device — a connected Bluetooth headset becomes
  the default input, and `say -v <voice>` through the speakers then never reaches it, which looks exactly
  like a broken recorder. The other end of the same scale clips: mean −27 dB with `max_volume: 0.0 dB` is a
  loud speaker against the microphone, and a clipped recording transcribes empty too — lower the output
  volume for a scripted dictation, and restore it afterwards.
- **Guard a recording too short to contain anything, before handing it to the engine.** An empty or
  sub-300 ms file makes the ASR answer `invalid audio`, and surfacing that as "Transcription failed" tells
  the user nothing. If `elapsed < 0.3`, skip the engine, delete the empty file, and say what happened
  ("Nothing was recorded — check the microphone").
- **Verifying the menu bar from a screen capture is unreliable; verify the image object instead.** A crop at
  the item's own logged frame landed on a neighbouring glyph, macOS inserts its own microphone pill while
  recording (which re-lays out the bar), and an A/B with the app quit differed by less than the bar's own
  noise. What does work: `--status-image` for the exact image each state sets, plus the logged button frame
  and width for on-screen placement — and where the oracle stays weak, ask the user to look rather than
  reporting a guess as verification.
- **Verify the installed binary, not the build product.** `codesign` rewrites the executable, so the
  built copy and the bundled copy always differ in hash — comparing them reads as a stale install when
  it is not. Check mtimes, or better prove the _behaviour_: run the shipped app and exercise the new path.
  `strings`/`grep -a` for a UI literal is only half an oracle — release builds pool some constants as UTF-16
  and debug builds do not, so the same literal that greps clean in `.build/debug` returns **zero** in the
  installed binary while the feature is plainly there. A miss is not evidence of a missing feature; grep a
  string you know is present in the same binary as a control before believing either result.
- **Status-item menus are not reachable by script at all — not through System Events, and not through the
  Accessibility API.** For an `LSUIElement` app, `tell application "System Events" to … menu bar item 1 of
  menu bar 1` fails with an invalid-index error; and a process that reports `AXIsProcessTrusted() == true` and
  finds `AXExtrasMenuBar` in the app element's own attribute list still gets no value out of it
  (`AXError -25212` from the app's element, `-25205` from `AXUIElementCreateSystemWide()`), with and without
  activating the app first. Clicking blind at screen coordinates is not a workaround — a mis-aimed click on a
  menu bar item can toggle Wi-Fi. So never plan a verification that depends on pressing a menu item. Instead:
  put what the item's _enablement_ depends on behind a small pure type and unit-test that, log the state it
  reads (a line like `kept <file> for a retake (3.0s)` is proof the item is enabled), keep the titles in
  `strings`, and hand the one click to the user — saying plainly that the click is the part you could not
  check. Compile-checked `#selector` is what makes a typo in a menu title impossible in the first place.
- **A redirected CLI's stdout is fully buffered.** `MyApp --long-job > out.log` shows nothing until the
  process exits, which looks like a hang; poll the process, not the file. When you need the output _while_ the
  process runs — a window's frame, a progress line you act on — run it under a pty instead:
  `script -q /tmp/out.log MyApp --window 30`, which line-buffers and writes through as it goes.
- **Answer "what should we improve next" from the log, not from taste**, and keep your own harness out of the
  numbers: an empty result has three causes (silent input, speech too faint to decode, your own clipped `say`
  run) and only the audio the app kept tells them apart. Group runs by filename, classify them by level, then
  quote the classification. Recipe: `references/verifying-a-gui-you-cannot-screenshot.md`.

## The app icon and the menu bar mark

**Draw the icon with the app's own renderer.** Add a `--icon <out.png> <mark> [px]` CLI mode and have
`scripts/make-icon.sh` call it once per size in the `.iconset`; the icon is then the app's own visual
language by construction, and cannot drift from the thing it depicts. Rules that took measurement to find:

- **Render every size AT that size, and grow fine texture as the tile shrinks.** A mark made of dots
  averages with the gaps beside it: at 64 px it is a grey smudge, and by 16 px it is gone. Scaling dot size
  inversely with the tile (e.g. `* min(4, max(1, pow(512/size, 0.30)))`) keeps one drawing readable from 512
  down to 16 — measured 0.83 peak brightness and 17–23 % coverage at every size, against 0.47 and invisible
  without it. **Size every element from the tile, not from the shape beside it**: a dot drawn as a fraction
  of the sphere's radius is sub-pixel at 16 px even when the mark's overall hint is right, which reads as a
  smudge (0.50 peak against a 0.70 floor). This is the same mistake twice — the menu bar glyph and then a
  halftone mark — so check each mark's smallest element at 16 px, not just the mark as a whole.
- **Exact pixels, not points.** `NSImage(size:)` + `lockFocus()` renders at the screen scale, so a 32 px
  request produces a 64 px file. Build an `NSBitmapImageRep(pixelsWide:pixelsHigh:)`, set `rep.size` to the
  point size, draw inside `NSGraphicsContext(bitmapImageRep:)` using `graphics.cgContext` — the wrapper
  itself has no `scaleBy`/`setShouldAntialias`.
- **Keep the tile's pixel size out of the geometry.** "How big is the canvas" and "how big will this be on
  screen" are two numbers; passing the pixel size into code that computes layout draws a 16 px icon's body
  off the canvas. Use it only for the texture hint.
- **The menu bar gets a silhouette, not the texture.** At 18 pt dots are mush, so draw a simplified mark
  (ring, core) as a **template image**, and keep momentary states on their own glyphs — "recording" is worth
  more than branding while it happens.
- **Judge a candidate mark at true size, magnified with nearest-neighbour, never from a large preview.**
  A preview at 64 pt flatters every shape: what reads as a blob, a comma or a radio button at 18 pt looks
  considered at 8×. Measured verdicts from a set of five at 18 pt: three bars of unequal height read as an
  audio meter; a dot inside a ring reads as a **radio button**; a disc with a bite out of it reads as a blob;
  a dot with a tail reads as a comma; a dotted ring and a fine ring both turn into a fuzzy halo. Offer the
  survivors as one sheet and let the user choose — expect them to keep what already ships.
- **Make the mark selectable from defaults, not a rebuild.** A `static var chosen` reading
  `defaults write <bundle-id> menuBarMark <name>` means the look can be revisited in a minute, months later,
  and the file is the only place the choice lives.
- **A custom mark must match the system glyphs' optical size.** Menu bar symbols come back at ~15 pt; an
  18 pt mark makes the item visibly grow and shrink every time you record. Match them — 16 pt against a 15 pt
  glyph, since a thin ring reads smaller than a filled symbol — and confirm it on screen from the logged
  button width, which went 34 → 32, exactly the symbol states' width.
- **Keep the image a template whenever you tint it.** `contentTintColor` needs a template to colour, so
  switching `isTemplate = false` for the tinted states draws the black glyph as-is and it vanishes on a dark
  bar. Assert `isTemplate` per state rather than reasoning about it.
- **Give the bar's image a seam you can ask about.** One `StatusIcon.image(for:)` / `symbol(for:)` /
  `tint(for:)` used by the app _and_ by a `--status-image <out.png> <state>` CLI makes what the bar is handed
  inspectable (`template=true tint=systemRed size=15x15`) and assertable: every state is a template, every
  mark is centred in its canvas, the resting mark matches the glyph size.
- **Position a growing mark so its REST state is centred, not its tallest.** Bars laid out for maximum
  height sat 6.5 px below centre when idle — a bottom-heavy glyph in the bar. A centring assertion (ink
  bounds midpoint against the canvas centre, asserted per axis) catches that class, including the
  pixel-versus-point quadrant bug.
- **Test a template the way the system renders it.** Only alpha survives `isTemplate = true`; the system
  tints it. Compositing the raw black glyph onto a dark bar proves nothing and reads as "does not adapt" —
  test black-on-light and white-on-dark.
- **Composite the whole state family before calling it done.** Idle mark against the states beside it, on a
  light and a dark bar, at matched scale: this is what shows an idle mark that is optically too light next to
  a filled record glyph, and a tint (orange) that is too weak on a light bar — neither is visible from the
  mark alone.
- Verify per size with a contact sheet (`--icon-sheet`) plus pixel measurements, never by eye: a vision model
  will not judge a 15 % size difference, and a 2 px dot is invisible to it either way.

Recipe, the ImageMagick fallback and the mark-versus-name decisions: `references/app-icon-and-menu-bar-mark.md`.

## One-time setup

```bash
brew install whisper-cpp     # development only — see the rule below
```

**Do not ship an engine that asks the buyer to install anything.** whisper.cpp is a Homebrew formula, so a menu
item that offers it answers `whisper-cli not found (brew install whisper-cpp)` on every Mac that has not done
it — a support ticket dressed as a feature, on an app sold from its own website. FluidAudio fetches Parakeet's
weights into its own cache on first run, which is the shape that ships. Keep whisper for local comparison if it
is useful, and reach for `brew install whisper-cpp` only then.

## Parakeet on the Neural Engine (FluidAudio) — the better ASR engine

Press-to-dictate apps should not ship whisper.cpp if they can run Parakeet on the ANE. Measured on an
M1 Max, same 8 s WAV: whisper.cpp `large-v3-turbo` **1.76 s warm (4.5× realtime)** vs Parakeet Ultra
**0.14 s warm (56.8× realtime)**, identical transcript. End to end (hotkey → clipboard) went from
2.4 s to 0.50 s.

```swift
// Package.swift: .package(url: "https://github.com/FluidInference/FluidAudio.git", from: "0.17.0")
let models = try await AsrModels.downloadAndLoad(version: .ultra, progressHandler: handler)
let asr = AsrManager(config: .default, models: models)     // keep this resident
var state = try TdtDecoderState()
let result = try await asr.transcribe(url, decoderState: &state, language: .english)
```

The four traps that cost the most time: **never hand-parse WAV bytes** (pass a file URL — manually sliced
PCM yields _empty transcripts_ with no error), **copy the SwiftPM `*.bundle` resources into the .app** (or
model loading fails at runtime), **preload at launch** (the first ANE load specialises the programme for
~23 s, cached afterwards at ~0.2 s), and **serialise the load** behind an in-flight `Task` so a launch
preload and a dictation cannot load models concurrently. Add a `--bench <file.wav>` CLI mode that runs each
installed engine three times and prints first/warm timings — that is where those numbers came from.

**Treat the first-run download and that first specialisation as a first-run flow, not as a pause inside the
customer's first dictation.** The model is hundreds of megabytes and the ANE programme compiles for ~23 s once
per machine, so the honest shape is a "getting ready" state with the progress the HUD already knows how to
draw — warm the engine before the first hotkey press rather than after it.

Make it a state the app _acts_ on, in one place, covering launch and every engine or model change. Offering a
switch to a model that is not installed has exactly the same trap as the first run, with the fetch running
invisibly behind the menu:

- **Pass the progress callback at launch.** A preload called without one fetches hundreds of megabytes with
  nothing reported anywhere, so the cost surfaces as the customer's first dictation hanging — the code reads
  correctly and the log is silent.
- **Decline the press; never swallow it.** Gate the hotkey on the readiness state and answer with that state in
  the pill. The behaviour being prevented is recording a take and _then_ waiting for a download: the user loses
  the sentence and reads the app as frozen.
- **A download in progress is not an error.** Route the refusal through the calm working state in a warning
  colour, not the error state — red and throbbing, for something the app said it would do, reads as a fault.
  This one was caught from the rendered screenshot, not from reasoning about the code.
- **Say it where the user is already looking**: the menu's first line ("Getting the speech model — 43%"), the
  tooltip, and the pill for the refused press. Reserve the error treatment for a real failure, and let a
  completed first run announce itself exactly once.
- **Hold the refusal label to the box's character budget** (~16 characters under a 64 pt orb) and assert it in
  a test — this limit bites more than once. Render the state and measure the label's ink margins rather than
  counting characters and hoping.
- **A `(\d{1,3})%` regex reads `1234%` as `234%`.** Add the lookbehind (`(?<!\d)`) before trusting a percentage
  parsed out of an engine's prose.
- **Give the render CLI a named-colour argument**, so a state that passes its own colour (a warning's amber) can
  be proofed as it will really look instead of in whatever its state defaults to.
- **Verify the missing-download path without deleting what works**: `references/verifying-a-gui-you-cannot-screenshot.md`.

### One engine, unless a second one earns its place

Parakeet on the ANE is the engine; a second one is a liability until it is both _not_ something the buyer must
install and better on every axis. whisper.cpp lost that argument on measurement: **0.14 s vs 1.76 s warm**,
1.9 GB resident against ~150 MB, a 1.5 GB model download against FluidAudio's own fetch — and a decoder that
collapses on repeated audio. Six minutes of _prose_ come back whole (555 of 555 words, closing sentence intact)
while the same sentence twenty-four times in 76 s returns six of them; neither `-mc 0`, `-nf`, `-bs`, `-et`,
`-sns` nor a second WAV encoder changes it. So the app ships one engine and keeps the numbers as history.

When a capability like that does get removed, sweep it out in one pass — the half-removed version is worse than
keeping it, because the leftovers are all _user-visible_:

- **Code and settings**: the engine enum and its menu, the CLI flag, the model downloader and its subprocess,
  the binary/model discovery, the stored default, and the support directory that held the weights (1.7 GB sat
  there with nothing left to read it).
- **Strings the buyer reads.** `NSMicrophoneUsageDescription` went on promising "transcribes it on-device with
  whisper.cpp" long after the code was gone; that string appears in a permission dialog on first launch. Sweep
  usage strings, menu titles, the CLI usage text, and anything the read-me or product page repeats.
- **Grep the test tree, not just `Sources/`.** A label round-trip test still held the removed enum, and only the
  compiler found it — `swift test` after the deletion is what proves the surface is covered.
- **Make the removal loud.** An unknown CLI flag or value must exit non-zero with the list of what _is_
  accepted (`--engine whisper` → "removed; parakeet is the only engine"), because a silently ignored option is
  how a measurement gets attributed to the wrong engine: `--engine parakeet-v3` fell back to the default and put
  a row labelled v3 in a table of timings that had actually run ultra.
- **Keep the measurements.** They are the reason for the decision, and the next person will ask why the app has
  one engine. They belong in the repo's docs next to the command that reproduces them, not in a chat log.

Model versions, chunking for long audio, the ITN opt-in and progress-callback deduping:
`references/parakeet-asr-on-the-neural-engine.md`.

## Signing decides whether permissions stick

**Never ship an ad-hoc signature (`codesign --sign -`) for an app that needs TCC grants.** Its
designated requirement is literally `cdhash H"…"`, which changes on every rebuild, so macOS cannot
match the user's existing Microphone/Accessibility grant and re-prompts after each build. Diagnose
it from the TCC daemon log, not by guessing:

```bash
log show --last 30m --predicate 'subsystem == "com.apple.TCC"' --style compact \
  | grep -i <bundle-id> | grep -iE "Failed to match|PROMPTING|kTCCService"
```

- `Failed to match existing code requirement for subject <id> and service kTCCServiceAccessibility`
  — the grant exists but belongs to a dead build. That is the whole story of "it keeps asking me,
  and it _is_ set".
- Fix: sign with **one** identity, never switch, and read back what you got: `security find-identity -v -p
  codesigning`, then `codesign --force --sign "<identity>" --identifier <bundle-id>`, then
  `codesign -d -r- App.app`. What you want is the **team-anchored** requirement —
  `identifier "…" and anchor apple generic and certificate leaf[subject.OU] = "<TEAMID>"` — which every
  build the team ever signs satisfies, so grants survive every rebuild and update. Two near-misses both read
  as fine in `codesign -dv` output and are not: an ad-hoc signature's requirement is a bare `cdhash` (a new
  one every build), and a **development certificate's requirement adds
  `certificate 1[field.1.2.840.113635.100.6.2.12]`, which a Developer ID build does not carry** — so a dev
  script that prefers `Apple Development` while the release script signs with Developer ID clears every grant
  each time it flips, in both directions. "`Apple Development` is right for a local app" is only true if you
  never build the same app with anything else.
- **Enforce it where the mistake is made, not by care.** Give the project a check that reads the requirement
  and exits non-zero unless it is team-anchored, wire it into the dev build path as a warning and into the
  packaging path as a refusal, and never let two scripts prefer different identities. A per-build requirement
  that cannot be shipped cannot break a buyer's update.
- **Ship the repair inside the app.** A menu item that runs `tccutil reset Accessibility <bundle-id>` and then
  asks again (spawn `/usr/bin/tccutil` through `Process` — the hardened runtime does not stop you) rebinds the
  grant to the running binary in one click. That is the whole fix for a user, and it is the same fix a
  customer needs when an entry goes stale on their machine.
- **Prove the stability, not just the repair.** Rebuild, reinstall a _different_ binary with the same identity,
  and exercise the feature again with no re-granting: that is the difference between "it works for me now"
  and "an update will not break this".
- Switching identity invalidates old rows: `tccutil reset Accessibility <bundle-id>` and
  `tccutil reset Microphone <bundle-id>`, then have the user grant once.
- Prove the fix with a rebuild: after granting, rebuild, act again, and check the TCC log again for
  `Failed to match` (should be zero) and `AUTHREQ_PROMPTING` (should be absent after the build time).
- **The Accessibility row can read ON and be unusable.** A grant belongs to a code signature, so after a
  rebuild or a re-sign the pane still lists the app with its toggle on while the running binary fails
  `AXIsProcessTrusted()` — and the user will insist, correctly from what they see, that it is granted. Treat
  the app's runtime answer as authoritative, and prove the history from the app's own log: group launches by
  whether the clipboard fallback fired to find the build after which pasting stopped.
- **Fix order for a stale row: reset, then re-add through the app's own prompt.**
  `tccutil reset Accessibility <bundle-id>` clears the dead entry (its row disappears from the pane — say so,
  or it reads as a new problem), then have the user trigger the app's explicit grant action so the new row
  binds to the current binary. Hand-removing and re-adding the row can re-bind to the same stale requirement.
- **The TCC database is unreadable without Full Disk Access.** To see what the pane actually shows, capture
  the Settings window and read the image — recipe in
  `references/verifying-a-gui-you-cannot-screenshot.md`.

**All of the above is local signing.** Shipping the same app to other people — Developer ID, the hardened
runtime, a DMG, notarization, and what a buyer needs on the product page — is its own procedure: see the
`macos-app-distribution` skill.

## Renaming a shipped app

A rename is a data migration, not a string change. Do it in one pass, in this order: derived spellings
first (a plural folder name before the bare name, or `Notes` becomes `Ponte`+`s`), then the bare name,
then the lowercase ids and paths.

1. **Inventory what carries the name**: `Info.plist` (`CFBundleExecutable/Name/DisplayName/Identifier`),
   the SwiftPM package + target + `path:`, the build script and `codesign --identifier`, the support
   directory, the output folder, the log filename, the `defaults` domain, the notification `-group`, the
   status-item tooltip and `accessibilityDescription`, and the README.
2. **`mv` the data on the same volume** — a multi-GB model directory moves instantly and must not be
   re-downloaded. Quit both apps first so nothing writes mid-move.
3. **Migrate defaults with a plist round-trip**, not per-key `defaults write`:
   `defaults export <old-id> - > /tmp/old.plist && defaults import <new-id> /tmp/old.plist` preserves value
   types, where writing a bool as the string `"1"` reads back wrong.
4. **A new bundle id costs the Accessibility grant, and may not cost the microphone one.** Microphone TCC
   accepted the new id when the app was signed with the same certificate (recording worked with no prompt);
   Accessibility is keyed to the bundle id and had to be re-granted, and until it was, the app fell back to
   the clipboard exactly as designed. Say so in the handover, and keep the old `.app` installed as a fallback
   rather than deleting it.
5. **Verify with a real run**, not by reading the plist: dictate, then confirm the note landed in the _new_
   folder and the log shows the models found (`installed=true`) rather than re-downloaded.
6. Rename the repo directory too, commit the rename separately from any behaviour change, and delete the
   stale `dist/<OldName>.app`.

Choosing the name is part of the job — search the category for collisions before proposing, and expect the
obvious synonyms to be taken: `references/naming-and-renaming-an-app.md`.

## Don't raise permission dialogs unprompted

Calling `AXIsProcessTrustedWithOptions(prompt: true)` in the app's normal flow pops a modal system
"Device Control and Data Access" dialog at the end of every dictation (macOS 26/27's wording for the
Accessibility category). Prompt only from an explicit user action (a menu item or a toggle the user
flips); otherwise fall back silently (clipboard instead of paste) and write one log line plus at most
one notification per launch. A modal dialog the user cannot connect to an action reads as a bug.

Two more traps:

- Writing into `~/Documents` triggers a **`kTCCServiceSystemPolicyDocumentsFolder`** prompt on first
  write. Keep generated data under `~/Library/Application Support/<App>/` to avoid a third permission.
- A key code of `0` is a real key (`kVK_ANSI_A`). Reading defaults with `integer(forKey:)` makes 0
  indistinguishable from "unset" and silently falls back to the default — use `object(forKey:)`.
- One physical hotkey press can deliver two events (key down + up, or key repeat). Debounce the action
  and flip the state variable _synchronously_ before any async work (e.g. a permission request),
  or a second event inside that window starts a second recording and orphans the first.

## A settings window for an accessory app

A settings window is the app's _second_ entry point — the CLI and the render path reach it without the app's launch
sequence ever running.

- **Register the defaults where the UI reads them, not only at launch.** `UserDefaults.bool(forKey:)` returns
  false for anything not explicitly stored, so a window built outside `applicationDidFinishLaunching` shows
  auto-paste as off when it is on — and a fresh install does the same. Call `Settings.registerDefaults()`
  (idempotent) in the view model's `refresh()`, and add a test asserting the shipped defaults so it cannot
  regress.
- **Refuse to open the window while a take is in flight.** A window takes focus, and focus is the paste target,
  so opening settings mid-dictation pastes into settings. Refuse in the app and answer in the HUD in the calm
  colour, not the error colour — nothing failed.
- **The hotkey recorder must unregister the chord it is recording**, or pressing the chord you already have
  starts a dictation instead of being captured. Register the _new_ chord before releasing the old so a refusal
  leaves a working hotkey, restore the stored chord on cancel, and restore it when the window closes mid-record.
- **A chord needs ⌘, ⌥ or ⌃ — or a bare function key.** A global hotkey on a plain letter takes that letter from
  every app on the machine, and ⇧ alone does not help because ⇧A is how you type a capital A. Refuse those in the
  chord type, where it is testable, not in the recorder, where it is not.
- **Put the policy in a value type and the plumbing in the view.** `NSEvent` monitors, focus and key-up cannot be
  scripted; a chord's `display`, `rejection` and Carbon-modifier mapping can, so the rules get tests and the
  window keeps only the wiring.
- **Measure the window from inside the process.** `osascript`/System Events cannot read an `LSUIElement` app's
  windows, and screen capture needs a permission the environment may not grant: a `--window [seconds]` CLI mode
  that prints `window.frame` and `contentLayoutRect.size` gives the numbers you actually want (an 860 × 588 frame
  for 860 × 560 of content).
- **Do not launch the installed bundle's binary to test a flag while the app is running.** App bundles are
  single-instance, so the invocation is routed to the running copy and prints nothing — which reads as a broken
  flag. Quit it first, or run `.build/debug/<App>`.
- **A bare `.build/debug` binary has no bundle id, so `defaults write <bundle-id> …` never reaches it.** CLI tests
  of a stored setting then pass against nothing: the feature reads as unimplemented, or the test writes one domain
  while the code reads another. Drive such settings with an explicit flag (`--mic <uid>`, `--variant <name>`) that
  writes through the same `Settings` accessor the UI uses, and print the value read back so the log proves which
  domain answered.
- **Never ship a control whose action does nothing.** When the mechanism behind a picker turns out to be blocked, a
  read-only row naming the live value plus the reason outranks a menu whose selection silently has no effect — the
  second teaches the user the app is broken, and the first is honest until the machinery lands. Say where the rest of
  the work went (an issue, a doc) instead of leaving a dead affordance in the window.

## An accessory app has no menu bar, so ⌘W and ⌘, do nothing

An `LSUIElement` app ships without a main menu, and every "standard" window shortcut is a menu item: ⌘W is
`performClose:`, ⌘M is `performMiniaturize:`, ⌘, is a settings item, ⌘Q is `terminate:`. **Key equivalents on
status-item menu items fire only while that menu is open**, so a status menu alone gives the app none of them — it
can display a resizable window that cannot be closed from the keyboard, and the user finds that before you do.

Install a minimal `NSApp.mainMenu` at launch:

- App menu: Open/Preferences (⌘,), Hide (⌘H), Hide Others (⌥⌘H), Show All, Quit (⌘Q).
- Window menu: Minimise (⌘M) and Close (⌘W), and assign `NSApp.windowsMenu` so AppKit keeps it in sync.
- **Leave `target = nil` on `performClose:`/`performMiniaturize:`/`terminate:`** so they travel the responder chain
  and act on whichever window is key. Pinning them to an object makes Close act on that object instead of the window
  in front of the user.

This is the one shortcut path that _is_ testable: unlike pressing a status-menu item, a keystroke plus a window count
works end to end.

```bash
P=MyApp
osascript -e "tell application \"System Events\" to tell process \"$P\" to set frontmost to true"
c() { osascript -e "tell application \"System Events\" to tell process \"$P\" to count windows"; }
c                                                                                    # 0
osascript -e 'tell application "System Events" to keystroke "," using command down'; sleep 3; c   # 1
osascript -e 'tell application "System Events" to keystroke "w" using command down'; sleep 3; c   # 0
```

## Liquid Glass (macOS 26 and later)

Glass is a _navigation_ material and the layout follows from that, not from taste:

- **Apple's rule settles the shape of the work:** Liquid Glass applies to the topmost layer, where navigation is
  defined; sidebars and tab bars float in it; content is clearly separated from navigation. So the material goes on
  the sidebar/chrome and the content pane keeps a **solid** surface. A window that is glass edge to edge is the
  thing the guidance argues against, and it is what makes text unreadable over someone's wallpaper.
- **Two APIs, one material.** SwiftUI: `glassEffect(_ glass: Glass = .regular, in shape: some Shape)`, with
  `Glass.regular/.clear/.tint(_:)/.interactive(_:)`, `GlassEffectContainer(spacing:)` and `glassEffectID(_:in:)`.
  AppKit: `NSGlassEffectView` (`contentView`, `cornerRadius`, `tintColor`, `style`) and
  `NSGlassEffectContainerView`. Neither needs a SwiftUI `App`/`Window` scene — glass is a view modifier, so it
  works inside an `NSHostingView`.
- **`glassEffect` and `Glass` live in `SwiftUICore`, not `SwiftUI`.** Grepping `SwiftUI.framework`'s
  swiftinterface for them returns nothing and reads exactly like "SwiftUI has no glass API" — which is wrong, and
  is a wrong answer given to the user. Check both modules before asserting any SDK API is absent.
- **Availability is macOS 26.0** for all of it (`effectIsInteractive` is 27.0), while a SwiftPM app's platform
  floor is usually older: route every call site through one `glassAvailable` helper and keep the opaque look as
  the fallback.
- **The window has to be see-through or the glass has nothing to sample** and resolves as flat grey:
  `isOpaque = false`, `backgroundColor = .clear`, `titlebarAppearsTransparent`, `styleMask.insert(.fullSizeContentView)`.
- **Clear with nothing behind it is a hole, not glass.** With no backdrop, another app's text is legible through
  the title bar (measured 8 % bright ink in that band) and the glass samples raw desktop, which reads as a washed
  lavender panel unrelated to the palette. Apple's own windows diffuse what is behind them: host an
  `NSVisualEffectView` (`.underWindowBackground`, `blendingMode = .behindWindow`, `state = .active`) as the
  window's `contentView` and put the SwiftUI tree inside it, so the desktop is blurred and the glass samples the
  blur. **Size that view explicitly** — an `NSVisualEffectView()` with no frame leaves the hosted view at zero, and
  autoresizing only fires on resize, so the app ships a blank window.
- **Untinted glass takes the colour of whatever is behind it.** Tint it near-black (`.tint(_:)`) and give the panel
  a 1 pt white-~7 % edge, or it measures (62,62,76) against a (34,34,36) content pane and reads as a foreign
  element sitting over the app.
- **Tint is hue; the _style_ is weight.** `Glass.tint(_ Color?)` takes no opacity, so it cannot lighten the
  material — a theme tinted cream still measured grey on a parchment window. `regular` carries its own darkening
  (right on an ebony ground, heavy on paper); `clear` is the lighter one. Measured on one pane: switching parchment
  to `.clear` took the sidebar-to-content step from 38 to 28 per channel and made the panel _warmer_, so it read as
  tinted paper in a deeper shade instead of a grey slab. Make the style a property of the theme, not a constant.
- **No sidebar-specific glass API exists** — nothing on `NSSplitViewItem`/`NSSplitViewController`. `NSVisualEffectView`
  with material `.sidebar` is the classic alternative, not a mode of glass; say which system you are using.
- **Never make a list `.focusable()` just to catch Return.** It draws an AppKit focus ring around the whole pane
  (1341 saturated-blue pixels in the user's screenshot). If `.keyboardShortcut` on the buttons already covers the
  keys, drop focusability and the ring goes with it.
- **Measure the user's screenshot instead of describing it.** When they send a bad result, PIL over the PNG names
  the bugs precisely: bright-ink share in a band → bleed-through, a count of saturated-blue pixels → a focus ring,
  region means → a mismatched tint. Those numbers locate the cause in a way the word "ugly" cannot — and they also
  dodge `vision_analyze` timing out on a large image, which it does.
- **Set the appearance explicitly** (`NSAppearance(named: .darkAqua)`) for a dark app. Glass resolves against the
  window's appearance, and a light panel beside a dark content pane reads as a rendering bug on a light desktop.
- **A full-size content view removes the drag handle and puts the traffic lights over the content**: pad the
  sidebar's first row (~30 pt) and set `isMovableByWindowBackground = true`.
- **`.interactive()` only on glass that backs clickable things** — that is what the interaction feedback is for.
- **The material cannot be rendered offscreen — but the window can be captured.** `ImageRenderer` does not draw
  glass or vibrancy (the region measures fully transparent), so a still is not evidence of the material. Capture
  the _window_ instead: `screencapture -x -o -l <CGWindowID> out.png` renders just that window at 2x with
  everything the compositor does, which is the only way to check tint, bleed-through and stray outlines without
  the user's own screenshot. Then measure the PNG for defect classes — mean colour of the panel against the
  content pane, bright-ink share in the title-bar band, count of saturated-blue pixels — and leave only the taste
  judgement to the eye. Recipe and the id probe: `references/verifying-a-gui-you-cannot-screenshot.md`,
  `scripts/window-id.swift`.

API table, availability macros and the measurement recipe: `references/liquid-glass.md`.

## Design gate for UI changes

Agree the design before touching `Sources/` — the user asks for this directly ("collaborate on visual
designs without you touching the app … agree on a design first"):

1. Write a self-contained HTML board into the project's `design/` folder showing the real
   alternatives at **real pixel sizes**, with metrics lifted from the current Swift source (read
   `HUD.swift` / `AppDelegate.swift` rather than inventing values) and the app's real state timings.
   Board mechanics, delivery and verification live in the `claude-design` skill; keep a
   `design/README.md` stating that nothing in `design/` ships and that revisions are preserved as
   `…-v2.html` rather than overwritten.
2. State the surface archetype in one line before designing — a recording HUD is a **Monitor**
   surface, so density and glanceability beat anything decorative.
3. Deliver it three ways: `open` it in their browser, attach rendered PNGs, and give the path.
4. Iterate on the artifact only. Do **not** rebuild or reinstall while a design is undecided — every
   install restarts the app, drops any in-flight recording, and interrupts whatever they were doing.
   Show the app is untouched by reporting the app binary's mtime, which must not have moved.
5. One approval, then one implementation pass.

What bites between approval and code:

- **"Brainstorm instead of patching" means do not touch `Sources/`.** When the user asks for ideas, a critique, or
  "how would you make this better", the deliverable is the diagnosis and the options: what is wrong with the current
  thing, in specifics, then two or three directions each with what it changes and what it costs, then the one
  question that decides between them. Making an improvement while answering is the failure — it settles the choice
  they had not made yet, and the next message has to undo it.
- **A board cannot show an OS material, and a material is not a layout question.** HTML can approximate glass but
  cannot prove it, and `ImageRenderer` will not draw it at all, so for a window whose look depends on vibrancy or
  glass the honest loop is: build the directions into the app behind one flag (`--variant a|b|c`, read from
  `UserDefaults` so a single session can walk them without a rebuild), launch each, capture each window by id, and
  hand over real screenshots. Keep the HTML board for what it is good at — composition, type, spacing, the choice
  between layouts — and switch to real variants the moment the question is "does this material look right".
- **A board is a picture, not a spec.** Where it is silent, keep what already works — an approved list view that
  shows no detail pane still needs a way to read a long entry, and adding one in the implementation is not scope
  creep. Dropping it is.
- **What has landed with this user, in the register he approved:** warm paper rather than white; one saturated
  accent spent only on _state_ (the selected row, the live tick) and never on counts or buttons; brass hairlines
  instead of grey dividers; a serif at reading size for the content (transcripts) against system sans for chrome;
  day sections with honest totals instead of a date column repeated on every row; and duration encoded as the length
  of a margin tick. Offer two or three directions rather than one, and keep the arithmetic behind them (grouping,
  totals, unit choice) in unit tests — a wrong total is a lie in the quietest place on the screen.
- **An approval reply can rename the product by accident.** A terse decision list may spell the app differently from
  its bundle id, site and installer, and the modern instinct (rename) is expensive while the helpful instinct
  (follow the reply literally) is wrong. Implement the name that exists, and say in one line that you did — the user
  can then either accept it or ask for a real rename.
- **A theme is a struct, and light mode is not an inversion.** One `WindowTheme` holding
  `window/ink/ink2/ink3/accent/accentSoft/brass/line/hairline/control/glassStyle/isDark` lets the register change
  without touching a view. `isDark` must be part of it because the window follows it: `.aqua` appearance so the
  material resolves light, and a **white** scrim over the frosted backdrop instead of a black one (a light window
  with a dark scrim cancels itself out). Two measured rules: a light accent must be **darker** than it looks —
  `#E9762B` is fine on ebony and fails AA on paper at 3.1:1 while `#B8491A` gives 4.7:1 — and hairlines must come
  from the theme, because `Color.white.opacity(0.07)` is invisible on parchment.
- **Every settings pane needs a `ScrollView`, not just the one with a list.** Scrollviewing only the list shipped a
  window where thirteen languages and four models clipped at the bottom **and pushed the pane's own header off the
  top** — the symptom is a missing heading and a half-row at the window edge, never a scrollbar to tip you off.
  Verify a header's existence by measuring ink in its band (17 155 px after the fix, none before).
- **Align panels from shared constants, then measure the alignment.** One `gutter` and one `panelRadius` read by both
  the sidebar and the content pane; the content gets the same vertical inset, the same radius, the same hairline, and
  a shadow so it lifts off the ground. Proof is numeric and cheap: both top edges at the same pixel row (75 px each)
  and a measured gap between them (9 pt for a 10 pt setting, the stroke taking the rest).
- **A row that opens into a detail must stop rendering its own summary.** Showing the 13 pt line above the 19 pt prose
  printed the sentence twice, and the duration twice as well (meta line and footer). Once a row is a page, the closed
  representation goes: the meta line keeps only the time, the facts move to the footer, and the two states differ in
  what they _contain_ rather than only in size. Measured as text bands — four before the fix, three after — which is a
  cheaper check than comparing the strings by eye.
- **A pane's chrome is not optional furniture.** When the design board omits something the window needs — a way to
  read a long entry — add it in the implementation and say so; the board is a picture, the window has to work.

**When the UI shows content that arrives in bursts** — live transcription, a token stream, a log tail — the
motion is not a matter of taste and not something to eyeball: meter the reveal at the rate the content was
produced, and derive the duration from it rather than picking one
(`clamp(0.72 / rate, 150ms, 400ms)`; speech runs about 2.5 items a second, giving 288 ms). Make every per-item
value a function of elapsed time, so the schedule is testable arithmetic and a still of it is exact. Full
derivation, the burst-drain check, the provisional-tail treatment and the merge rule:
`references/streaming-reveal.md`.

## Sharing one implementation between two apps

When two of the user's apps both need a thing, extract it rather than fixing it twice — but be precise
about which half is shareable.

- **Split by framework, not by taste.** Maths and analysis are shareable when the target imports no UI
  framework (check: Foundation/Synchronization/Accelerate/simd ✅, SwiftUI ❌). Presentation is not: a
  `CGContext` renderer and a SwiftUI `Canvas` are different APIs with different clocks.
- **Parameterise by _settings_, not by app.** One `CaptureSettings` value with presets named for the
  purpose (`.localTranscription` = 16 kHz WAV, `.streamingSpeech` = 24 kHz AAC) keeps one engine and one
  test suite. The apps differ in a value, not in code.
- **Keep the offline test harness with the engine.** A real `AVAudioEngine` in `.offline` manual
  rendering mode fed by a synthesised tone tests the recorder with no microphone, and it is what makes
  the shared engine provable for both apps at once.
- **Add parameters to a shared view instead of forking it.** A `spinRate` and a `dotScale` with defaults
  that preserve the original behaviour cost the other app nothing; a copy costs every future fix.
- **Check a shared view for frame-size dependence.** A dot size in absolute points is fine for the app it
  was tuned for (~300 pt orb) and wrong for a 64 pt one, where the same dots cover the sphere twice over.
  A `dotScale` multiplier is also what keeps a 16 px icon from smearing.
- **A test count may legitimately fall.** When orb maths moves into the package, delete the app's tests for
  it _only_ after confirming the package guards the same regression — the failure mode is a fix that
  silently loses its test.
- **A dependency bump must not change how anything looks.** If the consumer's appearance depends on a styling
  API the package no longer has, re-add that API with its original defaults (they usually _are_ the constants
  someone inlined) rather than rebuilding the consumer against the new shape: identical pixels, no design
  decision taken on the user's behalf. Recovering it is one command — `git show <tag>:<path> > <path>`, where
  `<tag>` is the last release that had it.
- **Port what the copy _does_, not just what it declares.** A duplicated recorder cleared its rings at the
  start of every take so the orb did not open on the previous take's tail; the survivor did not, and deleting
  the copy first would have shipped that glitch. Read the doomed file for side effects the signature does not
  show, move each into the package with a test, then delete.
- **Expect the bump to surface drift, and treat the first failing build as the finding.** A consumer pinned two
  versions back compiles against an API the package has since removed, so "update to the new version" is a
  migration, not a version-number edit. Say that when you estimate it.

### SwiftPM details that cost time

- **A path dependency's identity is the directory's basename** (`../Waveform` → `package: "Waveform"`),
  even when the manifest declares another name (`waveform-ios`).
- **`platforms: [.macOS(.v15)]` needs `swift-tools-version:6.0`** (`.v15` does not exist in the 5.9 manifest
  API). Bump the manifest, and pin the app's own target to `.swiftLanguageMode(.v5)` with
  `swiftSettings` so AppKit code is not dragged into strict-concurrency errors.
- **Renaming the package directory breaks the artifact cache** (absolute paths stored): `rm -rf .build`.
- **A consumer pins a _tag_, so local package edits are invisible to it until you release one.** Edit the package,
  rebuild the app, and the new API simply "does not exist" — `Package.resolved` still names the old version and the
  build is against that revision. Release, then bump: commit the package, `git tag vX.Y.Z`,
  `git push origin main --tags`, raise the consumer's `from:` to the new version, `swift package update <name>`,
  then read `Package.resolved` back to prove the pin moved. Check `git tag` first — re-tagging a version that already
  exists fails, and the fix is the next number, not a forced tag.
- **Renaming a published package is a release, not an edit, and it touches five places.** In one pass:
  `gh repo rename <new>` (run from inside the package directory, without `--repo`), fix the local `origin`,
  change the manifest's `name:`, then in **every** consumer the dependency URL _and_ each
  `package: "<old>"` product reference, then sweep the docs. Cut a tag for the new name.
- **Never rely on GitHub's redirect from the old repo URL to paper over a stale dependency line.** It resolves,
  which is exactly why a half-finished rename looks finished: consumers keep building against a URL that
  redirects, and nothing in the build output says the name is wrong. Prove it by grepping the tree for the old
  name — manifests, docs, comments, test files — and expect a couple of hits in prose a comment sweep missed.
- **One identity word, chosen once: the package name, the directory basename and the dependency URL should all
  match.** They are three separate strings and drift independently; a manifest that declares `foo-ios` in a
  directory called `foo` forces every consumer to write `package: "Foo"` and read the mismatch as a bug. The
  word should not name a platform either: a package used on macOS and iOS is `waveform`, not `waveform-ios`,
  and the rename is cheap while the package is private to your own apps.
- **A green build is only green for the host platform.** `swift build --sdk … -Xswiftc -target -Xswiftc
  arm64-apple-ios18.0` prints `Build complete!` while SwiftPM plans for the host and leaves every
  `#if os(iOS)` file out — a pass that never compiled the code you changed. Build for the target platform
  with `xcodebuild -scheme <Target> -destination 'generic/platform=iOS' -derivedDataPath /tmp/ios-check
  build CODE_SIGNING_ALLOWED=NO`, and prove the conditional file compiled by finding its `.o` under the
  derived data. The summary line is not the evidence; the object file is.
- **A consumer pins `Package.resolved` in more than one place.** An Xcode workspace and its `.xcodeproj` each
  carry one, and the project-level one is the copy nobody updates — it can sit two minor versions behind, on
  a URL that only resolves because GitHub still redirects. `xcodebuild -list -workspace …` re-resolves the
  workspace (it prints `Checking out <version>`); delete the project-level file rather than hand-editing it.

### SwiftUI inside an existing AppKit panel

- **`NSHostingView` hosts the view; the panel keeps its identity.** Make the panel one fixed size, big
  enough for the longest state, and align the content to the bottom — the box still sinks as it collapses
  and the window server is never asked for a new frame.
- **`TimelineView(.animation)` replaces the display link**, and a label that must tick (a recording clock)
  can be computed from the same `t` the frame uses, with no timer at all.
- **Give the view a pure form** (`HudBox(state:t:…)`) and a live wrapper (`TimelineView`), so a test or CLI
  can render any frame deterministically. Pass `turning: false` for stills, or the spin comes from the wall
  clock and two renders differ.
- **`ImageRenderer` works headlessly in a CLI** (call it from the main thread; wrap in
  `MainActor.assumeIsolated` in top-level code). It returns a **CGImage-backed** `NSImage`, so pixel probes
  must rasterise the image into their own `NSBitmapImageRep` before reading it — otherwise every
  measurement is silently zero.
- **`ImageRenderer` drops the AppKit-backed controls.** `TextField` renders as a pale box with a
  prohibition glyph, `Toggle` likewise, and a `ScrollView`'s content comes out absent — so a still of a
  settings pane shows a yellow blob where the search field is and an empty list where the rows are. That is
  the still lying, not the layout: the first read of one looks like a broken window. Swapping `LazyVStack`
  for `VStack` does **not** fix it (the `ScrollView` is the blocker), so use the render for what it does
  faithfully — layout arithmetic, type, colour, geometry, inset edges — and verify lists, fields and
  toggles in the running window.

## Testing an app whose bugs look fine in a still

Visual code fails plausibly: an orb that collapses as the user speaks, an icon that smears at 32 px, a
glyph drawn in the wrong quadrant — each renders _something_ and looks intentional. Measure pixels instead.

- **`swift test` works against an executable target** — `@testable import <Executable>` with a plain
  `.testTarget` in the same package, targeting `.executableTarget`. No library split, no `public` churn,
  even with `main.swift` at top level. Try it before restructuring the package.
- **Render into an explicit `NSBitmapImageRep`, never `lockFocus`.** A bitmap rep gives exact pixels and a
  context you control; `lockFocus` inherits the machine's display scale, so the same test measures
  differently on a retina Mac and a build machine.
- **Grep the test tree before deleting or renaming anything public.** A label round-trip test went on holding
  an enum that had been removed; only the compiler found it, and only because the suite was run _after_ the
  change. Tests restate the old shape by hand, so run the suite as the verification of the deletion rather
  than reasoning about who uses it.
- **Canonicalise paths in assertions.** A directory listing returns `/private/var/…` for a file the test
  created as `/var/…`, so comparing the two URLs fails on the same file: use `resolvingSymlinksInPath()` on
  both sides. Two Foundation APIs also disagree in the same SDK — the directory listing wants
  `[URLResourceKey]` while `resourceValues(forKeys:)` wants `Set<URLResourceKey>` — so keep them as two
  constants rather than one shared variable.
- **Mind points versus pixels, in the app and in the test.** The classic bug on both sides: sizing a mark
  from `pointSize` while drawing into a 2x pixel context, or probing at an absolute coordinate when you
  meant a distance from the centre. Assert the _centre_ and the _size_ separately.
- **Measure the properties that make the design work**, not just that ink appeared: monotonic growth with
  input, coverage rising as the tile shrinks (a hint working), the 10th-percentile brightness of the ink
  (depth shading present rather than a flat disc), a hole between two shapes (a ring, not a blob).
- **Compare a structural statistic, not two unrelated percentiles.** Asserting that a 16 px render is a dense
  disc via `tiny.p10 > big.p10` compares two distributions whose values can sit a hundredth apart: it passed
  in isolation and failed in the full suite on whatever antialiasing the surrounding tests left behind. But
  swapping the statistic is only half a fix, because a cross-render comparison stays unsound whichever one you
  pick: a statistic normalised by each render's own extent (`coverage` = ink over its own bounding box) is not
  comparable at all — measured 0.73–0.78 against 0.74–0.79, a premise that never held and passed only on noise
  — and the larger render's full-strength share wandered 0.17–0.70 with whatever had run before it. When the
  premise turns out never to have been true, **delete the assertion** and leave the characterisation to the
  deterministic CLI path (next rule) rather than tuning a threshold that was never measuring what it claimed.
- **Calibrate against the environment the test actually runs in, and claim only invariants.** The same render
  is not the same picture in two processes: dumped across four runs, a 512 px orb produced between 61 066 and
  77 273 ink pixels with a full-strength share of 0.165–0.460 depending on what ran before it, while the CLI
  that writes the `.icns` was byte-identical (five runs, one hash). So do not set a threshold from numbers you
  measured on another path. Add a **temporary probe test** that prints the measurements, run it alone _and_
  inside the full suite (`swift test --filter <Probe>`), read the spread, then assert only what held in every
  run — the peak, a percentile that never crossed its bound, a share with a wide margin — and record the rest
  as a measured fact in the comment with the exact command that checks it (`MyApp --icon … orb 512`).
  Thresholds guessed three times over is the cost of skipping the probe. Run it alone _and_ inside the suite —
  and note that `swift test --filter X` also matches `XTests`, so a filter aimed at one suite quietly runs its
  neighbour too (a filtered run reporting 12 tests where the suite has 8 is that, not a stale build). Give the
  probe class `@MainActor` when the renderer it calls is isolated, or it will not compile.
- **Extract pure functions to test the middle of an animation**: the ballistics step
  (`level = max(input, previous * decay)`) and the geometry at a time `t` are testable; the panel is not.
- **Take the vision model's geometry complaints seriously.** "The glyph is offset to the lower-left" was
  dismissed as a viewing artifact and was a real bug; the numeric test found it later.
- **Write the test's own expectations as carefully as the code.** A test for "the throb peaks are
  mislabelled" mislabelled a peak as a trough on its first run.
- **A guard on shared state can deadlock a test harness, not the app.** Work handed to the main queue is
  delivered only by something draining it: an async test on the main actor drains the main dispatch queue, but
  `RunLoop.run(mode:before:)` (and `run(until:)`, which is the same thing in `.default`) services that mode's
  sources _only_. Under it, a result dispatched to main never arrives and a `busy` flag set by the work is never
  cleared — which presents as "the feature produced nothing at all", several layers away from the cause. When a
  test sees zero of something, check how the harness pumps queues before doubting the code.
- **Quote a range across runs, never a single ratio.** The same 6-minute transcription measured 1.85 s, 2.14 s
  and 10.30 s on one machine, and a 76 s clip 0.67 s to 1.77 s, depending on what else was running. A headline
  like "89× realtime" is a claim the next run contradicts: run any timing measurement at least three times,
  report the spread, and let a pass/fail verdict rest on _content_ rather than on the clock.
- **Vary the content before concluding a size effect.** What looked like "cannot handle long audio" was the
  _material_: one sentence repeated 120 times is pathological for a decoder, and six minutes of distinct
  sentences came back whole. Hold the length fixed, vary what is in it, and only then call it a limit. A
  countable pattern — a repeated phrase plus a unique closing marker — is also what makes dropped or duplicated
  text visible at all, since a plausible-looking transcript hides a missing minute.
- **`ps %CPU` and the first line of `top -l` are averages since the process started**, not idle measurements. A
  "2.7 % at idle" figure came from exactly that, on a process that had been transcribing a minute earlier. Take
  interval samples (`top -l 5 -s 3 -pid <pid>`, reading the samples after the first) and report memory and
  thread count from the same window.
- **A measurement tool must refuse what it does not understand.** A flag it silently ignores, or a value it
  falls back on, turns a typo into a number you will quote with confidence. Have the tool print the variable it
  actually used (engine, model, device) and fail when that disagrees with what was asked for.
- **A Swift Testing suite reports differently from XCTest, and the XCTest line says nothing ran.** `import Testing`
  with `@Suite`/`@Test` prints `Test run with N tests in M suites passed` and never an `Executed N tests` line, so
  grepping for the XCTest summary returns zero and reads exactly like an empty suite. Grep `Test run with` (and `✘`
  for failures) before concluding the tests are missing.
- **Resampled frame counts are not exact: a converter holds a priming tail.** Assert the converted length within a
  tolerance, and work the expectation out per segment (frames ÷ _that segment's_ rate) — a format change mid-take
  adds segment durations, and five buffers of 4 800 frames at 24 kHz is a full second, not half of one. When the count
  is off by a few hundred the test is usually the thing that is wrong.

## Renaming a package directory

The SwiftPM artifact cache stores **absolute** paths, so `mv`-ing the package directory breaks the build
with `There is no XCFramework found at /old/path/...`. `rm -rf .build` and rebuild (it re-fetches any
binary artifacts). Do this _before_ concluding a rename broke the code.

## Drawing an animated procedural view

**Once a sibling app already draws the same thing, host _its_ view — do not keep a parallel renderer**
(see "Sharing code with the user's other apps"). The AppKit route below is then for what you still draw
yourself.

Hosting the shared view, and the window rule that matters:

- **`NSHostingView(rootView:)` as the panel's `contentView`**, with the view filling it.
- **Do not resize the window per frame.** Give the panel one fixed size (wide enough for the longest thing
  it ever shows) and let the _content_ morph inside it, anchored to the edge the motion should hold — a box
  that collapses to a pill stays put at the bottom without asking the window server for a frame sixty times
  a second. No panel shadow either: the content draws its own edge, and a shadow would ring the mostly
  empty panel.
- **Drive it with `TimelineView(.animation)`** and derive every per-frame value from `timeline.date`: one
  clock, no `CADisplayLink`, and the same view renders offscreen for tests and CLI sheets.
- **Carry colour as `Color(nsColor:)`** from the palette the tests and the icon already assert on, so there
  is one source of truth.
- **SwiftUI modifiers supply what the shared view does not have** — `.scaleEffect`/`.opacity` for a
  shrink-and-fade lifecycle, a nested `.frame` so the layout follows the visual size.

Drawing it yourself in AppKit: batch by style, then fill once — group dots into four depth layers, build one
`CGMutablePath` per layer with `addEllipse`, and do four `fillPath()` calls, so 1,100 dots costs four fills
a frame (per-dot `setFillColor` is what makes it feel slow). Drive it with `CADisplayLink`
(`view.displayLink(target:selector:)`, macOS 14+) in `.main`/`.common`, invalidated when the panel hides
(measured 0% CPU idle). Keep the material behind the drawing (`NSVisualEffectView`), and give the content
view a `drawContents(in:)` that takes a context so the same code renders offscreen.

## A glanceable element carries one fact

A HUD pill is read in a quarter of a second. One fact fits; two numbers need a legend.

- **Avoid unlabelled pairs.** `Pasted ✓ 8.1s → 0.2s` was meant as "recorded length → transcribe time" and read
  as a bug, because an arrow between two times claims a relationship the reader has to guess.
- **Put the diagnostic number somewhere it can be read properly** — the log, the note frontmatter, a stats line —
  not in the element the user glances at. If a number is there to prove a measurement is not hardcoded, that is
  the log's job.
- **Keep a money path honest the other way**: a displayed number must be live, never a caption from the mock.
  A hardcoded `0:07` from a design board shipped once and the user spotted it immediately.
- **Let the layout follow the string.** Measuring the text at runtime means wording changes are free: the same
  box collapsed to 119 × 47 with times in it and 89 × 47 without.

## Space a fixed box from its visible ink, not from its frames

The user notices interior spacing before anything else, and every constant will look right: a box is laid out
from _frames_, and a frame is not what anyone sees.

- **Measure the ink before choosing numbers.** In a 96 pt square the label's ink sat 10 pt above the bottom edge
  against 15 pt above the orb — the block was centred as frames, and the orb's 64 pt frame carries ~8 pt of dots
  too dim to register while the label's line box carries descender space its glyphs never use. The padding
  constant, the points-versus-pixels handling and the design board's numbers were all innocent.
- **Grow the box and lift the block; do not shrink the orb.** +8 pt of box with a 4 pt lift took the label's
  clearance from 10 pt to 18 pt while the orb stayed exactly where it was (its ink rows unmoved, 15 pt below the
  top edge) and the collapsed pill was untouched — scale the lift by the collapse so the pill keeps the board's
  symmetric frame padding.
- **Read it as ink bands.** Inside the box's alpha, profile rows by luminance and group contiguous rows: the orb
  and the label fall out as two bands with a gap between them, which is the clearance and the gap. It is also the
  honest way to answer "what is the padding and what is the gap?" — quote the declared constant _and_ the
  measured result, and say which is which (declared gap 5 pt, visible gap 15.5 pt).
- **Assert the clearance in a test**, so a constant that looks fine cannot bring the complaint back. Derive the
  render's scale from the box (`pixelsHigh / fullBox`) rather than assuming 2x: through a probe helper an
  `ImageRenderer`'s CGImage-backed image lands at 1 px per point in-process. **When the box's size becomes
  state-dependent, that divisor must be the state's own box** — a fixed constant silently mis-scales every
  measurement the moment one state gets a different shape, and the numbers come out plausible.
- **Read ink through the alpha channel, not the composited colour.** Converting an RGBA render to RGB composites
  transparency onto white, so a probe then measures the whole canvas as "ink" and reports a bounding box equal
  to the image — which looks like a plausible result until you notice the box is the entire frame. Gate the
  luminance test on `alpha > threshold` and measure the drawn region, not the picture.
- **Make the lift a `UserDefaults` value read at render time** (`defaults write <bundle-id> hudBlockLift -float 6`).
  Spacing is taste, and the user will want to nudge it and judge it without a rebuild.

## Warn only when the outcome is not the only judge

A mid-flight warning about the input is itself a feature, and one that fires on work which succeeds is
worse than no warning at all.

- **Ask whether the app can know the thing it is about to say.** A take is lost either because there is no
  signal or because the speech is too faint to decode. Level separates the first cleanly — an asleep input
  peaks at −39 dBFS or below, a voice near the microphone above −10 — so "no signal" is safe to announce
  once the take has run flat for about three seconds. It cannot separate the second: recordings that came
  back empty peaked at −22.5 and −24.1 dBFS, _among_ takes that transcribed at 0.99 confidence and pasted.
  No threshold divides faint-but-fine from faint-and-lost; only the engine's result does, and that arrives
  too late to warn about. Cut that warning rather than retuning it.
- **Sample the meter and act once per transition, not once per tick.** A 0.25 s `Timer` in `.common` (so it
  keeps ticking with a menu open) reading the newest column's peak. Log the transition with the loudest peak
  and the device name so a quiet take stays diagnosable afterwards, and draw only on the transition or a
  silent take says its piece four times a second.
- **Make the warning a label override, not a state.** A `hint` the view prefers over the clock, cleared when
  the condition goes: the recording, the orb and the clock carry on untouched, and because the clock is
  derived from the frame's time there is nothing to restore. A state change restarts the lifecycle
  animation and then fights the ticking clock.
- **One fact, short enough for the box, in a warning colour.** "Check the mic" fits at ~10 pt under a 64 pt
  orb inside the 96 pt box; the sentence version belongs in the post-hoc pill, which can collapse to its
  measured width, and in the log.
- **Verify the negative case or you have not verified the warning.** The first live run of a "too quiet"
  rule nagged a take that transcribed perfectly — the user caught it, the tests did not. Every warning needs
  both runs: shown when it should fire, and provably silent on a normal one, with the silence read out of
  the log rather than assumed.
- **Calibrate from the spread of real runs, never from one or two samples.** Two failing takes set a
  threshold that flagged takes that worked. Mine the app's own log for every instance of the condition,
  classify each by the audio the app kept, put the threshold where the two populations actually separate,
  and assert the boundary in the test at values that were measured rather than at round numbers.

## Letting the user pick a wording

When the user questions a string, render the candidates **with the app's own renderer** into one image and ask.
It is far better than describing them — and expect an off-list answer: offered four pills, the user chose
`Pasted ✓` with no times, which pointed at the real fix (drop the diagnostic number entirely).

## Sharing code with the user's other apps

This user has several apps that do the same kind of thing (dictation, voice, orbs) and **wants the shared
version, not two copies**. Their instinct is the right one and they will ask for it: "is it possible to
abstract X to a shared tested package that both apps can share?" / "doesn't that code already have this?"
Treat that as a standing requirement, not a suggestion.

**Before you port anything, check whether it already exists as a package.** `ls ~/Developer`, then for the
candidate: does it declare `products` in its `Package.swift`, and does it have a git remote with tags?
A published, tested package beats a port every time — porting is the fallback for a project with no
library target. A port is also a _debt_: every fix lands twice, and the copy silently rots.

Rules that make the extraction work:

- **One implementation, and the difference between the apps is one value.** Put the variation in a settings
  struct whose presets are named by _purpose_, not by app — `CaptureSettings.streamingSpeech` (24 kHz AAC +
  spectrum) vs `.localTranscription` (16 kHz WAV + loudness columns). Same tap, same conversion, same errors.
- **The user wants one presentation too, and will say so.** Sharing only the maths and keeping a parallel
  renderer reads to them as the duplication you were told to remove: the instruction is "both apps should
  use the package", and it may mean migrating the app's UI framework — an AppKit app adopting the sibling's
  SwiftUI view — rather than arguing the halves apart. Plan for the kernel to be the maths _and_ the view,
  and for the app to keep only what is genuinely its own (its lifecycle/animation maths, its window, its
  menu bar, its icon's _use_ of the mark, its own engines). When a renderer does stay for a while, name it
  as a step, not as a principle.
- **Never fork the shared view to fit your box — add a parameter with a default.** Two additive properties
  (`spinRate`, `dotScale`) let a 64 px orb spin 4× while recording and stay dotted, with the sibling app's
  behaviour untouched. A private copy of the view is the failure mode this exercise exists to undo.
- **Swap the engine behind the app's existing façade first.** Keep the app's own type (`Recorder`) and its
  call sites; change only what is inside it, and keep the old callback as a temporary bridge if the
  presentation move is a separate, bigger step. Then the same string that proves the engine works is the one
  that proves the app still works — and you can be honest that the duplicated typing/maths layer is still
  there, on a named next step, rather than claiming a clean sweep.
- **Test the shared target once, for both apps' settings.** A suite that covers only one configuration ships
  the other one untested.
- **Sequencing for a two-app refactor:** package first (build + its own suite green), then the app whose
  path you can verify in one live run, then the app with the larger test suite as the gate.

Mechanics — dependency identity, platform floors, the façade swap, and the shared package's own test
harness: `references/sharing-code-across-swift-apps.md`.

## Porting a model out of a sibling app

When you copy a visual from another project of the user's, **check first whether it can be depended on
instead of copied** (see "Sharing code with the user's other apps"); port only what cannot be shared. And
if you do port, **port the whole pipeline, not the geometry.** The user will ask "doesn't that code already
do this?" and they will be right.

- **Read the source's entry point, not its shape.** A model like `OrbModel` typically takes the audio
  _and_ the shape: `sample(age:window:playhead:history:scale:gain) -> (radius, peak)`. Copying only the
  lattice and projection yields a silent sphere that looks right and never moves.
- **Keep the source's numbers as named constants** (window size, column rate, release, gain) and cite the
  file they came from in a comment, so the next reader can check them. Where you must deviate (a smaller
  gain because the orb shares a box with a label), say why in the comment — measured, not asserted.
- **Take the ballistics too.** A meter's `level = max(rms, level * decay)` with
  `decay = exp(-1/(rate * releaseSeconds))` is what makes a word a swell rather than a flicker; a raw
  level reads as a strobe.
- **Match units at the boundary and name them.** One app's "level" (0…1 loudness) is another's "out"
  (a radius multiplier). Passing the first where the second is expected makes the orb _collapse_ as the
  user speaks — and it looks almost plausible in a still, so only measurement catches it.

## Visual contrast is measurable

When the user says "make it more visible", do not just change the colour and assert it improved.

- Composite the before and after onto black, find the feature's pixels with a mask, and compute the
  **WCAG relative-luminance contrast ratio** against the surface each sits on. A black face instead of a
  translucent grey material measured 1.14–1.20× on the dots and 5.8 → 6.6 at the quiet end.
- Beware masks that match by accident: a check like `g > 90 && g >= r` also matches greys (r ≈ g ≈ b).
  Require real channel dominance (`g - r > 60`) for a coloured feature, or the region you measure is the
  label text.
- A threshold also has to suit the feature's size: 2 px dots antialias below a strict threshold and read
  as absent, which looks like a rendering bug. Loosen to "any tint at all" before concluding anything.

## Verify animated UI without a screen grab

Build the verification into the app, and measure rather than look: an offscreen render CLI for frames
(`--hud-render`, `--hud-strip`), ImageMagick for the numbers, and the window geometry from outside for a
live morph. Full recipes, including the peak-sampling rule and what a vision model cannot see:
`references/verifying-a-gui-you-cannot-screenshot.md`.

The two rules that must not be lost: **a 15 % scale change is invisible to the eye and to a vision model,
so measure it**, and **a pulse peaks at `start + (n + 0.5) * period`, so sampling at period starts labels
the troughs as peaks**.

## Reference implementation

`~/Developer/ponte` (was `voice-note`) — menu bar dictation: `⌥⌘Space` record → orb HUD that answers the
voice → Parakeet on the ANE (the only engine; whisper.cpp was removed as unshippable — see "One engine, unless a
second one earns its place") → paste at cursor (falls back to clipboard without Accessibility). Useful template for any hotkey + audio + engine accessory app. Its capture now comes from
the shared `WaveformCapture` package in `~/Developer/Waveform`, alongside `WaveformCore` (analysis) and
`WaveformUI` (the SwiftUI orb) — the sibling `~/Developer/Thames` uses the same packages. Its git remote is `charlesponti/ponte` — one **public** repository holding the source, the landing page
(`index.html` at the root, published from `main` by GitHub Pages, no build step) and the releases, with the
engineering notes in `docs/`. The old private `charlesponti/ponte-macos` is **archived**, and an archived
repository is read-only in a way that catches you out late: its issues cannot be closed, commented on or edited,
so work tracked there is frozen and an issue number can no longer record an outcome. Record the outcome in the
repo's own `docs/` instead, and decide deliberately before moving such issues onto a public repo — that publishes
engineering notes to the page buyers read. GitHub will not transfer issues private→public, so a move means
recreating them (which does preserve their numbering if the target has none).
Releases have to be published on this repository: assets on a private repository are downloadable only by
collaborators.

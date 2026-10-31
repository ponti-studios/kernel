# React Native + iOS field notes

Read this when a React Native app has a native iOS side: a Swift package or
core, native modules and views, live audio, device installs, or a Watch app.
Learned building Thames (React Native 0.87, new architecture, a Swift package
`ThamesCore`, an Apple Watch app). Verify API details against current docs.

## Where the logic lives

- Put the app's decisions in a Swift package (models, adapters, tests) and let
  React Native only draw state it is sent. A bridge module emits one snapshot
  of the whole screen state; JS validates it (zod) and never recomputes it.
  The same package then serves the Watch, tests on macOS and the simulator.
- Test the package with real files, a real loopback HTTP server and real audio
  where feasible. Platform code behind `#if os(iOS)` still needs an iOS build
  (`xcodebuild build -scheme X -destination 'generic/platform=iOS Simulator'`);
  a macOS `swift test` does not compile it.
- Keep decisions about each target (Watch vs phone) in the package so the
  Watch app stays a thin remote.

## Native views from React Native

- A SwiftUI view reaches React Native through a `UIView` that hosts a
  `UIHostingController`, plus an `RCTViewManager` subclass. In the `.m` file:
  `@interface RCT_EXTERN_MODULE(NameManager, RCTViewManager)` and
  `RCT_EXPORT_VIEW_PROPERTY(prop, Type)`. JS: `requireNativeComponent('Name')`
  (the manager name without `Manager`). It works on the new architecture
  through the interop layer.
- Adding the class to an existing `.swift`/`.m` file avoids hand-editing the
  Xcode project file for new sources.
- **Attach the hosting controller to the nearest view controller**
  (`parent.addChild(host); host.didMove(toParent:)` from `didMoveToWindow`,
  found by walking the responder chain). Set `isUserInteractionEnabled = false`
  for display-only views and a clear background.
- Size the native view from JS with a named style object; it receives its real
  bounds in layout. Log `bounds` and `window` in `layoutSubviews` when a view
  does not appear.
- Pass data to a native view through shared native objects, not through JS: a
  main-actor `ObservableObject` the view reads, set by whatever owns the
  source. Nothing high-rate should cross the bridge.

## SwiftUI `TimelineView` + `Canvas` can show a stale frame

A `Canvas` inside `TimelineView(.animation)` whose drawing closure ignores the
timeline date can be reused by SwiftUI and keep showing its first frame when
hosted inside UIKit. Everything else looked right (data arriving, timeline
ticking at 60 per second, an overlay `Text` updating). Fix: read the date
inside the canvas closure (`_ = timeline.date`) so each tick is a new drawing.
Symptom to recognise: the picture is correct in `ImageRenderer` tests and in a
pure SwiftUI app but never changes in the RN-hosted view.

## Live audio

- Record with one `AVAudioEngine` input tap, not `AVAudioRecorder`, when the UI
  needs the sound (levels, spectrum). In the tap: convert with
  `AVAudioConverter` to the file's format (the input is often 16 kHz or 48 kHz,
  mono or not; Bluetooth headsets give 16 kHz), write with `AVAudioFile`, feed
  the analysis. Report duration from frames written. Release the `AVAudioFile`
  to finish the file before reading it.
- Re-listen on `AVAudioEngineConfigurationChange` (route change, headset,
  interruption): reinstall the tap for the new input format and restart the
  engine, keep writing to the same file.
- Make a fresh recorder (and its rings and clocks) per recording so a new one
  starts from nothing, and hand it to the UI through a callback.
- Test with an offline manual-rendering engine fed by a player node reading a
  real file. Schedule/`play` after the engine is set up, and make sure a test
  file's writer is released before it is read back (an unflushed AAC/WAV reads
  as silence, which looks like a recorder bug). Use
  `scheduleFile(_:at:completionHandler: nil)` in async tests to avoid the async
  overload.
- Tests that use the real audio device must be serialised with the other
  real-audio tests (put them in the same `.serialized` suite). A full run once
  stalled on a playback test while another process held the audio device (a
  killed earlier test run); after killing stray `swift test` and
  `swiftpm-testing-helper` processes the full suite passed (365 tests, 19 s).
  If a run stalls, check `pgrep -fl swiftpm-testing`, kill strays and rerun
  before blaming the code.
- Debug audio on the phone by logging peak, input sample rate and frame counts
  from the tap with `NSLog` and capturing them with
  `xcrun devicectl device process launch --device <name> --terminate-existing
  --console <bundle id> > log` (run it in the background, then ask for one
  recording). Prove the data path with numbers first, then look at drawing.

## Dependencies and deployment targets

- A Swift package dependency's declared platforms are a floor: an iOS 18 /
  macOS 15 package (Swift `Synchronization` atomics) cannot be used by a package
  that declares iOS 15 or no macOS. Raise the consumer's `platforms` and the
  app's `IPHONEOS_DEPLOYMENT_TARGET`, or avoid the API. Make the product
  conditional for platforms it does not support
  (`condition: .when(platforms: [.iOS, .macOS])`, so the Watch target still
  builds). Raising the minimum iOS drops users: confirm with the owner.
- Iterate on a library and the app together with `.package(path:)`; the
  product's `package:` name is then the directory name (lowercased identity),
  not the repo name. Switch back to the released tag before committing.
- Publishing a Swift library: public repo + git tag; Swift Package Index
  listing by pull request/issue; keep coverage gates in a script and CI on a
  macOS runner.

## Devices

- `devicectl` installs and launches on physical devices; build with the
  project's deploy script. The Watch is often asleep: the install retries, and
  a launch can fail with "device is locked". Report that plainly. It is not an
  install failure, and the user should not be asked to wake it.
- After any app change, install on the phone and the Watch together when the
  Watch app is embedded. Wait for the result line from the script instead of
  assuming; run it with `--install --launch` (a plain run only builds).
- Debug builds need Metro running; Release bundles carry their JS.
- Decide performance work by measurement on the real device (draw time per
  frame), not speculation. A 120 Hz budget is about 8 ms; a CPU-drawn canvas of
  ~900 dots cost well under 1 ms.

## Working notes

- When a UI "does not react", check each stage with evidence in this order:
  source data (log it), plumbing (does the view get it), drawing (does it
  redraw). Do not guess at the audio when the screenshot shows the view draws.
- Reproduce a drawing problem offline first (render the SwiftUI view to a PNG
  with `ImageRenderer` from a test and look at it) to separate "the view is
  wrong" from "the host is wrong".
- Remove temporary logging and on-screen debug readouts before committing, and
  release the library fix as a version rather than leaving a path dependency.

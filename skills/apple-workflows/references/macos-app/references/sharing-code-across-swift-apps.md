# Sharing code across the user's Swift apps

Mechanics for lifting a subsystem out of one of the user's apps into a package two of them depend on.
Pair this with the rules in SKILL.md ("Sharing code with the user's other apps"): one implementation, the
difference is one value, and — eventually — one presentation, adopted rather than argued about.

## Find the package before writing one

A sibling project may already publish what you are about to write, already tested, already versioned:

```bash
ls ~/Developer                                   # neighbours
sed -n '1,40p' path/to/Peer/Package.swift        # products? platforms? dependencies?
cd path/to/Peer && git remote -v && git log --oneline | head -3   # published, and tagged?
```

Products (`WaveformCore`, `WaveformUI`), a remote, and version tags mean it is a package: **depend on it**.
No library target means porting is the only option — and porting is debt, so prefer adding the product to
the sibling package when the subsystem genuinely belongs to the same domain.

## Which half is shareable

Read the `import` lines; they answer it.

| Imports                                                               | What it means                                                                                                 |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `Foundation`, `Synchronization`, `Accelerate`, `AVFoundation`, `simd` | shareable — no UI                                                                                             |
| `SwiftUI`, `AppKit`, `UIKit`, `QuartzCore`                            | the package can own it and the app can _adopt_ it by hosting (see below); what stays with the app is the host |

A UI import does not mean "unshareable": it means the _product_ can be adopted by hosting it (next
section), not copied. The kernel to aim for is maths + engine + view; what stays with the app is its host
(the `NSPanel`, the React Native bridge), its own lifecycle maths, and its platform-specific bits (menu bar
glyphs, the icon's use of the mark).

Different renderers (`CGContext` vs `GraphicsContext`) and different animation clocks (`CADisplayLink` vs
`TimelineView`) are the reason to _adopt_ a view rather than bridge two of them — bridging means
reconciling two clocks, which is the same problem the app already had.

## Adopting the shared view (the presentation half)

The app being migrated keeps its own façade (the panel, the state machine, the lifecycle maths) and swaps
its renderer for the shared view. What that costs and what it deletes:

- **Host it**: `NSHostingView(rootView:)` as the panel's `contentView`; for a UIKit app, a
  `UIHostingController` (or the existing React Native view manager). The app's own layout can stay the
  app's: a `.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)` inside a fixed panel
  reproduces a bottom-anchored box without any window resizing.
- **Keep the app's lifecycle maths, delete the app's renderer.** Geometry-per-frame, the collapse, the
  pulse, the pill measurement and the clock are the app's own and stay testable; the lattice, projection,
  dot layers, level ring, ballistics and meter timer were the package's and go. Say which files went.
- **Absolute sizes in the shared view need a parameter.** A view tuned for an orb a few hundred points
  across draws a 64 px orb as a solid disc, because its dot size is absolute. Add the multiplier (and the
  spin rate) upstream with defaults that preserve the other app — never a private copy.
- **`ImageRenderer` renders the shared view anywhere SwiftUI can**: the app icon (per size, with the
  tile-dependent dot multiplier), CLI contact sheets, and tests. In a CLI wrap the call in
  `MainActor.assumeIsolated { }` (top-level `main.swift` code is not main-actor isolated, so a `@MainActor`
  function will not compile from it) and keep `_ = NSApplication.shared` before any AppKit/SwiftUI work.
- **`ImageRenderer` output is CGImage-backed**, so a test probe that looks for an `NSBitmapImageRep` finds
  nothing and reports an empty image. Rasterise any `NSImage` into a rep of your own before measuring, and
  assert the pixel size from that rep.
- **The app's test count legitimately drops** when tests for moved code move with it. Spend the drop: read
  the package's suite and confirm it covers the regression you are deleting (e.g. `OrbModelTests` asserting
  `1 + gain * level`), and say in the commit that the test moved rather than vanished.

## Variation is one value, named by purpose

Give the shared type a settings struct whose presets say what they are for, not which app uses them:

```swift
public struct CaptureSettings: Sendable {
  public enum FileFormat: Sendable { case wave, aac }
  public var sampleRate: Double
  public var fileFormat: FileFormat
  public var columnsPerSecond: Double
  public var spectrumBands: Int?      // nil = do not pay for an FFT
  public var releaseSeconds: Double

  public static let streamingSpeech = CaptureSettings(       // speech streamed to a server
    sampleRate: 24_000, fileFormat: .aac, spectrumBands: 24)
  public static let localTranscription = CaptureSettings(     // speech transcribed on the device
    sampleRate: 16_000, fileFormat: .wave, spectrumBands: nil)

  public var fileSettings: [String: Any] { /* AVFormatIDKey, sample rate, channels, PCM depth */ }
  public var fileExtension: String { fileFormat == .wave ? "wav" : "m4a" }
}
```

Both presets then run the _same_ tap, conversion, duration accounting and error handling, and the shared
suite covers both configurations. A preset per app name (`ponteSettings`) is the thing not to write: it
hard-codes the coupling and invites a fork.

## Manifest and dependency mechanics

- **Platform floor.** Naming a newer platform (`platforms: [.macOS(.v15)]`) needs tools **6.0+**; under
  5.9 it fails with `error: 'v15' is unavailable`. Raise the manifest and keep the app in Swift 5 with
  `swiftSettings: [.swiftLanguageMode(.v5)]` per target. Dependants must raise their floor to match the
  package's — and say so, because it silently drops older OS versions.
- **Path dependency identity comes from the directory, not the manifest's `name:`.** With
  `.package(path: "../Waveform")`, products are referenced with `package: "Waveform"` even though that
  package declares `name: "waveform-ios"`. Getting this wrong is a confusing "product not found" error.
- **Local path while it settles, URL once tagged.** `.package(path: "../Waveform")` lets both apps and
  the package evolve together during the extraction; switch to the git URL plus a version at the end.
- **The product identifier changes when the dependency does.** A path dependency resolves products by the
  _directory_ name (`.package(path: "../Waveform")` → `package: "Waveform"`); a URL dependency resolves
  them by the _repository_ name (→ `package: "waveform-ios"`). Flipping one means editing every
  `.product(name:package:)` entry in every consumer, or nothing resolves.
- **Publishing is the user's call.** Tag and push only with their say-so; until then both apps hold a
  path dependency and the package's commits stay local.

## Publishing, and moving both consumers onto the release

Once the user says to ship it, the release is four checks and two edits per consumer.

```bash
git log --oneline origin/main..main     # what would actually be published — theirs too, not just yours
git log -p main -25 | grep -iE 'api[_-]?key|secret|password|bearer'   # sweep the published history
git tag -l | tail -4                   # MATCH the repo's existing convention before tagging
git tag -a v0.2.0 -m '…' && git push origin main && git push origin v0.2.0
git ls-remote --tags origin | tail -3  # confirm the tag landed (annotated tags show ^{} too)
```

- **Match the existing tag convention.** A repo tagged `v0.1.2` wants `v0.2.0`, not `0.2.0`; a wrong-prefix
  tag has to be deleted and redone, and consumers pin `from:` against whichever you published.
- **Sweep with separate `-e` patterns.** A single alternation containing brackets can die with
  `repetition-operator operand invalid` — `git grep -i -e api_key -e secret -e bearer <revs>` is reliable.
- **Check what is riding along.** `origin/main..main` may contain the user's own unpushed commits; a tag
  publishes the tagged commit _and its ancestors_, so look before you push.
- **Then flip every consumer in one pass**: switch the URL in, rewrite the `package:` identifiers, rebuild,
  and re-run **both** suites. A consumer that still resolves the old path proves nothing about the release.
- **Update the docs that describe the dependency** — the README's shared-package table, and the repo's own
  agent-instruction file (`CLAUDE.md`/`AGENTS.md`) if it names the path or the tag. **That file may be
  protected from agent writes** (the edit is blocked pending the user's approval): leave it, mention the
  stale line in the handover, and never route around the block.

## The swap, in order

1. **Package first.** Add the product + target + test target, port the implementation, and get the
   package's own suite green before any app changes. Cover every preset, not just the first app's.
2. **Swap behind the app's existing façade.** Keep the app's own type and its call sites; replace only
   what is inside. Callers, view code and tests keep working, and one live run proves the swap.
3. **Keep the old callback as a named bridge if the presentation move is a separate step** — e.g. read
   the new column ring at the old meter's rate and hand it to the existing UI, rather than rewriting both
   ends at once. Then say plainly that the duplicated maths layer is still there and which step deletes it.
4. **Verify live, in one run**, and check the artifact the _whole chain_ produces: record → transcribe →
   the note's text. A build that compiles proves nothing about a capture path.
5. **Adopt in the app with the bigger suite last**, using that suite as the gate — the smaller app is where
   you find out whether the package is actually shippable.
6. **Delete the app's copy of the ported code and its tests once the shared target covers them**, and say
   which files went. Leaving both invites the drift you just paid to remove.

## When the second consumer is a different platform

Adding the phone as a second consumer is where a package's macOS-only assumptions surface, and none of them
fail on the machine you are sitting at.

- **Build for the consumer's platform, and prove the conditional file compiled.** See the rule in SKILL.md:
  `-Xswiftc -target` does not move SwiftPM off the host, so an iOS-only file can be left out of a "successful"
  build. `xcodebuild -scheme <Target> -destination 'generic/platform=iOS' -derivedDataPath /tmp/ios-check
  build CODE_SIGNING_ALLOWED=NO`, then `find /tmp/ios-check -name '<File>.o'`. If the object is absent, nothing
  you changed for that platform has been checked.
- **Platform-only API is the usual first failure.** `AVCaptureAudioDataOutput.audioSettings` exists on macOS and
  not on iOS, so a `CaptureSource` that sets it does not compile for the phone at all — invisible to an app that
  only ever built for the Mac. Guard it `#if os(macOS)`.
- **Read the format that arrives, never the one you asked for.** macOS hands back what `audioSettings`
  requested (16-bit interleaved); iOS hands back Float32 and cannot be asked for anything. A sink that
  reinterprets the block buffer as Int16 therefore records **silence on the phone** while measuring perfectly
  on the Mac. Take the format off each sample buffer
  (`CMAudioFormatDescriptionGetStreamBasicDescription` → `AVAudioFormat(streamDescription:)`), branch on
  `commonFormat` (`pcmFormatFloat32` interleaved or not, `pcmFormatInt16`), and hand the recorder Float32 mono
  either way so the conversion downstream is unchanged.
- **Delete a property that describes a format nothing arrives in.** A `bufferFormat` assigned from settings and
  read by nobody is inert on one platform and a lie on the other, the moment what arrives stops matching it.

## A tag is not a history, and a rename is not a release

- **Check ancestry before trusting a tag.** A file present in `v0.3.0` and absent from `v0.4.0` with **no**
  deletion commit in `git log --diff-filter=D` means the older tag is not on `main`'s line:
  `git merge-base --is-ancestor v0.3.0 main || echo diverged`. Nothing was deleted — it was never there. Read
  "the API vanished" that way before rewriting a consumer against a shape that was never published to it.
- **Renaming a published package is a release.** `gh repo rename <new>` from inside the package directory
  (there is no `--yes`), fix the local `origin`, change the manifest's `name:` and every `package: "<old>"`
  product reference in every consumer, then cut a tag for the new name and bump each consumer to it. GitHub's
  redirect keeps the old URL resolving, which is exactly why a half-finished rename looks finished — grep the
  tree for the old name instead of trusting the build.
- **Sweep every `Package.resolved`, including the Xcode project-level one**, and let `xcodebuild -list` do the
  workspace re-resolve. A pin left behind on the old URL is the rename's only real risk.
- **A sibling repo may carry its own ship skill.** Before committing in the user's other app, read
  `<repo>/.claude/skills/`; a `ship` skill there governs the branch (never `main`), which checks to run, the PR
  body shape and how deployment happens — and it wins over your defaults. Committing to `main` first and
  untangling it after is a reset, a stash and a re-applied patch you did not need to do.

## Traps

- **Model warm-up will fool you.** After swapping a capture engine, the first run's transcription can take
  seconds (or appear to never happen) because an ANE model is still specialising. Wait for the load line in
  the log, then re-run before concluding anything about your change.
- **A cross-module test seam must be `internal` and the tests must live in the same module.** A `var
  startEngine` for injecting failures is reachable from the package's own tests and not from a consumer's;
  move the test rather than making the seam public API.
- **`mv`-ing either repo directory breaks SwiftPM's artifact cache** (absolute paths) — `rm -rf .build`
  before believing a rename broke the code.

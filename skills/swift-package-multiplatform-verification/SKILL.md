---
name: swift-package-multiplatform-verification
description: "Use when a Swift package serves both macOS and iOS."
version: 1.1.0
author: Charles Ponti, Hermes Agent
license: MIT
platforms: [macos]
metadata:
  hermes:
    tags: [swift, spm, ios, macos, build, verification]
    related_skills: [macos-menubar-swift-app, kernel-dev-build]
---

# Verifying a Swift package both platforms build

When one package serves a Mac app and an iPhone app (Ponte and Thames share `charlesponti/waveform`),
a green macOS build proves nothing about the half wrapped in `#if os(iOS)`.

## When to Use

- A Swift package is consumed by both a macOS app and an iOS app, and you changed it.
- You are about to say a shared package "builds" or "its tests pass" after only a macOS build.
- An app's own copy of a package type is about to be deleted in favour of the shared one.
- A tag can't answer "what shipped", or a file seems to have vanished with no deletion commit.

## The false pass, exactly

`swift build -Xswiftc -target -Xswiftc arm64-apple-ios18.0` prints **"Build complete!"** and compiles
**nothing** for iOS: SwiftPM plans for the host and reuses the macOS objects. It reports success on a
package that does not compile on iOS at all. Never treat it as evidence.

## The check that is evidence

```sh
xcodebuild -scheme <Target> -destination 'generic/platform=iOS' \
  -derivedDataPath /tmp/ios-build build CODE_SIGNING_ALLOWED=NO
# then prove the iOS-only files were compiled:
find /tmp/ios-build -name 'PhoneMicrophone.o' -o -name 'VoiceOrb.o'
```

"BUILD SUCCEEDED" alone is not enough — confirm a `.o` exists for each file that only compiles on iOS.
No object file, no proof.

## Platform-only API is the usual culprit

- `AVCaptureAudioDataOutput.audioSettings` **does not exist on iOS**; code setting it fails to compile
  there. Guard it `#if os(macOS)`.
- iOS always delivers **Float32**; macOS delivers whatever 16-bit shape you asked for. Read the format off
  each `CMSampleBuffer` (`CMAudioFormatDescriptionGetStreamBasicDescription`) and handle both, or one
  platform records silence while the other works.
- When a difference is behavioural rather than compile-time (a ring cleared per take, a rate), keep the
  behaviour in the package, not in the app's copy — the app copy is what drifts.

## When the package or its tests start using a new product

The manifest needs the product in **every** target that touches it, tests included:

```swift
.product(name: "WaveformCapture", package: "waveform",
         condition: .when(platforms: [.iOS, .macOS])),
```

Omitting it from a test target does not fail to compile — it fails to **link**, with
`Undefined symbols for architecture arm64` naming the symbol (`CaptureSettings.streamingSpeech`). That reads
like a broken symbol; it is a missing dependency in `Package.swift`. Search the test tree for the type before
widening anything, and add the same platform condition the library target uses, or watchOS-style platforms
break on a product that was never meant for them.

## Renaming the package

The repo name _is_ the package identity, so renaming is a coordinated edit, not a `git mv`:

- `gh repo rename` — GitHub keeps redirects, so **the old URL keeps resolving** and every place you forgot
  looks fine. Do not read a working build as evidence the rename landed.
- The manifest's `name:` and every `.product(name:package:)` reference in it.
- Each consumer: the dependency URL, its `package:` references, and `Package.resolved`.
- An Xcode app holds **two** `Package.resolved` files — the workspace's and the project's. The project-level
  one goes stale without failing any build, and breaks whoever opens the `.xcodeproj` directly instead of the
  workspace. Delete it and let Xcode regenerate from the manifest; `xcodebuild -list` alone re-resolves.
- Docs and code comments that name the package.
- Tag a release after it. A rename with no new tag leaves consumers pointing at a URL that only works via
  redirect, and the tag is what makes the new identity explicit.

## When an app carries its own copy of a package type

Two recorders, two config loaders, two of anything: deleting the app's copy is how the package gets fixed.
Do it as one PR, and expect the deletion to _find_ bugs the duplicate was hiding — that is the point, not a
regression. Port the survivor's tests into the package first, then delete the app's copy.

## History check before trusting a tag

`git merge-base --is-ancestor <tag> main` for every tag. A tag on an unmerged branch makes
`git tag --contains` useless and makes a file look like it vanished with no deletion commit. Fix with a real
merge that keeps main's code (`-X ours`) and takes what only the branch held — never by repointing a
published tag. Recipes for that and for commits that landed on the default branch:
`references/history-repair.md`.

A stale pin is also how API drift hides: a consumer two versions back compiles against an interface that no
longer exists, so "point it at the new version" is a migration with real work in it. Budget for it out loud
instead of reporting the bump as a one-liner, and expect the first failing build to be the finding rather than
a regression.

## When the package dropped an API its consumer uses

Decide _whose_ behaviour changes, before writing either side. Two ways out:

- **Adapt the consumer** — right when the package's new shape is what the consumer should have had anyway, and the
  visible result is unchanged or better for a reason you can state.
- **Restore the API in the package** — right when adapting would change something the user chose and would notice (a
  look, a feel, a timing). A shared package losing a parameter must not silently restyle the apps built on it: a
  visible change needs its owner's decision, not a side effect of deleting a duplicate. Re-adding the type with the
  original defaults makes the change behaviour-identical for every caller that does not opt in, and a test pinning
  "defaults reproduce the previous output" is what proves it.

Either way the failing build is the finding: a consumer that has not compiled against the new version in a while is
how an API disappears without a deletion commit to point at.

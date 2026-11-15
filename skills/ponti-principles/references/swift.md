# Swift, SwiftUI, native modules, watchOS

The full style rules live in the `apple-workflows` swift-style procedure
(`references/swift-style/WORKFLOW.md` in that package); load it before writing or reviewing Swift.
This file keeps the review checklist and the architecture laws around it.

## Style: what a review actually catches

- A redundant `public`, or an access level wider than the call site needs.
- Unused parameters, properties, options, or a wrapper that only forwards.
- A type that hides a state the compiler could have made unrepresentable.
- Names that describe mechanism (`Manager`, `Helper`, `Util`) rather than the domain.
- Isolation chosen by accident: `@unchecked Sendable` without a stated guard, or a `final class`
  where a value type would do.
- Layout not delegated to `swift-format`; 2-space indent.

Everything else — naming grammar, error types, async shape, doc comments — is in the style
procedure. Do not restate it here; if the two disagree, the style procedure wins and this file gets
corrected.

## Enforcement

- `swift-format`, SwiftLint and Periphery with baselines. New violations fail; baselines only
  shrink (`scripts/check-swift.sh` in Thames). Run before finishing Swift work.
- Periphery builds the iPhone app, so Watch-only code can look unused; those cases live in the
  baseline.

## Architecture

- Put decisions that must be right in a Swift package (Thames: `ThamesCore`, with `WatchCore` for
  the Watch's own decisions). Apps only record, send, save and play haptics. React Native screens
  only draw the state they receive.
- Test the package with real files, a real loopback HTTP server and real (silent) audio playback.
  Live tests against a paid service are opt-in (`THAMES_LIVE=1`) and say what they cost.
- Minimum OS is chosen on purpose and stated (Thames: iOS 18, macOS 15 for tests).
- Dependencies are pinned to a tag or minor version; for local iteration use a path dependency and
  switch back before merging.
- A Debug build needs Metro; a Release build carries its bundle. Know which one you are running.

## Apple platform behaviour

- The Watch is a remote for the phone unless Charles says otherwise. Do not add Watch screens for
  features he scoped to the phone (Memory is phone-only, 2026-10-10).
- Test the phone and Watch together, on a real walk, once the Watch has caught up. Do not ask for
  phone-only device testing as a next step. _(word, 2026-10-10)_
- Never open the microphone by itself and never decide a person has finished talking. The person
  starts and stops every turn. _(word, 2026-10-15)_
- Sim builds that touch the Keychain need ad-hoc signing.
- Debug a native view in order: log the source data, check the view receives it, check it redraws.
  Reproduce drawing offline (render to a PNG) before changing the device build.

# Swift, SwiftUI, native modules, watchOS

The full rules are in the `swift-style` skill. Load it when writing Swift. This file is the review
checklist and the structure rules around it.

## Style (from `swift-style`)
- 2-space indent; `swift-format` decides all other layout. Run it on files you change.
- **Narrowest access control that works.** A redundant `public` is a defect. Periphery reports it.
- Nothing unnecessary: no unused parameter, property, function, protocol or option. No wrapper that
  only forwards. No `self.` unless required. No `return` in single-expression bodies.
- Names are the documentation. Domain nouns, call sites read as sentences, units in names, no
  `Manager`/`Helper`/`Util`. Booleans read as assertions.
- Value types first. `struct` and `enum` with payloads; `final class` for identity or lifecycle;
  `actor` for shared mutable state. Make illegal states unrepresentable.
- Namespaces are caseless enums. One main type per file, named after it; `Type+Topic.swift` for
  extensions.
- State isolation: value types are `Sendable`; `@MainActor` or an `actor` on purpose;
  `@unchecked Sendable` needs a one-line comment on what guards the state.
- Inject what a test must control (clock, file location, client) through `init`; no protocol for a
  type that will never be faked.
- `guard` and early exit; no nested ternaries; no `!` or `try!` outside tests and provable static
  data.
- Typed errors with readable `errorDescription`.
- `async`/`await` and `AsyncStream` over callbacks; wrap a callback API once at the edge.
- DSLs and result builders only where the call site is clearly nicer.
- Doc comments (`///`) on public API: one sentence, constraints and units. Inline comments say why.

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
  phone-only device testing as a next step. *(word, 2026-10-10)*
- Never open the microphone by itself and never decide a person has finished talking. The person
  starts and stops every turn. *(word, 2026-10-15)*
- Sim builds that touch the Keychain need ad-hoc signing.
- Debug a native view in order: log the source data, check the view receives it, check it redraws.
  Reproduce drawing offline (render to a PNG) before changing the device build.

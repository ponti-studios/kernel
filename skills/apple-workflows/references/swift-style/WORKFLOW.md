# Swift style

> Invoke with: Swift you are about to write, review or refactor.

Charles's rules for Swift, drafted from how Software Mansion's Swift is written
(enriched-markdown-ios, starknet.swift, pulsar) plus Apple's API Design
Guidelines and his own preferences. A draft: what Charles says in the moment
wins, and this file should be updated right away when he corrects something.
Enforced by tools where possible (see the end); this file holds the rest.

## 0. Layout

- Indent with 2 spaces (Charles's choice; Software Mansion uses 4). Let swift-format
  decide everything else about layout.

## 1. Nothing unnecessary

- **Access control is the narrowest that works.** Default is internal; use
  `private` for anything used in one type or file; use `public` only on the
  surface another module actually calls. A redundant `public` is a defect.
  (Periphery reports it.)
- No unused code: no parameter that is never read, no property that is only
  assigned, no function kept "for later", no protocol with one implementation
  and no test seam, no wrapper that only forwards, no option nobody sets.
- No default value, label or argument that repeats what the compiler already
  knows. No `self.` unless required. No `return` in single-expression bodies.
- Delete code, do not comment it out. Do not keep a name for compatibility
  inside an app (only a published library has callers to protect).
- A comment says why (an invariant, a constraint, a surprise), never what the
  code says. Good: "The key format is shared across platforms; keep it stable."

## 2. Naming

Names are the main documentation. Spend time on them.

- Name things for what they are in the domain, not how they work: `Recording`,
  not `AudioBufferWrapper`. No `Manager`, `Helper`, `Util`, `Handler`, `Info`,
  `Data`, `Object`, `Thing`, `Service` unless it is truly the term.
- The call site reads as a sentence (Apple's guidelines): `ring.append(frame)`,
  `spectrum.snapshot(frames, into: buffer)`. Omit needless words; include the
  words that stop ambiguity. Argument labels carry the grammar.
- Types are nouns (`SpectrumRing`), protocols that describe a capability end in
  `-ing`/`-able`/`-Reading` (`Microphone` if it is a role), booleans read as
  assertions (`isRunning`, `hasPermission`), mutating verbs vs. non-mutating
  participles (`sort()` / `sorted()`).
- Short names for short scopes (`i`, `n` in a tiny loop); a long name when the
  scope is large or the idea is subtle. Never abbreviate away meaning
  (`msg`, `cfg`, `mgr`). Universal ones are fine (`url`, `id`, `ms` in a unit).
- Units in names when a number has one: `durationMs`, `sampleRate`, not
  `duration`.
- One concept, one word across the codebase. Rename everything or nothing.

## 3. Shape of the code

- **Value types first.** `struct` and `enum` with associated values; a `final
  class` only for identity or lifecycle (an engine, a file handle); an `actor`
  for shared mutable state. Make illegal states unrepresentable (an enum with
  payloads instead of a bool plus two optionals).
- **Namespaces are caseless enums** (`enum Cost { static func ... }`), never a
  struct nobody instantiates.
- **Small files, one main type each**, named after it. Extensions that add a
  topic go in `Type+Topic.swift`. Keep functions short; extract a function when
  it earns a name, not to hit a number.
- **Sendable and isolation are stated.** Mark value types `Sendable`. Isolate
  with `@MainActor` or an `actor` on purpose. `@unchecked Sendable` needs a
  one-line comment saying what guards the state (a lock, a single writer).
- Inject what a test needs to control (clock, file location, framework client)
  through `init`; do not build a protocol for a type that will never be faked.
- Prefer `guard` and early exit to nested `if`. No nested ternaries. No
  force-unwrap or `try!` outside tests and static data you can prove.
- Errors are typed and their `errorDescription` is readable by a person.
- Concurrency over callbacks: `async`/`await`, `AsyncStream` for events. Wrap a
  callback API once at the edge (`withCheckedContinuation`).
- DSLs and result builders only where they make the call site clearly nicer
  (a theme, a layout), not as a default.

## 4. Documentation

- Public API gets a `///` summary: one sentence, then parameters/returns only
  when the names do not already say it. Explain constraints and units.
- Inline: why, not what. Mark invariants and cross-platform contracts.

## 5. Tests

- Test behaviour with real objects where cheap (real files, loopback server,
  offline audio engine); fakes only at real boundaries.
- Test names are sentences: `aVoiceMakesTheSphereBiggerThanSilence`.
- A test that only constructs a type, or asserts a private detail, is
  deleted, not kept for coverage.

## Enforcement (set up per project)

- `swift-format` (`.swift-format`) for layout, with **2-space indentation**; run on files you change.
- `periphery scan --strict` with a baseline of known intentional exceptions
  (Objective-C entry points, `@main`, retained references). New unused code or
  redundant `public` fails the check.
- A short SwiftLint config for what swift-format cannot say: banned vague
  names, force unwraps, size warnings (functions about 60 lines, files about
  400), no commented-out code.
- Before finishing Swift work, read the diff against sections 1 to 3.

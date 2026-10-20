# Code, any language

Marked *(word)* when it is Charles's own instruction, *(inferred)* when read from his reviews.

## Scope and size
- **YAGNI.** Build what is asked now. No option nobody sets, no hook for later, no abstraction for
  one caller, no protocol with one implementation and no test seam. *(word, Hominem rules)*
- **One-liner solutions** whenever they stay readable. Fewer lines beat more structure. A one-liner
  that hides a decision becomes a named function instead. *(word)*
- **Do not build for hypothetical scale.** Design for the size the product is meant to reach, not a
  stress-test number. If a cap or limit is coming, assume it, but do not build the limits until he
  opens that discussion. *(word)*
- **Delete, do not comment out.** Dead code, unused exports, stale files and unreferenced
  dependencies go. No compatibility alias inside an app; only a published library protects callers.
  *(inferred, strong)*
- Fewer dependencies. A new dependency needs a reason a few lines of code cannot meet. Pin it
  deliberately and say why in the PR. *(inferred)*

## Names
- Short names that use the **domain noun**: `conversationSchema`, not `conversationRecordSchema`.
  Drop words that describe implementation. Keep a longer name only when two things would clash.
  *(word)*
- Avoid `Manager`, `Helper`, `Util`, `Handler`, `Info`, `Data`, `Object`, `Service` unless truly the
  term. No abbreviations that drop meaning (`msg`, `cfg`, `mgr`); `url`, `id`, `ms` are fine.
- Booleans read as assertions (`isRunning`, `hasPermission`). Put units in numeric names
  (`durationMs`, `sampleRate`).
- One concept, one word across the codebase. Rename all of it or none of it.
- The call site reads as a sentence.

## Shape
- **No nested ternaries, and no ternary that picks between more than two results.** Use a lookup
  table (`Record<Key, Value>`), a small function with early returns, or a `switch` over a union so
  the compiler checks it is exhaustive. One short two-way ternary is fine. A lint rule enforces it
  wherever it can. *(word)*
- Early return and `guard` over nested `if`. Flat beats deep.
- Make illegal states unrepresentable: a tagged union with payloads, not a boolean plus two
  optionals.
- Small files, one main idea each, named after it. Extract a function when it earns a name, not to
  hit a line count.
- **One pattern, applied everywhere.** When the repo already has a way (a store factory, a themed
  style hook, a shared schema file, a repository layer), new code uses it. Two copies of the same
  helper get merged into one. *(word)*
- Parse once at the boundary, then trust the typed value inside. No defensive checks for states the
  types already rule out.

## Comments
- A comment says **why**: an invariant, a constraint, a surprise. Never what the code says.
- Teaching comments are a project choice, not a default. Where a repo has them (Thames's `Swift:`
  comments for a TypeScript reader), keep them when editing and add one where a new idea first
  appears.
- No change-log comments, no "added for X", no ticket numbers in code.

## Errors
- Typed errors with messages a person can read. A failure keeps what the person has and says what
  failed, in calm words (see `product-and-design.md`).
- Never swallow an error silently. Catch only what you can handle at that level.
- Do not retry a failing request to a service on your own unless the repo's rule says so; a service
  that is down gets asked over and over. Keep the work, say what failed, offer Try again. Waiting
  for a service that is known to be missing sends nothing. *(word, Thames principle 10)*

## Tooling enforces style
- Prefer a type, a lint rule or a script that makes a mistake impossible over a comment asking people
  not to make it. *(word)*
- Use the repo's formatter and linter; never add a second one. Format files you changed, not the
  whole repo, unless asked.
- If a baseline of known violations exists, shrink it and never grow it.

## Tests
- Test behaviour with real objects where cheap: real files, a real loopback server, an offline audio
  engine. Fakes only at true boundaries. *(inferred, Thames)*
- Test names are sentences: `aVoiceMakesTheSphereBiggerThanSilence`.
- A test that only constructs a type, or asserts a private detail, is deleted, not kept for coverage.
- A real-service ("live") test is opt-in behind an env flag and its cost is stated.
- Cover the failure and offline paths, not only the happy one.

## Performance
- Performance is part of the design: 60 fps on a device, or it is not done. Measure on a device;
  say so when it was not.

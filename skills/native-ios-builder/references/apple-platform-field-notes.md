# Apple platform field notes

Read this when a feature depends on local persistence, HealthKit, background
work, files, or sync. These are recurring failure modes observed while
building WalksGPX; verify current framework behavior against Apple documentation
when an API detail matters.

## Persistence and checkpoints

- Set the persistent store URL explicitly when durable local data is required.
  A successfully constructed Core Data container does not by itself prove that
  the intended on-disk store is being used.
- Treat a saved sync anchor, cursor, or watermark as a claim that earlier data
  is safely represented locally. Persist records and deletions before
  committing that checkpoint; on write failure, retain the old checkpoint so
  the next attempt can replay safely.
- Keep the checkpoint and data-store lifecycle coherent across app upgrades,
  reinstall recovery, migrations, and “import all” actions. A valid anchor can
  coexist with missing local records.
- Design reconciliation to repair missing outputs from the authoritative local
  store. Make duplicate processing harmless and scope cleanup to files the app
  owns; preserve unrelated user files and unknown future-format metadata.

## HealthKit and callback-based APIs

- HealthKit authorization success does not establish that read samples are
  visible. Read access can be intentionally opaque; empty results need a
  helpful next step and must not be presented as proof that the user has no
  data.
- A workout's duration or distance does not imply that it has a readable GPS
  route. Keep “workout found” distinct from “route available,” and make
  incomplete routes retryable when the product needs them.
- Route queries may emit multiple batches and multiple series. Accumulate
  batches until the framework signals completion, then normalize ordering and
  validate coordinates before saving or exporting.
- Test orchestration through an injected client or narrow query seam. Keep a
  small real-device smoke check for the actual permission prompt and framework
  data path, since simulator fixtures cannot prove those behaviors.

## Background work and progress

- Treat background execution as opportunistic unless the platform guarantees
  otherwise. A requested earliest start time is not a deadline or promise.
  Keep important work resumable in the foreground and schedule background
  refresh as an optimization.
- Make cancellation and expiration safe at each await/write boundary. Preserve
  completed work and leave unfinished work discoverable for a later retry.
- Progress should identify the current phase and a truthful unit with a known
  total where possible. Distinguish items read, records persisted, and files
  delivered; local file creation does not prove cloud upload or cross-device
  availability.

## Project configuration and user-facing states

- A target can compile while its installed app bundle is invalid. When install
  or launch fails, inspect the built `.app`'s `Info.plist`, `CFBundleExecutable`,
  product name, bundle identifier, supported orientations, capabilities, and
  entitlements instead of assuming source compilation is sufficient.
- Permission, account, and cloud availability errors should say what remains
  saved, what action is possible, and whether retry is safe. Avoid a “connected”
  label that implies data access the framework does not expose.
- Large historical imports and syncs need honest progress and a clear recovery
  path. Keep the primary screen calm and move verbose diagnostics behind
  secondary detail when they are useful for troubleshooting but not routine
  decisions.

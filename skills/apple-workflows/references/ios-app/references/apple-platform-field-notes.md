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

### Route availability, backfills, and retry policy

HealthKit workout discovery and HealthKit route discovery are separate data
problems. Persist a workout summary even when it has no readable route, and
represent route availability explicitly instead of dropping the workout or
using a missing location blob as an ambiguous signal. This keeps the archive
complete while allowing route retrieval to happen independently.

Do not put every route-less workout into an unconditional “pending” set that
is replayed on every launch. First classify the outcome of route lookup:

- **Available:** validate and durably save the route; subsequent syncs should
  skip route reads for this workout.
- **Completed query returns no route:** persist that the route is unavailable
  to the app for now. Keep its summary visible, but do not query it on ordinary
  launches. Because HealthKit read visibility is opaque, this is not proof that
  no route exists in Health. A deliberate retry (for example, user-requested
  repair or a policy-controlled future recheck) may make it eligible again.
- **Transient query failure, cancellation, or incomplete callback sequence:**
  preserve retry eligibility. Do not record a permanent negative result, and
  do not advance a checkpoint past data that was not safely represented.
- **Route data present but invalid or too short:** retain an explicit invalid /
  unusable result and diagnostic rather than retrying the same deterministic
  payload forever. Define product-specific minimum geometry; do not silently
  fabricate a line.

Only classify the lookup as “completed, no usable route returned” after the
route query completed normally and all callback batches/series were accounted
for. A timeout, thrown error, or cancellation is a failed lookup, not a negative
route result. Even a clean empty result is not proof that no route exists in
Health: read authorization is intentionally opaque. User-facing copy should
describe what the app could read, not assert that the user's Health database has
no route data.

Make retry state durable and bounded. Store per-workout outcome/eligibility
alongside the local workout record (or another transactional store), including
enough distinction to recover after interruption. If using a retry schedule,
track attempt count and next eligible time, use backoff, and provide a
user-triggered retry for historical repair. Keep successfully saved routes
out of retry batches even if stale queue state remains. Apply deletions to
both the workout and its retry metadata. Stable workout UUIDs should make a
later route upgrade update the same summary rather than insert a duplicate.

Backfills must be resumable and separate from normal incremental sync. Do not
re-read every already-valid route just because an anchor is absent or a repair
is requested. Page lightweight workout metadata, process only missing or
explicitly retryable routes, save each result before advancing its checkpoint,
and make a failed/interrupted page safe to replay. Normal launch and library
scrolling should never trigger a full route scan or decode GPS data; load route
geometry only for selected detail or bounded sync work.

Tests should exercise the outcome matrix (route found, completed empty result,
query error, cancellation, malformed/short route), restart persistence,
eligibility/backoff, deleted workouts, late route arrival under the same UUID,
and the invariant that stable no-route workouts are not queried again on every
ordinary launch. Simulator fakes validate policy; a signed physical-device
check is still needed for actual HealthKit callback and permission behavior.

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

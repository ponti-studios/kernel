# Core Data across Apple devices with CloudKit

Use this reference when adding or debugging Core Data synchronization between
iOS, iPadOS, and macOS apps signed into the same iCloud account. It captures
Apple's documented model and practical failure modes observed while building
WalksGPX. Verify API details against the linked Apple documentation for the
platform and SDK in use.

## The right mental model

Core Data does not share one SQLite file across devices. Each installation has
its own local persistent store. `NSPersistentCloudKitContainer` mirrors a
CloudKit-compatible store to a CloudKit database, and Core Data imports remote
changes into each device's local store. The local store remains the app's
normal read/write interface, including while offline.

For one person's data across their own devices, use the same CloudKit
container's **private database** on each platform target. The devices must use
the same iCloud account. CloudKit Sharing is a separate feature for sharing
records with other iCloud users; it is not needed for a user's iPhone and Mac
to see their own private data.

This is distinct from:

- **iCloud Drive / ubiquitous documents:** synchronizes user-visible files.
  Keep it for GPX exports, manifests, and agent-readable artifacts when useful;
  it does not mirror Core Data objects into another app's local store.
- **A shared SQLite file:** do not point multiple devices at one file. CloudKit
  synchronizes records between local replicas; it is not a remote SQLite mount.
- **App Groups:** shares a local container among entitled processes on the same
  device, not between devices.
- **Direct CloudKit APIs:** appropriate when custom record-level control,
  server/web access, or a non-Core-Data data model is required. Do not add this
  layer just to get ordinary Core Data records onto another Apple device.

Apple overview: [Mirroring a Core Data store with CloudKit](https://developer.apple.com/documentation/coredata/mirroring-a-core-data-store-with-cloudkit), [CloudKit](https://developer.apple.com/documentation/cloudkit), [Shared data](https://developer.apple.com/documentation/technologyoverviews/shared-data).

## Target setup and compatible stores

- Add the **iCloud / CloudKit** capability to every target that opens the
  mirrored store. Enable the same iCloud container identifier and use the
  intended CloudKit database scope. CloudKit capability and an entitlement by
  themselves do not activate Core Data mirroring.
- Use `NSPersistentCloudKitContainer`, not `NSPersistentContainer`, for stores
  that should mirror. Configure the persistent store description with
  `NSPersistentCloudKitContainerOptions` for the intended container before
  loading the store. For a single store, Apple can associate the first store
  description with the first entitled container; explicit configuration helps
  keep multi-store or multi-container setups clear.
- Each platform keeps its own app-local SQLite URL. Share the model and
  persistence implementation where appropriate, but don't share the physical
  database file across targets/devices.
- All targets writing to the same mirrored dataset need compatible Core Data
  models and CloudKit schema. Keep model versioning deliberate across iOS and
  macOS releases.
- Core Data with CloudKit requires a SQLite store and a CloudKit-compatible
  model. Documented restrictions include: no unique constraints; no undefined
  or `objectID` attributes; relationships must be optional, have inverses, and
  must not use the Deny delete rule. Review current Apple model requirements
  before adopting additional model features.
- Initialize the development CloudKit schema while developing. Treat
  production schema promotion as a release decision: after promotion, existing
  record types and fields are not freely editable/deletable; schema evolution
  is additive and needs compatible app releases.

Apple setup and model references: [Setting Up Core Data with CloudKit](https://developer.apple.com/documentation/coredata/setting-up-core-data-with-cloudkit), [Creating a Core Data Model for CloudKit](https://developer.apple.com/documentation/coredata/creating-a-core-data-model-for-cloudkit).

## Existing local data and prototype-sized migrations

When adopting CloudKit for an app that already has a local SQLite store, keep
the store URL stable and configure that store for CloudKit mirroring rather
than silently switching to a new empty location. Existing local rows need to
be exported; another device's empty store then imports them. Test this with
representative existing data and compare counts and selected records on both
devices after mirroring settles.

Scale the migration work to the actual risk. For a personal prototype with one
source device and no conflicting user datasets, a simple in-place adoption,
one recoverable copy/export, and an end-to-end count/content check are usually
more useful than building a generalized multi-version migration framework.
Still do not delete or overwrite the only copy of valuable data to simplify a
test. Preserve the existing store and any independent export until the first
CloudKit round trip is verified.

Avoid seeding the same logical records independently on multiple devices
during initial rollout. Since the local stores are distinct, independently
created managed objects can become separate CloudKit records unless the app
has an explicit identity/deduplication strategy. Define stable domain IDs and
test duplicate/retry behavior; do not assume a Core Data uniqueness constraint
can enforce identity in a CloudKit-backed model.

## Runtime behavior and UI updates

- Mirroring is asynchronous and system-managed. A local save can succeed while
  export is pending; an export can finish before another device downloads it.
  Network availability, account state, device activity, and system scheduling
  affect timing. Apple describes synchronization as generally occurring on a
  natural system cadence (often around a minute), not as a latency guarantee.
- The destination app reads its local store. It should merge/fetch after local
  imports and when it becomes active; it should not query CloudKit for every
  screen read.
- `automaticallyMergesChangesFromParent` helps merge context changes but is
  not a complete view-update or history-consumption strategy for every app.
  If the UI needs precise incremental updates, enable persistent history and
  remote-change notifications, consume transactions, and merge relevant
  changes into the view context. Test deletion and stale-selection states too.
- `NSPersistentCloudKitContainer` exposes setup/import/export events and
  notifications. Use those for truthful phases and diagnostics. Avoid
  inventing exact remaining time or claiming another device is caught up based
  only on a successful local save or an export event.
- Silent pushes are opportunistic. A missed or delayed push is not proof that
  the data is lost; foreground/import behavior and logs help distinguish delay
  from a persistent error.

Apple runtime references: [Syncing a Core Data Store with CloudKit](https://developer.apple.com/documentation/coredata/syncing-a-core-data-store-with-cloudkit), [Consuming relevant store changes](https://developer.apple.com/documentation/coredata/consuming-relevant-store-changes), [Persistent CloudKit container events](https://developer.apple.com/documentation/coredata/nspersistentcloudkitcontainer/eventchangednotification).

## Payloads, scale, and privacy

- CloudKit record size and operation limits matter. `CKRecord` documentation
  advises using assets rather than ordinary data fields for large binary files;
  Core Data's CloudKit mapping may represent larger values as assets. Verify the
  actual mapping and behavior for the chosen attribute and OS versions instead
  of assuming an arbitrarily large blob is cheap.
- Large histories can create significant initial export/import work. Exercise
  realistic row counts, payload sizes, interrupted transfers, retries, and
  account/network unavailability. Prefer bounded processing in app-owned
  workflows; do not create a competing custom sync queue unless a demonstrated
  requirement needs one.
- Keep only data that belongs in the user's CloudKit private database. Health,
  location, and other sensitive records need careful user-facing explanation,
  least-data design, and platform policy review. CloudKit availability is not
  equivalent to HealthKit authorization.
- **HealthKit/iCloud distribution gate:** Apple's current App Review Guidelines
  section 5.1.3(ii) says apps may not store personal health information in
  iCloud. For any HealthKit-derived data, check this before proposing CloudKit
  or iCloud Drive storage, and distinguish a private development prototype
  from an App Store-distributed design. A private CloudKit database does not
  automatically make the design App Store-compliant. See
  [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/uk/)
  and Apple's [HealthKit privacy guidance](https://developer.apple.com/documentation/healthkit/protecting-user-privacy).
- If a user-facing file/agent workflow is also required, keep that contract
  explicit and separate. CloudKit-backed Core Data's generated schema is not a
  stable general-purpose file API; use a documented export format such as GPX
  and a manifest for that purpose.

Apple references: [CKRecord](https://developer.apple.com/documentation/cloudkit/ckrecord), [CKAsset](https://developer.apple.com/documentation/cloudkit/ckasset), [Reading CloudKit Records for Core Data](https://developer.apple.com/documentation/coredata/reading-cloudkit-records-for-core-data).

## Troubleshooting checklist

1. Confirm the built and signed app targets have the expected CloudKit
   container entitlement and are signed for the expected team/account.
2. Confirm iCloud account status, same Apple Account on both devices, network
   access, and that the configured container/database scope is correct.
3. Confirm the app uses `NSPersistentCloudKitContainer`, the intended SQLite
   URL, and CloudKit store options before loading persistent stores.
4. Confirm both targets use compatible model versions and CloudKit schema; look
   for unsupported model features and failed schema initialization.
5. Inspect Core Data setup/import/export events and unified logs before
   concluding that data disappeared. Apple documents the
   `com.apple.CoreData.CloudKitDebug` launch argument and subsystem filters.
   If a hosted simulator test crashes inside `PFCloudKitContainerProvider`
   before XCTest starts, inspect the `.ips` report and the test host's code
   signature/entitlements. A simulator test host can be unsigned or lack the
   app's iCloud container entitlement even when the regular app target has it;
   CloudKit container construction may then crash rather than return a useful
   assertion failure. Keep production configuration unchanged and give the
   test scheme an explicit test-only way to use an in-memory/local store (for
   example, a dedicated launch argument and/or scheme test environment
   variable consumed by the app's persistence factory). In one hosted XCTest
   setup, a TestAction command-line argument alone did not prevent CloudKit
   initialization in the host; a scheme environment override plus checking
   `XCTestConfigurationFilePath` allowed XCTest to bootstrap on a second
   simulator. Verify that the host honored the override from a successful
   bootstrap or fresh crash report. When unit-testing production config, pass
   explicit empty arguments/environment rather than inheriting XCTest's
   environment, or the test-only detection will correctly disable CloudKit.
   Do not
   silently disable CloudKit in normal Run, Archive, or release configurations.
6. Compare source local count, CloudKit export events, destination import
   events, and destination local count. Verify several route IDs and payloads,
   not just a headline count. A successful destination setup/import event with
   zero affected records is evidence that the destination queried successfully,
   not evidence the source has uploaded data. Inspect the source export side
   before changing destination persistence/UI code.
7. Test offline local reads, eventual arrival after reconnect/foregrounding,
   duplicate saves, deletion propagation, and relaunch. Keep a recovery copy
   until a first real-device round trip succeeds.

Simulator unit tests validate local persistence configuration and app logic;
they do not prove CloudKit account setup, schema deployment, entitlements on a
signed distribution build, or device-to-device delivery. Keep those as a
separate end-to-end acceptance check on two signed devices using the same
account. If physical-device access is unavailable, report the sync path as
unverified rather than treating a successful build or test suite as proof.

Xcode can leave `xcodebuild test` waiting on simulator diagnostics after the
test host exits; the associated `simctl diagnose` process can wait several
minutes (up to its configured timeout), leaving a partial `.xcresult` without
the final `Info.plist`. Check active test/diagnostic processes before retrying
and avoid overlapping runs on the same simulator. A partial result bundle or
an observation timeout is not a test outcome; stop only a confirmed stale
operation and wait for the replacement run's terminal result. In this case,
an older test job had remained alive during diagnostics; overlapping a new job
against the same simulator muddied the result. After stopping confirmed stale
jobs and using a second simulator, XCTest bootstrapped; the first focused run
had one test assertion fail because it accidentally inherited XCTest's
environment, not because persistence failed. After isolating that assertion,
the full suite passed 56/56 tests.

In one signed Mac-only check, local CloudKit setup and import events succeeded
but affected zero objects; the iPhone source was unavailable. The Mac's empty
list therefore remained inconclusive about cross-device delivery. Core Data's
`ANSCK*` SQLite metadata tables can help with one-off diagnosis, but are private
implementation details; do not build app logic or stable support procedures
around their schema. Prefer `NSPersistentCloudKitContainerEventRequest`, event
notifications, and unified logs.

Apple troubleshooting reference: [TN3164: Debugging the synchronization of `NSPersistentCloudKitContainer`](https://developer.apple.com/documentation/technotes/tn3164-debugging-the-synchronization-of-nspersistentcloudkitcontainer).

During a later physical-device check, an immediate post-launch screenshot
showed an empty state, but after the asynchronous iPhone store/history load
settled the app displayed its retained 2,786 routes. Treat the first frame as
unloaded until the application confirms its fetched count; don't trigger a
full-history repair just because that frame is empty. The phone's Core Data
SQLite was about 957 MB and had an active WAL. `devicectl device copy from`
failed with a closed file-service socket and left an incomplete local copy;
SQLite errors against that copy were not evidence of on-device corruption.
Never analyze a failed transfer as authoritative. Prefer in-app counts or
small, non-sensitive diagnostics; if a store copy is unavoidable, quiesce the
writer, include its SQLite sidecars as appropriate, and verify integrity.

Likewise, app-container `WalksGPX_ckAssets` files grew during the check, but
that is only a clue that asset work is staged/active—not proof of completed
CloudKit export or destination import. Compare documented container events
and the destination's actual local records. For device logs, `devicectl
device process launch --console` waits for termination and forwards Ctrl-C to
the app; launch without `--console` for persistent testing, and observe via
screenshots/process diagnostics instead.

The full prototype round trip was later verified on 2026-10-11: iPhone and Mac
both reached 2,786 local `PersistedWalk` rows; the Mac contained ~889 MB of
payload and passed `PRAGMA integrity_check`. A known 140-minute iPhone route
matched on Mac at 7,511 points. The Mac paused at 2,681 rows until the app was
reopened, which triggered another import and delivered the remaining 105. An
event row with a null end timestamp was still active, not a failure. For large
initial syncs, don't stop at the first plateau or infer completion from staged
asset files: compare source/destination row counts and representative route
payloads, wait for event completion, and if imports go quiet below the source
count, foreground or reopen the destination once before deeper diagnosis.

## WalksGPX-specific lessons (examples, not universal constraints)

WalksGPX has distinct iOS and macOS app targets. Matching entitlements alone
did not synchronize the Mac: the persistence stack also had to use
`NSPersistentCloudKitContainer` and explicitly attach options for the same
private CloudKit container to the intended store description before loading
stores. Keep the pre-existing iPhone SQLite URL stable during this prototype
adoption; switching to a new URL would make the app appear to have lost its
large local history. Each platform still has its own local SQLite file.

The app also publishes GPX files and a manifest into iCloud Drive for people
and agents. That export is intentionally independent from Core Data
mirroring: Drive files are not a Mac Core Data store, and CloudKit's generated
Core Data records are not a documented substitute for GPX. Keep the two
products, statuses, and progress indicators distinct so a successful file
refresh is not mistaken for database synchronization (or vice versa).

Remote import is asynchronous and the UI needs an explicit observation path.
The Mac reads its local store, refreshes after persistent-store remote-change
notifications, and refreshes again when the scene becomes active. Debounce
bursts of remote notifications and wait for persistent-store loading before
the first fetch. On iOS, refresh the app's stored-workout view after imports
and foregrounding. Preserve stable domain identity across refetches: deriving
SwiftUI row identity from a newly-created wrapper object's transient identity
can drop selection or animate/rebuild every row after each fetch. For synced
walks, use the workout's stable identifier; for file imports, use a stable file
identity appropriate to that import contract. Stable row identity alone is not
enough when selection stores a value-type snapshot: after refetch, rebind the
selected value to the newly fetched row with the same ID, or a detail pane can
keep showing stale route data while the list is current.

The route coordinates in this app are stored together as encoded binary JSON,
so test representative large routes and the full historical row count; a
record-count-only test does not validate payload transfer or decoding. Avoid
independently seeding the same logical history on both devices before the
first round trip, because separate local inserts can produce duplicate remote
records without an explicit stable-ID/deduplication strategy.

For hosted iOS simulator tests, the test runner lacked the production CloudKit
entitlement and crashed while constructing the CloudKit container before
XCTest could run. A TestAction command-line argument alone did not prevent
this; the scheme also sets `WALKSGPX_DISABLE_CLOUDKIT=1`, and the persistence
helper recognizes that variable and `XCTestConfigurationFilePath`. A focused
run on a second simulator booted XCTest, demonstrating that the host guard
works. One test initially failed because its production-default assertion
inherited the XCTest marker; explicitly pass an empty test environment for
that assertion. The normal app launch has neither test override and keeps
CloudKit enabled. This remains a test-host boundary, not a production
fallback; verify scheme placement and avoid overlapping test jobs against one
simulator.

Finally, a successful local build, unit suite, or iCloud Drive manifest update
does not prove a CloudKit round trip. The acceptance test is: retain and count
the source history, observe export, launch the Mac with the same account,
observe import, and compare counts plus selected stable IDs and route payloads.
For this one-person prototype, keep rollout reversible and avoid generalized
migration machinery, but do not call it complete until that real-device check
passes. Health-derived data in iCloud remains a distribution-policy concern:
the current Apple App Review Guidelines prohibit storing personal health
information in iCloud, so this architecture is prototype-only unless that
policy constraint is resolved.

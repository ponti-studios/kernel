# Apple app build, simulator, and device validation

Use this reference when building, testing, installing, or visually checking an
iOS/iPadOS/macOS app. The operational observations below came from an Xcode 27
project with separate iOS and macOS targets. Tool output and available runtime
versions vary; inspect the current machine rather than assuming these exact
names or failure modes apply everywhere.

## Establish the actual project and destination

- Identify the configuration source before editing target membership or build
  settings. In a generated project, change the declarative project file (for
  example, XcodeGen's `project.yml`), regenerate, and verify the generated
  `.xcodeproj`; do not let the generated project silently diverge.
- List schemes, targets, signing teams, connected devices, and available
  simulator runtimes before a build. Simulator names and OS versions differ
  across Xcode installations. If destination-by-name resolution fails despite
  a listed simulator, use the exact simulator UDID reported by Xcode/simctl.
- Build the specific platform target as well as the simulator/test target.
  An iOS build does not validate macOS-only SwiftUI code; a Mac Catalyst or
  Designed-for-iPad destination is not a native macOS build.
- For release-like/device validation, inspect the built app bundle and its
  signature, bundle identifier, `CFBundleExecutable`, entitlements, and
  provisioning/team selection. Compilation alone does not prove that iOS can
  install or launch the produced `.app`.

## Hosted XCTest and CloudKit

The simulator XCTest host is not the production app process. It can launch
before the test bundle and lack the app's iCloud-container entitlement. In
that state, constructing `NSPersistentCloudKitContainer` can crash in Apple's
CloudKit provider before XCTest reaches any assertion. A command-line argument
in the Test action alone did not prevent this in one project.

Make persistence configuration injectable. For hosted unit tests, use an
in-memory/local-only store and provide a test-scheme environment override that
the app host can see before persistence initialization. Keep that override
strictly in the Test action; verify ordinary Run, Archive, and signed-device
launches still enable the intended CloudKit store. If production-configuration
tests inspect environment resolution, pass an explicit empty environment
rather than inheriting `XCTestConfigurationFilePath` or the test override.
Confirm the test host honored the override from a successful test bootstrap or
fresh crash evidence; do not infer it merely from scheme XML.

Simulator unit tests establish deterministic app logic and local persistence
behavior. They do not establish iCloud account access, production schema
availability, HealthKit read visibility, or cross-device CloudKit delivery.
Keep the signed-device checks separate.

## Simulator test reliability

- Run one `xcodebuild test` operation per simulator at a time. Xcode can remain
  alive collecting `simctl diagnose` after the test host exits; starting a
  second test on the same destination can make both outputs and `.xcresult`
  bundles ambiguous.
- On a stalled test, inspect active `xcodebuild`, simulator launch, and
  `simctl diagnose` processes before retrying. Stop only an operation confirmed
  stale. Do not label a timeout, missing result-bundle metadata, or test-host
  crash as a test pass or an app assertion failure.
- Separate compile/build errors, XCTest assertion failures, simulator boot or
  host failures, and CloudKit integration failures in the report. A system
  framework crash before XCTest connects is not evidence that the app's
  persistence behavior is wrong.
- Save a fresh `.xcresult` per verification run and read its test summary.
  The command's exit status plus the result bundle should agree on pass/fail
  and test counts; a partial result bundle is not authoritative.

## Physical-device install and launch

An in-place development install with the same bundle identifier normally
updates the app while retaining its sandbox; do not delete/reinstall merely to
make a deployment step succeed when the store contains valuable local data.
After installation, verify the reported bundle ID, launch the app without a
console attachment, and inspect the foreground UI/process. A successful
`devicectl` install or launch only proves installation/launch, not that an
asynchronous Core Data load, HealthKit query, or CloudKit import has finished.

Avoid `devicectl device process launch --console` as if it were a detachable
log tail: it waits for process termination, and Ctrl-C can be forwarded to the
app and terminate it. Prefer non-console launch, then use screenshots,
accessibility/UI inspection, process checks, and bounded log collection.

If a store copy is necessary for diagnosis, first establish that the writer is
quiescent and account for SQLite WAL/SHM sidecars. Device file-service socket
failures can leave a truncated local copy; an integrity error on that partial
copy says nothing about the on-device source. Prefer app-visible counts and
small diagnostics. Never overwrite or “repair” the only device store based on
an unverified copy.

## Async launch and cross-device acceptance

The first frame after launch may precede persistent-store readiness and
asynchronous history loading. An immediate empty-state screenshot is not proof
of data loss. Wait for an explicit loaded/count state, then inspect the local
archive before triggering a full-history repair or changing persistence.

For CloudKit delivery, verify both sides: source local count and completed
export evidence; destination import events and destination local count; then
compare representative stable IDs and payload details. A destination setup or
successful zero-object import only proves that the destination queried. A
CloudKit asset-directory increase is only a clue that transfer work exists. A
container event with no end timestamp is still running. A large import may
pause below the source count and continue after foregrounding/reopening the
destination once; only do this after checking actual events and counts.

After changing macOS code, rebuild the native macOS target, replace/relaunch
the installed app, and inspect the running result. Looking at an already-open
old process or stale window can make a correct source change appear ineffective.
For visual changes, verify the real target window, including narrow-window
navigation, not only a build or a SwiftUI preview.

## Practical acceptance boundary

Keep these claims separate:

1. **Build passed:** target compiled for the declared destination.
2. **Tests passed:** the result bundle reports the tests that ran.
3. **Installed/launched:** the signed product is on the intended device and
   process started.
4. **Feature worked:** observed UI/data behavior after asynchronous work
   settled.
5. **Cross-device sync worked:** source export and destination import completed
   and matching data was read locally on both sides.

Report only the highest level actually verified, with the remaining boundary
made explicit.

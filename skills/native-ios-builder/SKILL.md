---
name: native-ios-builder
description: Build and improve native iOS apps with SwiftUI, emphasizing fast product iteration, test-first implementation, reliable Apple framework integrations, and polished interaction design.
license: MIT
compatibility: Native iOS projects using Swift and Xcode.
when:
  - building a new native iOS app or feature in SwiftUI
  - improving an existing iOS app's design, architecture, or tests
  - debugging app behavior involving Apple platform frameworks or project configuration
outputs:
  - Implemented and verified native iOS app changes
  - Test and device verification summary with known limitations
termination:
  - The requested app behavior is implemented and relevant validation passes
  - A reproducible platform limitation or external dependency is documented with its impact
---

# Native iOS Builder

Use this skill when building or changing a native iOS app. Fit the workflow to the request: a small bug fix does not need a full discovery phase, while a new feature with uncertain interaction may benefit from a quick visual prototype before SwiftUI implementation.

## Workflow

1. **Understand the user outcome.** Inspect the app structure, current behavior, project configuration, and existing tests before choosing an architecture. Identify the primary flow, empty/loading/error/success states, and any data or platform boundaries the feature touches. Reuse the app's conventions unless there is evidence they cause the problem.

2. **Resolve design uncertainty early.** For new or visually significant work, sketch the key screen and states in the fastest reviewable medium available (for example, a small HTML canvas or a SwiftUI preview). Ask for feedback when a material product choice is genuinely ambiguous. Once direction is clear, translate the hierarchy, spacing, typography, colors, and state behavior into native SwiftUI. Keep the screen focused; expose detailed diagnostics progressively instead of making every internal status equally prominent.

3. **Define observable behavior, then test first.** Turn the request into examples and edge cases before implementation. Add or update a failing test for the smallest meaningful behavior, implement it, and refactor only after it passes. Put deterministic business rules in pure value types or small services; inject clocks, storage, framework clients, and file locations where tests need control. Avoid tests that merely assert a view can be instantiated when a meaningful state or output can be asserted instead.

4. **Protect data invariants.** Decide which store is authoritative, when writes become durable, how retries work, and what happens on interruption, duplicate events, deletion, migration, or partial failure. Make operations idempotent where retries are expected. Advance checkpoints only after the data they represent is safely persisted. For framework callbacks, model batching and completion explicitly rather than assuming one callback per logical result.

5. **Verify in layers.** Run the narrow test first, then the relevant target's full suite and build. Use simulator tests for deterministic logic and UI states; use a physical device for behavior that depends on real permissions, sensors, account state, background scheduling, or cross-device delivery. Report what each environment proves and what remains unverified. Do not claim a coverage target from a partial report or hide untested platform code with exclusions.

6. **Review the shipped experience.** Check launch and navigation, small and large content, loading and failure states, VoiceOver labels, Dynamic Type, safe areas, and the actual target device/simulator when visual changes are involved. Inspect bundle identifiers, executable/product settings, Info.plist values, capabilities, entitlements, and signing configuration when project targets or platform integrations change.

## Load focused field notes

When work touches persistence, HealthKit, background execution, file export, or synchronization, read [Apple platform field notes](references/apple-platform-field-notes.md). Treat the examples as failure patterns to check for, not architecture requirements for unrelated apps.

## Completion report

Summarize the user-visible result, the tests/build/device checks actually run, and any concrete limitation that affects use. Keep coverage claims tied to the measured target and report; 100% is a measured result, not a proxy for correctness.

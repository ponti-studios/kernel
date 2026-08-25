---
name: kernel-dev-react-native
description: Enforces Expo and React Native implementation boundaries, navigation conventions, native dependency placement, and mobile performance rules. Use when building or reviewing mobile screens, routes, animations, lists, native integrations, or shared code that must remain compatible with the Expo-based app structure.
license: MIT
compatibility: React Native with Expo Router and the project's Expo-based mobile stack.
metadata:
  author: project
  version: "2.0"
  category: Mobile
  tags:
    - react-native
    - expo
    - expo-router
    - mobile
    - performance
    - animations
    - navigation
    - native-dependencies
    - lists
when:
  - user is building or reviewing a React Native or Expo screen, component, or feature
  - user is implementing navigation, routes, tabs, stacks, or mobile UI flow
  - user is adding animations, gestures, media, storage, or device integrations
  - user is optimizing list, scroll, or render performance on mobile
  - user is configuring native modules, Expo plugins, fonts, or monorepo native dependency placement
  - mobile code is mixing shared code, app code, and native dependencies incorrectly
applicability:
  - Use for all Expo / React Native mobile implementation work in this project
  - Use when enforcing mobile navigation, performance, and native dependency constraints
  - Use when reviewing whether a mobile feature belongs in shared code or app-specific code
  - Use when choosing the approved mobile implementation path instead of ad hoc native work
termination:
  - Mobile feature follows Expo-based project boundaries
  - Navigation and route ownership are correct
  - Native dependencies are placed in the correct app layer
  - Performance-sensitive UI follows the required mobile rules
outputs:
  - Boundary-correct mobile component or screen structure
  - Native dependency placement decision
  - Mobile performance findings and required fixes
  - Navigation or route structure decision
---

Enforce the mobile implementation contract for this project. This skill exists to stop the LLM from choosing the wrong mobile stack path, placing native dependencies in the wrong layer, or writing mobile UI that violates the required performance and navigation rules.

## Non-Negotiables

- Expo is the default mobile runtime and workflow.
- Expo Router owns route and navigation structure.
- Native dependencies stay in the app layer, not shared packages.
- Performance-sensitive mobile UI must use the approved primitives for lists, animation, and gestures.
- Shared code must not accidentally depend on native-only app context unless that boundary is explicit.

Forbidden behavior:

- Do not introduce React Native CLI or ad hoc native workflow when the Expo workflow is the project contract.
- Do not place native dependencies in shared packages.
- Do not use the wrong list, animation, or interaction primitive when the project has an approved one.
- Do not hide app-only native dependencies behind "shared" abstractions that break portability.

## Boundary Rules

Use this layering model:

- mobile app routes and screens own navigation, app wiring, and device-specific orchestration
- reusable mobile UI components own rendering and interaction
- shared cross-platform code stays free of app-only native dependencies unless explicitly designed for that boundary
- native integrations belong in the mobile app layer or a clearly app-owned mobile package

If a module requires Expo plugins, device APIs, or native runtime assumptions, do not treat it as generic shared UI.

## Navigation And Route Rules

- Routes belong in the Expo Router `app/` structure.
- Screen ownership, stacks, tabs, and modal structure should follow Expo Router conventions instead of ad hoc navigators.
- Route files should not become dumping grounds for unrelated utilities, types, or business logic.
- Mobile navigation decisions should follow the documented route structure and navigation references for the project.

## Performance Rules

Enforce the required performance defaults:

- long or dynamic lists use the approved high-performance list primitive
- animation uses the approved animation stack and GPU-friendly properties
- gesture-driven interactions use the approved gesture stack
- expensive work stays out of render paths and list items
- mobile state should not create avoidable re-render churn

See the performance references for concrete list, animation, and rendering patterns.

## Monorepo And Native Dependency Rules

- Keep `react-native-*`, Expo modules, and other native dependencies in the mobile app package or an explicitly mobile-owned package.
- Enforce a single version of mobile/native dependencies across the monorepo.
- Shared packages should not directly depend on app-only native runtime behavior unless that is the package's explicit purpose.
- Fonts, plugins, and native configuration should follow the Expo-approved configuration path rather than manual ad hoc setup.

## References

Load only the references for the task at hand. For any performance work, start with `performance.md` (priority-ordered overview), then load its topic references below:

- **Routing & navigation**: `expo-route-structure.md`, `navigation.md`, `navigation-native-navigators.md`, `expo-tabs.md`, `expo-search.md`, `expo-form-sheet.md`, `expo-toolbar-and-headers.md`, `expo-zoom-transitions.md`
- **Lists & scroll performance**: `js-lists-flatlist-flashlist.md`, `list-performance-virtualize.md`, `list-performance-item-memo.md`, `list-performance-item-types.md`, `list-performance-item-expensive.md`, `list-performance-callbacks.md`, `list-performance-function-references.md`, `list-performance-inline-objects.md`, `list-performance-images.md`
- **Animation & gestures**: `animation-derived-value.md`, `animation-gesture-detector-press.md`, `animation-gpu-properties.md`, `js-animations-reanimated.md`, `react-compiler-reanimated-shared-values.md`, `expo-animations.md`
- **State & re-render control**: `state-ground-truth.md`, `react-state-minimize.md`, `react-state-dispatcher.md`, `react-state-fallback.md`, `js-atomic-state.md`, `js-concurrent-react.md`, `js-uncontrolled-components.md`, `scroll-position-no-state.md`
- **Rendering rules**: `rendering-text-in-text-component.md`, `rendering-no-falsy-and.md`
- **React Compiler**: `js-react-compiler.md`, `react-compiler-destructure-functions.md`
- **UI primitives & design system**: `ui-pressable.md`, `ui-menus.md`, `ui-styling.md`, `ui-measure-views.md`, `ui-image-gallery.md`, `ui-expo-image.md`, `ui-native-modals.md`, `ui-safe-area-scroll.md`, `ui-scrollview-content-inset.md`, `design-system-compound-components.md`, `imports-design-system-folder.md`, `expo-controls.md`, `expo-gradients.md`
- **Media, icons, effects, storage**: `expo-icons.md`, `expo-media.md`, `expo-visual-effects.md`, `expo-webgpu-three.md`, `images.md`, `expo-storage.md`
- **Native modules & platform config**: `native-platform-setup.md`, `native-threading-model.md`, `native-turbo-modules.md`, `native-view-flattening.md`, `native-sdks-over-polyfills.md`, `native-android-16kb-alignment.md`, `monorepo-native-deps-in-app.md`, `monorepo-single-dependency-versions.md`, `fonts-config-plugin.md`
- **Profiling & memory**: `js-profile-react.md`, `js-measure-fps.md`, `native-profiling.md`, `native-measure-tti.md`, `native-memory-leaks.md`, `native-memory-patterns.md`, `js-memory-leaks.md`
- **Bundle size & startup**: `bundle-analyze-app.md`, `bundle-analyze-js.md`, `bundle-barrel-exports.md`, `bundle-code-splitting.md`, `bundle-tree-shaking.md`, `bundle-library-size.md`, `bundle-native-assets.md`, `bundle-r8-android.md`, `bundle-hermes-mmap.md`, `js-hoist-intl.md`

## Guardrails

- Never optimize for code reuse by breaking the native/shared boundary.
- Never choose convenience over mobile performance for list-heavy or animation-heavy UI.
- Never move device-specific assumptions into supposedly generic shared code.
- Never bypass the documented Expo routing and navigation structure just because a one-off solution seems faster.
- Never add a native dependency without deciding which layer owns it.

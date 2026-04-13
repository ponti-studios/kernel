React Native and Expo standards: UI patterns, Expo Router conventions, performance rules, animation, state management, and monorepo configuration.

## Toolchain

| Concern    | Tool                                                   |
| ---------- | ------------------------------------------------------ |
| Framework  | React Native + Expo                                    |
| Navigation | Expo Router                                            |
| Builds     | EAS (`eas build`, `eas submit`)                        |
| Animations | `react-native-reanimated` — never `Animated` from core |
| Gestures   | `react-native-gesture-handler`                         |
| Lists      | `FlashList` — never `FlatList` for long lists          |
| Images     | `expo-image`                                           |

Never use: React Native CLI (use Expo), `Animated` from React Native core, `FlatList` for long lists, `TouchableOpacity` (use `Pressable`).

## Running the App

**Always try Expo Go first before creating custom builds.**

Most Expo apps work in Expo Go without any custom native code. Before running `bunx expo run:ios` or `bunx expo run:android`:

1. Start with `bunx expo start` — scan the QR code with Expo Go
2. Test thoroughly in Expo Go
3. Only create custom builds when required (see below)

### When Custom Builds Are Required

You need `bunx expo run:ios/android` or `eas build` only when using:

- **Local Expo modules** (custom native code in `modules/`)
- **Apple targets** (widgets, app clips, extensions via `@bacons/apple-targets`)
- **Third-party native modules** not included in Expo Go
- **Custom native configuration** that can't be expressed in `app.json`

Expo Go supports all `expo-*` packages, Expo Router navigation, Reanimated, gesture handler, push notifications, deep links, and more. If unsure, try Expo Go first.

---

## Code Style

- Use import statements at the top of the file — no inline requires
- Use kebab-case for file names: `comment-card.tsx`
- Never use special characters in file names
- Always remove old route files when moving or restructuring navigation
- Configure `tsconfig.json` with path aliases; prefer aliases over relative imports
- Escape nested backticks and quotes carefully — unterminated strings are a common error

---

## Library Preferences

| Use                                  | Instead of                             |
| ------------------------------------ | -------------------------------------- |
| `expo-audio`                         | `expo-av` for audio                    |
| `expo-video`                         | `expo-av` for video                    |
| `expo-image` with `source="sf:name"` | `expo-symbols` or `@expo/vector-icons` |
| `react-native-safe-area-context`     | React Native's built-in `SafeAreaView` |
| `process.env.EXPO_OS`                | `Platform.OS`                          |
| `React.use`                          | `React.useContext`                     |
| `expo-image` `<Image>`               | intrinsic `<img>` element              |
| `expo-glass-effect`                  | custom blur implementations            |
| `Pressable`                          | `TouchableOpacity`                     |
| `FlashList`                          | `FlatList` for long lists              |

**Never use:** Picker, WebView, SafeAreaView, or AsyncStorage from core React Native — they have been removed. Never use `legacy expo-permissions`.

---

## Performance Rules

### Priority Order

| Priority | Category         | Impact   |
| -------- | ---------------- | -------- |
| 1        | List Performance | CRITICAL |
| 2        | Animation        | HIGH     |
| 3        | Navigation       | HIGH     |
| 4        | UI Patterns      | HIGH     |
| 5        | State Management | MEDIUM   |
| 6        | Rendering        | MEDIUM   |
| 7        | Monorepo         | MEDIUM   |
| 8        | Configuration    | LOW      |

### List Performance (CRITICAL)

- Use `FlashList` for any list that may exceed ~20 items — see `list-performance-virtualize.md`
- Memoize list item components with `React.memo` — see `list-performance-item-memo.md`
- Stabilize all callbacks with `useCallback` before passing to list items — see `list-performance-callbacks.md`
- Never create inline style objects in render — see `list-performance-inline-objects.md`
- Extract functions outside the component that don't need closures — see `list-performance-function-references.md`
- Use `expo-image` with correct size hints in list items — see `list-performance-images.md`
- Move all expensive computation outside list item render — see `list-performance-item-expensive.md`
- Use `getItemType` for lists with multiple item layouts — see `list-performance-item-types.md`

### Animation (HIGH)

- Animate only `transform` and `opacity` on the UI thread — see `animation-gpu-properties.md`
- Use `useDerivedValue` for values computed from other animated values — see `animation-derived-value.md`
- Use `Gesture.Tap()` from `react-native-gesture-handler` instead of `Pressable` for gesture-driven animations — see `animation-gesture-detector-press.md`

### Navigation (HIGH)

- Always use native stack (`createNativeStackNavigator`) and native tabs over JS navigators — see `navigation-native-navigators.md`

---

## Responsiveness

- Always wrap the root component in a `ScrollView` for responsiveness
- Use `<ScrollView contentInsetAdjustmentBehavior="automatic" />` instead of `<SafeAreaView>` for smarter safe area insets
- Apply `contentInsetAdjustmentBehavior="automatic"` to `FlatList` and `SectionList` as well
- Use flexbox instead of the `Dimensions` API
- Always prefer `useWindowDimensions` over `Dimensions.get()` to measure screen size

---

## Styling

Follow Apple Human Interface Guidelines.

- Prefer flex gap over margin and padding
- Prefer padding over margin where possible
- Always account for safe area — with stack headers, tabs, or `contentInsetAdjustmentBehavior="automatic"`
- Ensure both top and bottom safe area insets are accounted for
- Use inline styles or `StyleSheet.create` — CSS and Tailwind are not supported
- Add entering and exiting animations for state changes
- Use `{ borderCurve: 'continuous' }` for rounded corners unless creating a capsule shape
- Always use a navigation stack title instead of a custom text element on the page
- Use `contentContainerStyle` padding on `ScrollView` — not padding on the `ScrollView` itself

### Shadows

Use CSS `boxShadow` style prop. Never use legacy React Native `shadow*` props or `elevation`.

```tsx
<View style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }} />
```

### Text

- Add `selectable` prop to every `<Text>` displaying important data or error messages
- Use `{ fontVariant: 'tabular-nums' }` for counters and numeric values

---

## Behavior

- Use `expo-haptics` conditionally on iOS for delightful feedback
- Use built-in haptic views like `<Switch />` and `@react-native-community/datetimepicker`
- When a route belongs to a Stack, its first child should almost always be a `ScrollView` with `contentInsetAdjustmentBehavior="automatic"`
- Prefer `headerSearchBarOptions` in `Stack.Screen` options over a custom search bar
- Use `<Text selectable />` for data that users may want to copy
- Format large numbers as `1.4M` or `38k`
- Never use intrinsic elements like `<img>` or `<div>` unless inside a WebView or Expo DOM component

---

## Routes

See `references/expo-route-structure.md` for detailed conventions.

- Routes belong in the `app/` directory
- Never co-locate components, types, or utilities in `app/` — this is an anti-pattern
- Always ensure there is a route matching `"/"`, even if inside a group

---

## Navigation

### Link

```tsx
import { Link } from 'expo-router';

<Link href="/path" />

// With custom component
<Link href="/path" asChild>
  <Pressable>...</Pressable>
</Link>
```

Always consider adding `<Link.Preview>` to follow iOS conventions. Add context menus and previews frequently.

### Stack

- Always use `_layout.tsx` files to define stacks
- Use `Stack` from `'expo-router/stack'` for native navigation stacks
- Set the page title in `Stack.Screen` options, not with a custom `<Text>` element

### Context Menus

```tsx
<Link href="/settings" asChild>
  <Link.Trigger>
    <Pressable>
      <Card />
    </Pressable>
  </Link.Trigger>
  <Link.Menu>
    <Link.MenuAction title="Share" icon="square.and.arrow.up" onPress={handleShare} />
    <Link.MenuAction title="Delete" icon="trash" destructive onPress={handleDelete} />
  </Link.Menu>
</Link>
```

### Modal and Sheet

```tsx
// Modal
<Stack.Screen name="modal" options={{ presentation: "modal" }} />

// Form sheet with detents
<Stack.Screen
  name="sheet"
  options={{
    presentation: "formSheet",
    sheetGrabberVisible: true,
    sheetAllowedDetents: [0.5, 1.0],
    contentStyle: { backgroundColor: "transparent" }, // liquid glass on iOS 26+
  }}
/>
```

### Common Route Structure

```
app/
  _layout.tsx               — <NativeTabs />
  (index,search)/
    _layout.tsx             — <Stack />
    index.tsx               — Main list
    search.tsx              — Search view
```

```tsx
// app/_layout.tsx
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";

export default function Layout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(index)">
        <Icon sf="list.dash" />
        <Label>Items</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(search)" role="search" />
    </NativeTabs>
  );
}
```

---

## State Management

- Minimize the number of state subscriptions per component — see `react-state-minimize.md`
- Use dispatcher pattern for callbacks passed to child components — see `react-state-dispatcher.md`
- Always show a fallback state on first render before data loads — see `react-state-fallback.md`
- Do not store scroll position in component state — see `scroll-position-no-state.md`
- Maintain a single source of truth for derived state — see `state-ground-truth.md`

---

## Monorepo Configuration

- Keep all native dependencies (`react-native-*`, Expo modules) in the app package, not shared packages — see `monorepo-native-deps-in-app.md`
- Enforce single versions of all React Native dependencies across the monorepo — see `monorepo-single-dependency-versions.md`
- Use config plugins for custom fonts rather than manual native linking — see `fonts-config-plugin.md`

---

## Performance Optimization

This section covers performance optimization for React Native applications, based on Callstack's "Ultimate Guide to React Native Optimization".

### When to Apply

Reference these guidelines when:

- Debugging slow/janky UI or animations
- Investigating memory leaks (JS or native)
- Optimizing app startup time (TTI)
- Reducing bundle or app size
- Writing native modules (Turbo Modules)
- Profiling React Native performance
- Reviewing React Native code for performance

### Priority Order

| Priority | Category           | Impact      |
| -------- | ------------------ | ----------- |
| 1        | List Performance   | CRITICAL    |
| 2        | Bundle Size        | CRITICAL    |
| 3        | FPS & Re-renders   | CRITICAL    |
| 4        | TTI Optimization   | HIGH        |
| 5        | Native Performance | HIGH        |
| 6        | Memory Management  | MEDIUM-HIGH |
| 7        | Animations         | MEDIUM      |

### Quick Reference

**Profile first:**

```bash
# Open React Native DevTools
# Press 'j' in Metro, or shake device → "Open DevTools"
```

**Common fixes for slow/janky UI:**

- Replace ScrollView with FlatList/FlashList for lists
- Use React Compiler for automatic memoization
- Use atomic state (Jotai/Zustand) to reduce re-renders
- Use `useDeferredValue` for expensive computations

**Common fixes for bundle size:**

- Avoid barrel imports (import directly from source)
- Remove unnecessary Intl polyfills (Hermes has native support)
- Enable tree shaking (Expo SDK 52+ or Re.Pack)
- Enable R8 for Android native code shrinking

**Common fixes for TTI:**

- Disable JS bundle compression on Android (enables Hermes mmap)
- Use native navigation (react-native-screens)
- Preload commonly-used expensive screens before navigating to them

**Common fixes for native performance:**

- Use background threads for heavy native work
- Prefer async over sync Turbo Module methods
- Use C++ for cross-platform performance-critical code

### Performance References

Full documentation with code examples in `references/`:

| Category         | Files                                                                                                                                                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JavaScript/React | `js-lists-flatlist-flashlist.md`, `js-profile-react.md`, `js-measure-fps.md`, `js-memory-leaks.md`, `js-atomic-state.md`, `js-concurrent-react.md`, `js-react-compiler.md`, `js-animations-reanimated.md`, `js-uncontrolled-components.md`                                                  |
| Native           | `native-turbo-modules.md`, `native-sdks-over-polyfills.md`, `native-measure-tti.md`, `native-threading-model.md`, `native-profiling.md`, `native-platform-setup.md`, `native-view-flattening.md`, `native-memory-patterns.md`, `native-memory-leaks.md`, `native-android-16kb-alignment.md` |
| Bundling         | `bundle-barrel-exports.md`, `bundle-analyze-js.md`, `bundle-tree-shaking.md`, `bundle-analyze-app.md`, `bundle-r8-android.md`, `bundle-hermes-mmap.md`, `bundle-native-assets.md`, `bundle-library-size.md`, `bundle-code-splitting.md`                                                     |

### Problem → Skill Mapping

| Problem                        | Start With                                              |
| ------------------------------ | ------------------------------------------------------- |
| App feels slow/janky           | `js-measure-fps.md` → `js-profile-react.md`             |
| Too many re-renders            | `js-profile-react.md` → `js-react-compiler.md`          |
| Slow startup (TTI)             | `native-measure-tti.md` → `bundle-analyze-js.md`        |
| Large app size                 | `bundle-analyze-app.md` → `bundle-r8-android.md`        |
| Memory growing                 | `js-memory-leaks.md` or `native-memory-leaks.md`        |
| Animation drops frames         | `js-animations-reanimated.md`                           |
| List scroll jank               | `js-lists-flatlist-flashlist.md`                        |
| TextInput lag                  | `js-uncontrolled-components.md`                         |
| Native module slow             | `native-turbo-modules.md` → `native-threading-model.md` |
| Native library alignment issue | `native-android-16kb-alignment.md`                      |

---

_Performance optimization content based on "The Ultimate Guide to React Native Optimization" by Callstack._

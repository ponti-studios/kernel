# Jinn Design Skill

You are handling frontend design and UI implementation with the Ponti Studios design system as the operating spec.
You do not separate "design" from "implementation". Component architecture, layout, styling, motion, accessibility, and polish are one job.

Before writing any UI code, read all five reference files emitted alongside this skill:
- `references/foundations.md` — tokens, typography, color, spacing, elevation, radii, grid, z-index, accessibility
- `references/motion.md` — GSAP mandate, canonical sequences, timing, easing, reduced motion, mobile animation
- `references/components.md` — button, input, card, sheet, badge, avatar, skeleton, toast, empty state, link, form, table, code block, markdown
- `references/patterns.md` — responsive behaviour, overlay stacking, focus management, copy/writing style, image handling, gesture thresholds, route transitions, scrollbars, cursor rules, selection styles
- `references/chat.md` — chat UI: header, message bubbles, transcript, composer, thinking indicator, shimmer, animations, tokens, common violations

If reference files do not exist in the current project, fall back to the canonical rules in this skill.
Token files are the authoritative source of values. Never use a value that isn't in the token files.

Use this skill whenever the work includes any of the following:
- building or reviewing frontend UI components
- CSS, layout, responsiveness, or accessibility work
- design-system enforcement
- animation and interaction design
- visual polish, hierarchy, or user flow improvements

---

## Philosophy

Three obsessions drive every decision.

1. **Performance.** Every pixel rendered, every byte shipped, every animation frame must earn its place. The UI must feel faster than the user expects.
2. **Minimalism.** Remove everything that doesn't serve a purpose. Complexity is a bug. If a component can be expressed with less, it must be.
3. **Joyful motion.** Animation communicates state, confirms intent, and creates delight. Every transition is deliberate, purposeful, and physically believable.

Deviation from this spec requires explicit justification. "It was easier" is not justification.

---

## Absolute rules — no exceptions

### Tokens
- All values come from tokens: colors, spacing, radii, shadows, durations, font sizes, z-indices.
- **Never hardcode** any of these values in a component or style file.
- If a token doesn't exist, add it to the project's token files before using it.
- Platform divergence (web vs. native) is handled inside token files — always use the platform-correct key.

### Animation (read motion.md in full)
- **All interactive animations on web MUST use GSAP via the project's canonical sequences file.**
- Never reimplement a canonical sequence locally — import it.
- CSS keyframe animations are reserved exclusively for Radix UI (or equivalent headless UI library) component enter/exit via data-attribute selectors.
- Never add new `@keyframes` for product surfaces.
- Every GSAP sequence must respect `reducedMotion()`.
- Never animate `width`, `height`, `top`, `left`, `right`, `bottom`, or `box-shadow`.
- On mobile: `react-native-reanimated` worklets only. Never `Animated` from React Native core.
- Target 60fps. If it can't hold 60fps on a mid-range device, remove it.

### Typography
- Use only composed utility classes: `.display-1/2`, `.heading-1–4`, `.body-1–4`, `.subheading-1–4`.
- Never mix raw size/weight utilities (e.g. `text-sm font-medium`) for product text.
- Never `font-weight` above 700.
- Minimum 16px on mobile form inputs — prevents iOS auto-zoom.
- Maximum line length: 72 characters for body copy.

### Color
- All color references through CSS custom properties. Never raw Tailwind palette classes.
- Text dimming: use the correct text tier token — never `opacity` on text.
- Accent = `#007AFF`. Destructive = `#FF3B30`. Never swap these.
- WCAG AA minimum contrast ratio: 4.5:1 for body text, 3:1 for large text and UI components.

### Spacing
- 8px primary grid. 4px secondary (internal fine-tuning only).
- Only `1px` is permitted outside the spacing scale — for hairline borders.

### Accessibility
- Touch targets: **44px × 44px minimum** (Apple HIG + WCAG 2.5.5).
- Focus ring: `outline: 2px solid var(--color-ring); outline-offset: 2px; border-radius: inherit`. `--color-ring` is `#1c1c1e` (Apple near-black label colour), **not** accent blue. `border-radius: inherit` means pill buttons get pill rings, cards get card-radius rings. Never suppress without replacement.
- Mouse/touch `:focus` shows nothing. Keyboard `:focus-visible` shows the ring.
- Modals and sheets trap focus (`aria-modal="true"`).
- On close, return focus to the trigger element.
- Never `tabIndex > 0`.
- All non-decorative images need `alt` text.
- `aria-label` on all icon-only buttons.

### Interaction states
Every interactive element must implement all applicable states. Missing states are bugs.
- **Hover**: CSS `transition-colors duration-150` on the container (never on child elements individually)
- **Focus-visible**: `outline: 2px solid var(--color-ring); outline-offset: 2px; border-radius: inherit`
- **Active/pressed**: GSAP `scale(0.97)` on pointerdown, reversed on pointerup
- **Disabled**: `opacity: 0.4`, `cursor: not-allowed`, `pointer-events: none` — never change color
- **Loading**: spinner replaces label — never silently disable
- **Error**: destructive border + error message
- **Selected**: accent background + accent foreground

### Performance
- Lists > 50 items: virtualise (`react-window` web, `FlashList` mobile).
- `React.memo` on all feed/stream row components.
- Lazy-load routes: `React.lazy` + `Suspense`.
- Named icon imports only — never import entire icon libraries.
- Never import `lodash`. Use native methods.
- Explicit `width` and `height` on all images — prevents CLS.
- Never use `will-change` speculatively.

---

## Chat-specific rules

These rules apply to all chat UI components: web and mobile. Always consult `references/chat.md` for the full specification.

### Token usage — no exceptions

Chat components must use `chatTokens` from the project's token files for all chat-specific values. Common violations:

- ❌ `bg-white`, `bg-bg-surface`, `text-foreground` — use tokens
- ❌ `border-subtle`, `border-border-default` — use `colors['border-subtle']`
- ❌ `rounded-md`, `rounded-[1.75rem]` — use `radii.md` or `chatTokens.radii.bubble`
- ❌ `rgba(0,0,0,0.08)` — use `chatTokens.borders.composer`
- ❌ `shadow-sm`, `shadow-[0_2px_12px_...]` — use `shadows.low` / `shadows.medium`
- ❌ `space-y-4`, `py-4` — use `chatTokens.turnGap`, `chatTokens.contentGap`
- ❌ Hardcoded font sizes (17, 18, 24) — use `body-1` class or `fontSizes` token

### Bubble rules — the most important chat rule

**User messages:** Wrapped in a bubble.
- Background: `chatTokens.surfaces.user`
- Border: `1px solid chatTokens.borders.user`
- Radius: `chatTokens.radii.bubble`
- Max width: `chatTokens.userBubbleMaxWidth`
- Text: white, `body-1`
- Shadow: `shadows.low`
- Alignment: right

**Assistant messages:** Never wrapped in a bubble. Plain text, full transcript width.
- Background: transparent
- Text: `text-primary`, `body-1`
- Alignment: left

**Forbidden:**
- Never put assistant messages in a bubble
- Never show a user avatar
- Never put "You" inside the user bubble
- Never use `rounded-full` for message bubbles

### Animation requirements

**Message enter animation (web):** Every message rendered into the DOM must animate in:
```ts
playEnterRow(el, 0) // No stagger for new messages — stagger only on initial load
```

**Initial load shimmer:** Use `playShimmer` on each skeleton row. Kill on data resolve.
```ts
shimmerTween = playShimmer(skeletonEl)
dataResolve => shimmerTween.kill()
```

**Streaming cursor:** CSS custom animation class (not Tailwind `animate-pulse`). Define in `animations.css`.

**Reduced motion:** All animations must check `reducedMotion()`. The canonical sequences handle this automatically when imported correctly.

### Mobile-specific

- Never use `Animated` from React Native core — use react-native-reanimated only
- Font sizes: 17px for body text (not 16px — iOS minimum)
- `borderRadii.md` (numeric, not percentage)
- Safe area insets on header and composer
- Composer clearance: 220px minimum from bottom (accounts for keyboard + safe area)
- 44×44px minimum touch targets on action buttons

---

## Review checklist

Fail the review if any of the following are violated:

### Tokens & values
- [ ] No hardcoded colors, sizes, radii, durations, z-indices, or font values
- [ ] Platform-correct token keys used (web vs. native)
- [ ] New token added to token files if a value was missing

### Animation
- [ ] All interactive animations use GSAP canonical sequences
- [ ] Radix/headless UI states use CSS `void-anim-*` classes only
- [ ] `reducedMotion()` guard respected — no sequences bypass it
- [ ] No animation of layout-triggering CSS properties
- [ ] 60fps achievable on mid-range device

### Typography & copy
- [ ] Composed utility classes used — no raw size/weight combinations
- [ ] Font weight ≤ 700
- [ ] Mobile inputs ≥ 16px
- [ ] Button labels are verb-first, sentence case
- [ ] Error messages tell the user what to do

### Color & contrast
- [ ] All colors from CSS custom properties — no raw Tailwind palette
- [ ] Text dimmed via tier token, not opacity
- [ ] Accent and destructive never swapped
- [ ] WCAG AA contrast met (4.5:1 body, 3:1 UI components)

### Accessibility
- [ ] Touch targets ≥ 44px × 44px
- [ ] Focus ring uses --color-ring (#1c1c1e), not accent, with border-radius: inherit
- [ ] :focus shows nothing; :focus-visible shows the ring (keyboard only)
- [ ] Modals/sheets trap focus with aria-modal
- [ ] Focus returns to trigger on close
- [ ] No tabIndex > 0
- [ ] Alt text on non-decorative images
- [ ] aria-label on icon-only buttons

### Components & states
- [ ] All required interaction states implemented (hover, focus-visible, active, disabled)
- [ ] Loading and error states implemented where applicable
- [ ] Component spec consulted before implementing (components.md)
- [ ] No new component variants without updating the spec

### Layout & responsive
- [ ] Mobile-first — base styles are mobile, breakpoints layer up
- [ ] No max-width media queries
- [ ] Z-index from token scale only
- [ ] Only one modal/sheet open at a time
- [ ] Toasts portal to document body

### Performance
- [ ] Lists > 50 items virtualised
- [ ] React.memo on feed row components
- [ ] Routes lazy-loaded
- [ ] Named icon imports only
- [ ] Explicit width/height on images

### Chat UI
- [ ] `chatTokens` used for all chat-specific values (surfaces, borders, radii, spacing)
- [ ] User messages in bubble, assistant messages plain (no assistant bubble)
- [ ] No hardcoded Tailwind color classes in chat (no `bg-white`, `text-foreground`, `border-subtle`)
- [ ] No hardcoded rgba values — tokens only
- [ ] No hardcoded font sizes or radii in chat components
- [ ] No `animate-pulse` — custom CSS class or GSAP for streaming cursor
- [ ] Mobile: react-native-reanimated used, not `Animated` from React Native core
- [ ] Message enter animation on mount (`playEnterRow` web, reanimated equivalent mobile)
- [ ] Shimmer tweens killed on data resolve (never left running)
- [ ] Composer shadow upgrade on focus (shadows.low → shadows.medium)
- [ ] Actions row has 44px minimum touch targets
- [ ] aria-label on all icon-only buttons
- [ ] No stub components returning `null`
- [ ] Mobile composer clearance accounts for keyboard + safe area

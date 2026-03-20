# Design System — Chat UI

Canonical specification for all chat/conversation UI components across web and mobile. This document is the authoritative reference for chat components; always use it alongside `design-system-components.md`.

---

## Anatomy

A chat screen consists of four regions, top to bottom:

```
┌──────────────────────────────────────┐
│  ChatHeader                           │  ← Fixed, non-scrolling
├──────────────────────────────────────┤
│                                      │
│  ChatMessages (scrollable)            │  ← Virtualised if > 50 items
│    └── ChatMessage (per turn)         │
│                                      │
│                                      │
├──────────────────────────────────────┤
│  Composer (pinned)                   │  ← Always visible
└──────────────────────────────────────┘
```

---

## ChatHeader

### Web

| Property | Value |
|----------|-------|
| Background | `bg-elevated` with `bg-overlay` backdrop |
| Height | 56px mobile, 60px desktop |
| Border bottom | `1px solid border-subtle` |
| Back button | Left-aligned, 44×44px touch target |
| Title area | Centre-aligned, max-width 50% of header |
| Status copy | `body-4`, `text-tertiary` |
| Actions | Right-aligned, icon buttons 44×44px |

**Status copy states:**
- New conversation: "New conversation"
- With messages: "{n} messages"
- Classifying: "Preparing note review"
- Reviewing: "Review ready"
- Persisting: "Saving note"

### Mobile

- Safe area insets applied to top padding
- Context anchor shows above status copy
- Icon buttons 36×36px minimum

---

## ChatMessages — Scroll Container

| Property | Web | Mobile |
|----------|-----|--------|
| Max width | `chatTokens.transcriptMaxWidth` (768px) | Full width |
| Horizontal padding | 24px desktop, 16px mobile | 16px |
| Vertical padding | 24px top, clearance for composer bottom | 4px top |
| Scroll | Native overflow-y | `FlatList` |
| Composer clearance | 32px bottom padding | `CHAT_COMPOSER_CLEARANCE` token |
| Auto-scroll | On new message if user is near bottom | Same |
| Virtualisation threshold | 50 messages | Same |

---

## ChatMessage — Per-turn rendering

Each turn consists of layers in this order:

1. **Message row** — handles padding and alignment
2. **MessageContent** — column container, handles max-width
3. **Reasoning** (assistant only) — above main content, 3px left border
4. **Tool calls** — below reasoning, above main content
5. **Main content** — bubble (user) or plain (assistant)
6. **Focus items** — referenced notes, collapsed by default
7. **Metadata** — sender label · timestamp, `body-4`, `text-tertiary`
8. **Actions** — hidden on hover (web), always visible (mobile)

**Gap between layers:** 8px (`chatTokens.contentGap`)
**Turn gap (between messages):** 20px (`chatTokens.turnGap`)

---

## User message bubble

| Property | Value |
|----------|-------|
| Max width | `chatTokens.userBubbleMaxWidth` (544px) |
| Background | `chatTokens.surfaces.user` |
| Border | `1px solid chatTokens.borders.user` |
| Border radius | `chatTokens.radii.bubble` = `radii.md` (10px web, 10 native) |
| Padding | 16px horizontal, 12px vertical |
| Text color | `chatTokens.foregrounds.user` = `white` |
| Font | `body-1` (16px web, 17px mobile) |
| Line height | 1.6 web, 1.5 mobile |
| Alignment | Right |
| Shadow | `shadows.low` |

**Forbidden:**
- Never put assistant messages in a bubble
- Never show a user avatar
- Never put "You" inside the user bubble
- Never use `rounded-full` for message bubbles

---

## Assistant message surface

| Property | Value |
|----------|-------|
| Width | Full transcript width (up to 768px) |
| Background | `transparent` |
| Border | None |
| Text color | `text-primary` |
| Font | `body-1` (16px web, 18px mobile) |
| Line height | 1.6 web, 1.5 mobile |
| Alignment | Left |

**Never wrap assistant messages in a bubble.** The transcript is prose.

---

## Metadata row

| Property | Value |
|----------|-------|
| Font | `body-4` (12px) |
| Color | `text-tertiary` |
| Opacity | 0.7 |
| Content | Sender label · Relative timestamp |
| Alignment | Matches message alignment |

- "You" for user, "AI Assistant" for assistant — never initials
- Relative timestamp: "just now", "2m ago", "Yesterday"
- Never show absolute timestamps in the transcript

---

## Actions row

| Property | Value |
|----------|-------|
| Visibility | Hidden by default, visible on hover (web) / always visible (mobile) |
| Transition | CSS `opacity 120ms ease` on group hover |
| Touch target | 44×44px minimum |
| aria-label | Required on every icon-only button |

**Actions per message type:**

| Action | User | Assistant |
|--------|------|-----------|
| Copy | ✅ | ✅ |
| Edit | ✅ | ❌ |
| Regenerate | ❌ | ✅ |
| Delete | ✅ | ✅ |
| Speak (TTS) | ❌ | ✅ |
| Share | ❌ | ✅ |

---

## Reasoning block (assistant)

| Property | Value |
|----------|-------|
| Background | `bg-surface` |
| Border left | `3px solid border-default` |
| Padding | 16px left, 8px vertical |
| Font | `body-4`, monospace |
| Color | `text-tertiary` |

---

## Tool calls

| Property | Value |
|----------|-------|
| Surface | `bg-surface` with `1px border border-subtle` |
| Radius | `radii.md` |
| Padding | 12px |
| Tool name | `body-4`, `fontWeight: 600` |
| Args | monospace, 12px, `text-secondary` |
| Status | Dot indicator: `accent` = running, `success` = completed, `destructive` = error |
| Gap between tools | 8px |

---

## Focus items (referenced notes)

| Property | Value |
|----------|-------|
| Surface | `bg-base` with `1px border border-default` |
| Radius | `radii.md` |
| Padding | 8px horizontal, 4px vertical |
| Font | `body-4` |
| State | Collapsed by default (show count only) |

---

## Composer

### Web

| Property | Value |
|----------|-------|
| Container | Full width up to 768px |
| Background | `chatTokens.surfaces.composer` |
| Border | `1px solid chatTokens.borders.composer` |
| Border radius | `1.75rem` (28px) — **documented exception** |
| Shadow | `shadows.low`, upgrades to `shadows.medium` on focus |
| Padding | 16px |
| Submit button | 36×36px, circular, foreground background, white icon |

### Mobile

| Property | Value |
|----------|-------|
| Background | `bg-elevated` |
| Border top | `1px solid border-default` |
| Shadow | `shadows.low` (iOS only) |
| Textarea | 17px font, `text-primary` |
| Submit | 44×44px, accent background |
| Clearance | 220px minimum from bottom (keyboard + safe area) |

### Suggestions strip (shown when input is empty)

| Property | Value |
|----------|-------|
| Surface | `bg-base` |
| Border | `1px solid border-default` |
| Radius | `radii.md` |
| Font | `body-2` |
| On tap | Insert suggestion text, focus textarea |

---

## Thinking indicator (streaming)

| Property | Web | Mobile |
|----------|-----|--------|
| Label | "AI Assistant" in `body-4` | Same |
| Indicator | 3 dots, 8px each | Same |
| Animation | CSS custom class (not Tailwind `animate-pulse`) | react-native-reanimated bounce dots |
| Text | "Thinking…" in `body-4`, `text-tertiary` | Same |

**Mobile:** Use react-native-reanimated `withSequence` + `withTiming`. Do not use `Animated` from React Native core.

---

## Skeleton / shimmer

| Property | Web | Mobile |
|----------|-----|--------|
| Structure | Match the shape of real messages | Same |
| Background | `bg-surface` | `bg-surface` |
| Animation | GSAP `playShimmer` | reanimated pulse |
| Kill on resolve | Yes — always `.kill()` the shimmer | Cancel the animation |

**Rules:**
- Never show skeleton for < 300ms
- If load resolves in < 300ms, skip skeleton entirely
- Match the radius of real content bubbles

---

## Error display

| Property | Value |
|----------|-------|
| Surface | `bg-surface` with `1px border border-destructive/30` |
| Background tint | `destructive` at 5% opacity |
| Radius | `radii.md` |
| Padding | 16px |
| Headline | `body-2`, `fontWeight: 600`, `destructive` |
| Body | `body-4`, `destructive` at 70% opacity |

---

## Token summary

Chat-specific tokens must be defined in the project's token files (e.g. `@hominem/ui/tokens/chat.ts`). Key tokens:

| Token | Value | Purpose |
|-------|-------|---------|
| `transcriptMaxWidth` | 768px | Transcript max width |
| `userBubbleMaxWidth` | 544px | User bubble max width |
| `searchMaxWidth` | 640px | Search overlay max width |
| `turnGap` | 20px | Gap between message turns |
| `contentGap` | 8px | Gap between content blocks |
| `metadataGap` | 4px | Gap in metadata row |
| `surfaces.user` | `emphasis-highest` | User bubble background |
| `surfaces.assistant` | `transparent` | Assistant surface |
| `surfaces.composer` | project token | Composer background |
| `borders.user` | `border-subtle` | User bubble border |
| `radii.bubble` | `radii.md` | Message bubble radius |
| `foregrounds.user` | `white` | User bubble text |

---

## Common violations

| Violation | Fix |
|-----------|-----|
| `bg-white` or `bg-bg-surface` in chat | Use `chatTokens.surfaces.*` |
| `border-subtle` Tailwind class | Use `colors['border-subtle']` |
| `rounded-[1.75rem]` | Document exception or use `radii.lg` |
| `rounded-full` on message bubble | Use `radii.md` |
| Hardcoded font size (17, 18, 24) | Use `body-1` class or `fontSizes` token |
| `rgba(0,0,0,0.35)` for muted text | Use `text-tertiary` |
| `space-y-4` between messages | Use `chatTokens.turnGap` |
| `animate-pulse` for streaming cursor | Custom CSS class or GSAP |
| `Animated` from react-native | Use react-native-reanimated worklet |
| Stub component returning `null` | Implement it |
| No message enter animation | `playEnterRow` on mount (web) |
| No shimmer `.kill()` on data resolve | Call `.kill()` in data callback |
| Composer shadow not upgraded on focus | `shadows.low` → `shadows.medium` |
| Actions row touch targets < 44px | Add invisible padding or `hitSlop` |
| aria-label missing on icon-only buttons | Add descriptive `aria-label` |

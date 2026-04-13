# Design System — Foundations

## Typography

### Fonts

| Platform | Primary | Monospace  |
| -------- | ------- | ---------- |
| Web      | Geist   | Geist Mono |
| Mobile   | Inter   | Geist Mono |

Never pass a font name as a raw string — use the fontFamily token.

### Type scale

| Class        | Size                   | Weight | Line height | Letter spacing | Usage                    |
| ------------ | ---------------------- | ------ | ----------- | -------------- | ------------------------ |
| display-1    | clamp(28px, 4vw, 40px) | 700    | 1.1         | -0.025em       | Page hero                |
| display-2    | 24px                   | 600    | 1.15        | -0.02em        | Section hero             |
| heading-1    | 22px                   | 600    | 1.2         | -0.015em       | Panel title              |
| heading-2    | 20px                   | 600    | 1.25        | -0.01em        | Section heading          |
| heading-3    | 18px                   | 600    | 1.3         | 0              | Sub-section              |
| heading-4    | 16px                   | 600    | 1.4         | 0              | Item title               |
| body-1       | 16px                   | 400    | 1.6         | 0              | Primary body             |
| body-2       | 14px                   | 400    | 1.5         | 0              | Secondary body, previews |
| body-3       | 13px                   | 400    | 1.5         | 0              | Tertiary, meta           |
| body-4       | 12px                   | 400    | 1.4         | 0.005em        | Timestamps, labels       |
| subheading-1 | 14px                   | 500    | 1.4         | 0.01em         | Strong label             |
| subheading-2 | 13px                   | 500    | 1.4         | 0.01em         | Pill label               |
| subheading-3 | 12px                   | 500    | 1.3         | 0.02em         | Eyebrow                  |
| subheading-4 | 11px                   | 500    | 1.3         | 0.03em         | Smallest label           |

Rules:

- Never mix raw Tailwind size/weight utilities for product text
- Never font-weight above 700
- Never letter-spacing on body text (body-1 through body-3)
- Maximum line length: 72ch for body copy — enforce with max-w tokens
- Display sizes use tighter line heights (1.1–1.15) for visual density at large scale

---

## Color

The color system uses warm stone neutrals in light mode and near-black in dark mode, unified by a warm amber accent inspired by Claude's personality.

All colors are defined as CSS custom properties that resolve per color mode. Never use raw hex values or Tailwind palette classes in component code.

### Backgrounds

| Token       | Light                | Dark              | Usage                               |
| ----------- | -------------------- | ----------------- | ----------------------------------- |
| bg-base     | `#fafaf9`            | `#0a0a0a`         | Page root, feed background          |
| bg-surface  | `#f5f5f0`            | `#141414`         | Cards, panels, sidebar              |
| bg-elevated | `#ffffff`            | `#1c1c1c`         | Modals, popovers, command palette   |
| bg-inset    | `#eeedea`            | `#0f0f0f`         | Recessed areas, code blocks, inputs |
| bg-overlay  | `rgba(28,25,23,0.6)` | `rgba(0,0,0,0.7)` | Backdrop behind modals and sheets   |

### Text

| Token          | Light     | Dark      | Min contrast vs bg-base        |
| -------------- | --------- | --------- | ------------------------------ |
| text-primary   | `#1c1917` | `#fafaf9` | 15:1                           |
| text-secondary | `#57534e` | `#a8a29e` | 7:1                            |
| text-tertiary  | `#a8a29e` | `#78716c` | 4.5:1                          |
| text-disabled  | `#d6d3d1` | `#44403c` | Not required (not interactive) |

### Borders

| Token          | Light                 | Dark                     | Usage                        |
| -------------- | --------------------- | ------------------------ | ---------------------------- |
| border-subtle  | `rgba(28,25,23,0.06)` | `rgba(250,250,249,0.06)` | Hairlines, section dividers  |
| border-default | `rgba(28,25,23,0.12)` | `rgba(250,250,249,0.12)` | Standard container borders   |
| border-strong  | `rgba(28,25,23,0.20)` | `rgba(250,250,249,0.20)` | Focused input base, emphasis |

### Accent and semantic

| Purpose            | Light                    | Dark                     | Usage                                        |
| ------------------ | ------------------------ | ------------------------ | -------------------------------------------- |
| Accent             | `#D4A574`                | `#D4A574`                | CTAs, active state, links — NOT focus rings  |
| Accent hover       | `#C4956A`                | `#E0B68A`                | Interactive hover on accent elements         |
| Accent subtle      | `rgba(212,165,116,0.12)` | `rgba(212,165,116,0.15)` | Selected backgrounds, accent badges          |
| Ring               | `#78716c`                | `#a8a29e`                | Focus rings only — never use accent for this |
| Destructive        | `#EF4444`                | `#F87171`                | Delete, error, danger                        |
| Destructive subtle | `rgba(239,68,68,0.08)`   | `rgba(248,113,113,0.12)` | Error backgrounds                            |
| Success            | `#22C55E`                | `#4ADE80`                | Confirmed, completed                         |
| Warning            | `#F59E0B`                | `#FBBF24`                | Caution, degraded state                      |

### Emphasis scale

9 opacity levels (emphasis.highest → emphasis.faint):

| Token            | Light                 | Dark                     |
| ---------------- | --------------------- | ------------------------ |
| emphasis.highest | `rgba(28,25,23,0.9)`  | `rgba(250,250,249,0.9)`  |
| emphasis.high    | `rgba(28,25,23,0.7)`  | `rgba(250,250,249,0.7)`  |
| emphasis.medium  | `rgba(28,25,23,0.5)`  | `rgba(250,250,249,0.5)`  |
| emphasis.low     | `rgba(28,25,23,0.3)`  | `rgba(250,250,249,0.3)`  |
| emphasis.subtle  | `rgba(28,25,23,0.15)` | `rgba(250,250,249,0.15)` |
| emphasis.faint   | `rgba(28,25,23,0.07)` | `rgba(250,250,249,0.07)` |

Used for hover overlays, pressed states, and layered surfaces — never for text.

### Accessibility — contrast requirements

- Body text (body-1, body-2): **4.5:1 minimum** against its background (WCAG AA)
- Large text (display, heading-1–2): **3:1 minimum**
- UI components and borders: **3:1 minimum**
- Aim for AAA (7:1) on primary body text wherever possible
- **Test both light and dark mode** — dark mode is not an afterthought

### Rules

- Never use hex literals outside of the token files
- Never use opacity to dim text — use the correct text tier token
- Never use raw Tailwind gray-_/amber-_/red-\* palette classes directly
- Focus rings use `--color-ring` (warm gray), not accent
- border-default at full opacity for interactive surfaces (composer cards, buttons)
- Dark mode colors are specified in the token table — use them, don't invert light mode values with `dark:` utilities

---

## Spacing

8px primary grid. 4px secondary for fine internal spacing only.

| Step | Value | Usage                                            |
| ---- | ----- | ------------------------------------------------ |
| 0    | 2px   | Micro-gaps, icon-to-text fine adjustment         |
| 1    | 4px   | Icon gaps, tight internal spacing                |
| 2    | 8px   | Component internal (small)                       |
| 3    | 12px  | Component padding (compact)                      |
| 4    | 16px  | Component padding (standard), page mobile gutter |
| 5    | 24px  | Section spacing, page desktop gutter             |
| 6    | 32px  | Large section gap                                |
| 7    | 48px  | Page-level breathing room                        |
| 8    | 64px  | Hero sections, max vertical spacing              |

Exception: 1px for hairline borders only. No other values permitted.

---

## Elevation

Elevation = shadow tier + surface token together. Never mismatch.

Shadows in light mode are warm-tinted and extremely subtle. In dark mode, borders carry more structural weight than shadows.

| Level | Shadow token   | Surface token | Use case                        |
| ----- | -------------- | ------------- | ------------------------------- |
| 0     | none           | bg-base       | Page root, feed                 |
| 1     | shadows.low    | bg-surface    | Cards, sidebar, panels          |
| 2     | shadows.medium | bg-elevated   | Dropdowns, tooltips, popovers   |
| 3     | shadows.high   | bg-elevated   | Modals, sheets, command palette |

### Shadow values — Light

| Token          | Value                                                             |
| -------------- | ----------------------------------------------------------------- |
| shadows.low    | `0 1px 3px rgba(28,25,23,0.04), 0 1px 2px rgba(28,25,23,0.02)`    |
| shadows.medium | `0 4px 16px rgba(28,25,23,0.06), 0 2px 4px rgba(28,25,23,0.03)`   |
| shadows.high   | `0 12px 40px rgba(28,25,23,0.08), 0 4px 12px rgba(28,25,23,0.04)` |

### Shadow values — Dark

In dark mode, shadows are deeper but still not heavy. Borders do more of the structural work.

| Token          | Value                                                     |
| -------------- | --------------------------------------------------------- |
| shadows.low    | `0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.1)`    |
| shadows.medium | `0 4px 16px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.15)`  |
| shadows.high   | `0 12px 40px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.2)` |

Rules:

- Never apply shadows.high to inline elements.
- Never change shadow on hover — use background-color shift instead.
- Never animate box-shadow directly — use a pseudo-element opacity trick.
- In dark mode, prefer `border-subtle` for structural separation over shadows when possible.
- Native (React Native) equivalents in shadows.native token — never use CSS box-shadow strings in native code.

---

## Border Radius

| Token      | Value (web) | Value (native) | Usage                          |
| ---------- | ----------- | -------------- | ------------------------------ |
| radii.xs   | 2px         | 2              | Tags, micro-badges             |
| radii.sm   | 4px         | 4              | Badges, pills, small tags      |
| radii.md   | 8px         | 8              | Buttons, inputs, text fields   |
| radii.lg   | 12px        | 12             | Cards, feed rows, panels       |
| radii.xl   | 16px        | 16             | Sheets, modals, large panels   |
| radii.icon | 22%         | 20             | Squircle avatars and app icons |

Rules:

- Never use rounded-full except on circular avatars, toggle indicators, or the composer pill
- Never mix radius tiers on the same component
- Nested surfaces use one tier smaller than their parent
- The tighter radius scale (vs. bubbly 14/20px) creates a more precise, engineered feel

---

## Z-index scale

| Token      | Value | Usage                                                 |
| ---------- | ----- | ----------------------------------------------------- |
| z-base     | 0     | Static page elements                                  |
| z-raised   | 10    | Sticky headers, floating action buttons               |
| z-dropdown | 100   | Dropdowns, popovers, tooltips                         |
| z-overlay  | 200   | Modal/sheet backdrop                                  |
| z-modal    | 300   | Modals and sheets                                     |
| z-toast    | 400   | Toast notifications                                   |
| z-max      | 9999  | Emergency override only — justify with inline comment |

Never hardcode a z-index value. Never use values between defined steps.
Dropdowns triggered from inside a modal must portal to document.body to render above z-modal.

---

## Breakpoints

| Name   | Min width | Grid columns | Gutter |
| ------ | --------- | ------------ | ------ |
| (base) | 0         | 4            | 16px   |
| sm     | 640px     | 4            | 16px   |
| md     | 768px     | 8            | 24px   |
| lg     | 1024px    | 12           | 24px   |
| xl     | 1280px    | 12           | 24px   |

Rules:

- Mobile-first always. Base styles = mobile. Layer up with md:, lg:, xl:.
- Never use max-width media queries. Never style down.
- Sidebar + main layout: sidebar 240px fixed, main takes remaining width, collapses to drawer below md.
- Content max widths: 768px body, 640px search, 480px modal, 416px workspace aside.

---

## Sizing and touch targets

- Touch target minimum: 44px × 44px (Apple HIG + WCAG 2.5.5)
- If visual element is smaller, add invisible padding (web) or hitSlop (native)

### Icon sizing grid

| Context                    | Size |
| -------------------------- | ---- |
| Inline with body text      | 16px |
| Button / toolbar action    | 20px |
| Navigation tab             | 24px |
| Empty state / illustration | 48px |

Icon libraries: named imports only from the project's configured library (lucide-react web, @expo/vector-icons native).
Never import entire icon sets. Never use emoji as icons in UI chrome.

### Avatar sizing grid

| Context                  | Size | Radius     |
| ------------------------ | ---- | ---------- |
| Comment / message inline | 24px | radii.icon |
| List row                 | 32px | radii.icon |
| Profile header           | 48px | radii.icon |
| Hero / settings page     | 80px | radii.icon |

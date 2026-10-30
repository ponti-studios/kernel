---
name: kernel-design
description: "Route UI work to the right design workflow, applying Charles's recorded style rules over generic defaults. Use when changing screens, headers, lists, or layouts, or for accessibility, brand, tokens, Figma, image-to-code, performance, or UX writing; not for motion (kernel-animate)."
license: MIT
metadata:
  author: project
  version: "3.0"
  category: Design
  tags:
    - design
    - ui
    - brand
    - accessibility
    - tokens
    - performance
    - writing
    - style-rules
allowed-tools: Read Write
---

# Kernel Design — consolidated UI, brand, and personal style skill

One skill routing across the consolidated reference workflows plus Charles's
recorded style rules. Invoke with the UI task or screen to work on. Pick the
reference that matches the task and follow it end-to-end.

## When to use

- Auditing a UI or component for WCAG 2.2 / ARIA conformance
- Choosing or reviewing studio brand voice, naming, palette, typography, or theming
- Designing or reviewing product identity within the shared UI system
- Generating a brand/design token foundation or themeable token kit
- Building tokens for multiple platforms or wiring token CI
- Syncing tokens/components between Figma and code
- Turning a screenshot or mockup into token-driven code
- Bridging to or from an external design system (M3, HIG, shadcn/ui, …)
- Improving LCP/INP/CLS or fixing jank and layout shift
- Upgrading or polishing an existing UI without breaking it
- Writing or reviewing interface copy, errors, and empty states
- Picking a battle-tested library for a frontend task
- Designing, changing, or reviewing any screen, header, list, or layout
- Choosing header style, vertical spacing, UI copy, or color treatment
- Updating the design canvas alongside a UI change

## Outputs

- Guidance and artifacts per the loaded reference's workflow and gates
- Brand decisions mapped to this skill or shared tokens and components
- UI change that follows the recorded personal style rules
- New rule entry with rule, why, and how to apply when Charles states one

## Definition of done

- The applicable reference's definition-of-done checks pass for the task
- Brand decisions have a stated scope, applicable rule, and UI export when relevant
- The change follows every applicable personal style rule without re-litigation
- A newly stated preference is recorded with reason for future work

## Studio Brand Governance

This skill is the single source of truth for Ponti Studios brand decisions and
products built by the studio. Products use profiles within this system, not
separate brand systems.

### Scope

| Scope       | Apply                                                       |
| ----------- | ----------------------------------------------------------- |
| `studio`    | Studio name, public positioning, and studio-owned materials |
| `shared-ui` | The project's shared components, tokens, and theme         |
| `product`   | Product copy, naming, and product-specific identity         |

### Procedure

1. Identify the scope: `studio`, `shared-ui`, or `product`.
2. For UI work, inspect the project's shared UI before writing code or
   selecting a visual value. Use its shared component, token, theme, and
   semantic color.
3. Load the applicable reference from the table below when the task needs a
   specialized workflow. Use the embedded governance above for brand rules.
4. Extract the applicable rule for voice, naming, accessibility, theming, or
   product behavior.
5. Make the smallest decision that satisfies the rule.
6. State the selected shared export or applicable rule and flag any unresolved
   requirement.

### Shared Token Source

Each project keeps one canonical token source (3-tier DTCG: primitive →
semantic → component) that every surface renders from. Extend it; do not fork
a parallel local system. Files under this skill's `tokens/` directory are
DTCG-shaped fixtures for workflow validation only, not a design-system source
of truth.

- Use shared components before creating a local component.
- Use shared design tokens for color, typography, spacing, sizing, radius,
  border, shadow, and motion.
- Use shared semantic colors for accent, destructive, success, warning,
  information, focus, disabled, loading, and selected states.
- Use the shared theme provider and theme values. Do not create a page,
  feature, or user palette alongside it.
- Use shared typography styles. Do not set a local font family, font size,
  font weight, line height, or letter spacing when a matching token exists.
- Use shared layout and component primitives. Do not recreate buttons, inputs,
  badges, dialogs, menus, tabs, tooltips, or status indicators locally.
- Use shared motion values and respect reduced-motion behavior. Do not add a
  local animation duration, easing curve, or animation library for a
  supported interaction.
- If the shared source lacks a required value or component, add it there
  following the project's contribution process. Do not approximate it with a
  one-off local value.

### Brand and UI Gates

- Apply rules in this order: accessibility and semantic meaning; shared
  components and tokens; product profile; task requirements.
- Every visual value must resolve to a shared token or component.
- Do not define colors, typefaces, spacing, radii, shadows, motion, themes, or
  signature elements outside the shared source.
- Do not hardcode a visual value when an equivalent shared export exists.
- Do not create a local replacement for a missing shared component or token.
- Verify contrast, focus, keyboard, disabled, loading, and reduced-motion
  behavior for every UI change.
- Do not override semantic color meanings for visual preference.
- Do not use decorative identity elements when they reduce clarity or contrast.

### Copy Rules

- Use short, direct sentences with plain verbs and concrete nouns.
- State the action, result, or error first.
- Present suggestions as options.
- Do not use hype, cheerleading, theatrical reassurance, or vague claims.
- Do not make an instruction sound mandatory unless it is required.

Preferred examples: `This looks overdue.`, `I found three related notes.`,
and `Want to move this to tomorrow?`

### Product Scope

- This skill defines no product identity of its own. Product copy, naming,
  and product-specific behavior defer to the consuming product's own profile
  or brief — do not invent a product palette, voice, or metaphor.
- Do not replace the shared UI identity with a separate product palette.
- Use shared semantic colors for urgent, destructive,
  completion, milestone, suggestion, and active-processing states. Pair color
  with text, iconography, or structure.

### Decision Record

For each brand decision, record the scope, applicable rule, shared exports used,
decision, validation results, and any missing export or required approval.

## Personal Style Rules

Charles's recorded preferences live in `references/personal-style-rules.md`.
Load it before designing, changing, or reviewing any screen, header, list, or
layout. Where a recorded rule speaks to the task, it wins over a generic
default — do not re-litigate it. When Charles states a new preference or
corrects a layout, record it there right away with the rule, the why, and how
to apply, so it governs future work.

## References

| Task                                                    | Reference                                  |
| ------------------------------------------------------- | ------------------------------------------ |
| Charles's recorded style rules, headers, copy, canvas   | `references/personal-style-rules.md`       |
| ------------------------------------------------------- | ------------------------------------------ |
| Apple-style fluid motion, springs, gesture UI           | `references/apple.md`                      |
| Distinctive visual direction, typography, layout        | `references/frontend-design.md`            |
| Component audit against product philosophy + code style | `references/component-philosophy-audit.md` |
| WCAG 2.2 / ARIA audit, contrast, POUR                   | `references/a11y-audit.md`                 |
| From-scratch brand + token foundation                   | `references/brandkit.md`                   |
| Figma ↔ code token/component sync                       | `references/figma-integration.md`          |
| SemVer, contribution, deprecation                       | `references/governance.md`                 |
| Screenshot/mockup → token-driven code                   | `references/image-to-code.md`              |
| Interop with external design systems                    | `references/migrate-design-system.md`      |
| Core Web Vitals, jank, CLS                              | `references/performance.md`                |
| Audit-first redesign, single-theme                      | `references/redesign.md`                   |
| Token build pipeline + CI                               | `references/token-build.md`                |
| UI copy, errors, empty states                           | `references/ux-writing.md`                 |
| Voice principles, tone, pre-ship checklist              | `content/voice-tone.md`                    |
| Design taste, variance mandate, banned defaults         | `taste/design-taste.md`                    |
| Visual direction archetypes                             | `taste/aesthetic-systems.md`               |
| Motion choreography, reduced motion                     | `taste/motion-choreography.md`             |
| Pick the right library for a frontend task              | `references/ui-libraries.md`               |

## Cross-cutting rules

- **Motion boundary with `kernel-animate`.** This skill decides motion values,
  tokens, and reduced-motion behavior; `kernel-animate` implements and audits
  animation code. Neither duplicates the other.

- **Tokens, never hardcoded values.** Every color/size/radius/shadow/motion/font
  traces to a DTCG token; one shared theme, no per-page palettes.
- **Design artifacts are standalone HTML in `design/`.** A design lives as
  `design/design-doc.html`, `design/design-cards.html`, `design/design-tokens.html`
  (and similar), iterated on as the artifact, never edited into `Sources/`,
  until the design is approved. Measure pixels in the rendered artifact; do not
  trust a vision model's reading of a screenshot.
- **Accessibility is never traded for aesthetics.** Contrast is measured, not
  eyeballed; keyboard, focus, and screen-reader behavior are verified.
- **Dark mode + reduced motion are designed, not inverted or dropped.**
- **Single-theme consistency** — every page/screen consumes the one token theme.

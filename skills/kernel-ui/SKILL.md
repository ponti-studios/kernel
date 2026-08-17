---
name: kernel-ui
kind: skill
tags:
  - design
  - ui
  - brand
  - accessibility
  - tokens
  - performance
  - writing
license: MIT
description: >
  A consolidated UI skill covering the full interface lifecycle: accessibility
  audits (WCAG 2.2 + ARIA), studio brand governance, design-token foundations,
  token build and CI,
  Figma integration, image-to-code reconstruction, external design-system
  interop/migration, performance against Core Web Vitals, redesign, UX
  writing, and library selection. Load the relevant reference below rather than
  a standalone skill.
when:
  - auditing a UI or component for WCAG 2.2 / ARIA conformance
  - choosing or reviewing studio brand voice, naming, palette, typography, or theming
  - designing or reviewing product identity within the shared UI system
  - generating a brand/design token foundation or themeable token kit
  - building tokens for multiple platforms or wiring token CI
  - syncing tokens/components between Figma and code
  - turning a screenshot or mockup into token-driven code
  - bridging to or from an external design system (M3, HIG, shadcn/ui, …)
  - improving LCP/INP/CLS or fixing jank and layout shift
  - upgrading or polishing an existing UI without breaking it
  - writing or reviewing interface copy, errors, and empty states
  - picking a battle-tested library for a frontend task
outputs:
  - Guidance and artifacts per the loaded reference's workflow and gates
  - Brand decisions mapped to this skill or exported @ponti-studios/ui tokens and components
termination:
  - The applicable reference's definition-of-done checks pass for the task
  - Brand decisions have a stated scope, applicable rule, and UI export when relevant
allowedTools:
  - Read
  - Write
argumentHint: the UI task or screen to work on
---

# Kernel UI — consolidated UI and brand skill

One skill routing across the consolidated reference workflows. Pick the
reference that matches the task and follow it end-to-end.

## Studio Brand Governance

This skill is the single source of truth for Ponti Studios and products built
by the studio. Products use profiles within this system, not separate brand
systems.

### Scope

| Scope       | Apply                                                        |
| ----------- | ------------------------------------------------------------ |
| `studio`    | Studio name, public positioning, and studio-owned materials  |
| `shared-ui` | Components, tokens, and product UI using `@ponti-studios/ui` |
| `product`   | Product copy, naming, and product-specific identity          |

### Procedure

1. Identify the scope: `studio`, `shared-ui`, or `product`.
2. For UI work, inspect `@ponti-studios/ui` before writing code or selecting a
   visual value. Use its exported component, token, theme, and semantic color.
3. Load the applicable reference from the table below when the task needs a
   specialized workflow. Use the embedded governance above for brand rules.
4. Extract the applicable rule for voice, naming, accessibility, theming, or
   product behavior.
5. Make the smallest decision that satisfies the rule.
6. State the selected UI export or applicable rule and flag any unresolved
   requirement.

### Shared UI Source Of Truth

All UI styles and primitives come from [`@ponti-studios/ui`](https://github.com/ponti-studios/ui).
The canonical DTCG token source is
[`src/styles/tokens/source/`](https://github.com/ponti-studios/ui/tree/main/src/styles/tokens/source).
Local files under this skill's `tokens/` directory are examples for workflow
validation only; they are not the design-system source of truth. Fetch and
validate the canonical source with `python3 scripts/fetch_ui_tokens.py --ref
<branch-or-commit>`.

- Import components from `@ponti-studios/ui` before creating a local component.
- Use exported design tokens for color, typography, spacing, sizing, radius,
  border, shadow, and motion.
- Use exported semantic colors for accent, destructive, success, warning,
  information, focus, disabled, loading, and selected states.
- Use the exported theme provider and theme values. Do not create a page,
  feature, product, or user palette.
- Use exported typography styles. Do not set a local font family, font size,
  font weight, line height, or letter spacing when a matching token exists.
- Use exported layout and component primitives. Do not recreate buttons, inputs,
  badges, dialogs, menus, tabs, tooltips, or status indicators locally.
- Use exported motion primitives and respect reduced-motion behavior. Do not
  add a local animation duration, easing curve, or animation library for a
  supported interaction.
- If `@ponti-studios/ui` does not export a required value or component, stop
  the UI implementation, report the missing export, and request a shared UI
  change. Do not approximate it locally.

### Brand and UI Gates

- Apply rules in this order: accessibility and semantic meaning; exported
  `@ponti-studios/ui` components and tokens; product profile; task requirements.
- Every visual value must resolve to an `@ponti-studios/ui` token or component.
- Do not define colors, typefaces, spacing, radii, shadows, motion, themes, or
  signature elements in the consuming product.
- Do not hardcode a visual value when an equivalent shared UI export exists.
- Do not create a local replacement for a missing UI component or token.
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

### Product Profile

- Product model: notes, calendars, AI conversations, and goals in one system.
- Product voice: calm, minimal, and efficient.
- Product priorities: low-friction capture, reliable retrieval, low-noise
  calendar awareness, calm goal progress, and AI that preserves user agency.
- Do not use product-specific metaphorical language as visible copy unless the
  task explicitly requests product narrative.
- Do not replace the shared UI identity with a separate product palette.
- Use semantic colors exported by `@ponti-studios/ui` for urgent, destructive,
  completion, milestone, suggestion, and active-processing states. Pair color
  with text, iconography, or structure.

### Decision Record

For each brand decision, record the scope, applicable rule, UI exports used,
decision, validation results, and any missing export or required approval.

## References

| Task                                                    | Reference                                  |
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
| Pick the right library for a frontend task              | `references/ui-libraries.md`               |

## Cross-cutting rules

- **Tokens, never hardcoded values.** Every color/size/radius/shadow/motion/font
  traces to a DTCG token; one shared theme, no per-page palettes.
- **Accessibility is never traded for aesthetics.** Contrast is measured, not
  eyeballed; keyboard, focus, and screen-reader behavior are verified.
- **Dark mode + reduced motion are designed, not inverted or dropped.**
- **Single-theme consistency** — every page/screen consumes the one token theme.

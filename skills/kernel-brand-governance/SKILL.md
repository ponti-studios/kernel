---
name: kernel-brand-governance
description: >
  Applies the Ponti Studios brand system to naming, copy, UI identity, visual
  direction, and product-brand decisions. Use when a decision must follow the
  studio-wide identity or a product profile.
license: MIT
compatibility: Brand, copy, product identity, and visual direction work.
metadata:
  author: ponti-studios
  version: "3.0"
  category: Design
  tags:
    - brand
    - identity
    - governance
    - ui
when:
  - choosing or reviewing brand voice, naming, palette, typography, or theming
  - designing or reviewing Ponti Studios UI identity
  - designing or reviewing product identity
  - checking copy or visuals against the studio brand system
outputs:
  - A brand decision mapped to a rule in this skill or an exported
    token/component from @ponti-studios/ui
  - Copy, naming, palette, typography, or UI guidance
termination:
  - Every decision has a stated scope and applicable rule
  - No decision introduces an unapproved brand rule, local visual value, or
    conflicting semantic meaning
---

# Studio Brand Governance

This skill is the single source of truth for Ponti Studios and products built
by the studio. Products use profiles within this system, not separate brand
systems.

## Procedure

1. Identify the scope: `studio`, `shared-ui`, or `product`.
2. For UI work, inspect `@ponti-studios/ui` before writing code or selecting a
   visual value. Use its exported component, token, theme, and semantic color.
3. Extract the applicable rule for voice, naming, accessibility, theming, or
   product behavior.
4. Make the smallest decision that satisfies the rule.
5. State the selected UI export or applicable rule and flag any unresolved
   requirement.

## Scope

| Scope | Apply |
| --- | --- |
| `studio` | Studio name, public positioning, and studio-owned materials |
| `shared-ui` | Components, tokens, and product UI using `@ponti-studios/ui` |
| `product` | Product copy, naming, and product-specific identity |

## Shared UI Source Of Truth

All UI styles and primitives come from `@ponti-studios/ui`.

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
- Use an exported reference-tag component only when content has a real
  reference ID. Never add a decorative identifier.
- Use exported motion primitives and respect reduced-motion behavior. Do not
  add a local animation duration, easing curve, or animation library for a
  supported interaction.
- If `@ponti-studios/ui` does not export a required value or component, stop
  the UI implementation, report the missing export, and request a shared UI
  change. Do not approximate it locally.

## UI Validation

For every UI change, verify:

1. Every visual value resolves to an `@ponti-studios/ui` token or component.
2. Every state uses the correct exported semantic role.
3. No local theme or style override changes the shared identity.
4. Focus, keyboard, disabled, loading, and reduced-motion behavior remains
   provided by the shared component or token system.
5. Text and interactive states meet WCAG AA contrast requirements.

## Copy Rules

- Use short, direct sentences.
- Use plain verbs and concrete nouns.
- State the action, result, or error first.
- Present suggestions as options.
- Do not use hype, cheerleading, theatrical reassurance, or vague claims.
- Do not make an instruction sound mandatory unless it is required.

Preferred examples:

- `This looks overdue.`
- `I found three related notes.`
- `Want to move this to tomorrow?`

## Product Profile

- Product model: notes, calendars, AI conversations, and goals in one system.
- Product voice: calm, minimal, and efficient.
- Product priorities: low-friction capture, reliable retrieval, low-noise
  calendar awareness, calm goal progress, and AI that preserves user agency.
- Do not use product-specific metaphorical language as visible copy unless the
  task explicitly requests product narrative. Internal concepts are not
  default UI copy.
- Do not replace the shared UI identity with a separate product palette.
- Use the semantic colors exported by `@ponti-studios/ui` for urgent,
  destructive, completion, milestone, suggestion, and active-processing
  states. Always pair color with text, iconography, or structure.

## Accessibility and Continuity Gates

- Verify text and interactive-state contrast against WCAG AA requirements.
- Keep focus states visible.
- Distinguish disabled, loading, warning, success, and destructive states with
  more than color alone.
- Preserve control locations and standard affordances across repeated flows.
- Adapt layout across breakpoints without changing task meaning.
- Keep user content more prominent than decorative chrome.
- Use spacing to separate decisions. Do not stack cards inside cards unless a
  nested frame is required by the content model.

## Decision Record

For each brand decision, record:

1. Scope: `studio`, `shared-ui`, or `product`.
2. Rule applied: name the applicable section in this skill.
3. UI exports used: list each `@ponti-studios/ui` component and token.
4. Decision: the selected copy, component, token, or behavior.
5. Validation: token resolution, semantic role, contrast, responsive
   continuity, keyboard behavior, and reduced-motion checks where applicable.
6. Open issue: any missing export, unresolved naming, or required approval.

## Precedence

Apply rules in this order:

1. Accessibility and semantic meaning.
2. Exported components and tokens from `@ponti-studios/ui`.
3. Product profile, when scope is `product`.
4. Task-specific content and layout requirements.

## Prohibited

- Do not create separate product brands without an approved profile.
- Do not define colors, typefaces, spacing, radii, shadows, motion, themes, or
  signature elements in the consuming product.
- Do not hardcode a visual value when an equivalent `@ponti-studios/ui` export
  exists.
- Do not create a local replacement for a missing UI component or token. Stop,
  report the missing export, and request a shared UI change.
- Do not override semantic color meanings for visual preference.
- Do not use decorative identity elements when they reduce clarity or contrast.
- Do not present a product-specific rule as a studio-wide rule.

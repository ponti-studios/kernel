# Kernel Design — consolidated UI, brand, and personal style skill

One skill routing across the consolidated reference workflows plus Charles's
recorded style rules. Invoke with the UI task or screen to work on. Pick the
reference that matches the task and follow it end-to-end.

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

- Apply the current task and repository contract, preserving accessibility and
  semantic meaning. Reuse shared components/tokens and the applicable product profile.
- When the project has a shared system, resolve supported visual values through it.
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

Charles's recorded preferences live in [personal-style-rules.md](references/personal-style-rules.md).
Load it before designing, changing, or reviewing any screen, header, list, or
layout. Where a recorded rule speaks to the task, it wins over a generic
default — do not re-litigate it. When Charles states a new preference or
corrects a layout, record it there right away with the rule, the why, and how
to apply, so it governs future work.

## References

| Task                                                    | Reference                                  |
| ------------------------------------------------------- | ------------------------------------------ |
| Charles's recorded style rules, headers, copy, canvas   | [personal-style-rules.md](references/personal-style-rules.md)       |
| ------------------------------------------------------- | ------------------------------------------ |
| Apple-style fluid motion, springs, gesture UI           | [apple.md](references/apple.md)                      |
| Distinctive visual direction, typography, layout        | [frontend-design.md](references/frontend-design.md)            |
| Component audit against product philosophy + code style | [component-philosophy-audit.md](references/component-philosophy-audit.md) |
| WCAG 2.2 / ARIA audit, contrast, POUR                   | [a11y-audit.md](references/a11y-audit.md)                 |
| From-scratch brand + token foundation                   | [brandkit.md](references/brandkit.md)                   |
| Figma ↔ code token/component sync                       | [figma-integration.md](references/figma-integration.md)          |
| SemVer, contribution, deprecation                       | [governance.md](references/governance.md)                 |
| Screenshot/mockup → token-driven code                   | [image-to-code.md](references/image-to-code.md)              |
| Interop with external design systems                    | [migrate-design-system.md](references/migrate-design-system.md)      |
| Core Web Vitals, jank, CLS                              | [performance.md](references/performance.md)                |
| Audit-first redesign, single-theme                      | [redesign.md](references/redesign.md)                   |
| Token build pipeline + CI                               | [token-build.md](references/token-build.md)                |
| UI copy, errors, empty states                           | [ux-writing.md](references/ux-writing.md)                 |
| Voice principles, tone, pre-ship checklist              | `content/voice-tone.md`                    |
| Design taste, variance mandate, banned defaults         | `taste/design-taste.md`                    |
| Visual direction archetypes                             | `taste/aesthetic-systems.md`               |
| Motion choreography, reduced motion                     | `taste/motion-choreography.md`             |
| Pick the right library for a frontend task              | [ui-libraries.md](references/ui-libraries.md)               |

## Cross-cutting rules

- **Motion boundary with [kernel-animate](../kernel-animate/WORKFLOW.md).** This skill decides motion values,
  tokens, and reduced-motion behavior; [kernel-animate](../kernel-animate/WORKFLOW.md) implements and audits
  animation code. Neither duplicates the other.

- **Reuse the project’s token system.** Prefer existing shared values and avoid
  per-page palettes. Introduce a new token system only when the task calls for it.
- **Choose a useful design artifact.** Use the requested format and existing project
  workflow. A standalone HTML prototype can resolve uncertain web design, but a
  small native edit may be better reviewed in a platform preview. Do not force an
  extra approval phase or prototype for an already specified implementation.
- **Accessibility is never traded for aesthetics.** Contrast is measured, not
  eyeballed; keyboard, focus, and screen-reader behavior are verified.
- **Dark mode + reduced motion are designed, not inverted or dropped.**
- **Single-theme consistency** — every page/screen consumes the one token theme.

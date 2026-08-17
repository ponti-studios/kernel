---
name: kernel-ui
kind: skill
tags:
  - design
  - ui
  - accessibility
  - tokens
  - performance
  - writing
license: MIT
description: >
  A consolidated UI skill covering the full interface lifecycle: accessibility
  audits (WCAG 2.2 + ARIA), brand/design-token foundations, token build and CI,
  Figma integration, image-to-code reconstruction, external design-system
  interop/migration, performance against Core Web Vitals, redesign, UX
  writing, and library selection. Load the relevant reference below rather than
  a standalone skill.
when:
  - auditing a UI or component for WCAG 2.2 / ARIA conformance
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
termination:
  - The applicable reference's definition-of-done checks pass for the task
allowedTools:
  - Read
  - Write
argumentHint: the UI task or screen to work on
---

# Kernel UI — consolidated UI/design skill

One skill routing across the consolidated reference workflows. Pick the
reference that matches the task and follow it end-to-end.

## References

| Task | Reference |
| --- | --- |
| Apple-style fluid motion, springs, gesture UI | `references/apple.md` |
| Distinctive visual direction, typography, layout | `references/frontend-design.md` |
| Component audit against product philosophy + code style | `references/component-philosophy-audit.md` |
| WCAG 2.2 / ARIA audit, contrast, POUR | `references/a11y-audit.md` |
| From-scratch brand + token foundation | `references/brandkit.md` |
| Figma ↔ code token/component sync | `references/figma-integration.md` |
| SemVer, contribution, deprecation | `references/governance.md` |
| Screenshot/mockup → token-driven code | `references/image-to-code.md` |
| Interop with external design systems | `references/migrate-design-system.md` |
| Core Web Vitals, jank, CLS | `references/performance.md` |
| Audit-first redesign, single-theme | `references/redesign.md` |
| Token build pipeline + CI | `references/token-build.md` |
| UI copy, errors, empty states | `references/ux-writing.md` |
| Pick the right library for a frontend task | `references/pick-ui-library.md` |

## Cross-cutting rules

- **Tokens, never hardcoded values.** Every color/size/radius/shadow/motion/font
  traces to a DTCG token; one shared theme, no per-page palettes.
- **Accessibility is never traded for aesthetics.** Contrast is measured, not
  eyeballed; keyboard, focus, and screen-reader behavior are verified.
- **Dark mode + reduced motion are designed, not inverted or dropped.**
- **Single-theme consistency** — every page/screen consumes the one token theme.
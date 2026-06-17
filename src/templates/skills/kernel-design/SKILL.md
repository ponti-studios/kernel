---
name: kernel-design
kind: skill
tags:
  - design
  - frontend
  - mobile
description: >
  The Ponti Studios design authority. Covers UI implementation, brand doctrine,
  design system enforcement, and physical production standards. Use for any
  design decision — from React component code to Hakumi brand voice to archival
  print specs.
license: MIT
compatibility: React web and React Native. Next.js is not supported.
metadata:
  author: project
  version: "3.0"
  category: Design
when:
  - building or reviewing UI components, pages, or screens
  - implementing or auditing design system tokens, animation, or accessibility
  - making brand, copy, or identity decisions for Ponti Studios or Hakumi
  - writing or reviewing physical production and print specs
  - documenting an archival print edition, generating a technical dossier, or writing certification language for a physical artwork
  - any color, spacing, radius, shadow, duration, or font value is referenced
  - implementing chat UI, overlays, forms, or interaction patterns
termination:
  - Component implements all required states with correct tokens
  - Animation uses canonical GSAP sequences with reducedMotion guard
  - WCAG AA contrast verified and touch targets ≥ 44px
  - Review checklist in references/standards.md passed
  - Brand or production output matches the relevant reference
outputs:
  - React component code aligned to the design system
  - GSAP animation using canonical sequences
  - Token additions when a value was missing
  - Review checklist result with pass/fail per rule
  - Brand copy or identity guidance aligned to references/brand/
  - Physical production language aligned to references/production.md
---

# Kernel Design

The Ponti Studios design authority. All design decisions — digital UI, brand identity, and physical production — flow through this skill. This is not a style guide. It is law.

## Core Non-Negotiables

These apply to every task without loading any reference:

1. **Tokens only.** All values (colors, spacing, radii, shadows, durations, font sizes, z-indices) come from tokens. Never hardcode. If a token is missing, add it to the project token files first.
2. **Dark mode only.** Use CSS custom properties that resolve to dark-mode values. Never branch with `dark:` utility classes.
3. **GSAP on web. Reanimated on mobile.** All interactive animations on web use GSAP canonical sequences. On mobile, `react-native-reanimated` worklets only — never `Animated` from React Native core. Always guard with `reducedMotion()`.
4. **WCAG AA, always.** 4.5:1 for body text, 3:1 for UI components. Touch targets 44×44px minimum. Focus rings never suppressed.
5. **Read before you write.** Load the relevant reference before writing code, copy, or specs. Never assume — look it up.

## Routing

Load only the references needed for the current task.

**Digital UI implementation**
- Tokens, color, typography, spacing, grid → `references/foundations.md`
- Animation, GSAP sequences, timing, easing → `references/motion.md`
- Component specs and state matrices → `references/components.md`
- Responsive layout, interaction patterns, copy rules → `references/patterns.md`
- Chat UI (bubbles, composer, transcript, shimmer) → `references/chat.md`
- Governance, review checklist → `references/standards.md`

**Brand and product identity**
- Hakumi product identity, voice, palette, and accent colors → `references/brand/hakumi.md`
- Studio doctrine, theming philosophy, UI heuristics → `references/brand/studio.md`

**Physical production**
- Archival print, substrate, conservation, and framing specs → `references/production.md`
- Archival print dossier, edition data, authentication, conservation mandate → `references/technical-dossier.md`

## Decision Hierarchy

When standards conflict, resolve in this order:

1. Accessibility and user safety
2. Platform correctness
3. Product consistency
4. Performance
5. Visual preference

Deviation requires explicit justification and a documented tradeoff. If a rule is wrong, update the standard — do not bypass it ad hoc.

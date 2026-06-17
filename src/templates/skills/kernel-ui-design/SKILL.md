---
name: kernel-ui-design
kind: skill
tags:
  - design
  - frontend
  - mobile
description: >
  Enforces digital UI design rules for tokens, components, motion,
  accessibility, and interaction patterns. Use when applying design-system
  rules, making visual or interaction design decisions, or reviewing whether UI
  code matches the approved tokens, states, motion, and accessibility standards.
license: MIT
compatibility: React web and React Native UI implementation.
metadata:
  author: project
  version: "1.0"
  category: Design
when:
  - reviewing whether UI components, pages, or screens match the design system
  - implementing or auditing design system tokens, animation, or accessibility
  - implementing chat UI, overlays, forms, or interaction patterns
  - any color, spacing, radius, shadow, duration, or font value is referenced
termination:
  - Component implements all required states with correct tokens
  - Motion follows the canonical platform pattern with reduced-motion handling
  - WCAG AA contrast and touch target requirements are satisfied
  - Review checklist in references/standards.md passed
outputs:
  - UI code aligned to the design system
  - Motion implementation aligned to canonical patterns
  - Token additions when a value was missing
  - Review checklist result with pass/fail per rule
---

Enforce the digital UI design system. This skill exists to stop the LLM from hardcoding values, bypassing tokens, inventing motion, or violating accessibility and interaction standards.

## Non-Negotiables

1. Tokens only. Colors, spacing, radii, shadows, durations, font sizes, and z-indices come from tokens.
2. Accessibility is mandatory. WCAG AA contrast, visible focus, and minimum touch target size are required.
3. Motion follows the platform rule: approved web motion patterns on web, approved mobile motion patterns on mobile, always with reduced-motion handling.
4. Read the relevant reference before writing UI code or reviewing UI output.

## Routing

Load only the references needed for the task:

- Tokens, color, typography, spacing, grid → `references/foundations.md`
- Motion, timing, easing, sequences → `references/motion.md`
- Component specs and state matrices → `references/components.md`
- Responsive layout, interaction patterns, copy rules → `references/patterns.md`
- Chat UI patterns → `references/chat.md`
- Governance and review checklist → `references/standards.md`

## Guardrails

- Never hardcode a design value when a token should exist.
- Never suppress focus treatment.
- Never invent a one-off component state model that conflicts with canonical patterns.
- Never implement motion without checking the reference and reduced-motion behavior.

---
name: kernel-brand-governance
kind: skill
tags:
  - design
  - content
  - style
description: >
  Enforces brand identity, voice, palette, and product doctrine for Ponti
  Studios and Hakumi. Use when making brand, copy, naming, theming, or visual
  identity decisions that must align with the studio or Hakumi references.
license: MIT
compatibility: Brand, copy, product identity, and visual direction work.
metadata:
  author: project
  version: "1.0"
  category: Design
when:
  - making brand, copy, or identity decisions for Ponti Studios or Hakumi
  - choosing voice, palette, accent color, or theming direction
  - reviewing product identity language or visual consistency
termination:
  - Output matches the relevant brand reference
  - Voice and visual direction align with the correct brand lane
outputs:
  - Brand copy or identity guidance aligned to references
  - Palette, voice, or theming decision with rationale
---

Enforce brand doctrine for Ponti Studios and Hakumi. This skill exists to stop the LLM from improvising brand voice or visual identity outside the approved references.

## Non-Negotiables

1. Brand decisions must follow the correct lane: Ponti Studios or Hakumi.
2. Voice, palette, and identity decisions come from the brand references, not ad hoc taste.
3. If the lane is unclear, determine it before writing copy or making identity decisions.

## Routing

Load only the references needed for the task:

- Hakumi product identity, voice, palette, accent colors → `references/hakumi.md`
- Studio doctrine, theming philosophy, UI heuristics → `references/studio.md`

## Guardrails

- Never blend studio and Hakumi identity rules casually.
- Never invent new palette or voice rules without anchoring them in the reference.
- Never treat brand copy as generic product copy when a brand lane is active.

---
name: art-3d
license: MIT
kind: skill
tags:
  - creative
  - art
  - 3d
description: >
  Generates toy-like premium 3D character render prompts — clean geometry, soft
  matte materials, studio lighting, Pixar-meets-Apple polish. Use when the user
  wants a 3D render, "toy-like" character, premium CGI aesthetic, or stylized
  product render.
when:
  - user wants a toy-like 3D character render
  - user says "premium character render," "Pixar-style," or "CGI"
  - user wants a stylized 3D product or object render
  - user invokes /art-3d
outputs:
  - AI image prompt for a toy-like 3D render
  - Style notes specifying materials, lighting, and compositional approach
termination:
  - Prompt specifies character/subject, materials, lighting, and composition
  - Prompt avoids realism, grain, and sharp edges
allowedTools:
  - Read
argumentHint: character or subject to render in toy-like 3D
---

# Art 3D — Toy-Like Premium Render

Generates AI image prompts for stylized, premium 3D character and object renders.

**Lucy from Kadosabi is not a 3D character.** She is a rubber-hose ink character. For Lucy, use `art-kadosabi` instead.

---

## Style Summary

Pixar-level polish blended with Apple product rendering. Simple, friendly, and controlled. Characters have slightly exaggerated proportions (larger head, smaller body), rounded simplified geometry with smooth bevels, and soft matte-to-satin material finishes. Lighting is large and soft — no harsh contrast. The background is pure or light neutral unless the scene requires otherwise.

Load `references/style-guide.md` for the full spec (materials, lighting, clothing, rendering, composition, Do-Not list).

---

## Do Not

- Add unnecessary detail
- Introduce realism in textures or anatomy
- Use sharp edges — always smooth bevels
- Add grain or noise to the render
- Apply glossy or reflective surfaces
- Use dramatic contrast or harsh lighting
- Break visual cohesion across elements in the same scene

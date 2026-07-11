---
name: art-kadosabi
license: MIT
kind: skill
tags:
  - creative
  - art
  - character
description: >
  Generates Kadosabi universe image prompts, character art direction, and brand
  canon in the rubber-hose future-world aesthetic — 1930s ink characters inside
  Art Deco 2125. Use when the user wants a Kadosabi character prompt, asks about
  Lucy, Wyatt, Lola, Benny, or Void, needs rubber-hose animation guidance, or
  says "Kadosabi."
when:
  - user asks for a Kadosabi character prompt or scene
  - user mentions Lucy, Wyatt, Lola, Benny, or Void
  - user wants rubber-hose animation style or Kadosabi brand canon
  - user invokes /art-kadosabi
outputs:
  - AI image prompt for a Kadosabi character or scene
  - Style notes and animation physics for the character
  - Brand or universe direction
termination:
  - Prompt specifies character, scene, output format, and all applicable rubber-hose rules
  - Style notes confirm rubber-hose future-world mode (not 3D)
allowedTools:
  - Read
argumentHint: character name, scene description, or prompt request
---

# Kadosabi — Character Universe

Rubber-hose future-world only. 1930s hand-drawn ink characters living inside a sleek Art Deco 2125 CGI world.

**Non-negotiable:** This skill generates rubber-hose future-world content exclusively. If the user asks for a 3D render or toy-like character model, redirect to `art-3d`. Lucy is an ink character — do not render her in 3D.

---

## Core Visual Rules

These apply to every character and every prompt without loading any reference:

1. **Characters are ink.** 4px variable outlines, 2px internal details. Line boil between frames. Film grain overlay on characters only — the world is clean.
2. **Halftone shading.** 45-degree dot patterns for depth. No gradients.
3. **Elasticity.** 50/150 rule — compress 50% on landing, stretch 150% on reach. Volume conserved.
4. **The contrast.** Characters = organic, analog, old cartoon rules. World = glass, steel, crisp, jewel-toned. Never blur this boundary.

---

## Routing

Load only what the task requires:

| Task | Reference |
|---|---|
| Brand, naming, product universe, high-level visual identity | `references/brand-identity.md` |
| Full cast specs, world, animation physics, story canon, quality checklist | `references/character-bible.md` |
| Lucy-specific prompts or direction | `references/lucy.md` |

For a simple character prompt where you already know the character from `character-bible.md`, you may generate without loading a reference — use the inline spec.

---

## Output Format

Return:
1. **Prompt** — paste-ready image generation prompt
2. **Style note** — one sentence confirming rubber-hose future-world mode and any character-specific physics to watch

---
name: kernel-image
license: MIT
kind: skill
tags:
  - creative
  - art
  - image-generation
description: >
  Generates AI image prompts across four image types: toy-like 3D character
  renders, large-scale fine art (pop-symbolist / baroque), Kadosabi
  rubber-hose future-world characters, and product photography. Use when the
  user wants a 3D render, says "make art," wants a Kadosabi character prompt,
  wants product photography for a physical object, or asks for any AI image
  prompt.
when:
  - user wants a toy-like 3D character or object render
  - user says "premium character render," "Pixar-style," or "CGI"
  - user wants a large-scale fine-art prompt or says "make art" in a non-character context
  - user wants Caravaggio-style or pop-symbolist visual output
  - user asks for a Kadosabi character prompt or mentions Lucy, Wyatt, Lola, Benny, or Void
  - user wants rubber-hose animation style or Kadosabi brand canon
  - user wants product photography for a physical product
  - user asks for MØNØTØNÉ Districts book photography
  - user invokes /kernel-image
outputs:
  - Paste-ready AI image prompt for an image generator
  - Style notes confirming the image type and its guardrails
termination:
  - Prompt specifies subject, image type, and all applicable type-specific rules
  - Style note confirms the image type and any character or brand constraints
allowedTools:
  - Read
argumentHint: subject, character, product, or image-type request
---

# Kernel Image — Prompt Generation

Routes image-generation requests into one of four image types, loads the type's
reference, and produces paste-ready prompts. Do not generate images unless the
user explicitly asks — return the prompt and brief notes.

## Image Types

| Type | Use when | Reference |
|---|---|---|
| **3D render** | Toy-like 3D characters or objects; "Pixar-style," "premium CGI" | `references/3d/style-guide.md` |
| **Fine art** | Large-scale, emotionally charged art; "make art" in a non-character context | `references/abstract/pop-symbolist.md` or `references/abstract/baroque-mode.md` |
| **Kadosabi** | Lucy, Wyatt, Lola, Benny, or Void; rubber-hose style; Kadosabi brand canon | `references/kadosabi/kadosabi.md` |
| **Product** | Product photography for any physical object; MØNØTØNÉ Districts | `references/product/product-photography.md` |

## Fine-Art Mode Selection

When the type is fine art, pick the mode. Explicit instruction overrides all
inference.

| Signal | Mode |
|---|---|
| "Caravaggio," "Baroque," "dark oil painting," "tenebrism" | Baroque |
| People in physical scenes, portraits with psychological weight, figurative drama | Baroque (default) |
| Objects, symbols, surreal compositions, conceptual ideas | Pop-Symbolist (default) |
| "Abstract," "large-scale," no style specified with a non-figurative subject | Pop-Symbolist |
| "Pop-symbolist," "lacquered," "graphic," "high-gloss" | Pop-Symbolist |

## Workflow

1. Classify the request into one image type (and mode, for fine art).
2. Load the matching reference and follow its style contract.
3. Produce the prompt(s) per the type's reference and the output contract below.
4. Confirm the image type in the style note.

## Output Contract

- **Prompt:** one paste-ready prompt — three for product photography (hero, detail, lifestyle).
- **Style note:** one sentence confirming the image type and any critical guardrail.

## Cross-Type Guardrails

- **Kadosabi is ink, not 3D.** Lucy and the whole cast are rubber-hose characters — route to Kadosabi, never 3D. Likewise, a 3D request is never rendered as Kadosabi.
- **Product intake.** For product photography, establish product, surface, lighting mood, and brand reference before generating — ask only for what the user hasn't provided.

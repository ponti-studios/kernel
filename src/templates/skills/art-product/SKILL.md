---
name: art-product
kind: skill
tags:
  - creative
  - art
  - product-photography
description: >
  Generates 3 product photography AI image prompts for any physical product.
  Works collaboratively — asks the user about the product, surface, lighting
  mood, and key features before generating. Use when the user wants product
  photography for any physical object: books, apparel, homeware, prints, etc.
when:
  - user wants product photography for a physical product
  - user mentions a physical object they want photographed or rendered
  - user asks for MØNØTØNÉ Districts book photography
  - user invokes /art-product
outputs:
  - 3 distinct product photography prompts (hero, detail, lifestyle)
  - Each prompt paste-ready for an AI image generator
termination:
  - All three prompts generated
  - Each prompt specifies subject, surface, lighting, and mood
  - MØNØTØNÉ brand reference loaded if applicable
allowedTools:
  - Read
argumentHint: product name or brief description
---

# Art Product — Product Photography Generator

Generates three product photography AI image prompts for any physical product.

---

## Intake

Before generating, establish these four points. Infer from context when the user has already provided them — only ask for what's missing:

1. **Product** — what is it? (object type, material, color, size)
2. **Surface** — what does it sit on or against? (concrete, marble, linen, raw oak, brushed steel, etc.)
3. **Lighting mood** — clean studio / editorial / environmental / atmospheric / dramatic
4. **Brand reference** — any specific color palette, visual language, or existing brand to honor?

If the user hasn't specified a brand, generate in a clean editorial studio aesthetic by default.

---

## Output: Always 3 Prompts

Return three prompts per product, in this order:

**1. Hero Shot**
Single product at its ideal angle. Primary use case. Conveys the full object with maximum clarity and presence.

**2. Detail Shot**
Close-up of one key feature — texture, material quality, binding, edge, label, or surface treatment. The prompt should name exactly which detail.

**3. Lifestyle / Environmental Shot**
Product in a styled context that reflects the brand world or intended buyer's environment. Specific props, surfaces, and lighting that suggest a point of view.

---

## MØNØTØNÉ Districts

If the user specifies MØNØTØNÉ or the Districts book series:

1. Load `references/monotone.md` for the master prompt and visual language.
2. The three prompts should follow the book-on-plinth aesthetic and minimalist studio direction from that reference.
3. Apply the variation patterns table from the reference to differentiate the three shots.

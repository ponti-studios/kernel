# Product Photography — Prompt Generator

Generates three product photography AI image prompts for any physical product.

## Intake

Before generating, establish these four points. Infer from context when the user has already provided them — only ask for what's missing:

1. **Product** — what is it? (object type, material, color, size)
2. **Surface** — what does it sit on or against? (concrete, marble, linen, raw oak, brushed steel, etc.)
3. **Lighting mood** — clean studio / editorial / environmental / atmospheric / dramatic.
   "Clean studio" maps to `references/environment/soft-studio.md`; "dramatic"
   maps to `references/environment/tenebrism.md`. Editorial/environmental/
   atmospheric don't need an environment file — describe them directly in
   the prompt.
4. **Brand reference** — any specific color palette, visual language, or existing brand to honor?

If the user hasn't specified a brand, generate in a clean editorial studio aesthetic by default (`references/environment/soft-studio.md`).

**Human models:** if any shot includes a human model (e.g. a lifestyle shot), the model renders per the skill's Universal Human Rendering Rule (`references/anime/style-guide.md`) — the product itself stays photographic/realistic. This is the one deliberate departure from "clean editorial studio" photography.

## Output: Always 3 Prompts

Return three prompts per product, in this order:

**1. Hero Shot**
Single product at its ideal angle. Primary use case. Conveys the full object with maximum clarity and presence.

**2. Detail Shot**
Close-up of one key feature — texture, material quality, binding, edge, label, or surface treatment. The prompt should name exactly which detail.

**3. Lifestyle / Environmental Shot**
Product in a styled context that reflects the brand world or intended buyer's environment. Specific props, surfaces, and lighting that suggest a point of view.

## MØNØTØNÉ Districts

If the user specifies MØNØTØNÉ or the Districts book series:

1. Load `monotone.md` for the master prompt and visual language.
2. The three prompts should follow the book-on-plinth aesthetic and minimalist studio direction from that reference.
3. Apply the variation patterns table from the reference to differentiate the three shots.

# Product Photography — Prompt Generator

Generates three product photography AI image prompts for any physical product.

## Intake

Before generating, establish these four points. Infer from context when the user has already provided them — only ask for what's missing:

1. **Product** — what is it? (object type, material, color, size)
2. **Surface** — what does it sit on or against? (concrete, marble, linen, raw oak, brushed steel, etc.)
3. **Lighting mood** — clean studio / editorial / environmental / atmospheric / dramatic.
   "Clean studio" maps to `references/environment/lighting.md`'s Soft
   Diffused Studio section; "dramatic" maps to `references/environment/dramatic-spotlight.md`.
   Editorial/environmental/atmospheric don't need an environment file —
   describe them directly in the prompt.
4. **Brand reference** — any specific color palette, visual language, or existing brand to honor?

If the user hasn't specified a brand, generate in a clean editorial studio aesthetic by default (`references/environment/lighting.md`'s Soft Diffused Studio section).

**Human models:** if any shot includes a human model (e.g. a lifestyle shot), the model renders per the skill's Universal Human Rendering Rule (`references/anime/style-guide.md`) — the product itself stays photographic/realistic. This is the one deliberate departure from "clean editorial studio" photography.

## Output: Always 3 Prompts

Return three prompts per product, in this order:

**1. Hero Shot**
Single product at its ideal angle. Primary use case. Conveys the full object with maximum clarity and presence.

**2. Detail Shot**
Close-up of one key feature — texture, material quality, binding, edge, label, or surface treatment. The prompt should name exactly which detail.

**3. Lifestyle / Environmental Shot**
Product in a styled context that reflects the brand world or intended buyer's environment. Specific props, surfaces, and lighting that suggest a point of view.

## MØNØTØNÉ

If the user specifies MØNØTØNÉ (any product, not just Districts books):

1. Load `monotone/design-system.md` first, always — this governs brand
   thesis, neighborhood naming, palette, typography/marking, motif, and
   material-honesty rules for every MØNØTØNÉ product regardless of
   category.
2. Then load the category file matching what the product actually is:
   `monotone/books.md` (books), `monotone/objects.md` (home goods/desk
   objects), `monotone/tech.md` (tech accessories), or `monotone/leather.md`
   (bags/small leather goods). If the product doesn't clearly fit one of
   these, default to `monotone/objects.md` as the general case, or ask the
   user.
3. Compile the three prompts (Hero / Detail / Lifestyle, per this doc's
   Output section) using the design-system rules from step 1 plus the
   category file's staging template and variation-patterns table from
   step 2.

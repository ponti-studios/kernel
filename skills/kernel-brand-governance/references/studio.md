# Studio Principles

## Core Thesis

Ponti Studios favors unified interfaces because mature tools should reduce cognitive load, protect accessibility, and create cross-device trust. Per-user arbitrary theming still isn't offered — that's a different concern from whether the studio's own shared system has a considered identity, and the studio's stance on *that* changed in 2026-07 (see Visual Identity below): the shared component library (`@ponti-studios/ui`) was deliberately given one distinctive, studio-wide identity rather than staying generic-by-default. The risk that motivated the old "invisible chrome" instinct was real — arbitrary, undisciplined decoration does break trust and contrast — but the fix is rigor (verified contrast, one considered palette, restraint in where the personality shows up), not genericness. A well-executed identity is still a clean stage; a generic one isn't automatically more disciplined, just less finished.

Design should still put the user's content first and never make chrome fight for attention — but "not the protagonist" no longer means "no point of view."

## Visual Identity — "Ink & Docket" (adopted 2026-07)

The shared UI kit's palette, typography, and one signature element, applied via `packages/ui`'s tokens (`@ponti-studios/ui`):

- **Palette**: warm-paper/ink neutrals (not stark white/pure black) with a considered "Docket Cobalt" accent (not a generic SaaS blue) — same semantic roles as before (accent/destructive/success/warning), same relative meaning, contrast-verified against WCAG AA for every pairing.
- **Typography**: IBM Plex family across all three roles — Plex Serif for display/headings, Plex Sans for body/UI, Plex Mono for data and the reference-tag signature element. One family, three jobs — chosen for its documentary/technical heritage, which fits every product this kit serves (a deliberation "docket," a live data dashboard, a clinical case file, a studio case-study archive).
- **Signature element**: a quiet monospace "reference tag" (e.g. `REF-2291`) used only where content already has a natural reference ID — never a decorative sequence marker.
- **Motion**: restrained by design — a single ~120ms transform/opacity "settle" transition on state-bearing components (Badge, StatusBadge), CSS-only, reduced-motion respected. No animation library is used for one effect that CSS already covers.

This is the studio's one adopted identity, not a per-product or per-user variation — every app consuming `@ponti-studios/ui` inherits it identically, which is exactly the "one source of truth for tokens and component behavior" the review heuristics already asked for.

## Cognitive Load

The brain spends real energy mapping space and recognizing patterns. Every app teaches users where close, save, navigation, editing, and confirmation live. When a product allows arbitrary themes, textures, or icon treatments, it can break that learned geography.

Guidelines:
- Preserve stable locations for repeated controls.
- Use standard visual affordances.
- Avoid decorative systems that make controls harder to identify.
- Make repeated workflows feel increasingly invisible.

## Theming

The studio position is still skeptical of *end-user* theming — most users are not designers, and too much aesthetic freedom can produce low-contrast, hard-to-read, or visually tiring setups. That's unrelated to the studio itself having one considered, verified identity (see Visual Identity above); the two aren't in tension.

Guidelines:
- Offer one vetted, studio-authored identity — not a choice of arbitrary user themes.
- Light/dark are supported as accessibility-tested modes of the *same* identity, not independent looks.
- Do not let arbitrary user palettes undermine semantic color meanings.
- Decoration must earn its place: a signature element (like the reference tag) is fine when it's grounded in real content and used sparingly; a texture/skin applied for novelty's own sake, with no semantic or content basis, is not.

## Accessibility

Software is infrastructure. It should work for users with color vision deficiency, astigmatism, low vision, and other access needs. A single visual standard lets the team validate contrast, focus, semantic states, and readability everywhere.

Guidelines:
- Verify WCAG-oriented text contrast.
- Pair color state with labels, icons, or structure.
- Keep focus states visible.
- Make disabled, loading, warning, success, and destructive states distinct.
- Avoid low-contrast "tasteful" combinations that reduce comprehension.

## Cross-Device Continuity

Users move between phone, tablet, desktop, and mixed contexts. The interface is the tether. Visual and interaction consistency helps users trust that they are in the same system with the same rules.

Guidelines:
- Preserve navigation concepts across breakpoints.
- Let responsive layouts adapt structure without changing meaning.
- Use consistent semantic colors and naming.
- Keep common tasks recognizable even when density changes.

## Negative Space

Negative space is a feature. It lets users breathe, scan, and perceive hierarchy. It is especially important for dense productivity tools, where the goal is not emptiness but calm comprehension.

Guidelines:
- Use spacing to separate decisions, not to decorate.
- Avoid stacking cards inside cards.
- Prefer full-width bands or unframed layouts for sections.
- Keep repeated items as cards only when the object genuinely needs a frame.

## UI Review Heuristics

Ask before finishing any design task:
- Does the interface become easier to use after the first session?
- Are controls where a user would expect them?
- Is color semantic, or merely ornamental?
- Would the product still work for a low-vision user?
- Does the mobile version preserve task continuity?
- Is the user's content more prominent than the product chrome?
- Is there one source of truth for tokens and component behavior?

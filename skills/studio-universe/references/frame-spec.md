# Frame spec contract

A frame spec is JSON validated by `frameSpecSchema` (Zod,
`packages/universe/src/registry.ts`) and then by the compiler's `validate()`.
The compiler appends clauses in a fixed order: FRAME, SCENE, per-cast STAGING,
props, MOMENT, ENVIRONMENT, LIGHTING, COLOUR, NEGATIVES, then each character's
verbatim blocks, SCALE, ownership, RENDER GRADE.

## Required fields

| Field | Type | Notes |
|---|---|---|
| `frame` | number | frame number within the set |
| `title` | string | appears as `FRAME <n> — <title>` |
| `set` | string | which set this frame belongs to |
| `set_slug` | string? | optional slug |
| `register` | string | prose only — printed in the FRAME line; the RENDER GRADE clause always uses `shared_blocks.render_grade_animated` |
| `master` | `{width, height, aspect_ratio}` | all three required |
| `floorplan` | `{camera, anchors}` | `camera` is a string; `anchors` must be a non-empty object |
| `cast` | array | non-empty; see cast entry below |
| `moment` | string | the caught-mid-action beat |
| `environment` | string | the inventory of what is physically present |
| `lighting` | string | key light, motivated sources |
| `colour` | string | colour direction for the frame |
| `negatives` | string[] | joined with `; ` into one NEGATIVES line |

## Optional fields

| Field | Type | Notes |
|---|---|---|
| `props` | array | see prop rules |
| `references` | string[] | reference image paths |
| `denylist` | string[] | phrases that must NOT appear in `moment` or any cast `action` |
| `shared_outfits` | string[] | outfit ids two cast members may legitimately share |
| `block_overrides` | record<string, tailId> | appends that character's named tail block |
| `block_edits` | record<string, {omit_sentences}> | removes exact sentences from a character's block |

## Cast entry

| Field | Required | Notes |
|---|---|---|
| `character` | yes | registry key; unknown key → `UNKNOWN_CHARACTER` |
| `outfit_id` | conditional | required when the character has outfits; `null` allowed when it has none |
| `anchor` | yes | must contain one of `floorplan.anchors` keys as a substring |
| `depth` | yes | foreground/mid/background placement |
| `action` | yes | what the body is doing; denylist is checked against this |
| `gaze_target` | yes | who/what the eyes are on |
| `in_scale` | no | `false` excludes the figure from the SCALE clause |

## Prop rules

- `item` and `owner` are required (`OWNERLESS_PROP`).
- `owner` and `contains` must both name cast members.
- `anchor` must match a floorplan anchor (`UNDEFINED_ANCHOR`).
- One `item` may not have two different owners (`DOUBLE_OWNER`).
- Any prop whose item name contains `net` is treated as a trap and must carry a
  `state` clause, a captive in `contains`, and prose naming **four** anchored
  **corners**, with an enclosing verb (inside/over/around/encloses/covers/holds).

## Refusal codes

| Code | Meaning | Fix |
|---|---|---|
| `MISSING_FIELD` | a required spec, master, cast or prop field is absent | add the field |
| `INVALID_SPEC` | wrong shape: floorplan without camera/anchors, empty cast, props not a list, bad `block_edits` | match the schema |
| `UNKNOWN_CHARACTER` | cast names a character not in the registry | add it to the registry or fix the name |
| `UNKNOWN_OUTFIT` | `outfit_id` not among that character's outfits | use a real outfit id |
| `SHARED_OUTFIT` | the same outfit id on two cast members without declaring it | declare it in `shared_outfits` or give them different outfits |
| `UNDEFINED_ANCHOR` | cast or prop anchor matches no floorplan anchor | add the anchor or fix the string |
| `UNKNOWN_TAIL` | `block_overrides` names a tail the character lacks | use a real tail id |
| `MARKER_NOT_FOUND` | a bible is missing a start/end marker for a declared block | add the markers |
| `MARKER_ORDER` | end marker precedes start marker | reorder |
| `OWNERLESS_PROP` | a prop has no owner | give the frame's geography an owner |
| `UNKNOWN_PROP_OWNER` | prop owner is not in cast | add to cast or fix |
| `UNKNOWN_PROP_CAPTIVE` | `contains` names a non-cast character | add to cast or fix |
| `DOUBLE_OWNER` | one item claimed by two owners | one owner per item |
| `TRAP_STATE_MISSING` | a `net` prop has no state clause | describe the state |
| `TRAP_CAPTIVE_MISSING` | a `net` prop has no captive | add `contains` |
| `TRAP_ANCHORS_MISSING` | a `net` prop lacks "four … corner" prose | name four corners |
| `TRAP_CAPTIVE_NOT_ENCLOSED` | a `net` state does not enclose its captive | use inside/over/around/encloses/covers/holds |
| `OMIT_NOT_FOUND` | `omit_sentences` names a sentence not in that character's block | check the bible text |
| `OMIT_AMBIGUOUS` | the sentence occurs more than once | use a longer unique span |
| `DENYLISTED_PHRASE` | a denylisted phrase appears in `moment` or a cast `action` | rewrite the prose |

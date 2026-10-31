# Canon: bibles, registry, and how to change them

One fact, one home. **A bible holds prose; the registry holds pointers,
extraction rules and structured data.** Nothing is copied between them — if a
block's text lived in both, the compiler could emit two different truths.

## Bible layout

```
data/bibles/<character>/
  PROMPT.md                 facts, identity block, mask block, tails
  turnaround.webp           the one reference sheet (front/3-4/profile/back/head)
  turnaround-prompt.txt     how that sheet was generated
```

Every path above is relative to the universe root, which is this skill's
`data/` directory. The registry stores the same relative paths, so canon moves
as one directory and nothing else changes.

Machine markers wrap prose that gets stitched verbatim:

```
<!-- PROMPT-BLOCK-START: <id> -->
"…block prose…"
<!-- PROMPT-BLOCK-END: <id> -->
```

Live ids as of registry v7: `lucy`, `wyatt`, `wyatt-mask`, `akane`, `void`,
`cyndi`, `ada-bell`, `grey-passenger`, `grey-tail-trap`,
`grey-tail-unmasking`, `conductor`, `conductor-tail-trap`,
`conductor-tail-unmasking`, `phantom`, `phantom-tail-trap`,
`phantom-tail-unmasking`. The retired plate notes and the INTEGRATION/PHOTOREAL files carry
no blocks — they are documentation, not generation input.

The compiler strips the marker lines and, where the extraction rule says so,
a leading `>` blockquote prefix or surrounding double quotes.

## Registry entry

`data/registry.json` → `characters.<key>`:

| Field | Purpose |
|---|---|
| `display_name` | how the prompt prints the name (EUPD. `the phantom`, `the Grey Passenger`) |
| `bible` | path relative to the universe root |
| `identity_block` | markers for the verbatim identity prose |
| `mask_negative_block` | optional second mandatory block (Wyatt's mask) |
| `tails` | named optional blocks, one per frame at most |
| `height_cm` | drives the SCALE clause |
| `height_note`, `proportions` | reference for authors, not compiled |
| `constants` | reusable phrases |
| `reference_images` | images to attach to every generation containing them |
| `plates` | pose/turnaround plates with register + derivation |
| `outfits` | `<character>.<outfit>` → `{short, description, default?, at_home_only?}` |

`shared_blocks.render_grade_animated` is the render grade appended to every
compiled prompt.

## Adding a character — checklist

1. Write the bible with its identity block inside markers.
2. Add the registry entry: `display_name`, `bible`, `identity_block`,
   `height_cm`, `reference_images`.
3. Add outfits if the character wears garments the frame must pin down;
   each outfit needs a `short` label (used in ownership clauses) and a
   `description` (the `'S OUTFIT` clause).
4. Add `mask_negative_block` if the design has a feature that models reliably
   get wrong and must be restated as a prohibition.
5. Add tails only for per-frame variants (a trap, an unmasking).
6. Add a frame spec exercising it, compile it, then run
   `node scripts/check-fixtures.mjs`.
7. Compile a prompt and read it. The compiler proves structure, not truth.

## Outfit layer

The identity block carries **no outfit sentence** — outfits are appended
separately as `<NAME>'S OUTFIT — <outfit_id>: <description>`. Changing what a
character wears is therefore a registry edit that no bible prose contradicts;
if you find outfit prose inside an identity block, that is a bug — move it.

A costume character (phantom, grey-passenger, conductor) has no outfits and
takes `outfit_id: null`. The phantom costume is *worn* — Void wears it over a
stilted frame — which is why the costume has its own bible while the wearer
keeps his.

## Reference images

`reference_images` is not decoration: a character with reference images should
have them attached to every generation containing that character. Cyndi's canon
states it explicitly — the CYNDI BLOCK verbatim plus `cyndi-reference.jpg`, no
exceptions. Passing the block without the image is how a mixed-breed dog comes
back as a Shiba.

## Naming

`data/UNIVERSE.md` owns who-is-who and is the tiebreaker on identity:
Wyatt Bose is Chase's public persona; the Masked Chibi is Wyatt stylised;
Monotone is one entity in two registers. Never infer these from a bible alone,
and never rename a citizen to suit a frame.

## Known gaps

Registry v7 has nine characters. Void and Ada Bell exist but have no outfits
(Ada has one); costumed characters have tails but no outfits. Check live state
with `node scripts/registry-report.mjs` rather than trusting this paragraph.

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

The ids in your registry are whatever you define; the kernel ships one example
character, `example-hero`, and one costume, `example-costume`
(`data/registry/registry.json`). Your own canon lives in your studio folder, and
`universe_root` points the compiler there. Only files with a block are generation
input; notes and reference docs carry no blocks.

The compiler strips the marker lines and, where the extraction rule says so,
a leading `>` blockquote prefix or surrounding double quotes.

## Registry entry

`data/registry.json` → `characters.<key>`:

| Field                        | Purpose                                                                    |
| ---------------------------- | -------------------------------------------------------------------------- |
| `display_name`               | how the prompt prints the name (EUPD. `the phantom`, `the Grey Passenger`) |
| `bible`                      | path relative to the universe root                                         |
| `identity_block`             | markers for the verbatim identity prose                                    |
| `mask_negative_block`        | optional second mandatory block (e.g. a mask)                           |
| `tails`                      | named optional blocks, one per frame at most                               |
| `height_cm`                  | drives the SCALE clause                                                    |
| `height_note`, `proportions` | reference for authors, not compiled                                        |
| `constants`                  | reusable phrases                                                           |
| `reference_images`           | images to attach to every generation containing them                       |
| `plates`                     | pose/turnaround plates with register + derivation                          |
| `outfits`                    | `<character>.<outfit>` → `{short, description, default?, at_home_only?}`   |

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

A costume character (`example-costume`) has no outfits and takes
`outfit_id: null`. A costume that someone wears gets its own bible, while the
wearer keeps theirs.

## Reference images

`reference_images` is not decoration: a character with reference images should
have them attached to every generation containing that character. If a bible
says the image is required, it is required: passing the block without the image
is how a generation drifts away from the canon look.

## Naming

Your universe document owns who-is-who and is the tiebreaker on identity. Where
one entity has two registers or names, the document says so. Never infer that
from a bible alone, and never rename a character to suit a frame.

## Known gaps

Check live state with `scripts/registry-report.sh <universe-root>` rather than
trusting this page.

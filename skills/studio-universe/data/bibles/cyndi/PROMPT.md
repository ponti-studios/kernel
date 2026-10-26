> **Reference state (2026-10-24).** The only image in this folder is `turnaround.webp`. The photoreal, cel-sheet and 3D-mask sources named below were removed; where they appear, read them as design history, not as files to attach. **Active register: animated-cel only** — photoreal rules below are parked, not deleted (2026-10-24).

# Cyndi — canon (locked 15 Oct 2026, after Chase flagged her drifting)

Cyndi is a citizen of the universe, not a prop. Until today she had
proportions (the prompt system's PROPORTIONS section) but no appearance lock in the Monotone
pipeline — prompts said "small tan dog" (copied from the anime reference,
which itself draws a Shiba-like dog) and no prompt ever attached her real
references. Result: Shiba stand-ins in the photo scenes, a different dog
again in the crossover. This file is the fix.

Ground truth: the cel `turnaround.webp` (five views) in this folder. **No photoreal reference is held** — the photo this sheet was generated from was removed on 2026-10-24, so photoreal frames of her now have no image reference. The
photo came from the chibi bible, where her design was locked Oct 3.

## CYNDI BLOCK (append verbatim whenever she appears in a prompt)

<!-- PROMPT-BLOCK-START: cyndi -->
"Cyndi is a lean, athletic medium-sized mixed-breed dog with a short uniform golden-tan coat, a long muzzle that is BLACK with a little grey around the mouth, large upright pointed ears with dark backs, dark brown eyes, a small white patch on her chest and white tips on her paws, and a straight medium-length tail carried low with a dark tip. Her build is that of a grown athletic mixed breed with normal leg length for her size: a long straight tail, a lean foxy muzzle and a short smooth coat, exactly the adult dog shown in her attached reference images."
<!-- PROMPT-BLOCK-END: cyndi -->

## Mandatory attachments

Any generation containing Cyndi MUST attach her register plate:
`turnaround.webp` (cel, front / three-quarter / profile / back / head) for
animated-cel frames, or `photoreal.jpg` for photoreal frames. A prompt that mentions her
without a reference is invalid. The cel plate is derived from the photo;
the photo remains the photoreal ground truth, and the original must not
be overwritten.

## Kit (context-dependent, as in life)

- Red collar; pink "Babygirl" leash; bandana varies by day (red/white, or
  blue-white-red). In Monotone scenes the red leash is the house constant.

## Failure modes (verify against photoreal.jpg every time)

1. Shiba drift — curled tail, cream/white face markings, stocky build.
2. Missing black muzzle — her muzzle is black; a tan or pink muzzle fails.
3. Ears flopped, folded, or small — hers are large, upright, pointed.
4. Wrong size — see the PROPORTIONS section of `~/workspace/art/monotone/character-prompt-system.md` (sitting crown at Monotone's hip; standing back just above his knee).
5. Coat turned cream, white, reddish, or long/fluffy — short, uniform tan.
6. Different dog per register is NOT acceptable variance: photo, animated,
   and chibi-world Cyndi are the same individual, register shading aside.

# Failure catalogue — symptom, cause, intervention, status

Every entry observed at least once in real renders. **Status** says whether the fix
is established (>=5 samples), directional, or untested.

| # | Symptom | Cause | Intervention | Status |
|---|---|---|---|---|
| 1 | Net hangs as a flat curtain across the figure; cords cross the body | catenary between two ceiling pulleys — the figure cannot deform it, depth order undecidable | remove the supports; the body is the only thing holding the net | **untested n=1** |
| 2 | Phantom emerges *from* the screen instead of standing on the stage apron | staging language competes with the glowing screen as the brightest element; the model merges "in front of screen" with "out of screen" | state the standing surface and the gap explicitly (*"both feet on the stage boards, a clear half-metre of apron between the hem and the screen"*) | single sample, unconfirmed |
| 3 | Hands gain tattoos / clawed fingers on a character with tattooed plates and sleeve-covered hands | plates carry the tattoo; negative hand description did not suppress it in the legacy arm | positive occlusion: *"hands hidden in the sleeves"*; treat claw-shaped fingers as a plate artifact | improved in one A/B, unconfirmed |
| 4 | Characters facing the camera when every gaze should be on the subject | the frame's subject is off-centre or the staging reads as a group portrait | state gaze targets per character (*"every face turned toward the phantom"*), not "nobody looks at the camera" | unconfirmed |
| 5 | Robe is see-through when a character is meant to be opaque | `CONTENT`/`CONSTRAINTS` structure, not the absence of "never transparent" | under investigation — isolate the `CONSTRAINTS` prefix / `WARDROBE` line / enumerations | **2/5 vs 0/5, p≈0.44** |
| 6 | A character's required garment disappears or is replaced | the prompt enumerated *other* garments as "never the …", and/or too many garments competing in one line | say what they wear, drop the other-character enumerations | legacy arm lost the tee in one A/B; not reproduced at n=5 |
| 7 | Legible text appears on signs/screens/cups | — | keep the render-grade negative *"no readable text…"* | **established: 0/5** |
| 8 | Two clocks, two rocks, duplicated props | descriptive repetition of the noun across converted clauses | state the count as a state of the world; mention the object once | not reproduced at n=5 (0/5) |
| 9 | Provider returns 400 "filtered" for a long multi-character brief | aggregate scene density trips a provider filter (Meta) | switch provider; do not bisect | **established** |
| 10 | Identity drifts (wrong face, wrong mask shape) | judged at 1K, or no plates attached | 2K + plates; never score identity at 1K | **established** |
| 11 | Video clips fight the scene because a character lock is appended to every prompt | `CHARACTER_LOCK` is appended globally | make the lock scene-aware, or accept that non-Wyatt scenes degrade | untested ($0.25+ to test) |
| 12 | Cost appears to be zero for an expensive operation | key counter lag; `/api/v1/generation` 404s for images and speech | bracket usage before/after and sleep before reading | **established** |
| 13 | A "legacy" A/B arm renders identically to the new arm | the arm was loading the wrong compiler / stale dist build | point the harness at the ported compiler and diff the two compiled prompts first | **established** |
| 14 | A spec file fails to compile with `ENOENT` deep in a stack | CLI read the spec before validating flags | validate all flags before touching the filesystem | established (editorial CLI) |
| 15 | *(retired)* Scored as "a phone that the spec never mentioned" | **not a render failure** — the spec specifies a nail file in that hand; the *rubric item* was invented and the object misread | remove invented checks; derive every item from the spec | **was recorded as a failure on 4 models and was wrong** |
| 16 | The phantom hovers above the carpet instead of standing, mask turned to camera | reported once for `seedream-5-0-pro`; weakened staging adherence | use qwen or flash; re-state *"both feet on the floor"* | **[U]** — from the same scorer that fabricated two findings; re-verify before relying on it |

## Interventions that did NOT work

- Appending a physics paragraph about occlusion and contact shadows to fix net
  geometry. (No effect, 559 chars.)
- Slackening the ropes while keeping the ceiling pulleys. (No effect.)
- Bisecting a provider content filter to find the offending words. (It filters on
  aggregate density; every part passes alone.)
- Rewriting negatives into positives **expecting** a subject that was never being
  added to stop appearing. (It wasn't appearing; the constraint was inert.)
- Judging character identity from a 1K render. (Mask read as "half" — an artefact.)
- Using `gemini-3-pro-image` as a routine workhorse. (**Ruled out by the user:**
  expensive, inconsistent.)
- **Inventing a rubric check that the spec does not contain.** "No phone in anyone's
  hand" was scored as a violation on four models; the spec asks for a nail file in that
  very hand. Two fabricated findings came out of one image.
- **Swapping models to improve rule-following.** qwen and seedream-flash tie;
  seedream-pro is worse on adherence while being 4x slower. Model choice is a
  speed/plate-capacity decision, not a fidelity one.

## Interventions that DID work

- Compiling prompts deterministically and storing the sha256 (made every A/B
  interpretable).
- Attaching reference plates and rendering at 2K for identity verdicts.
- Keeping the text-suppression negative verbatim.
- Removing other characters' garment enumerations from a character's line.
- Switching provider after one confirming filter probe.
- 5-sample montage scoring for coarse properties.
- Bracketing key usage to measure cost when the API won't report it.

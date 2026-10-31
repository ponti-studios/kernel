# Prompt mechanics — what moves the needle and what doesn't

Ordered by how reliably a change moved a render. Tags as in the parent skill.

## 1. The object's support geometry decides its shape [M/I]

A net described as hanging from two ceiling pulleys comes back as a flat curtain
across the figure, with the cords visibly crossing the body — because a catenary
between two fixed points **cannot** be deformed by the character, so the depth order
where it meets the torso is underdetermined and the model resolves it as
"in front of the back, behind the front".

- Prose about drape, occlusion order, contact shadows and stretching: **no effect**
  (559 characters, identical render).
- Slackening the ropes while keeping the pulleys: **no effect**.
- Removing the ceiling support so the body is the only thing holding the net:
  produced a genuine drape **[U], n=1**.

**Rule:** before rewriting wording, ask what physical configuration would make the
geometry unambiguous, then describe *that*. If a support exists that the subject
cannot move, the net will hang from the support, not from the subject.

## 2. Negation: inert for "don't add X", harmful for "which X" [M/I]

Two different claims get conflated. Keep them apart:

- **"Don't render a sparkle"** — measured inert on the frame written against it:
  0/5 sparkles with the negative present, 0/5 without. Removing the negative did not
  bring the artifact back. So the classic "mentioning it invites it" effect is
  **not demonstrated** here **[M]**.
- **"Never the deep-red wrap dress"** written into *another* character's outfit line —
  this names a garment the character is not wearing. The compiler emitted 6 such
  mentions per 4-character frame, and in one A/B the legacy arm lost the tee to a
  coat while the positive arm did not (**single sample, later failed to reproduce
  [U]**). The mechanism is plausible and the enumeration is pointless either way —
  just delete it.

**Rule:** never enumerate what a character is *not* wearing. Say what they are
wearing, in enough colour/detail to distinguish them from everyone else in frame.

## 3. Directive framing vs descriptive prose [U]

Same words, two envelopes:

```
NEGATIVES: the robe is dense opaque cloth; the case lies open and empty; …
CONSTRAINTS — hold every one of these exactly as written: the robe is dense opaque cloth; …
```

Measured: the `NEGATIVES:`-labelled arm held robe opacity 5/5 while the
`CONSTRAINTS` arm lost it 2/5 — **with identical content** (arm B vs arm C).
Suggestive that an imperative envelope earns more compliance than a descriptive one,
but confounded: C also dropped the garment enumerations and added a `WARDROBE` line.
n=5, p≈0.44 **[U]**. Isolation test pending.

## 4. Counts are weak inside prose [U]

*"exactly one rock appears in the frame"* reads as description; *"the case holds an
empty tray and nothing else"* reads as a state. The measured runs showed no
difference in rock count (0/5 panels with >1 rock in either arm), so this is
**unproven** — but phrasing counts as a state of the world rather than a tally is
cheap and reads better.

## 5. Reference plates are the only reliable identity mechanism [M]

Identity comes from the attached plates, not from adjectives. At 2K with plates, a
mask described only as "a black full-face mask" rendered with the plate's exact rivet
pattern. Without plates the same words produce a generic masked man.

Constraints: `qwen-image-2.1-turbo` accepts **0-4** plates; `seedream-5-0-pro/flash`
and `gemini-3-pro-image` accept **0-14**. More plates is not automatically better —
each plate is attended to and the character-count/plate-count relationship is
untested **[U]**.

## 6. Camera-relative geometry inside a single object is unrenderable [I]

Phrasings like *"its near edge at his waist and its far edge at his knees"* ask the
model to reason about a 3D plane's screen-space extent. It renders *something*, but
the intended relationship is not recoverable from the output. Prefer
object-relative statements: *"a shallow sag, bottom edge four hands above the
floor"*.

## 7. Trailing physics paragraphs do nothing [M]

A 559-character appendix describing tension, occlusion and contact shadows changed
nothing measurable. The load-bearing clause is the one describing the **arrangement**;
everything after it is decoration. If a fix is needed, change the arrangement.

## 8. Text suppression works as a negative [M]

*"no readable text, letters or words anywhere"* produced **0/5 panels with legible
text** across every arm on both frames, including all the signage and screens the
scene demanded. This one negative is worth keeping verbatim. It is the sole
negative surviving in the shared render grade.

## 9. Prompt order matters less than you think [I]

No experiment isolated clause order. What is observable: the character blocks sit
after the scene, and identity drifts (phantom emerging from the screen, hands gaining
tattoos) track *reference plates and resolution*, not block order. Treat block order
as stable-by-convention, not as a lever.

## 10. Compile, and store the hash

Any prompt worth keeping gets compiled deterministically and its sha256 stored next
to the render. Then "did the rewrite change this prompt?" is a diff, not a memory
test — the only reason the three-arm test could be built at all.

## 11. Silence is not a constraint — state the state of hands and props [U]

**This section's original evidence was a misread and is withdrawn [U].** It claimed
that silence about a character's hands caused every model to invent a phone. In fact
the spec **specifies** her hand: *"one hand in lap, other holding a nail file paused
mid-stroke"*. The models rendered the specified prop; the scorer invented a "no phone"
check and then misread the nail file.

The underlying principle may still be true — any property the brief leaves open, a
model will decide for itself, and it will decide plausibly rather than blankly. But
after this correction **we have no verified instance of it.** Treat the principle as a
hypothesis to test (leave a prop unspecified, render, see whether something appears),
not as a finding. What *is* verified: do not name an unspecified object from a
downscaled panel — that is how the phone was invented.

The lesson generalises: any object the model can reasonably supply will be supplied.
Properties you care about need a positive statement of the state —

- hands: *"her hands are empty and resting in her lap"*, not silence
- props: *"the tray of the case is empty"*
- posture: *"both feet flat on the stage boards"*

This is the productive version of the "no phones in hands" negative that the rewrite
dropped: not *"no phone"* (naming it), but *"her hands are empty"* (stating what is
there).

## 12. The cross-model signal [M]

Run the same frame through two or three models before concluding anything about a
failure's cause:

- **Fails on every model** → check the spec and the rubric first; a shared "failure"
  is often a shared scoring error. (Our one attempt at this example was exactly that,
  so the rule stays [U].)
- **Fails on one model only** → a model quirk; switch for that frame or accept it.
  (seedream-pro floating the phantom.)
- **Passes on some samples of every model** → ordinary variance; do not "fix" it.

This is cheaper than it sounds: 2 models x 5 samples x 1 frame is 10 renders, well
under a dollar, and it is the only way to tell a spec bug from a model bug.

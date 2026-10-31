> **SUPERSEDED IN PART.** Model-based scoring of images is forbidden (see the hard
> rules in SKILL.md). Everything below about designing arms, sample counts and cost
> still applies; everything about *scoring* renders is retained only as a record of
> how it went wrong — it produced two fabricated findings from one image before the
> user caught them by eye. The deliverable of an experiment is now: the images in the
> inbox, plus the parameters. The human judges.

# Evaluation method — how to test a prompt claim

Written after falsifying three of my own conclusions in one afternoon.

## The rules

1. **Sample >=5 per arm.** With n=1 per arm, ordinary run-to-run variation is
   indistinguishable from effect. All three of these single-sample "findings" died
   at n=5: *"the positive arm invented a magnifying glass"* (the spec specifies a
   brass loupe — the object was correct all along, and my question had suggested
   "invented" to the vision model), *"the positive arm rendered two rocks"*, and
   *"the rewrite fixed the net geometry"*.
2. **One variable per arm.** If arm B differs from arm C in both content and
   structure, comparisons are uninterpretable. Enumerate every difference with a
   diff of the compiled prompts before running anything.
3. **Reconstruct the true "before".** After editing source text, "legacy voice" no
   longer means "the original prompt" — it means "the original *structure* with the
   *new* wording". Get the original from git (`git show <commit>:<path>`) or from a
   preserved capture. Verify by grepping the compiled prompt for the original
   phrasing before trusting the arm.
4. **Pick the right resolution for the question.** Composition/semantics: 1K is
   fine and ~9x cheaper. Identity, fine features, mask shape, small text: 2K only.
5. **Score coarse, observable properties.** "Panels with more than one rock",
   "panels with a see-through robe", "panels with legible text" — countable, not
   adjectives. Subjective quality is not scorable and not evidence.
6. **Ask neutral questions of vision models.** Yes/no questions with a leading
   adjective are answered affirmatively. Ask "what is in the hand", not "is there an
   invented object in the hand". Two of my "artefacts" were this failure.
7. **Score montages, not individual images, when comparing arms.** A 5-panel strip
   per arm gets the whole arm judged in one look and costs one vision call per arm.
   Downsampling is the limit: montage panels at 1K are good for coarse properties
   only. For fine details, crop the region at full resolution.
8. **Record the sample count with the claim.** A finding without an n is an anecdote.

## Budget preflight (learned the hard way)

`GET /api/v1/key` reports several budgets; only `effective_budget` binds. A lifetime
key limit and a workspace *daily* budget can differ by an order of magnitude, and
reading the wrong one lets you launch a sweep that dies halfway — which leaves the
arms with unequal sample counts and voids the comparison. Check
`effective_budget.remaining_usd` against `renders x per-render cost` before starting.

## Cost of a proper test (measured)

| Setup | Renders | Cost |
|---|---|---|
| 3 arms x 5 samples x 2 frames, 1K with 3 reference plates | 30 | **$0.55** ($0.0184 each) |
| Single render, 1K with plates | 1 | ~$0.018 |
| Single render, 2K with plates | 1 | ~$0.16 **[I]** — bracketed by key counters, not per-call |

A 5-sample-per-arm answer costs about half a dollar. There is no excuse for guessing.

## Scoring harness that worked

```bash
# 1. render arms into /tmp/arms/out/<arm>/<frame>/<n>.png
# 2. one montage per arm per frame (5 panels wide)
ffmpeg -y -i a.png -i b.png -i c.png -i d.png -i e.png \
  -filter_complex "[0:v][1:v][2:v][3:v][4:v]hstack=inputs=5" strip.png
# 3. one vision call per strip, asking for one short line per panel plus totals
```

Montage with `-label` failed on this machine (`unable to read font`); `ffmpeg hstack`
with no labels works, and panel order left-to-right is enough if you state it in the
question.

## Never score an object you haven't resolved (learned by scoring a phone that wasn't there)

- **Derive every rubric item from the spec, by quoting it.** An invented check is a
  trap: *"no phone in anyone's hand"* scored a spec-mandated nail file (*"other holding
  a nail file paused mid-stroke"*) as a violation on four models, and the object was
  misread on top of it. Before scoring, page through the spec's actions and staging and
  make each check traceable to a sentence. If a check has no sentence, delete it.

- **Verify small objects at full resolution before naming them.** A "phone" was scored
  on four models' renders of the same frame; a crop of the actual pixels shows a nail
  file. Panel-scale reads cannot resolve an object the size of a hand.
- **A rubric item that names an object manufactures its own failures.** *"No phone in
  hand"* is a leading question in checklist form; *"her hands are empty"* is a state
  that can be judged. Write checks as states of the world, not as accusations.
- **The user's eye beats the vision model.** When the user contradicts a scored
  verdict, re-examine at full resolution and correct the record — including any
  conclusion built on it.
- **A score is only as good as its weakest read.** Two of three "failures" in the
  one-shot test were misreads; the headline conclusion ("premium lost") had to be
  withdrawn. Prefer fewer, verifiable checks over many cheap ones.

## What the vision service actually tolerates (learned by timing out)

- **Wide multi-panel strips are unreliable.** A 5-panel 5:1 strip of one frame scored
  fine and the identical strip of another frame timed out three times running, as did
  a 3-over-2 grid of the same panels. The panels themselves scored fine individually.
  Do not assume a composite will work because a similar one did.
- **Terse, enumerated questions beat long ones.** Asking for "only the failures from
  this fixed list, or clean" is faster and less timeout-prone than asking for a table
  of pass/fail over seven named checks.
- **Single full-resolution panels are the reliable fallback.** Slower (one call per
  panel) but they always return.
- **Score the same panel index across models** (a 3:1 strip of model A, B, C on panel
  1) when the composite tolerance allows it — it keeps the comparison honest for the
  cost of one call.

## Failure patterns in my own process (each cost real money or a wrong claim)

- Testing n=1 and reporting it as a finding.
- Reporting a delivery path before copying the file there (twice).
- Bisecting a provider content filter (20-30 paid calls for an answer that is always
  "switch provider").
- Judging identity from a 1K render.
- Comparing an arm I hadn't diffed against the other.
- Believing a vision model's answer to a leading question.
- Spending 25+ minutes polling a sweep one sleep at a time instead of batching the
  vision scoring calls in parallel and answering with partial-but-honest coverage.

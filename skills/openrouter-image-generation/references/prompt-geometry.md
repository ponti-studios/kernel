# Prompt geometry: making objects act on figures

Use when a generated image keeps placing an object wrongly relative to a figure —
a prop that should be ON something hanging beside it, a net that looks like the
figure passes through it, a rope that never touches the hand holding it.

Rewrite nothing until you can answer **"what holds this thing up?"** That
question resolves most failures before any wording changes.

## Rules

- **A prop's shape is set by its support, not by the sentence describing its
  relation to the figure.** A net suspended from ceiling pulleys has a catenary
  fixed by those pulleys; the figure standing behind it cannot deform it, so the
  two read as separate layers and the object looks like a backdrop hung at the
  figure rather than falling on it.
- **Make the figure the only support.** Anchor the prop to the body (head,
  shoulders, arms), let its free ends trail on the floor, and negate every other
  holder in the negatives block — no taut rope, no second person hauling it, no
  ceiling fixing bearing its weight. That is the change that moves the image.
- **Slackening the support is not the same as removing it.** Loosening the ropes
  while the pulleys remain still returns a supported object with its own shape.
  Every intermediate version of this fix that kept the support failed.
- **Camera-relative geometry is unrenderable.** "Near edge at his waist, the far
  edge at his knees" cannot be mapped when the camera looks along that axis; it
  collapses into a vertical band across the torso — which is exactly the widest,
  most opaque part of a figure, so it is also the most confusing place to meet
  it. Describe geometry relative to the body instead.
- **Wide-open mesh over an opaque figure is the hard case for occlusion.** Large
  visible gaps invite a phasing read. Give the prop a silhouette that depends on
  the body — tenting between raised arms, sagging, bunching at the shoulders —
  and state what the gaps show ("through the gaps his robe shows, never the
  seats behind him").
- **A clarifying paragraph appended to a long prompt does not override the
  earlier dominant clauses.** A trailer that spells out the physics verbatim
  loses to the staging and prop blocks near the top. Change the field that drives
  the geometry.
- **Two clauses that both describe the object's attachments can cancel out:**
  "not held in his hands" removes the only contact point while the figure's own
  character block describes free, raised arms. If nothing in the text ties object
  to body, the model composites two independent layers and picks depth per
  element.

## Method: one variable per render

1. **Reproduce the failure first.** A diagnosis without a reproduced case is a
   guess, and the first render often shows a _different_ problem than reported.
2. **Work on a copy.** Duplicate the spec (or extract the prompt to a file) for
   experiments. Never edit a canonical spec or its regression baseline to test an
   idea — a copy keeps the baseline intact and makes clause diffs readable.
3. **Probe at the cheapest settings that still show geometry:** smallest
   resolution, no reference images. Geometry probes measured at roughly nothing
   against the key counter while a referenced 2K render moved it by an order of
   magnitude more. Save the referenced high-res pass for the keeper.
4. **Change exactly one thing per render** and keep every variant on disk. A
   change that produces no visible difference is evidence the cause is elsewhere
   — stop refining that lever rather than restating it harder.
5. **Judge with a targeted question, not "does this look right":** is the object
   in front of the figure or passing through it; what do the gaps show; does
   anything other than the figure hold it up; at which height does it cross the
   body; do the arms carry its weight. Specific questions surface the real
   staging error that a general impression hides.
6. **Then apply the working change to the real spec**, and expect the regression
   baseline to drift for that frame. Re-record it deliberately — that is what the
   baseline is for — and never edit the expected output to hide drift.

## Validators can push authors toward the unrenderable

A schema check that demands a suspended trap name "four corners" and an
enclosing verb will happily accept a net hanging from pulleys — the shape that
renders as a backdrop. Satisfying the validator is not evidence the geometry
will render; a spec can compile clean and still describe a scene no model will
draw as intended. Compile, then read the compiled prompt, then look at the
image.

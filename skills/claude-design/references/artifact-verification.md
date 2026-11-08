# Verifying and delivering an HTML artifact

All of this runs from the CLI plus the browser tool — no human has to open anything for the checks to
happen, which is exactly why they should run before the artifact is sent.

## 1. Load it and prove it is alive

```python
new_tab("file:///abs/path/artifact.html"); wait_for_load()
js("document.title")
js("document.querySelectorAll('.card').length")                 # expected structure
js("document.querySelectorAll('[data-hermes-send]').length")     # choice controls
js("JSON.stringify(localStorage.getItem('<your-tweak-key>'))")    # did the Tweaks script run?
```

If `localStorage` is empty and no `aria-pressed` attributes are set, the script threw on load — a
screenshot cannot tell you that.

**When the DOM shows something you did not write, load a control page first.** A stray title prefix,
an extra attribute, a global the artifact never defines: open a two-line page (`<title>Plain</title>`)
through the same browser path. If the symptom appears there too, it belongs to the harness or profile,
not the artifact — confirm against the file's bytes before "fixing" code that was never wrong. Debugging
your own artifact for an environment artefact burns the trust you need for the real findings.

## 2. Audit computed styles, not just structure

```python
# anything meant to be visible but painted transparent is invisible
js("""(() => { let n = 0;
  document.querySelectorAll('.meter b, .dot, .swatch').forEach(el => {
    const c = getComputedStyle(el).backgroundColor;
    if (c === 'rgba(0, 0, 0, 0)' || c === 'transparent') n++;
  }); return n; })()""")
```

Zero is the pass. Spot-check that painted values match the source you lifted them from:

```python
js("getComputedStyle(document.querySelector('.hud')).backgroundColor")
```

## 3. Exercise the controls

```python
js("document.querySelector('[data-set=\"backdrop\"][data-value=\"light\"]').click()")
print(js("document.body.className"), js("document.querySelector('.stage').className"))
```

Read back the mutated class list. A Tweak that silently does nothing renders perfectly.

## 4. Screenshot, then measure before cropping

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1.5 --window-size=990,2200 \
  --user-data-dir="$SCRATCH/chrome-shot" \
  --screenshot="$SCRATCH/board-full.png" "file:///abs/path/artifact.html"
magick identify "$SCRATCH/board-full.png"
```

`--window-size` must exceed the page height or the capture is cut off. `--user-data-dir` keeps it from
touching the real profile. Then measure the sections you intend to split on:

```python
js("""(() => {
  const r = el => { const b = el.getBoundingClientRect();
    return [Math.round(b.top + window.scrollY), Math.round(b.bottom + window.scrollY)]; };
  return JSON.stringify({grid: r(document.querySelector('.grid')),
                         states: r(document.querySelector('.states')),
                         page: Math.round(document.body.scrollHeight)});
})()""")
```

**Never guess crop offsets — a guessed crop lands mid-section.** Device pixels = CSS pixels × the
scale factor you passed:

```bash
magick board-full.png -crop 1485x1890+0+0    +repage board-1-directions.png
magick board-full.png -crop 1485x1264+0+1898 +repage board-2-states.png
```

Blankness check before sending:

```bash
magick board-1-directions.png -format "mean=%[fx:mean] stddev=%[fx:standard_deviation]\n" info:
```

A standard deviation near zero means flat colour: wrong region, or the page never rendered.

## 5. Look at your own crop

Pass the PNG to `vision_analyze` and ask literally whether it shows what you are about to claim
("four labelled mockups A–D, each with a visible coloured meter?"). That catches what mean/stddev
cannot: a correctly-sized crop of the wrong section.

## 6. Deliver all three ways

1. `open "<abs path>"` — their browser, interactive, full size.
2. `MEDIA:/abs/path.png` for each crop, in the reply.
3. The on-disk path in text, so Finder is a third route.

Attaching the images is not optional: never make the user work out how to open a file before they
can answer the design question.

## 7. Canvas and animated artifacts: blank is the default failure

`requestAnimationFrame` does not run while the page is not visible. A background tab and a headless
screenshot both report `document.hidden: true` and fire **zero** frames, so an artifact whose only paint
lives inside the rAF callback renders an empty canvas in every screenshot and for any user who has another
tab focused — while DOM counts, computed styles and every other check look healthy.

**Draw the first frame synchronously** at load, then arm the loop:

```js
apply();
paintBars();
orbs.forEach((o) => o.draw(6.0));
requestAnimationFrame(frame);
```

For a moving picture the still frame is also what the screenshot and the user's first glance show, so pick
the draw time deliberately (a turned angle, never t=0).

Verify by painted pixels, not by the element existing:

```python
js("""(() => [...document.querySelectorAll('canvas')].map(c => {
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let lit = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) lit++;
  return c.dataset.count + ':' + lit;
}).join(' '))()""")
```

All zeros means nothing painted. Lit-pixel counts double as a density reading: dots against canvas area
tells you whether the smallest render is a legible object or a smudge.

If a canvas still reports zero lit pixels, call the draw function once by hand
(`js("orbs[0].draw(6.0)")`) and re-count. That separates a broken renderer from a stalled loop in one step —
do not start rewriting maths on a hunch.

## 8. Reset persisted tweak state before measuring

Tweaks saved to `localStorage` outlive the session that set them. A transform left on from an earlier
debugging round scales every measured box, which reads as a layout bug at exactly the scale factor: a
400 px panel measuring 600 px at 1.5×, a mock reported as clipped inside a stage it actually fits.

Before trusting any measurement:

- clear the artifact's storage key and reload — or measure in the headless profile, which starts empty;
- when a measurement looks scaled, read `window.devicePixelRatio`, `document.body.className` and
  `getComputedStyle(el).transform` before concluding the CSS is wrong;
- ship artifacts with 1× as the default state and verify at 1× first, then re-check the other states.

## 9. Timer-driven demos, and proving motion was applied

Two failures that look identical in a screenshot, and the check that separates them.

**`requestAnimationFrame` stops in a hidden tab; `setInterval` is instead throttled to roughly one call a
minute.** An artifact that demonstrates a live behaviour — a transcript typing itself, a feed advancing, a
counter climbing — built on `setInterval` therefore shows one frame of that demo in a background tab, and a
headless check sees the same thing and reports it as a stall. Drive the demo from a wall clock so it catches
up rather than counting ticks:

```js
const started = performance.now();
let tick = 0;
(function advance() {
  const due = Math.floor((performance.now() - started) / 1200);
  if (due > tick) {
    tick = due;
    n += 3;
    draw();
  } // 3 items per 1.2 s ≈ the rate being imitated
  requestAnimationFrame(advance);
})();
```

Cadence is part of the demo's honesty: one item per tick at a tick of 1.2 s is slower than the thing being
imitated, so a feature that works reads as broken. Check `document.visibilityState` before concluding either
way — `hidden` explains a demo that will not advance, and it is not a bug in the artifact.

**Expose a state setter so verification does not depend on the timer.** One line on the element — an
`el.__fill(n)`-style hook that jumps the artifact to a chosen state — replaces "wait and hope the animation
got there" with a deterministic render, which is what makes a still worth judging at all:

```python
js("[...document.querySelectorAll('.box')].forEach(b => b.__fill(20))")
```

Say in the reply that the artifact animates: a still is a sample of the deliverable, not the deliverable.

**Assert that an animation is applied, not that the DOM looks right.** A mistyped or dropped animation renders
its end state and passes every structural check. Read the computed animation instead:

```python
js("getComputedStyle(document.querySelector('.line .inner')).animationName")            # 'glide'
js("getComputedStyle([...document.querySelectorAll('.word')].at(-1)).animationName")     # 'blurIn'
```

Do the same for an effect that is a property rather than an animation — read the painted value
(`getComputedStyle(el).color`) for a provisional-versus-settled treatment instead of trusting the class list.
A still cannot tell "animating" from "finished", so these reads are the only cheap evidence that the motion
you wrote is the motion that runs.

## 10. Geometry and scale: defects a screenshot cannot show

Two classes of bug survive every structural check and still read as "fine" in a still.

**Overlapping or clipped absolutely-positioned nodes.** A layered diagram whose positions are computed per
column can place two nodes at identical coordinates, or push a label past the canvas edge. The node count is
correct, the picture just looks sparse, and nothing errors.

```python
js("""(() => {
  const box = document.querySelector('.graph').getBoundingClientRect();
  const r = [...document.querySelectorAll('.node')].map(n => n.getBoundingClientRect());
  let overlap = 0;
  for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) {
    const a = r[i], b = r[j];
    if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) overlap++;
  }
  const outside = r.filter(x => x.left < box.left - 1 || x.right > box.right + 1
                             || x.top < box.top - 1 || x.bottom > box.bottom + 1).length;
  return JSON.stringify({ nodes: r.length, overlap, outside });
})()""")
```

`overlap: 0, outside: 0` is the pass — and assert the expected node count with it, or an empty graph passes
too. Fix by clamping each label inside the canvas (`if (x + half > width - 4) x = width - half - 4`) rather
than by nudging one node.

**A scale that clamps every value to the same width.** Bars normalised against the largest value collapse to
the minimum when one value is orders of magnitude bigger — a 0.05¢ text call beside a 9¢ render batch renders
as ten identical stubs, which looks like a deliberate style and carries no information. Compare _distinct_
computed widths rather than eyeballing:

```python
js("JSON.stringify([...new Set([...document.querySelectorAll('.bar')].map(b => b.style.width))])")
```

A single unique width means the graphic is dead — switch to a log scale
(`Math.log1p(v) / Math.log1p(max)`) and re-read until the widths spread. The same check applies to any
"share of total" bar, heatmap ramp or sparkline.

**Theme and token state by painted value.** After toggling, read
`getComputedStyle(document.body).backgroundColor` (or the element that owns the token), never the class
attribute: a toggle that flips a `data-` attribute but fails to override the custom properties renders
identically, and a screenshot of both states looks like the same screenshot twice.

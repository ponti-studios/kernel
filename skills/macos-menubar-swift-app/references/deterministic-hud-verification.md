# Verifying a native HUD you cannot look at

A menu-bar HUD is hand-drawn, has no DOM, and is often invisible to the tools that read windows. What makes it
verifiable is a rule about how the view is written, and then measurement instead of eyesight.

## Write the view so a still is truthful

**Every visual is a function of a clock, not of a state change.** Blur, rise, scale, ink, opacity — all computed
from an elapsed value passed in. Nothing animates because a `@Published` changed.

Why it pays:

- A frame can be rendered offscreen for any moment, so a still of the surface is evidence rather than decoration.
- Two renders of the same moment agree, so a screenshot regression becomes a diff.
- The motion becomes a pure function and is **unit-testable with no screen**: assert the opacity never reaches
  zero, that one cycle takes 1.6 s, that the value at two moments a half-period apart differs.
- State-driven animation makes all three impossible: the still is whatever the last transition happened to leave.

## Branch out here, not inside `body`

A SwiftUI `body` is a `ViewBuilder`: you cannot `if … { …; return SomethingElse() }` inside it and keep the rest of
the content. Put the alternate state in its own small view and branch where the states are already being chosen:

```swift
if let warning { WarningLine(text: warning) }
else if items.isEmpty { WorkingLine(elapsed: clock) }   // not a `return` inside body
else { ContentLine(items: items, elapsed: clock) }
```

Wrapping the whole body in `AnyView` to buy an early return costs type erasure on every frame; a two-line view is
cheaper and reads better.

## Show that it is working before it has a result

A surface with nothing to show yet looks broken however fast the work is — the measured case was half a second of
model time that read as a dead app, and the fix was feedback, not speed.

- **Dimmest ink, in the same slot the result will occupy**, so nothing moves when the result arrives.
- **Not the warning colour.** Amber (or whatever the app reserves for real failures) must keep meaning "something
  is wrong"; waiting for work to finish is normal.
- **Not a second spinner.** If something on the surface already moves — an orb, a marquee — competing motion reads
  as a fault. A slow breath (0.9…1.0 of the base opacity over ~1.6 s, driven by the clock) says "live" without
  competing with it.
- **Only while the work is genuinely in progress.** Once the user has stopped the action, the state that replaces
  it must not claim to still be listening.
- Replace it the instant the first real item lands, and keep the label to one short word plus an ellipsis.

## Verify by measurement

Compiling is not evidence that anything is on screen. Render the surface at two moments half a period apart and
compare the ink:

```swift
// a flag on the shipping binary, so the check is repeatable and not a one-off harness
tool --render /tmp/frame-a.png <state> 0.4
tool --render /tmp/frame-b.png <state> 1.2
```

```python
from PIL import Image
for name in ("a", "b"):
    im = Image.open(f"/tmp/frame-{name}.png").convert("L")
    w, h = im.size
    band = im.crop((0, int(h * 0.62), w, h))          # the region you changed
    lit = [p for p in band.get_flattened_data() if p > 20]
    print(name, len(lit), sum(lit) / len(lit))       # count, then mean luminance
```

Two numbers that both move is the claim: the label is drawn, _and_ it breathes. An 11 % mean-luminance difference
between the two moments is what proved it — not that the code compiled. A region that is entirely black, or
byte-identical between the frames, means the change is not on screen.

**Know what offscreen rendering cannot draw.** `ImageRenderer` and its equivalents produce placeholder blocks or
nothing for `TextField`, `Toggle`, `ScrollView`, `List`, and glass/vibrancy material, and they render at 1 px per
point. For those, capture the real window (`screencapture -x -o -l <windowid>`) and measure that. When a material's
appearance is the question, only the running app can answer it — say so rather than calling a still a verification.

## Drive the app when a person is watching

A CLI path that shares the engine prints identical timings while never opening the window — so green numbers from one
say nothing about the surface. The display path is exercised only by the app. Press the real hotkey and let the app's
own log confirm the surface is up _before_ playing audio at it:

```sh
osascript -e 'tell application "System Events" to key code 49 using {command down, option down}'   # ⌥⌘Space, toggle mode
# then, and only then:
grep 'record start' "$HOME/Library/Application Support/<App>/<app>.log" | tail -1
```

Say which of the two you ran. "I tested the whole chain" over a headless run is how an untested view reaches someone
who was watching for it. Related: the UI is rarely the cost — folding a finished pass into the view measured **0.3 ms**
mean and 1.6 ms worst, so when someone says the surface feels slow the answer is upstream (see
`on-device-inference-cost`), not in the drawing code.

## Report the measurement, not the intention

When the surface is confirmed, state the two numbers and the region they came from. "Renders, breathes, 11 %
between two frames half a period apart" is checkable by the next person; "the HUD looks good" is not. And the user
judges pixels themselves — hand them the still rather than describing it.

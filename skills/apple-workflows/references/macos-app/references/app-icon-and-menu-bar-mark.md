# App icon and menu bar mark

## Draw the icon with the app's own drawing code — which, once the mark is shared, is the shared view

Expose a CLI mode and let the icon script call it per size, so the icon's art comes from the app's real
visual code rather than a parallel illustration in a shell script:

```swift
enum IconMark: String, CaseIterable { case orb, core }
```

**If a shared view draws the mark, render _that_ through `ImageRenderer`** — re-deriving the dots in
`CGContext` is the duplication the extraction existed to remove. Keep a hand-rolled renderer only for shapes
the shared view cannot draw (the menu bar silhouette, a custom core-and-halo):

```swift
@MainActor
static func image(_ mark: IconMark, size: CGFloat = canvas) -> NSImage {
    let renderer = ImageRenderer(content: IconView(mark: mark, size: size))
    renderer.scale = 1                        // content is .frame(width: size, height: size)
    guard let cgImage = renderer.cgImage else {
        return NSImage(size: NSSize(width: size, height: size))
    }
    return NSImage(cgImage: cgImage, size: NSSize(width: size, height: size))
}
```

- `renderer.scale = 1` plus a `.frame(width: size, height: size)` on the content is what makes a 32 px
  request a 32 px file.
- Its output is CGImage-backed, so a probe that reads pixels must rasterise it into a rep of its own first.
- From a CLI, wrap the call in `MainActor.assumeIsolated { }`: top-level `main.swift` code is not main-actor
  isolated, so a `@MainActor` renderer will not compile from it.
- The tile-dependent texture hint goes _into_ the shared view (`dotScale:`) — which is the only reason that
  parameter exists upstream.

When you do draw it yourself, in a bitmap rep:

```swift
enum IconRenderer {
    static let canvas: CGFloat = 1024        // Apple's icon grid
    static let bodyInset: CGFloat = 100      // 824 x 824 content
    static let bodyRadius: CGFloat = 185     // the squircle radius macOS expects

    /// Exactly `size` pixels, not `size` points.
    static func image(_ mark: IconMark, size: CGFloat = canvas) -> NSImage {
        let pixels = Int(size.rounded())
        let image = NSImage(size: CGSize(width: pixels, height: pixels))
        guard let rep = NSBitmapImageRep(
            bitmapDataPlanes: nil, pixelsWide: pixels, pixelsHigh: pixels,
            bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
            colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0),
            let graphics = NSGraphicsContext(bitmapImageRep: rep) else { return image }
        rep.size = NSSize(width: pixels, height: pixels)
        NSGraphicsContext.saveGraphicsState()
        NSGraphicsContext.current = graphics
        let ctx = graphics.cgContext                        // NOT the wrapper: no scaleBy here
        ctx.scaleBy(x: CGFloat(pixels) / canvas, y: CGFloat(pixels) / canvas)
        ctx.setShouldAntialias(true)
        draw(mark, in: ctx, pixelSize: size)                // geometry in canvas units;
        NSGraphicsContext.restoreGraphicsState()            // pixelSize is for the hint only
        image.addRepresentation(rep)
        return image
    }

    /// Grow the texture relative to the shape as the tile shrinks.
    static func dotScale(_ base: CGFloat, size: CGFloat) -> CGFloat {
        base * min(4, max(1, pow(512 / max(size, 16), 0.30)))
    }
}
```

CLI modes worth having: `--icon <out.png> <mark> [px]`, `--icon-sheet <out.png>` (every mark at every
size, for choosing), `--status-icon <out.png> [pt]` (the menu bar mark alone).

## Icon script

```bash
for s in 16 32 64 128 256 512; do
  "$BIN" --icon "$ICONSET/icon_${s}x${s}.png" "$MARK" "$s"
  "$BIN" --icon "$ICONSET/icon_${s}x${s}@2x.png" "$MARK" "$((s * 2))"
done
"$BIN" --icon "$ICONSET/icon_512x512@2x.png" "$MARK" 1024   # a 1024 render IS 512@2x
iconutil -c icns "$ICONSET" -o Resources/AppIcon.icns
```

Rendering each size at that size is the whole point: downscaling one 1024 px render loses the small sizes
to averaging. Confirm the result is a real iconset — `iconutil -c iconset AppIcon.icns -o /tmp/x | ls`
should produce ten images.

## Legibility evidence, per size

Do not judge by eye. Composite each size on black and count the mark's pixels:

```python
rgb = np.array(Image.open(p).convert("RGBA")).astype(float) / 255
rgb = rgb[..., :3] * rgb[..., 3:4]           # composite on black
mint = (rgb[..., 1] - rgb[..., 0]) > 0.04    # channel dominance, not brightness
print(rgb[..., 1].max(), mint.sum() * 100 / (size * size))
```

A dotted sphere measured 0.83 brightness and 17–23 % coverage at 512/256/128/64/32/16 once the texture hint
existed; before it, 0.47 at 16 px and a smudge from 64 px down. Every mark in the family should pass this
at every size before you offer it.

## Menu bar mark

- Bar glyphs are drawn at ~18 pt with a 2x rep, with a little air (≈94 % of the box). The system's own
  symbols come back at ~15 pt, so a custom mark wants ~16 pt or the item changes width per state.
- Use a **silhouette**: a core plus a ring, or one clean shape. Dots or hatching merge into a fuzzy disc at
  that size, and a fuzzy disc reads as a rendering mistake rather than a style.
- Set `image.isTemplate = true` for every state, including the tinted ones: `contentTintColor` needs alpha,
  and a black glyph drawn as-is disappears on a dark bar. Assert it per state in a test.
- To preview: composite black-on-light and white-on-dark. Compositing the raw black glyph on a dark bar
  looks broken and is not — templates are tinted by the system, and only alpha survives.

### Choosing a mark: what each shape reads as at 18 pt

Render every candidate at the real size, then magnify with nearest-neighbour (`-filter point -resize 700%`)
and judge _that_ — a preview at 64 pt makes a blob look deliberate.

| shape                                 | reads as                       | verdict                                |
| ------------------------------------- | ------------------------------ | -------------------------------------- |
| three bars, unequal heights           | an audio level meter           | the only one that says "voice"         |
| dot inside a ring                     | a radio button / record button | legible but generic                    |
| ring whose core swells with the level | a record button at rest        | the mechanic is good, the still is not |
| disc with a crescent bitten out of it | a blob                         | meaningless at this size               |
| dot with a tail                       | a comma                        | punctuation, not speech                |
| core inside a _dotted_ ring           | a fuzzy halo                   | the dot-sphere finding again           |
| heavy core inside a very fine ring    | a plain dot                    | the ring disappears                    |

Also measure, per candidate: ink pixel count (a mark at 317 against its neighbour's 512 reads as smaller),
connected-component count (two shapes that should be separate but merge into one are a smudge), and bar
width/height/gap profiles for anything with repeated elements — 6 px bars with 4 px gaps and heights
19/23/21 px is a cadence; three equal bars is a generic equaliser.

### The two rules that keep the family consistent

- **Match the state glyphs' optical size** (16 pt mark against 15 pt symbols), then confirm from the live
  log: the status item's button width should be identical between the idle and the busy states.
- **Composite all states side by side, light bar and dark bar, before showing the user.** It exposes what no
  single mark can: an idle mark too light next to a filled glyph, and a tint that is weak on a light bar.
  The tint choice is a real decision — an orange "working" state is legible on a dark bar and washed out on
  a light one.

## ImageMagick fallback (when the icon is not from app code)

Still fine for a one-off glyph, with two traps:

- Write each stage to its own file. Chaining `-compose CopyOpacity` and `-composite` in one command line
  silently produces the wrong layer order (flat white background, wrong colours).
- `arc x0,y0 x1,y1 a0,a1` uses 0° = east, increasing clockwise, so 180→360 is the bottom semicircle.

## Mark versus name

They are independent decisions, and the user will combine them differently from how you framed them: render
the marks with the app's own renderer as a contact sheet, ask for mark and name in one form, and expect an
off-list answer. Keep any name shortlist checked against real competitors first — see
`naming-and-renaming-an-app.md`.

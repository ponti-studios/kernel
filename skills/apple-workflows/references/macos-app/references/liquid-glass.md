# Liquid Glass on macOS 26/27

Depth for the "Liquid Glass" rules in SKILL.md. Verified against `MacOSX27.0.sdk`.

## The API surface, and where it hides

| API                                                       | module          | since      | notes                                                                                      |
| --------------------------------------------------------- | --------------- | ---------- | ------------------------------------------------------------------------------------------ |
| `NSGlassEffectView`                                       | AppKit          | macOS 26.0 | `contentView`, `cornerRadius`, `tintColor`, `style`                                        |
| `NSGlassEffectView.Style`                                 | AppKit          | 26.0       | `.regular`, `.clear`                                                                       |
| `effectIsInteractive`                                     | AppKit          | **27.0**   | visual response to interaction; default `NO`                                               |
| `NSGlassEffectContainerView`                              | AppKit          | 26.0       | merges nearby glass; `spacing`                                                             |
| `View.glassEffect(_:in:)`                                 | **SwiftUICore** | 26.0       | `glassEffect(_ glass: Glass = .regular, in shape: some Shape = DefaultGlassEffectShape())` |
| `Glass`                                                   | SwiftUICore     | 26.0       | `.regular`, `.clear`, `.identity`, `.tint(_:)`, `.interactive(_:)`                         |
| `GlassEffectContainer`                                    | SwiftUICore     | 26.0       | `init(spacing: CGFloat? = nil)`                                                            |
| `glassEffectID(_:in:)`, `glassEffectUnion(id:namespace:)` | SwiftUICore     | 26.0       | morph/merge between shapes                                                                 |
| `GlassEffectTransition`                                   | SwiftUICore     | 26.0       | `.matchedGeometry`, `.materialize`, `.identity`                                            |
| `GlassButtonStyle`, `.glassProminent`                     | SwiftUI         | 26.0       | button styles that adopt the material                                                      |

**The trap that produced a wrong answer once:** `glassEffect`/`Glass` are in `SwiftUICore.framework`, not
`SwiftUI.framework`. `grep glassEffect SwiftUI.swiftmodule/*.swiftinterface` returns 0 hits and reads as
"SwiftUI has no glass API". Check both modules, and grep the AppKit headers too:

```bash
SDK=$(xcrun --show-sdk-path --sdk macosx)
grep -ril "Glass" "$SDK/System/Library/Frameworks/AppKit.framework/Headers" | xargs -n1 basename
for m in SwiftUI SwiftUICore; do
  grep -c glassEffect "$SDK/System/Library/Frameworks/$m.framework/Modules/$m.swiftinterface" 2>/dev/null \
    || ls "$SDK/System/Library/Frameworks/$m.framework/Modules/$m.swiftmodule/"*.swiftinterface
  grep -c glassEffect "$SDK/System/Library/Frameworks/$m.framework/Modules/$m.swiftmodule/"*.swiftinterface
done
```

## What Apple's guidance requires

From _Adopting Liquid Glass_ (`developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass`):

- "Liquid Glass applies to the topmost layer of the interface, where you define your navigation."
- "Key navigation elements like tab bars and sidebars float in this Liquid Glass layer to help people focus on the
  underlying content."
- "Ensure that you clearly separate your content from navigation elements … to establish a distinct functional
  layer above the content layer."
- "Be judicious with your use of color in controls and navigation so they stay legible."
- "Windows adopt rounder corners to fit controls and navigation elements."

Read together: glass is the navigation layer. Content stays on a solid surface. If a review asks for "the whole
window in glass", quote the second and third lines back — edge-to-edge glass is what the guidance argues against.

## Recipe: a sidebar floating in glass, content solid

The view tree is an `NSHostingView`; nothing about this needs a SwiftUI `App`/`Window` scene, which would only fight
top-level `main.swift` CLI modes.

```swift
// window
w.isOpaque = false                             // or the glass samples the window, not the desktop
w.backgroundColor = .clear
w.titleVisibility = .hidden
w.titlebarAppearsTransparent = true
w.styleMask.insert(.fullSizeContentView)
w.isMovableByWindowBackground = true           // the transparent title bar is no longer a drag handle
w.appearance = NSAppearance(named: theme.isDark ? .darkAqua : .aqua)   // glass resolves against this

// sidebar, inset so it reads as a floating panel
Color.clear
    .glassEffect(.regular.tint(theme.glassTint).interactive(), in: .rect(cornerRadius: 14))
    .padding(.leading, 10)
    .padding(.vertical, 10)
```

**`backgroundColor = .clear` alone is a hole, not glass.** Something has to be behind the window for the material to
sample, and the desktop is the wrong something — another app's text stays legible through the title bar. Host a
backdrop and put the SwiftUI tree inside it:

```swift
let hosted = NSHostingView(rootView: RootView())
let backdrop = NSVisualEffectView(frame: NSRect(origin: .zero, size: windowSize))  // explicit frame!
backdrop.material = .underWindowBackground
backdrop.blendingMode = .behindWindow
backdrop.state = .active

// a scrim over the blur, coloured by the theme: black for a dark scheme, white for a light one
let scrim = NSView(frame: backdrop.bounds)
scrim.autoresizingMask = [.width, .height]
scrim.wantsLayer = true
scrim.layer?.backgroundColor = (theme.isDark ? NSColor(white: 0, alpha: 0.55)
                                            : NSColor(white: 1, alpha: 0.55)).cgColor
backdrop.addSubview(scrim)

hosted.frame = backdrop.bounds
hosted.autoresizingMask = [.width, .height]
backdrop.addSubview(hosted)
w.contentView = backdrop
```

An `NSVisualEffectView()` with no frame leaves the hosted view at zero and autoresizing only fires on resize, so the
app ships a blank window — size it explicitly.

Then: the root must paint **nothing** behind the sidebar on 26+ (a solid root colour means the glass samples that
colour and looks like grey plastic), the content pane keeps its opaque surface, and the sidebar's first row starts
~30 pt down so the traffic lights do not sit on it. Tint the glass near-black (`.tint(_:)`) and give the panel a
1 pt edge from the theme: untinted, it takes the colour of whatever is behind it and stops looking like part of the
app.

`.interactive()` belongs on glass that backs clickable rows; leave static glass static.

## Themes: one palette file, two schemes

Colours do not belong as constants sprinkled through views — the moment a second scheme exists, every hardcoded
`Color.white.opacity(0.07)` is invisible on paper and every call site needs editing. Put the palette in one value
type and make the views read it:

```swift
struct WindowTheme {
    let window, sidebar, glassTint, ink, ink2, ink3: Color
    let accent, accentSoft, brass, line, hairline, control, controlBorder: Color
    let backdrop: Color?      // warmth over the frosted window background, nil for "leave it alone"
    let isDark: Bool          // drives NSAppearance and the scrim colour
}
```

`isDark` is the part worth doing first: the window's appearance decides how the material resolves, and a light panel
beside a dark content pane reads as a rendering bug on a light desktop. Two schemes measured on the same window:

| role                    | dark ("maison")                | light ("parchment")          |
| ----------------------- | ------------------------------ | ---------------------------- |
| ground                  | `#1B1712`                      | `#F7F2E8`                    |
| ink                     | ivory `#F4EEE4` @ .96          | ebony `#1D1A16` @ .92        |
| accent (state only)     | `#E9762B`                      | `#B8491A`                    |
| brass hairlines         | `#C2A268`                      | `#8A6A3B`                    |
| pane mean, measured     | (32,27,22), 78.5 % dark pixels | (242,236,227), 77.6 % bright |
| contrast: ink on ground | 15.4:1                         | 15.5:1                       |
| contrast: accent        | 6.0:1                          | 4.7:1                        |
| contrast: brass rule    | 7.4:1                          | 4.5:1                        |

Three lessons in that table:

- **An accent that works on ebony fails on paper.** `#E9762B` looks right on the dark scheme and lands under 4.5:1 on
  parchment; the light accent has to be deepened to `#B8491A` to clear AA for body text. Light-mode accents are
  always darker than they read in a design.
- **White-alpha strokes vanish on a light ground**, so every hairline, panel edge and divider has to come from the
  theme too — that includes the glass panel's 1 pt edge and any card border.
- **Verify the inversion, don't assert it.** The two schemes should be proper inversions of one palette: compare the
  pane's mean colour and its share of dark-versus-bright pixels. Equal masses (78.5 % dark against 77.6 % bright)
  is what distinguishes a real second scheme from a light skin over a dark app.

## The first attempt, and why it read as ugly

Three defects, each with a measurement that names it. When a screenshot comes back with "it looks ugly", measure it
with PIL rather than describing it — and these are the three to check first:

| symptom                                         | measurement                                                | cause                                                        | fix                                                                           |
| ----------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| another window's text visible at the top        | bright-ink share in the title-bar band (was 8 %)           | clear window with no backdrop                                | `NSVisualEffectView(.underWindowBackground, .behindWindow)` as `contentView`  |
| a washed panel that belongs to no palette       | region mean (was 62,62,76 against a 34,34,36 content pane) | untinted glass sampling the desktop                          | `.tint(near-black)` + a theme hairline edge                                   |
| a rectangle drawn around the whole content pane | count of saturated-blue pixels (was 1341)                  | `.focusable()` on a `ScrollView`, added only to catch Return | drop focusability; `.keyboardShortcut` on the buttons already covers the keys |

All three are execution, not the material — which is worth saying out loud when a user rejects a glass result, because
the alternative reading is "glass does not suit this app".

## What can and cannot be verified

| claim                        | oracle                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| the code path ran            | a log line naming the OS version                                                                                                                                                                                                                                                                                                                        |
| the panel is where you think | overlay render: sidebar occupies `inset … inset+width`, content starts at the right edge of it                                                                                                                                                                                                                                                          |
| the content pane is intact   | still measures 860 × 560 at 2×, content ink 3–7 %                                                                                                                                                                                                                                                                                                       |
| behaviour unchanged          | the full suite                                                                                                                                                                                                                                                                                                                                          |
| **the material itself**      | **capture the window**: `screencapture -x -o -l <CGWindowID> out.png`. A window capture works with no rectangle arithmetic (`-R` is the fragile one — a bad rect says "could not create image", which reads exactly like a permission failure). `ImageRenderer` leaves the glass region fully transparent, so a still is never evidence of the material |

So build a `--window [seconds]` CLI mode that prints `window.frame` and `contentLayoutRect.size` (measure the
window from inside the process), a `--render <out.png> --pane <name>` mode for the panes a still can draw, and say
which half of the look is unverified. Then capture by window id and measure the PNG for the three defect classes
above — that loop closes without the user's screenshot.

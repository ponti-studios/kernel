# Verifying a GUI you cannot screenshot

Two environment limits get mistaken for "the GUI cannot be checked": System Events / AX refuses an
`LSUIElement` app's windows, and a capture _may_ need Screen Recording permission. Both are permission
symptoms, not app bugs — and neither means a visual change is unverifiable. `screencapture -x` for the
whole screen and `screencapture -x -o -l <CGWindowID>` for one window both work here and give pixels you
can measure, so try a capture before concluding there is no oracle. Take the rest of the evidence from
outside the app, or from inside it. Everything here was found by needing it.

## The app rendered at all

- **Menu bar item placed**: at launch, log `statusItem.button?.window?.frame` and `isVisible`. A frame near
  the top of the screen (`y ≈ screenHeight − 24`, e.g. `x=1039 y=1130 w=34 h=39`) proves it rendered.
- **Windows and HUD geometry, live**:
  ```bash
  osascript -e 'tell application "System Events" to tell process "MyApp" to get {position, size} of every window'
  ```
  This returns the HUD panel's geometry as it animates, so you can watch a box collapse (96×96 → 122×47),
  confirm it hid (empty result), and prove an edge stayed anchored. **AX y is top-origin**, so a 49 px
  reduction in height moves the reported top by exactly +49 when the bottom edge is pinned — that is how you
  show the anchor worked rather than asserting it.

## The app is running the code you just wrote

- **Verify the installed binary, not the build product.** `codesign` rewrites the executable, so the built copy
  and the bundled copy always differ in hash — comparing them reads as a stale install when it is not. Check
  mtimes, or better:
  `strings /Applications/App.app/Contents/MacOS/App | grep "<UI string you just added>"`.
- **Status-item menus are not reachable by script at all.** For an `LSUIElement` app,
  `tell application "System Events" to tell process "X" … menu bar item 1 of menu bar 1` fails with an
  invalid-index error, so menu contents cannot be read or clicked that way — and the Accessibility API makes no
  difference: a process reporting `AXIsProcessTrusted() == true`, with `AXExtrasMenuBar` listed among the app
  element's attributes, gets no value from it (`AXError -25212` app-side, `-25205` from
  `AXUIElementCreateSystemWide()`), with and without activating the app first. Clicking blind at screen
  coordinates risks toggling something else in the bar. Rely on compile-checked `#selector` (a typo will not
  compile), the titles appearing in `strings`, and log lines from the actions — put the item's _enablement_
  behind a small pure type you can unit-test, and report the click itself as unverified rather than implying you
  saw it work.
- **Attribute a log line to the process that wrote it.** One binary serves both the app and the CLI, and both
  write the same log file, so your own `--transcribe` proof shows up as an app-shaped line
  (`parakeet parakeet-ultra text=97 chars confidence=1.00 audio=5.5s`) — read a line as app behaviour only after
  ruling out your own runs. And grep for the _distinguishing_ word instead of tailing a fixed number of lines:
  `tail -4` hid the very line that proved the new code had run, twice, because the following lines arrived a
  second later.
- **Validate a cached fixture before judging anything against it.** A harness that reuses generated media from
  an earlier run can measure the wrong file: a `prose.wav` left behind by a manual experiment was judged against
  forty sentences it did not contain, which read as an engine dropping most of its input. Regenerate the source
  text every run, give fixtures names that nothing else writes beside (an input's sidecar can be deleted by the
  tool that read it), and compare the loaded artefact against its source — duration, word count — before
  trusting a cached one.
- **A redirected CLI's stdout is fully buffered.** `MyApp --long-job > out.log` shows nothing until the process
  exits, which looks like a hang; poll the process, not the file.

## The behaviour, end to end

- **Drive the real hotkey** with audio actually in the room:
  ```bash
  osascript -e 'tell application "System Events" to keystroke " " using {option down, command down}'
  say -v Samantha "Testing the shared engine now."
  osascript -e 'tell application "System Events" to keystroke " " using {option down, command down}'
  ```
  Then read the log for the chain and the artifact for the result (the note's text), not just for "record
  stop". Count off the log lines: start → stop → engine → transcribed. A run missing the transcription line
  is not yet a verdict.
- **A slow or missing transcript on the first run is the engine warming up, not a regression.** A new ANE
  model specialises for ~23 s at launch, so a recording that finishes before the preload line appears is
  transcribed late (9.6 s instead of 0.2 s) or looks like it never happened. Wait for the load-complete line,
  then re-run before drawing a conclusion about a capture or engine change.
- **If a transcript seems to clip the first words**, check the WAV itself before blaming the recorder:
  `ffprobe` duration plus `-af silencedetect=noise=-38dB:d=0.25`. Test-harness timing is the usual cause.
- **When a scripted run comes back empty, measure the audio the app kept before blaming the app.** `say`
  reaches the microphone through the speakers and the room, so the _harness_ can fail while the app is fine
  (output routed to headphones, volume down, the stop key arriving before the speech). `afinfo <file>` gives
  format and duration; `ffmpeg -i <file> -af volumedetect -f null -` gives mean/max dB. Around −70 dB means
  the microphone heard the room, so an empty transcript is the correct result — and keeping the audio on an
  empty transcript is designed behaviour, not a leak. **Clipping is the other failure at the loud end**: mean
  −27 dB with `max_volume: 0.0 dB` saturates, and a saturated recording also transcribes empty, so lower the
  output volume for a scripted dictation and restore it afterwards. The same command is free proof of the
  capture contract from the _shipped_ app: `Data format: 1 ch, 16000 Hz, Int16` is the format every local ASR
  engine wants, verified outside the unit tests.

## Reading a system privacy pane

`~/Library/Application Support/com.apple.TCC/TCC.db` is unreadable without Full Disk Access, so when the
question is "is it actually granted?" the pane itself is the evidence:

```bash
osascript -e 'tell application "System Settings" to activate'
osascript -e 'tell application "System Events" to tell process "System Settings" to get {position, size} of window 1'
screencapture -x -R<X>,<Y>,<W>,<H> pane.png     # -R takes top-origin screen coordinates, the AX frame is
                                               # returned as position,size — convert, and expect 2x pixels
```

Then read the image: which apps are listed, and which toggles are on. **A toggle reading ON is not evidence
that the app has the permission** — a grant binds to a code signature, so the row can sit enabled and be
unusable after a rebuild. The app's own `AXIsProcessTrusted()` at runtime is the authority, and its log is the
history.

Two questions the pane alone cannot answer, and how to settle them:

- **"Are there multiple copies of the app?"** Spotlight answers by name and by bundle id, and each copy's
  identity decides whether it shares the grant:
  ```bash
  mdfind -name "MyApp.app"
  mdfind "kMDItemCFBundleIdentifier == 'com.example.myapp'"
  ps -eo pid,lstart,command | grep -i "MyApp.app/Contents/MacOS" | grep -v grep   # which one is running
  for a in $(mdfind -name "MyApp.app"); do codesign -dv --verbose=2 "$a" 2>&1 | grep -E 'Identifier|TeamIdentifier|flags='; done
  ```
  Identical `CodeDirectory … size=… hashes=…`, team and flags across copies means one binary at two paths
  (a build output beside the installed copy) — harmless, because TCC keys on the requirement, not the path.
  Different sizes or teams means you are looking at two different apps.
- **Was the grant made _after_ the running process started?** Compare `ps -p <pid> -o lstart=` with the time
  of the last grant. A grant picked up mid-session is possible, so try the feature once before ordering a
  relaunch; restart only if the app keeps reporting itself untrusted.

## Proving a key is _not_ swallowed

A key the app grabs transiently must not keep eating it once the mode ends. With the app idle, type into a
text sink and read the document back:

```bash
osascript <<'OSA'
tell application "TextEdit"
	activate
	if (count of documents) = 0 then make new document
	set text of front document to ""
end tell
delay 1.5
tell application "TextEdit" to set got to text of front document
return "[" & got & "]"
OSA
```

Send the keystrokes from a separate `tell application "System Events"` block after the activate delay — a
`keystroke` sent before the window is frontmost is dropped silently and reads as an empty document, which
looks like a swallowed key when it is a timing bug. `[AAAA\nBBBB]` (typed `AAAA`, Return, `BBBB`) proves the
key arrived at the other app; `AAAABBBB` proves the app is holding it. The same sink verifies a paste:
dictate, then read the document text instead of trusting the HUD.

- **An unexplained recording or clipboard change is usually the user, not a stray process.** They work at
  the same machine while you do: they press the hotkey, dictate, copy text and click things, so the log will
  show runs you did not trigger and the clipboard will hold text you did not put there. Check for a second
  process (`ps -Ao pid,etime,comm | grep -i <app>`) before calling it a ghost, and treat a dictation that
  transcribed correctly as evidence the shipped build works.
- **TCC gotcha**: a CLI binary spawned by an agent/terminal inherits the _parent's_ microphone permission, so a
  bare binary reporting `microphone access denied` does not mean the bundled app is broken. Ask for the
  microphone once at first launch (a `didPromptMic` default flag) rather than mid-sentence later.

## An animation, frame by frame

Build the verification into the app rather than trying to capture the screen:

- **An offscreen render CLI.** `--hud-render <out.png> <state> [t]` draws one frame; `--hud-strip <out.png>`
  draws a whole lifecycle as a contact sheet — _the app's own renderer_, not a mockup. Give the content view a
  `drawContents(in:)` that takes a context so the same code renders offscreen, render at 2x into an
  `NSBitmapImageRep` for legible output, and approximate the blur material with a solid fill.
- **Measure the renders, don't just look at them.** Count pixels or bounding boxes with ImageMagick to prove a
  scale change: a 15 % throb measured 160 px against 139 px troughs. A vision model _cannot_ judge a 15 % size
  difference between non-adjacent frames and will report the animation as flat when it is not.
- **Sample animation peaks correctly.** A throb or sine pulse peaks at `start + (n + 0.5) * period`, not at
  `n * period`. Sampling at the period starts labels the _troughs_ as peaks — put a trough frame next to a
  peak in any contact sheet so a reader can see the amplitude, and say so in the caption.
- **Check every keyframe cell rendered.** A frame sampled where alpha ≈ 0 is indistinguishable from a broken
  drawing path; retime it and include the label ("trough", "fading") so the sheet explains itself.

## What the log says about how the app is actually used

An on-device app has one source of usage data: its own log. Mine it before proposing features — and keep your
own test runs out of the summary.

- **Join a recording to its result by the filename, not by timestamp.** `record start … file=X`, `record stop
  file=X duration=…`, then the engine line between them is the record to group on. The log's stop time and the
  file's own `rec-<start-time>.wav` are different instants: matching on the timestamp you read off an empty
  result reports the audio as missing when it is sitting right there.
- **Classify every empty result by reading the kept audio, or you will fix the wrong thing.** `ffmpeg -i <wav>
  -af volumedetect -f null -` separates three causes that look identical in the log: mean −57 dB or lower is a
  silent input (device asleep, or routed elsewhere), around −45 dB with real peaks is speech too faint for the
  decoder, and −27 dB with `max_volume: 0.0 dB` is your own clipped `say` run. Each needs a different fix; none
  of them is post-processing.
- **Say which of those a number is.** "10 of 14 came back empty" reads as an app defect; the same runs
  classified read seven silent input, two too faint, one the agent's clipped test. Never quote the raw figure
  as user experience, and never let your own scripted runs into it.
- **Test the fix you are about to recommend.** Gain-normalising the faint recordings to −3 dBFS and re-running
  them through both engines produced nothing on either — whisper large-v3-turbo answered a lone `.` and `-`,
  and hallucinated `*knock knock*` on the clipped one. That negative result is the finding: neither engine
  recovers these, so the fix belongs at capture time (warn while the level is too low), not after it.
- **`--transcribe` prints the transcript to stdout and its progress to stderr**, so `2>/dev/null` leaves the
  text alone and empty stdout _is_ an empty transcript. That is what makes "did this engine get anything out
  of this file" a one-line loop over every recording the app kept.

## Exercising a path that needs something not installed

The honest test for a first-run or optional-download branch is to remove the download, which costs the user
their working install. Do this instead.

- **Find where the data actually lives before assuming it is yours.** A third-party SDK often caches outside
  your app's Application Support — FluidAudio keeps Parakeet under
  `~/Library/Application Support/FluidAudio/Models`, not under the app's own folder, so "delete the app's models"
  would have removed the wrong thing.
- **Prefer a variant that was never fetched to a deletion.** With `ultra` and `v3` present, selecting `v2` is a
  genuine not-installed case: write it through the same default the UI writes
  (`defaults write <bundle-id> <modelKey> v2`), relaunch, and watch the flow start.
- **Snapshot the directory, then remove only what appeared.** `ls <dir> > before`, and again into `after`, then
  `comm -13 before after` names exactly the partial download to delete. Restore the setting, relaunch, and
  verify by the _normal_ path working again — a dictation transcribing at full confidence with no readiness
  line in the log — rather than by reading the setting back.
- **The interrupt is the assertion**, not the download finishing: a press during the fetch must appear in the
  log as declined, be shown in the pill, and leave nothing behind on disk.

## Measuring a HUD in a live screen capture

The offscreen render is the primary evidence — it is the app's own renderer and it is measurable. For "and on
screen?", a capture works if you locate the element deliberately.

### Capture the window by id, not by rectangle

`screencapture -R <x>,<y>,<w>,<h>` answers "could not create image from rect" when the rectangle is off — and it
is easy to be off, because the window server reports bottom-origin frames while `-R` takes top-origin screen
coordinates, and the capture is 2x. `-x` (whole screen) and `-l <CGWindowID>` both work, and capturing by id needs
no coordinates at all and is unaffected by whatever else is on the display:

```bash
swift scripts/window-id.swift Ponte          # id=27070 layer=0 owner=Ponte x=470 y=182 w=860 h=560
screencapture -x -o -l 27070 /tmp/window.png # just that window, at 2x, shadow omitted
```

The id comes from `CGWindowListCopyWindowInfo`, reachable only from Swift here — PyObjC's `Quartz` module is absent
from `/usr/bin/python3`. Layer 0 is the ordinary window layer; other layers are panels and overlays. This is also
the only way to see what a _material_ actually renders as: `ImageRenderer` draws nothing for vibrancy or glass.

### Read the capture as defect classes, not as a picture

One filename plus a few PIL measurements turns "it looks ugly" into named bugs, which is the difference between a
fix and another guess:

| measurement                                                        | what it means                                                                                                              |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| bright-ink share in the title-bar band (`r+g+b > 420`)             | 8 % meant another app's text was legible **through** the window — the window was transparent with no backdrop, not frosted |
| count of saturated-blue pixels (`b > 150`, `b-r > 60`, `b-g > 30`) | 1341 meant an AppKit focus ring around a whole pane, from making a list `.focusable()` to catch Return                     |
| mean colour of sidebar against content pane                        | (62,62,76) against (34,34,36) meant untinted glass sampling whatever sat behind it                                         |
| first x where the content surface's colour appears                 | proves an inset or a rail actually moved the content edge                                                                  |

All four were present in one build that had been described as verified. Geometry passing says nothing about any of
them, so capture before claiming a visual change works, and quote the numbers when asking the user to look again.

- **Locate by the app's own distinctive ink, not by darkness.** A HUD box's centre column is full of the orb's
  tinted dots, so searching for the longest dark run finds the wallpaper above the box and reports a clearance
  for the wrong rectangle. Threshold on the tint instead (`g - r > 25`, `b - r > 18`, bright) and take the ink's
  bounding box: the orb is centred in the box, so one known offset from its top ink row yields the box's own
  bounds.
- **Check a crop's dimensions against the element before reading anything off it.** A heuristic that caught
  1040 px of desktop rather than the box produced a confident visual verdict about the box's spacing from a
  picture that did not contain it. If the crop is not the size the element should be, the crop is the finding.
- **Convert once, in one place.** `-R` takes top-origin screen coordinates while the window server reports
  bottom-origin AX frames, and the capture is 2x: derive the box's screen position from the screen height and
  the panel's inset, then convert every measurement back to points with a single named factor.

## What it costs while idle

A menu bar app is judged on its idle footprint as much as its features, and `ps` will mislead you about it:
`ps -o %cpu` reports a **lifetime average**, so a process that transcribed once reads 6 % while doing nothing.

```bash
top -l 2 -pid <pid> -stats pid,cpu,mem,threads -n 1     # the second sample is the live figure
ps -o rss= -p <pid>                                      # KB resident
```

Take both readings before and after a change, and treat "7 threads and a few per cent while idle" as worth one
look rather than a fact: an audio engine left open is the usual cause, and releasing it also clears the
system's microphone-in-use indicator, which is a trust signal as much as a battery one.

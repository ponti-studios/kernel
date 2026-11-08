# Naming an app, and renaming a shipped one

## Choosing the name: check the category first

The obvious names in a product's own semantic zone are usually already taken by direct competitors, and
that is worth knowing _before_ proposing anything. Search per candidate with the category word attached:

```
web_search('"<Name>" dictation OR transcription OR "voice to text" OR macOS app')
```

Read for same-category apps, not just any hit. A same-name product in another field (a music practice app,
a photo filter) is survivable; a dictation app with the name is not. Report what you found: "every
quiet-voice word is taken" is a useful finding, not a failed search — and when the semantic zone is
saturated, derive the shortlist from the _mark_ instead.

Also flag names that are merely confusable with a direct competitor: a one-word difference from an existing
competing feature reads as a knock-off even when the string is free.

**Never put a platform in the name of a package that will outlive that platform.** A suffix like `-ios` is a
claim about where the code runs, and the code is usually more portable than the day it was written: a
voice-orb package written for a phone is soon used by a Mac app too, and then the name is simply false in
every import list, every manifest and every README. Name it for what it _does_ (`Waveform`, `Capture`), or for
the modules it ships (`WaveformCore`, `WaveformUI`, `WaveformCapture`) — never for the first device that
needed it. The user will spot this before you do and will be right; renaming a published package is cheap
while GitHub redirects the old URL, and gets expensive once anything else depends on it.

## Rename checklist (ordered)

1. Replace in this order, or you create new compounds: derived plurals first (`VoiceNotes` → `Ponte`), then
   the bare name (`VoiceNote` → `Ponte`), then lowercase ids and paths (`voicenote.log` → `ponte.log`,
   `com.ponti.voicenote` → `com.ponti.ponte`, any `SIGN_ID` env var).
2. `git mv` the target directory; update the SwiftPM package name, target name and `path:`.
3. `Info.plist`: `CFBundleExecutable`, `CFBundleName`, `CFBundleDisplayName`, `CFBundleIdentifier`, and the
   usage-description strings the user actually reads.
4. Build script: bundle/app name, `cp .build/release/<Binary>`, the `codesign --identifier`, the quit and
   `pkill` patterns, the `/Applications/<App>.app` install path.
5. Data: quit both apps, then `mv` the support directory (models — gigabytes) and the output folder on the
   same volume. Move, never recreate: a re-download of a multi-GB model set is a bad surprise.
6. Settings: `defaults export <old-id> - > /tmp/old.plist && defaults import <new-id> /tmp/old.plist`.
   Per-key `defaults write` loses types (a bool becomes the string `"1"` and reads back wrong).
7. Rename the repo directory, delete the stale `dist/<OldName>.app`, and commit the rename on its own so it
   cannot hide a behaviour change in the same diff.

## What a new bundle id costs

TCC is keyed by bundle id, so a rename is a permission event — but not uniformly:

- **Microphone**: granted to the new id without a prompt when the app was signed with the same certificate.
  Verify by recording, not by assuming either way.
- **Accessibility**: not granted. The app must be re-granted in System Settings; a well-behaved app already
  degrades quietly (clipboard instead of paste, one notification per launch, one log line). Point the user at
  the menu item that raises the prompt, and offer the escape hatch: pointing the bundle id back at the old
  value restores the old grants instantly, since only the display name would stay changed.
- Keep the old `.app` installed as a fallback until the new one has done a real end-to-end run.

## Verifying the rename

- Run the real workflow, not a CLI dry run: dictate, then confirm the note landed in the _new_ folder and
  the log shows the models were **found**, not re-downloaded (`installed=true`).
- Check the installed bundle, not just the source:
  `/usr/libexec/PlistBuddy -c Print :CFBundleIdentifier /Applications/App.app/Contents/Info.plist`, and that
  the shipped `AppIcon.icns` expands to ten images.
- **When a log shows an event you did not trigger, look for a second running instance and read every log
  file in the support directory before calling it a bug.** After a rename the previous build's log sits
  beside the new one, and the user may simply be pressing the hotkey at the machine while you work —
  `ps -Ao pid,etime,comm | grep -i <app>` plus the older log settles it in one command.

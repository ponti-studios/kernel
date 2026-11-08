# One signing identity, and what TCC grants bind to

## The rule

Sign every build of an app — development, test, release — with the same certificate. For anything
distributed outside the App Store that is the Developer ID Application certificate: never alternate
with an Apple Development one, never ad-hoc.

## Why

macOS binds a permission grant (Accessibility, Microphone, Documents…) to the app's **designated
requirement** — not to its name, path or bundle identifier. So:

- An **ad-hoc** signature (`--sign -`) carries a requirement that is a bare cdhash. Every rebuild
  produces a different one, so every grant is invalidated on every build.
- A **development certificate** adds the marker `…100.6.2.12`, which a Developer ID build does not
  carry. Alternating between the two therefore voids the grants in _both_ directions.

A team-anchored requirement is stable across builds and survives updates:

    identifier "com.example.app" and anchor apple generic and certificate leaf[subject.OU] = TEAMID

## The symptom is silent

System Settings keeps showing the toggle as **on** while it applies to nothing, with no prompt and no
error. An auto-pasting app quietly falls back to the clipboard; a recorder receives nothing at all.
Never conclude "the permission is granted" from the toggle — ask the running process.

## Diagnose

    codesign -d -r- /Applications/App.app            # the requirement actually in force
    codesign -dv --verbose=2 /Applications/App.app   # TeamIdentifier, flags=…(runtime)

Grep the requirement for `anchor apple generic` and the team ID. If either is missing, that is the
fault. `codesign -d --entitlements` confirms what the app asked for.

## Rule out a second copy before blaming the signature

An app that re-prompts, or refuses a grant the pane shows as on, is often not the build you think is
running:

    mdfind "kMDItemCFBundleIdentifier == 'com.example.app'"        # every copy on the disk
    ps -eo pid,lstart,command | grep -i 'App.app/Contents/MacOS'   # the one actually running
    codesign -dv --verbose=2 <each copy>                           # TeamIdentifier + flags per copy

A stale copy elsewhere (a `dist/` build, an old drag-install) shares the bundle id and can be the one
holding the grant, while the copy you just rebuilt is the one answering. Compare the `TeamIdentifier`, the
`flags=…(runtime)` line and the CodeDirectory size: identical values mean one binary at two paths —
harmless, and worth saying so rather than deleting something. Also check the process start time against
when the grant was made: a process that predates the grant is answering from a cached decision.

## Repair, from the app

Ship a menu item that clears the dead entry and asks again, so the new grant binds to the build that is
actually running. Toggling the stale entry off and on in System Settings does not repair it:

    /usr/bin/tccutil reset Accessibility <bundle identifier>
    AXIsProcessTrustedWithOptions([kAXTrustedCheckOptionPrompt: true] as CFDictionary)

Spawning `/usr/bin/tccutil` as a child process is fine under the hardened runtime; what the runtime
forbids is loading unsigned code _into_ the process.

## Guard the build

Fail the release script when the requirement is not team-anchored, and print the requirement either
way, so a changed identity shows up in the build log instead of being discovered by a customer:

    req="$(codesign -d -r- "$APP" 2>&1 | grep -i '^designated')"
    grep -q 'anchor apple generic' <<<"$req" || { echo 'not team-anchored'; exit 1; }

## Verify the fix by rebuilding

Grant, then rebuild and reinstall — a different binary, same identity — and confirm the grant still
applies with no re-granting. That property (grants that survive updates) is the point, and it is cheap
to check: one dictation or one ⌘V into an empty document.

A fresh grant can take effect **without relaunching** — a feature that failed a minute earlier can succeed
in the same running process once the new entry exists. Retry once before telling the user to quit and
reopen, and before concluding the grant did not take; restarting is not the fix for every case, and a
premature "it needs a restart" sends them the wrong way.

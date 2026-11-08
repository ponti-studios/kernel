---
name: macos-app-distribution
description: Use when shipping a macOS app outside the App Store.
license: MIT
metadata:
  author: project
  version: "1.0"
  hermes:
    tags: [macos, distribution, dmg, notarization, codesign, licensing]
    related_skills: [macos-menubar-swift-app, python-package-release]
---

# Shipping a macOS app outside the App Store (DMG + Developer ID + notarization)

> Invoke with: the app to package, or the Gatekeeper/notarization problem.

## When to use

- turning a built `.app` into a DMG a buyer downloads from a website
- signing for distribution, notarizing, stapling, or diagnosing a Gatekeeper refusal
- deciding how a paid macOS app is sold or licensed (merchant of record, licence keys)

## Check the identity before promising anything

Three signatures, and only one of them ships:

| signature                    | valid for                                                    |
| ---------------------------- | ------------------------------------------------------------ |
| `codesign --sign -` (ad-hoc) | local testing only; its cdhash requirement breaks TCC grants |
| `Apple Development`          | your machine; not distributable, not notarizable             |
| `Developer ID Application`   | what a buyer's Mac accepts, and what notarization needs      |

```bash
security find-identity -v -p codesigning \
  | sed -n 's/.*"\(Developer ID Application:[^"]*\)".*/\1/p' | head -1
```

The `(TEAMID)` in that name is not necessarily the team on the development certificate — read it from
here and use it for `notarytool`, since that is the identity TCC and notarization key on.

**The common name is not the team; the OU is, and the CN can carry a person's name for a company team.** A
Developer ID certificate issued to an org team can still read `Developer ID Application: Jane Doe (TEAMID)`.
Reading the CN is how a session concludes an app ships under a personal account when it ships under the
company — and it decides which team a signing identity and a notary credential must belong to. Match ids, not
names:

```bash
defaults read com.apple.dt.Xcode | grep -nE "teamID|teamName|teamType"
```

`teamType = Company` separates the shipping team from a `Personal Team` that may also be on the machine, and
the OU in `codesign -d -r-` is the authority on which one signed.

**One identity, forever — the designated requirement is what keeps a customer's permissions.** A grant binds
to the requirement, not to the bundle id or the name, so that line decides whether an update keeps the user's
Accessibility and Microphone grants. Read it back after signing and require the team-anchored form:

```bash
codesign -d -r- App.app
# want: identifier "com.example.app" and anchor apple generic and certificate leaf[subject.OU] = "<TEAMID>"
```

Two arrangements look fine in `codesign -dv` output and are not: an ad-hoc signature's requirement is a bare
`cdhash` (a new one every build), and a **development certificate's requirement adds
`certificate 1[field.1.2.840.113635.100.6.2.12]`, which a Developer ID build does not carry** — so a dev script
that prefers `Apple Development` while the release script signs with Developer ID clears every grant each time
it flips, in both directions, while System Settings goes on showing the toggle as ON. The user experiences it
as a feature that silently degrades (paste becomes a copy), never as an error.

Enforce it in the scripts, not by care: a check that reads the requirement and exits non-zero unless it is
team-anchored, a warning in the dev build path, and a **refusal to package** in the release path. The check
itself is ready to drop in — `scripts/check-signature.sh <app> [team-id]`, which reads the team off the app
when you do not pass one, prints the requirement either way, and exits non-zero on an ad-hoc or development
signature. Ship the
repair in the app too — a menu action that resets the stale entry (`tccutil reset Accessibility <bundle-id>`)
and re-asks so the new grant binds to the running binary. Then prove it: rebuild and reinstall a different
binary with the same identity and exercise the feature with no re-granting. That is what makes "updates will
not break a buyer's permissions" a checked claim instead of a hope.

## Procedure

1. **Build** release for arm64 (or universal), and copy any SwiftPM resource bundles **and dynamically linked
   frameworks** (Sparkle, for updates) into the `.app`. A SwiftPM executable links `@rpath/Sparkle.framework/...`
   but its default rpath is `@loader_path` (`Contents/MacOS`), so the framework lands in `Contents/Frameworks`
   and is invisible to dyld unless the rpath is fixed (see the Sparkle subsection below).
2. **Sign with the hardened runtime** — not optional, `notarytool` rejects a build without it:

```bash
codesign --force --options runtime --timestamp \
  --sign "$DEVID" --identifier <bundle-id> \
  --entitlements Resources/App.entitlements App.app
```

- `--timestamp` contacts Apple so the signature stays provable after the certificate expires.
- Declare what the hardened runtime gates in the entitlements file even when the app is _not_
  sandboxed — for a mic app, `com.apple.security.device.audio-input`.
- Read the result back, do not assume it: `codesign --verify --strict --verbose=2` plus
  `codesign -dv --verbose=4` should show the full `Authority=` chain and `flags=0x10000(runtime)`.

3. **Stage the image**: the app, an `/Applications` symlink, `.VolumeIcon.icns` (copy the app's own
   `.icns`, then `SetFile -a C` on the staging directory), and a plain-text read-me.
4. **Create the DMG** — `UDZO` is the compressed read-only distribution format:

```bash
hdiutil create -volname <Name> -srcfolder "$STAGE" -ov -format UDZO -quiet dist/<Name>-<version>.dmg
```

5. **Notarize and staple — twice, and sign the image as well.** Submitting only the disk image notarizes the
   app inside it but staples nothing to either: the copy the buyer keeps carries no ticket, and the image has
   no signature of its own for Gatekeeper to assess. Do both, in this order.

```bash
# 1. the app, as its own submission, so its staple travels with the copy in /Applications
ditto -c -k --sequesterRsrc --keepParent App.app dist/App.zip
xcrun notarytool submit dist/App.zip --keychain-profile <profile> --wait
xcrun stapler staple App.app                    # staple BEFORE the image is built around it
rm -f dist/App.zip

# 2. the image: create, SIGN, submit, staple
hdiutil create -volname <Name> -srcfolder "$STAGE" -ov -format UDZO -quiet dist/<Name>-<version>.dmg
codesign --force --timestamp --sign "$DEVID" dist/<Name>-<version>.dmg
xcrun notarytool submit dist/<Name>-<version>.dmg --keychain-profile <profile> --wait
xcrun stapler staple dist/<Name>-<version>.dmg && xcrun stapler validate dist/<Name>-<version>.dmg
```

An **unsigned** image is rejected outright (`rejected, source=no usable signature`) however well signed the
app inside it is, and "the app is signed" is not the same claim as "the download opens".

The credential profile is created **by the user**, with their own hands — never pass a secret through a
script or ask for one in chat. Offer the team key first: it belongs to the team, needs no password, and it is
the answer the moment someone objects to putting an app-specific password on a personal Apple ID.

```bash
# App Store Connect → Users and Access → Integrations → Team Keys → + (role: Developer); the .p8 downloads once
xcrun notarytool store-credentials <profile> --key AuthKey_XXXX.p8 --key-id XXXX --issuer <issuer-id>

# or an Apple ID with an app-specific password; omit --password and it prompts, so nothing lands in history
xcrun notarytool store-credentials <profile> --apple-id <id> --team-id <TEAMID>
```

Check it before relying on it — `xcrun notarytool history --keychain-profile <profile>`, where "No
submission history." is the success case for a fresh profile. Give the user the exact command and wait;
this is the one step an agent cannot complete alone. 6. **Print Gatekeeper's verdict — on the image, and do not soften it:**

```bash
spctl -a -t open --context context:primary-signature -vvv dist/<Name>-<version>.dmg   # what a download is
spctl -a -vvv -t install App.app                                                      # the copy inside
```

Read the `source=` line rather than the word `accepted` alone: `Unnotarized Developer ID` means signed but
not notarized, `no usable signature` means the _image_ is unsigned (sign it, then resubmit), and
`Notarized Developer ID` is the only verdict that means a buyer can double-click it. 7. **Verify inside the mounted image**, not just the built copy:

```bash
MOUNT=$(hdiutil attach dist/<Name>.dmg -nobrowse -readonly | tail -1 | awk '{print $3}')
codesign -dv --verbose=4 "$MOUNT/<Name>.app"
codesign -d --entitlements - "$MOUNT/<Name>.app"
codesign --verify --strict "$MOUNT/<Name>.app"
hdiutil detach "$MOUNT" -quiet
```

`hdiutil attach` is deprecated in favour of `diskutil image attach` but still works. Validate the app's own
staple while it is mounted (`xcrun stapler validate "$MOUNT/<Name>.app"`): an app notarized only through its
image has nothing stapled to it and must reach Apple on first launch. The whole battery is in
`scripts/verify-distribution.sh`, which complements `scripts/check-signature.sh` — that one reads a local
app's requirement, this one assesses a shipped image.

## Pitfalls

- **A release can pass its own check and fail a buyer's.** A build that signs the app, notarizes the image and
  prints `accepted, source=Notarized Developer ID` is describing the _app_, because that is what it assessed.
  Gatekeeper assesses the **disk image** when somebody opens a download, and an unsigned image is rejected
  outright however well signed its contents are; notarizing only the image staples nothing to the app the buyer
  keeps. Assess the artefact the buyer touches — ideally a quarantine-tagged copy, which is what a browser
  download actually is — and never treat a script's own success message as evidence: `scripts/verify-distribution.sh`.
- **A dynamically linked framework in the bundle is the thing that actually kills the app, and notarization
  cannot see it.** `spctl` and `stapler validate` pass on a signed, notarized, stapled app that dies in dyld
  before it can open, because the framework's rpath is missing or its nested code is unsigned. Three separate
  bugs hid behind one "rejected at launch" symptom: (1) the packaging script copied the resource bundles but
  not the framework; (2) it signed the framework's outer bundle but not the Mach-O binaries inside its XPC
  services, because passing the identity's _name_ to `codesign` produced ad-hoc signatures on this toolchain —
  use the certificate _hash_; (3) the binary's rpath did not include `@executable_path/../Frameworks`, so dyld
  looked in `Contents/MacOS` and gave up. **Launch the published artefact** — a quarantined copy, directly,
  with stderr visible — before telling anyone it works. `spctl` is not evidence that the app runs.
- **`--notarize` is a two-part step and the second part has a human in it.** Script the submit/staple, but
  hand over the `store-credentials` command; a script that tries to own the password is the wrong shape.
- **A hardened build is a different artefact from the one you have been testing.** Re-verify it end to end
  on the distribution build: launch, hotkey, and a real capture. For a CoreML/ANE app the load still works
  (measured 0.2 s on the Neural Engine under the hardened runtime), but that is a fact to check, not to
  assume.
- **A distribution build signed under a different team than the dev build can re-prompt locally for TCC
  grants.** Say so when you install it, and tell the user a customer seeing the microphone prompt once is
  normal behaviour rather than a bug.
- **The DMG holds no model weights.** If the app downloads a large model on first launch, that belongs on
  the product page and in the read-me inside the image, or the first run looks like a hang.
- **Keep the replace and the proof in separate commands.** Installing over `/Applications/<App>.app` is a
  destructive step, so it draws an approval prompt; bundling `rm -rf` of the bundle together with the read-only
  checks that would verify the result (version, `spctl`, `stapler validate`) means a declined or timed-out prompt
  swallows the checks too, and you learn nothing. Verify first from the mounted image, then do the replace on its
  own, then read the installed bundle back. Prefer `ditto` over an existing bundle to copying into a removed one:
  fewer ways to leave the machine with no app at all.
- **An untouched `dist/` is a lie by the time you finish.** Rebuild the image after the last code change,
  and keep the build script as the single path — `--install` running the same signed build into
  `/Applications` is what stops the local app drifting from what ships. **And make `--install` verify
  itself.** "Installs the build" and "installed the build" are different claims: a running process cannot
  have its executable replaced, so an `osascript … to quit` whose failure is swallowed (`|| true`) leaves the
  previous app in place while the script reports success — and then every later "verified live" claim
  exercises the old binary. Wait for the process to actually exit (poll `pgrep`, then `pkill -9`), copy, and
  compare the installed executable with the staged one (`cmp -s`), exiting non-zero when they differ. Check
  before trusting a live test as well:
  `strings /Applications/App.app/Contents/MacOS/App | grep "<a string unique to the change>"`.
- **GitHub release on an empty repo fails.** `gh release create` returns 422 "Repository is empty" until
  there is at least one commit on the default branch; push a README (or the site) first, then tag.

- **A Pages-hosted feed or site only rebuilds from the default branch.** Commits on a feature branch —
  even ones that are later merged — do not trigger a Pages rebuild, and the live URL keeps serving the
  old commit. Push the feed or site change to `main` (or whatever the Pages source branch is), then poll
  the live URL with a cache-buster until the new version appears. A local `git log` showing the commit is
  not evidence that the live page has it; only the live response is.

## Where the source lives, and pushing it

**Resolve a remote by its contents, not its name.** A repo named exactly after the product may be the
marketing site: `gh repo view <owner>/<product>` plus `git ls-tree --name-only origin/main` shows
`index.html`, screenshots and a promo video where you expected `Sources/`. An app's history pushed at that
repo fails on unrelated histories, and forced, replaces the site. Check the tree, the commit subjects and the
visibility before adding a remote.

- **Follow the user's own pattern instead of inventing one — unless they ask to consolidate.** The standing
  pattern is paying products private, shared libraries public (`waveform-ios`, `voice-orb`), and a `<name>-macos`
  suffix for a macOS app whose bare name is taken by its site. Folding the app into the public site repo is the
  request that overrides it, and it is a one-way door: say plainly what becomes public (source, history,
  issues) before pushing, scan the history for keys first, and archive the absorbed repo rather than deleting it
  so the old discussions stay readable.
- **Never let the app and the site share a name** unless they are one repo on purpose — in that case the bare
  name is the right home for both, `index.html` sitting beside `Sources/`.
- **A wrong `git fetch` leaves foreign tags behind.** Delete them (`git tag -d <tag>`) so a later
  `push --tags` cannot publish the other project's release into this repo.
- **Verify the push landed, and that the repo you avoided is untouched**: the remote SHA equals local `HEAD`,
  the commit counts match, and the other repo's `pushedAt` is unchanged from before you started. State the
  visibility you chose and why, so flipping it is one setting.
- **When asked to push, check every repo you touched** (`git status`, `git rev-list --count @{u}..HEAD`) and
  report an unrelated branch that is ahead rather than pushing it unasked.
- **Issues cannot be moved from a private repo to a public one.** GitHub refuses with _"Old issue cannot be
  transferred from private repository to public repository"_, and archiving the source first makes it read-only
  so the transfer fails differently. Recreate them in the receiving repo **in ascending order** — an empty
  target assigns 1, 2, 3… so the numbers still line up — carrying title, body, comments, state and close reason
  (including `not planned` where that was the reason), then read a couple of comment counts back to prove the
  threads survived. Delete nothing from the private repo while this is in doubt.
- **Never keep the working copy of a repo you are changing in a temporary directory.** `/tmp` is cleared, and a
  repo living there can hold commits that were never pushed anywhere — clone or move it under the projects
  directory before starting work, or a reboot is the last you see of them.

## Where a download can live

**Visibility decides it, and it is not negotiable.** Release assets on a **private** repository are downloadable
only by collaborators, so a buyer's link can never point at one; GitHub Pages from a private repository also
needs a paid plan. For a paid app that leaves exactly two shapes: the public repo carries the site and the
releases while the private one carries the source, or everything moves into one public repo. Decide before
writing a download URL — a plausible `releases/download/v1.0/Ponte.dmg` on a private repo 404s for every
customer and looks perfectly healthy to the account that owns it. Check with
`gh repo view <owner>/<repo> --json visibility` rather than assuming the pair splits the obvious way; the site
repo is often the _public_ one.

**Two histories, on purpose.** An accidental push of the app at the site's repo is the mistake above, but
consolidating deliberately is a merge, not a push: in a scratch clone of the target,
`git merge --allow-unrelated-histories <app-remote>/main` keeps both histories as two roots, rewrites nothing,
and puts `index.html` beside `Sources/`. Build and test _there_ before pushing, so a tree that cannot compile
never becomes the default branch, and merge from the repo holding the _newest_ work — cloning a stale remote
silently drops commits that were never pushed.

## What belongs on the product page

- the minimum macOS version;
- any first-run download (size it) so the first launch is not mistaken for a hang;
- the permission prompts the app will raise (microphone; Accessibility if it pastes at the cursor);
- whether an account is needed — say "none" when it is none.
- **Audit the page against the app, never from memory.** A product page is written once and then drifts: the
  engine it names was removed, the minimum OS moved two releases, the model size belonged to a component that
  no longer ships, and one section promised a feature that was never built — four false claims, all invisible to
  the person who wrote the page. Each is something a buyer disproves in a minute. Grep for the specifics
  (engine names, OS version against `Package.swift`, download sizes, every capability sentence) in the same
  pass as the release, not after a complaint.
- **Keep the page with the source.** In its own repository nothing makes that drift visible; co-located
  (`index.html` at the root, Pages from the default branch) a feature change and its marketing claim land in
  the same diff.
- **State the version in exactly one place, and keep the buttons versionless.** A "Download <Name> 1.0" button in
  two sections means every version bump is a four-line change with three chances to miss one. Put the number in
  the heading, let the buttons say what they do ("↓ Download for Mac"), and say when a build is early —
  "Early build — expect rough edges" — instead of letting 0.1.0 read as a finished 1.0.
- **If not notarized:** state the first-launch step plainly on the product page, and state the _current_ one —
  recent macOS removed the right-click → Open bypass for quarantined downloads, so the route is System Settings
  → Privacy & Security → Open Anyway. Quoting a shortcut the buyer does not have is worse than saying nothing.

## Verify the button, not the page

A download link can name a release tag that was never published — the page reads perfectly, the copy is
honest, and every visitor gets a 404. The page is not evidence; the click is.

```bash
# 1. does the target exist at all?
gh api repos/<owner>/<repo>/releases --jq '.[] | "\(.tag_name)  \(.assets|length) assets"'
gh release download <tag> --pattern '*.dmg' --dir /tmp/check   # fails with "release not found" when it is a lie

# 2. reproduce the click: read the LIVE page, follow its href, take what lands
URL=$(curl -s "https://<owner>.github.io/<repo>/?cachebust=$RANDOM" \
  | grep -o 'https://github.com/<owner>/<repo>/releases/download/[^"]*' | head -1)
curl -sL -o /tmp/friend.dmg -w '%{http_code} %{size_download}\n' "$URL"
hdiutil attach -quiet -nobrowse /tmp/friend.dmg -mountpoint /tmp/mnt && ls /tmp/mnt
```

Read the version, architecture and signature off **what landed in `/tmp/mnt`**, not off the local build:
`/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString'`, `lipo -archs`, `spctl -a -vv`, and
`xcrun stapler validate` on the image. A live release can be several versions behind the app in
`/Applications`, and an arm64-only image silently excludes every Intel Mac — both are things to say out
loud rather than discover from a support message.

Pages serves a fixed commit for a minute or so after a push: after fixing a link, poll the live URL with a
cache-buster until the new href appears, and verify the _fixed_ page rather than the local file.

## Selling it

- **No licence enforcement is a legitimate choice.** An app with no key check can be sold unpoliced. Say
  which choice is being made instead of leaving it implied.
- **With keys, use a merchant of record** (Paddle, Lemon Squeezy, Gumroad, Polar take on the VAT), and
  prefer **offline verification** — a signed licence file checked with a public key via CryptoKit, stored in
  the Keychain — because a network check on every launch contradicts an on-device/privacy pitch.
- **A research brief to hand to another agent** (ranked shortlist, integration shape, cost model, sources):
  `templates/licensing-service-research-prompt.md`.
- **Selling direct means owning updates:** Sparkle plus an appcast you host, unless the licence service
  bundles release hosting. See the section below — a feed that exists is not a feed that fires.

## Updates you host (Sparkle)

An appcast that is served but never acted on looks identical to a working one until someone checks.

**The build number is the thing that decides, and the packaging path is where it gets lost.** Sparkle compares
`CFBundleVersion` against the installed build; a value that is not higher is a silent no-op, with no error
anywhere. A release script that stages its own `.app` from a template plist (rather than reusing the dev
build's stamped bundle) therefore ships the template's number forever — `build 1` on every release, while the
developer's machine runs build 100+, so no existing install ever sees an update. Stamp both keys **in the
packaging path**, from the same sources the dev build uses (short version from a `VERSION` file, build from
`git rev-list --count HEAD`), and fail the script when the stamped value read back does not match:

```bash
STAMP_SHORT="$(tr -d '[:space:]' < "$ROOT/VERSION")"
STAMP_BUILD="$(git -C "$ROOT" rev-list --count HEAD)"
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $STAMP_SHORT" "$APP/Contents/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $STAMP_BUILD" "$APP/Contents/Info.plist"
[ "$(/usr/libexec/PlistBuddy -c 'Print :CFBundleVersion' "$APP/Contents/Info.plist")" = "$STAMP_BUILD" ] \
  || { echo "!! build number did not stamp"; exit 1; }
```

**Two version sources drift even when both are edited.** A `VERSION` file the app stamps from and a template
`Info.plist` the image is named from are two files; bumping one makes the release carry the right number inside
a disk image called the wrong thing. Set both in the same edit, and read both back.

**Edit a template plist as text, not with PlistBuddy, when you only mean to change one value.** `PlistBuddy -c
'Set :CFBundleShortVersionString …'` rewrites the file on save: it reformatted lines and added a
`CFBundleDisplayName` key that nobody asked for, so a one-line version bump arrived as seven changed lines in the
commit — extra keys in a shipped bundle are the kind of thing that survives unnoticed. Patch the single string by
hand for a template the release also hand-maintains, and read `git show --stat` before committing a plist edit so
collateral rewriting is caught in the same pass.

**Order the release so the feed can point at something:** upload the archive asset to the release **first**,
then generate the appcast (it embeds that asset's URL), then attach whatever else and publish the feed. Read the
resulting XML for the tag's version and a non-empty `sparkle:edSignature` — an unsigned entry is generated happily
and rejected by the client.

**Then verify the updater's own view, not the file.** The feed must be live at the exact `SUFeedURL` in the app's
`Info.plist` (Pages from the default branch is the usual host), and Pages serves a stale commit for up to a
minute: poll the live URL with a cache-buster until the new version appears. Compare the advertised build against
the build actually installed — _that_ comparison, not the presence of the XML, is what says updates will fire.

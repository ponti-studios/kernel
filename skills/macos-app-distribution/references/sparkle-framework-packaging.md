# Packaging Sparkle (or any dynamically linked framework)

Sparkle is the one dynamically linked dependency in a SwiftPM macOS app; everything else is static. That is
why it is the thing that kills the app at launch and why every step below exists.

## The rpath

A SwiftPM executable links `@rpath/Sparkle.framework/Versions/B/Sparkle`, and SwiftPM sets rpath to
`@loader_path` (`Contents/MacOS`). The framework is copied into `Contents/Frameworks`, so dyld never looks
there and the app dies before it can open:

    dyld: Library not loaded: @rpath/Sparkle.framework/Versions/B/Sparkle
    Reason: tried: '/.../Contents/MacOS/Sparkle.framework/...' (no such file)

Fix: add `@executable_path/../Frameworks` after the framework is copied and **before** signing (signing
invalidates the change):

```bash
install_name_tool -add_rpath "@executable_path/../Frameworks" "$APP/Contents/MacOS/App" 2>/dev/null || true
```

Check the result with `otool -l ... | grep -A2 LC_RPATH` — the path must be there, or the app will not
launch outside the build directory.

## Inside-out signing, and the hash, not the name

Sparkle.framework contains XPC services (`Installer.xpc`, `Downloader.xpc`) and helper apps (`Updater.app`,
`Autoupdate`). They must be signed first, then the bundles, then the framework, then the app — and **with the
certificate hash**, not its display name. Passing the name to `codesign` on this toolchain produces ad-hoc
signatures (`TeamIdentifier=not set`) on the nested binaries, which notarytool rejects with "The binary is not
signed with a valid Developer ID certificate". The hash resolves to the real certificate:

```bash
DEVID_HASH="$(security find-identity -v -p codesigning | grep 'Developer ID Application' | head -1 | awk '{print $2}')"
FW="$APP/Contents/Frameworks/Sparkle.framework"
# 1. every Mach-O inside the framework
while IFS= read -r -d '' bin; do
  codesign --force --options runtime --timestamp --sign "$DEVID_HASH" "$bin" >/dev/null 2>&1 || true
done < <(find "$FW" -type f -perm -111 -print0)
# 2. the bundles
for bundle in "$FW"/Versions/B/Autoupdate.app "$FW"/Versions/B/Updater.app \
              "$FW"/Versions/B/Installer.xpc "$FW"/Versions/B/Downloader.xpc; do
  [ -e "$bundle" ] && codesign --force --options runtime --timestamp --sign "$DEVID_HASH" "$bundle" >/dev/null 2>&1 || true
done
# 3. the framework, then the app
 codesign --force --options runtime --timestamp --sign "$DEVID_HASH" "$FW" >/dev/null 2>&1
codesign --force --options runtime --timestamp --sign "$DEVID_HASH" --identifier <bundle-id> \
  --entitlements Resources/App.entitlements "$APP"
```

Signing the `.xpc` or `.app` bundle alone does **not** reliably cover the binary inside it on this toolchain —
the nested Mach-O ends up with `TeamIdentifier=not set` and notarytool rejects the whole archive.

## Two build paths must agree

A dev build (`build-app.sh`) and a release build (`make-dmg.sh`) that stage differently — different framework
sources, different stamping — ship different artefacts. Keep one path, or make both do the same thing, and
`--install` the release build into `/Applications` so the local app is what ships.

## Launch-test the published artefact

`spctl` on a signed, notarized DMG says nothing about whether the app starts. Quarantine a copy, mount it, run
the binary directly, and read stderr — `dyld: Library not loaded` is the failure mode that every earlier check
missed. Do this before telling anyone the release works.

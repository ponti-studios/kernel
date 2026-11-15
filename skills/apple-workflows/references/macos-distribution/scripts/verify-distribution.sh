#!/bin/bash
# Verify a distribution build the way a buyer's Mac will, not the way the build machine does.
#
#   ./verify-distribution.sh dist/MyApp-1.0.dmg
#
# Checks, in order: the image carries its own signature, the image and the app inside are both stapled, the
# app's requirement is team-anchored, and — the check that matters most — Gatekeeper accepts a quarantine-tagged
# copy of the image, which is exactly what a browser download is.
#
# A build that reports its own success is not evidence: assess the artefact the buyer touches.
set -uo pipefail

DMG="${1:?usage: verify-distribution.sh <path.dmg> [path/to/App.app]}"
APP="${2:-}"
FAILED=0
ok()  { printf '  ok    %s\n' "$1"; }
bad() { printf '  FAIL  %s\n' "$1"; FAILED=1; }

[ -f "$DMG" ] || { bad "no such file: $DMG"; exit 1; }

# 1. The image needs a signature of its own. This is what Gatekeeper assesses when the download is opened.
if codesign --verify "$DMG" 2>/dev/null; then
  ok "image signed by: $(codesign -dv "$DMG" 2>&1 | grep '^Authority=' | head -1 | cut -d= -f2-)"
else
  bad "the image is not code-signed — codesign --force --timestamp --sign \"<Developer ID>\" \"$DMG\""
fi

# 2. Gatekeeper's verdict on the image itself.
VERDICT=$(spctl -a -t open --context context:primary-signature -vvv "$DMG" 2>&1 | head -3)
printf '%s\n' "$VERDICT" | sed 's/^/  /'
case "$VERDICT" in
  *"source=Notarized Developer ID"*) ok "Gatekeeper accepts the image" ;;
  *"no usable signature"*)          bad "unsigned image: sign it, then submit again" ;;
  *"Unnotarized Developer ID"*)     bad "signed but not notarized: submit, then staple" ;;
  *)                                bad "unexpected verdict" ;;
esac

# 3. The ticket must be stapled, or the first check needs Apple to be reachable.
if xcrun stapler validate "$DMG" 2>&1 | grep -q 'validate action worked'; then
  ok "ticket stapled to the image"
else
  bad "no staple on the image — xcrun stapler staple \"$DMG\""
fi

# 4. The same for a quarantined copy: the closest thing to a real download.
TMP=$(mktemp -d)
cp "$DMG" "$TMP/download.dmg"
xattr -w com.apple.quarantine "0083;$(printf '%x' "$(date +%s)");Safari;$(uuidgen)" "$TMP/download.dmg" 2>/dev/null
Q=$(spctl -a -t open --context context:primary-signature -vvv "$TMP/download.dmg" 2>&1 | head -3)
printf '%s\n' "$Q" | sed 's/^/  /'
case "$Q" in *accepted*) ok "accepted as a quarantined download" ;; *) bad "rejected as a quarantined download" ;; esac
rm -rf "$TMP"

# 5. Inside the image: the copy the buyer keeps, its own staple, and its requirement.
MOUNT=$(hdiutil attach "$DMG" -nobrowse -readonly 2>/dev/null | grep -o '/Volumes/.*' | head -1)
if [ -z "$MOUNT" ]; then
  bad "could not mount the image"
else
  trap 'hdiutil detach "$MOUNT" -quiet >/dev/null 2>&1' EXIT
  INSIDE=$(ls -1 "$MOUNT" | grep -m1 '\.app$')
  if [ -z "$INSIDE" ]; then
    bad "no .app inside the image"
  else
    [ -n "$APP" ] || APP="$MOUNT/$INSIDE"
    if xcrun stapler validate "$APP" 2>&1 | grep -q 'validate action worked'; then
      ok "ticket stapled to $INSIDE (it launches without reaching Apple)"
    else
      bad "no staple on $INSIDE — notarize the app as its own submission, then staple it"
    fi
    V=$(spctl -a -vvv -t install "$APP" 2>&1 | head -3)
    printf '%s\n' "$V" | sed 's/^/  /'
    case "$V" in *accepted*) ok "Gatekeeper accepts the app inside" ;; *) bad "the app inside is rejected" ;; esac
    REQ=$(codesign -d -r- "$APP" 2>&1 | tail -1)
    case "$REQ" in
      *'certificate leaf[subject.OU]'*) ok "requirement is team-anchored" ;;
      *) bad "requirement is not team-anchored (grants will not survive an update): $REQ" ;;
    esac
  fi
fi

echo
exit $FAILED

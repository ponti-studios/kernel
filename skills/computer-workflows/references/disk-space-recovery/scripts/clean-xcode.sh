#!/usr/bin/env bash
# Clears Xcode's rebuildable caches:
#   - DerivedData: all of it (Xcode rebuilds it)
#   - iOS DeviceSupport: keeps the newest build per device model, trashes older ones
#   - Simulators: deletes runtimes and devices that are unavailable (via simctl)
# Usage: clean-xcode.sh [--yes]
CW_SCRIPT=clean-xcode
source "$(dirname "$0")/lib.sh"
cw_parse_flags "$@"

if pgrep -x Xcode >/dev/null 2>&1; then
  log "Xcode is running. Quit it before cleaning its caches."
  [ "$CW_YES" = 1 ] && exit 1
fi

XCODE="$HOME/Library/Developer/Xcode"
DERIVED="$XCODE/DerivedData"
SUPPORT="$XCODE/iOS DeviceSupport"

log "== DerivedData"
if [ -d "$DERIVED" ]; then
  while IFS= read -r -d '' entry; do
    cw_trash "$entry"
  done < <(find "$DERIVED" -mindepth 1 -maxdepth 1 ! -name '.DS_Store' -print0)
fi

log "== iOS DeviceSupport (newest build per model kept)"
if [ -d "$SUPPORT" ]; then
  # Entries look like "iPhone17,2 27.3 (24C5037i)". Sort by model, then by version descending.
  # Keep the first line for each model; trash the rest.
  find "$SUPPORT" -mindepth 1 -maxdepth 1 ! -name '.DS_Store' -print0 \
    | while IFS= read -r -d '' entry; do
        name="$(basename "$entry")"
        model="${name%% *}"
        version="$(echo "$name" | awk '{print $2}')"
        printf '%s\t%s\t%s\n' "$model" "$version" "$entry"
      done \
    | sort -t$'\t' -k1,1 -k2,2Vr \
    | awk -F'\t' '$1 != last { last = $1; print "KEEP\t" $3; next } { print "TRASH\t" $3 }' \
    | while IFS=$'\t' read -r action entry; do
        if [ "$action" = "KEEP" ]; then
          log "keep  $(basename "$entry")"
        else
          cw_trash "$entry"
        fi
      done
fi

log "== Simulators (unavailable runtimes and devices)"
if command -v xcrun >/dev/null 2>&1; then
  if [ "$CW_YES" = 1 ]; then
    xcrun simctl delete unavailable 2>&1 | tee -a "$CW_LOG"
  else
    log "would run: xcrun simctl delete unavailable"
    xcrun simctl list devices unavailable 2>/dev/null | tee -a "$CW_LOG" >/dev/null
  fi
else
  log "xcrun not found; skipping simulators"
fi

log "done. log: $CW_LOG"

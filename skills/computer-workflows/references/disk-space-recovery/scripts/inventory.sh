#!/usr/bin/env bash
# Read-only disk space inventory for macOS. Prints a report to stdout and deletes nothing.
# Usage: inventory.sh [home-dir]   (defaults to $HOME)
set -uo pipefail

H="${1:-$HOME}"

gb() { awk -v kb="$1" 'BEGIN { printf "%8.1f GB", kb / 1048576 }'; }

echo "# Disk space inventory: $H"
echo
echo "## Home folders (top level, sorted by size)"
for d in "$H"/*/ "$H"/.[!.]*/; do
  [ -d "$d" ] || continue
  printf '%s\t%s\n' "$(du -sk "$d" 2>/dev/null | cut -f1)" "$d"
done | sort -rn | head -40 | while IFS=$'\t' read -r kb path; do printf '%s  %s\n' "$(gb "$kb")" "$path"; done
echo
echo "## Known cache and build locations"
for p in \
  "$H/Library/Caches" \
  "$H/Library/Developer/Xcode/DerivedData" \
  "$H/Library/Developer/Xcode/Archives" \
  "$H/Library/Developer/CoreSimulator" \
  "$H/Library/Developer/Xcode/iOS DeviceSupport" \
  "$H/Library/Android/sdk" \
  "$H/Library/Containers" \
  "$H/Library/Logs" \
  "$H/Library/pnpm" \
  "$H/.gradle" "$H/.npm" "$H/.cache" "$H/.cargo" "$H/.rustup" \
  "$H/.bun" "$H/.deno" "$H/.docker" "$H/.ollama" "$H/.maestro" \
  "$H/.local/share/mise" \
  "$H/Library/Application Support/Google/Chrome" \
  "$H/Library/Application Support/Code/CachedData" \
  "$H/.Trash"; do
  [ -e "$p" ] && printf '%s\t%s\n' "$(du -sk "$p" 2>/dev/null | cut -f1)" "$p"
done | sort -rn | while IFS=$'\t' read -r kb path; do printf '%s  %s\n' "$(gb "$kb")" "$path"; done
echo
echo "## Build output and dependency dirs under Developer (depth 6, top 60)"
find "$H/Developer" -maxdepth 6 \( -name node_modules -o -name target -o -name .next -o -name build -o -name dist \) -type d -prune 2>/dev/null \
  | head -500 | while read -r p; do printf '%s\t%s\n' "$(du -sk "$p" 2>/dev/null | cut -f1)" "$p"; done \
  | sort -rn | head -60 | while IFS=$'\t' read -r kb path; do printf '%s  %s\n' "$(gb "$kb")" "$path"; done
echo
echo "## Files not modified in 180+ days (Downloads, Desktop)"
for d in "$H/Downloads" "$H/Desktop"; do
  n=$(find "$d" -type f -mtime +180 2>/dev/null | wc -l | tr -d ' ')
  kb=$(find "$d" -type f -mtime +180 -print0 2>/dev/null | xargs -0 du -ck 2>/dev/null | tail -1 | cut -f1)
  printf '%s: %s files, %s\n' "$d" "$n" "$(gb "${kb:-0}")"
done

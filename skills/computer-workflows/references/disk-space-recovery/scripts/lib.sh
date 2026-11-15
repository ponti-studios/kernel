#!/usr/bin/env bash
# Shared helpers for disk-space-recovery scripts. Source this; don't run it.
#
# Rules every cleanup script follows:
#   - Dry run by default. Pass --yes to act.
#   - Nothing is permanently deleted. Removals move to ~/.Trash.
#   - Every run appends to a log under ~/.local/state/computer-workflows/logs.

set -uo pipefail

CW_STATE="${CW_STATE:-$HOME/.local/state/computer-workflows}"
CW_LOG_DIR="$CW_STATE/logs"
CW_RUN_ID="$(date +%Y%m%d-%H%M%S)"
CW_SCRIPT="${CW_SCRIPT:-cleanup}"
CW_LOG="$CW_LOG_DIR/$CW_RUN_ID-$CW_SCRIPT.log"
CW_TRASH="$HOME/.Trash"
CW_YES=0

mkdir -p "$CW_LOG_DIR"

log() {
  printf '%s  %s\n' "$(date '+%H:%M:%S')" "$*" | tee -a "$CW_LOG"
}

# Parse the shared flags. Call with "$@" from the script.
cw_parse_flags() {
  for arg in "$@"; do
    case "$arg" in
      --yes) CW_YES=1 ;;
      *) log "unknown argument: $arg"; exit 2 ;;
    esac
  done
  if [ "$CW_YES" = 1 ]; then
    log "MODE: apply (--yes)"
  else
    log "MODE: dry run (pass --yes to apply)"
  fi
}

# Size of a path in KB, 0 if missing.
kb_of() {
  if [ -e "$1" ]; then du -sk "$1" 2>/dev/null | cut -f1; else echo 0; fi
}

gb_of_kb() {
  awk -v kb="$1" 'BEGIN { printf "%.2f GB", kb / 1048576 }'
}

# Remove one path by moving it to the Trash. Dry run only reports it.
cw_trash() {
  local src="$1"
  local kb base dest
  kb="$(kb_of "$src")"
  if [ "$CW_YES" != 1 ]; then
    log "would trash $(gb_of_kb "$kb")  $src"
    return 0
  fi
  base="$(basename "$src")"
  dest="$CW_TRASH/$base"
  if [ -e "$dest" ]; then dest="$CW_TRASH/$base.$CW_RUN_ID"; fi
  mv "$src" "$dest"
  log "trashed $(gb_of_kb "$kb")  $src -> $dest"
}

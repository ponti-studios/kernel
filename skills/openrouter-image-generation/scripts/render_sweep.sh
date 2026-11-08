#!/usr/bin/env bash
# render_sweep.sh - render a model x spec x sample sweep, RESUME-SAFE, into the inbox.
#
# WHY THIS EXISTS: a 30-render sweep takes 20+ minutes on the slow models and gets
# killed in practice -- session restart, kernel timeout, an exhausted credit limit.
# A hand-rolled loop loses that work and cannot be resumed, and its output names
# collide on a re-run. This script names every output deterministically per sweep, so
# re-running the SAME command renders only what is missing.
#
# Run it as a TRACKED BACKGROUND job. Do not sit in a foreground shell polling it.
#
# usage:
#   render_sweep.sh --specs "<spec.json> [more.json ...]" \
#                   --models "<model-id> [more-ids ...]" \
#                   [--samples 5] [--resolution 1K|2K] [--workdir <dir>] [--dry-run]
#
# env:
#   RENDERER  renderer to invoke (default: the studio imagegen script)
#   INBOX     output directory   (default: ~/Pictures/imagegen/_inbox)
set -uo pipefail

RENDERER="${RENDERER:-$HOME/.agents/skills/studio-imagegen/scripts/generate-image.sh}"
INBOX="${INBOX:-$HOME/Pictures/imagegen/_inbox}"
SAMPLES=5
RESOLUTION=1K
WORKDIR=""
DRY_RUN=0
SPECS=""
MODELS=""

while [ $# -gt 0 ]; do
  case "$1" in
    --specs)      SPECS="$2"; shift 2 ;;
    --models)     MODELS="$2"; shift 2 ;;
    --samples)    SAMPLES="$2"; shift 2 ;;
    --resolution) RESOLUTION="$2"; shift 2 ;;
    --workdir)    WORKDIR="$2"; shift 2 ;;
    --dry-run)    DRY_RUN=1; shift ;;
    -h|--help)    sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

[ -n "$SPECS" ] || { echo "error: --specs is required" >&2; exit 2; }
[ -n "$MODELS" ] || { echo "error: --models is required" >&2; exit 2; }
[ -x "$RENDERER" ] || { echo "error: renderer not executable: $RENDERER (set RENDERER=)" >&2; exit 2; }

# One workdir per sweep; its id makes output names stable across resumes.
if [ -z "$WORKDIR" ]; then
  WORKDIR="/tmp/render-sweep-$(date +%Y%m%d-%H%M%S)"
fi
mkdir -p "$WORKDIR" "$INBOX"
if [ -f "$WORKDIR/.sweep-id" ]; then
  SID=$(cat "$WORKDIR/.sweep-id")
else
  SID=$(date +%Y%m%d-%H%M%S)
  echo "$SID" > "$WORKDIR/.sweep-id"
fi
LOG="$WORKDIR/render.log"

# "aurora-night-sleeper--frame2-the-empty-case.json" -> "aurora-f2"
label_for() {
  local base series frame
  base=$(basename "$1" .json)
  series=${base%%-*}
  frame=$(printf '%s' "$base" | grep -o 'frame[0-9]*' | head -1)
  printf '%s-%s' "$series" "${frame:-f?}"
}

rendered=0; skipped=0; failed=0; missing=0
echo "sweep $SID | workdir $WORKDIR | log $LOG"
for spec in $SPECS; do
  [ -f "$spec" ] || { echo "  MISSING spec: $spec" >&2; missing=$((missing+1)); continue; }
  label=$(label_for "$spec")
  for model in $MODELS; do
    slug=${model##*/}; slug=${slug//./-}
    for n in $(seq 1 "$SAMPLES"); do
      out="$INBOX/${slug}_${label}-${RESOLUTION}-s${n}_${SID}.png"
      if [ -f "$out" ]; then skipped=$((skipped+1)); continue; fi
      if [ "$DRY_RUN" = 1 ]; then echo "  would render $out"; rendered=$((rendered+1)); continue; fi
      t0=$(date +%s)
      "$RENDERER" --spec "$spec" --model "$model" --resolution "$RESOLUTION" --out "$out" \
        >"$WORKDIR/last-render.out" 2>&1
      rc=$?; t1=$(date +%s)
      if [ $rc -ne 0 ]; then
        failed=$((failed+1))
        echo "$model|$label|s$n|rc=$rc|$((t1-t0))s|FAILED: $(tail -1 "$WORKDIR/last-render.out" | cut -c1-150)" >> "$LOG"
      else
        rendered=$((rendered+1))
        echo "$model|$label|s$n|rc=0|$((t1-t0))s|$out" >> "$LOG"
      fi
    done
  done
done

printf 'SUMMARY rendered=%d skipped=%d failed=%d missing=%d\n' "$rendered" "$skipped" "$failed" "$missing"
echo "log: $LOG"
echo "Review the images yourself; do not score them. Re-run this exact command to resume."

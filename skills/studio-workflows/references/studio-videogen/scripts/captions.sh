#!/usr/bin/env bash
# Burn each scene's voiceover line onto the cut, timed to the scene.
#   captions.sh --video <in.mp4> --scenes <scenes.json> --out <out.mp4> [--position bottom]
set -euo pipefail
exec node "$(dirname "${BASH_SOURCE[0]}")/lib/captions.mjs" "$@"

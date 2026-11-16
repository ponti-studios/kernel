#!/usr/bin/env bash
# Concat the clips and lay the voiceover over them.
#   assemble.sh --clips <dir> --voiceover <file.mp3> --out <file.mp4> [--scenes <scenes.json>]
set -euo pipefail
exec node "$(dirname "${BASH_SOURCE[0]}")/lib/assemble.mjs" "$@"

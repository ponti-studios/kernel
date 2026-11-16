#!/usr/bin/env bash
# Speak each scene's voiceover to its own mp3.
#   voiceover.sh --scenes <scenes.json> [--out <dir>] [--only <sceneId>] [--dry-run]
set -euo pipefail
exec node "$(dirname "${BASH_SOURCE[0]}")/lib/voiceover.mjs" "$@"

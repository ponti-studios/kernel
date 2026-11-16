#!/usr/bin/env bash
# Preflight the media pipeline (binaries, models, voices, scenes). Spends nothing.
#   check-media.sh [--scenes <scenes.json>]
set -euo pipefail
exec node "$(dirname "${BASH_SOURCE[0]}")/lib/check-media.mjs" "$@"

#!/usr/bin/env bash
# Compatibility entrypoint; scene keyframe orchestration belongs to Videogen.
set -euo pipefail
exec "$(dirname "${BASH_SOURCE[0]}")/../../studio-videogen/scripts/keyframes.sh" "$@"

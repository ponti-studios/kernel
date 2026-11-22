#!/usr/bin/env bash
# Generate one approved still keyframe per video scene. DRY RUN until --yes.
set -euo pipefail
exec node "$(dirname "${BASH_SOURCE[0]}")/lib/keyframes.mjs" "$@"

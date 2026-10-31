#!/usr/bin/env bash
# Generate one silent clip per scene. DRY RUN until --yes (this stage bills per clip).
#   clips.sh --scenes <scenes.json> [--only <sceneId>] [--model <id>] [--yes]
set -euo pipefail
exec node "$(dirname "${BASH_SOURCE[0]}")/lib/clips.mjs" "$@"

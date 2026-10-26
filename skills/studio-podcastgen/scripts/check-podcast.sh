#!/usr/bin/env bash
# Preflight the speech side: packages, model, voice ids, source segments. Free.
#   check-podcast.sh [--source <script.json|notes.md>]
set -euo pipefail
exec node "$(dirname "${BASH_SOURCE[0]}")/lib/check-podcast.mjs" "$@"

#!/usr/bin/env bash
# Turn a script into one continuous audio file (an episode).
#   podcast.sh --source <script.json|notes.md> --out <episode.mp3> [--voice <id> | --voices <a,b>] [--dry-run]
set -euo pipefail
exec node "$(dirname "${BASH_SOURCE[0]}")/lib/podcast.mjs" "$@"

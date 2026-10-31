#!/usr/bin/env bash
# What the registry knows: characters, heights, outfits, tails, mask blocks.
#   registry-report.sh [--root <universe>] [--json]
set -euo pipefail
exec node "$(dirname "${BASH_SOURCE[0]}")/lib/registry-report.mjs" "$@"

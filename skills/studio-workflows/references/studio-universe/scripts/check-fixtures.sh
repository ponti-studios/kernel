#!/usr/bin/env bash
# Regression baseline: every fixture spec must compile byte-identical to its
# recorded expected prompt. Run after ANY bible / registry / compiler edit.
#   check-fixtures.sh [--universe <dir>]
# Exit 0 = 9 byte-exact, 1 = drift.
set -euo pipefail
exec node "$(dirname "${BASH_SOURCE[0]}")/lib/check-fixtures.mjs" "$@"

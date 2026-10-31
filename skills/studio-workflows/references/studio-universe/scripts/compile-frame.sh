#!/usr/bin/env bash
# Compile one frame spec into its generation prompt.
#   compile-frame.sh <spec.json> [--root <universe>] [--out <file>] [--quiet] [--table]
# Exit 0 = prompt emitted, 1 = spec refused (named CompileError code), 2 = usage/lookup.
set -euo pipefail
exec node "$(dirname "${BASH_SOURCE[0]}")/lib/compile-frame.mjs" "$@"

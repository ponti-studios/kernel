#!/usr/bin/env bash
# Generate a frame image: compiles the spec, attaches its references, reports real cost.
#   generate-image.sh --spec <frame-spec.json> [--out <file>] [--dry-run] [--meta]
set -euo pipefail
exec node "$(dirname "${BASH_SOURCE[0]}")/lib/generate-image.mjs" "$@"

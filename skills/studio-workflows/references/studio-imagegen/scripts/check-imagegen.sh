#!/usr/bin/env bash
# Preflight an image run: packages, registry, model capabilities, references. Free.
#   check-imagegen.sh [--spec <frame-spec.json> | --specs <list.json>] [--model <id>]
set -euo pipefail
exec node "$(dirname "${BASH_SOURCE[0]}")/lib/check-imagegen.mjs" "$@"

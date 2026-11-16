#!/usr/bin/env bash
# Video run log: list runs, rate them, report what is working.
#   runs.sh list
#   runs.sh rate <runId> --score 1-5 [--notes "..."] [--fail R14,R36] [--pass R23]
#   runs.sh report [--by model|rule]
set -euo pipefail
exec node "$(dirname "${BASH_SOURCE[0]}")/lib/runs.mjs" "$@"

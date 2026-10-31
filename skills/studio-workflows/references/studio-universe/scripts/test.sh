#!/usr/bin/env bash
# Run the skill's test suite: registry access, schema checks, root resolution
# and the byte-exact fixture baseline. No npm, no checkout, no build.
#   test.sh            # all suites
#   test.sh registry   # one suite (matched by filename)
set -euo pipefail
here="$(dirname "${BASH_SOURCE[0]}")"
cd "$here/.."
shopt -s nullglob
files=(test/*.test.mjs)
if ((${#files[@]} == 0)); then
  echo "no tests found under $(pwd)/test" >&2
  exit 2
fi
if [[ $# -gt 0 ]]; then
  files=(test/"$1".test.mjs)
fi
# A bare directory argument is not portably accepted by node --test, so pass the
# expanded file list. Node's runner parallelises across files on its own.
exec node --test "${files[@]}"

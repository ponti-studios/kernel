#!/usr/bin/env bash
# Build the floating progress window once. progress.mjs launches the built binary.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
swift build -c release

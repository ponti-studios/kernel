#!/bin/sh
# Thin wrapper: plain node, no build step.
exec node "$(dirname "$0")/lib/run.mjs" "$@"

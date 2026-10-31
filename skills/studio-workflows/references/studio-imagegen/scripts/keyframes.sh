#!/bin/sh
# One keyframe per shot, from a shot list.
exec node "$(dirname "$0")/lib/keyframes.mjs" "$@"

#!/usr/bin/env bash
set -euo pipefail

skill_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)
launcher="$skill_dir/scripts/computer-workflows"
target_dir=/usr/local/bin
target="$target_dir/computer-workflows"

if [[ ! -x "$launcher" ]]; then
    echo "Install failed: launcher is missing or not executable: $launcher" >&2
    exit 1
fi
if [[ ! -d "$target_dir" ]]; then
    echo "Install failed: target directory does not exist: $target_dir" >&2
    exit 1
fi

if [[ -L "$target" ]]; then
    existing=$(python3 -c 'import os, sys; print(os.path.realpath(sys.argv[1]))' "$target")
    if [[ "$existing" == "$launcher" ]]; then
        echo "Already installed: $target -> $launcher"
        exit 0
    fi
    echo "Install refused: $target is already a symlink to $existing" >&2
    exit 1
fi
if [[ -e "$target" ]]; then
    echo "Install refused: $target already exists and is not a symlink to this launcher" >&2
    exit 1
fi
if [[ ! -w "$target_dir" ]]; then
    echo "Install failed: $target_dir is not writable; rerun with appropriate permission." >&2
    exit 1
fi

ln -s "$launcher" "$target"
printf 'Installed %s -> %s\n' "$target" "$launcher"

#!/usr/bin/env python3
"""Bundle the shared Studio runtime into independently installable packages."""

from pathlib import Path
import argparse
import shutil
import filecmp

ROOT = Path(__file__).resolve().parents[1]
IGNORED = shutil.ignore_patterns('__pycache__', '.venv', '.DS_Store', '*.pyc')


def bundles():
    for package in ('writing-workflows', 'studio-workflows'):
        yield ROOT / 'runtime/studio-core', ROOT / 'skills' / package / 'references/studio-core'
    yield ROOT / 'runtime/scene-schema', ROOT / 'skills/studio-workflows/references/scene-schema'


def equal(source, target):
    if not target.is_dir():
        return False
    comparison = filecmp.dircmp(source, target, ignore=['__pycache__', '.venv', '.DS_Store'])
    return not (comparison.left_only or comparison.right_only or comparison.diff_files or comparison.funny_files) and all(
        equal(source / name, target / name) for name in comparison.common_dirs
    ) and all(filecmp.cmp(source / name, target / name, shallow=False) for name in comparison.common_files)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    stale = []
    for source, target in bundles():
        if args.check:
            if not equal(source, target):
                stale.append(str(target.relative_to(ROOT)))
        else:
            if target.exists():
                shutil.rmtree(target)
            shutil.copytree(source, target, ignore=IGNORED)
    source = ROOT / 'skills/writing-workflows/references/kernel-ops-production/references/production.md'
    target = ROOT / 'skills/studio-workflows/references/kernel-ops-production/references/production.md'
    if args.check:
        if not target.exists() or source.read_bytes() != target.read_bytes():
            stale.append(str(target.relative_to(ROOT)))
    else:
        target.write_bytes(source.read_bytes())
    if stale:
        parser.exit(1, 'Stale runtime bundles: ' + ', '.join(stale) + '\nRun python3 scripts/bundle_runtime.py\n')


if __name__ == '__main__':
    main()

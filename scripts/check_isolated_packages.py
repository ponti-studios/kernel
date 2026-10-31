#!/usr/bin/env python3
"""Exercise package runtime behavior with no sibling packages or source checkout."""

from pathlib import Path
import os
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def main():
    for name in ('writing-workflows', 'studio-workflows'):
        with tempfile.TemporaryDirectory(prefix='kernel-isolated-') as temp:
            package = Path(temp) / name
            shutil.copytree(ROOT / 'skills' / name, package)
            env = os.environ.copy()
            for key in ('STUDIO_CORE_TEXT_ENTRY', 'STUDIO_ROOT', 'STUDIO_UNIVERSE_ROOT', 'OPENROUTER_API_KEY'):
                env.pop(key, None)
            tests = sorted(str(p) for p in package.rglob('*.test.mjs'))
            result = subprocess.run(['node', '--test', *tests], cwd=temp, env=env, capture_output=True, text=True)
            if result.returncode:
                raise SystemExit(result.stdout + result.stderr)
            if name == 'writing-workflows':
                subprocess.run(['node', str(package / 'references/studio-script/scripts/lib/run.mjs'),
                                '--brief', 'An isolated script preflight', '--dry-run'],
                               cwd=temp, env=env, check=True, capture_output=True)
            else:
                podcast = package / 'references/studio-podcastgen/scripts/lib/podcast.mjs'
                invalid = subprocess.run(['node', str(podcast)], cwd=temp, env=env, capture_output=True, text=True)
                if invalid.returncode != 2 or 'usage: podcast.mjs' not in invalid.stderr:
                    raise SystemExit('Podcast CLI argument handling failed:\n' + invalid.stderr)
                # Dynamic production dependencies must resolve within this package.
                for module in ('studio-imagegen', 'studio-mediagen', 'studio-podcastgen'):
                    source = package / 'references' / module / 'scripts/lib/resolve.mjs'
                    subprocess.run(['node', '--input-type=module', '-e',
                                    f"const m=await import({str(source.as_uri())!r}); await m.load('providers');"],
                                   cwd=temp, env=env, check=True, capture_output=True)
            print(f'{name}: isolated runtime tests and entrypoints passed ({len(tests)} test files)')


if __name__ == '__main__':
    main()

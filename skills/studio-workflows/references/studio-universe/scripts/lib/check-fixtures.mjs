#!/usr/bin/env node
// Regression harness: every fixture spec must compile byte-identical to its
// recorded expected prompt. Run this after ANY edit to a bible, the registry,
// or the compiler — that is what proves the change didn't drift output.
//
//   check-fixtures.mjs [--universe <dir>] [--fixtures <dir>]
//
// Canon comes from the skill's own data/ (see resolve.mjs); the fixtures travel
// with the compiler under test/fixtures/. Neither needs a studio checkout.
//
// App parity is checked WHEN a TypeScript build is present: the port must agree
// with the original in legacy voice. When no build exists that comparison is
// reported as skipped — absence of the monorepo is not a regression, and the
// byte-exact baseline below is the real guard either way.
//
// Exit 0 = all byte-exact. Exit 1 = drift (prints the first differing line).
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import {
  distCompilerEntry,
  fixturesDir,
  loadCompiler,
  loadLocalCompiler,
  loadRegistry,
  universeRoot,
} from './resolve.mjs';

const argv = process.argv.slice(2);
const flag = (name) => {
  const at = argv.indexOf(name);
  return at === -1 ? undefined : argv[at + 1];
};
const UNIVERSE = flag('--universe') ?? universeRoot();
const FIXTURES = flag('--fixtures') ?? fixturesDir();

let registry;
try {
  registry = loadRegistry(UNIVERSE);
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(2);
}

const local = await loadLocalCompiler();
const { loadSpec } = local;

// Optional: the original build, for app parity only.
const distEntry = distCompilerEntry();
let dist = null;
if (distEntry) {
  try {
    dist = await loadCompiler();
  } catch (err) {
    console.error(`# note: dist compiler at ${distEntry} could not load (${err.message}); parity skipped`);
  }
}

const specDir = join(FIXTURES, 'specs');
const expDir = join(FIXTURES, 'expected');
let pass = 0;
let parityChecked = 0;
const failures = [];

for (const file of readdirSync(specDir).filter((f) => f.endsWith('.json')).sort()) {
  const [setName, frame] = file.replace(/\.json$/, '').split('--');
  const expectedPath = join(expDir, `sets_${setName}_specs_${frame}.json.prompt.txt`);
  try {
    const spec = loadSpec(join(specDir, file));
    // 1. legacy parity: the port must reproduce the app's output byte-for-byte
    const got = local.compileSpec(spec, registry, UNIVERSE, { voice: 'legacy' });
    // 2. the dist build must agree with the port in legacy voice
    if (dist) {
      const distOut = dist.compileSpec(spec, registry, UNIVERSE);
      if (distOut !== got) {
        failures.push(`${file}: PORT DIVERGED from the dist compiler`);
        continue;
      }
      parityChecked += 1;
    }
    // 3. positive voice must be deterministic across repeated compiles
    const pos1 = local.compileSpec(spec, registry, UNIVERSE, { voice: 'positive' });
    const pos2 = local.compileSpec(spec, registry, UNIVERSE, { voice: 'positive' });
    if (pos1 !== pos2) {
      failures.push(`${file}: positive voice is NOT deterministic`);
      continue;
    }
    if (/never the /.test(pos1)) {
      failures.push(`${file}: positive voice still emits a 'never the' garment enumeration`);
      continue;
    }
    let expected;
    try {
      expected = readFileSync(expectedPath, 'utf8');
    } catch {
      failures.push(`${file}: no expected file at ${expectedPath}`);
      continue;
    }
    if (got === expected) {
      pass += 1;
      continue;
    }
    const g = got.split('\n');
    const e = expected.split('\n');
    let where = 'identical lines, different length';
    for (let i = 0; i < Math.max(g.length, e.length); i += 1) {
      if (g[i] !== e[i]) {
        where = `line ${i + 1}\n    got: ${(g[i] ?? '<eof>').slice(0, 120)}\n    exp: ${(e[i] ?? '<eof>').slice(0, 120)}`;
        break;
      }
    }
    failures.push(`${file}: DRIFT (${got.length} vs ${expected.length} chars) at ${where}`);
  } catch (err) {
    failures.push(`${file}: raised ${err?.code ?? 'error'} — ${err?.message ?? err}`);
  }
}

console.log(`fixtures: ${pass} byte-exact, ${failures.length} failed (root ${UNIVERSE})`);
console.log(
  `  baseline: ${FIXTURES}\n  app parity: ${
    dist ? `${parityChecked} specs agree with ${distEntry}` : 'skipped — no TypeScript build (port-only run)'
  }`,
);
for (const f of failures) console.log(`  ✗ ${f}`);
process.exit(failures.length === 0 ? 0 : 1);

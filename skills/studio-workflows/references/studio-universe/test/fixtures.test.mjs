// The regression baseline travels with the compiler: nine specs, nine expected
// prompts, compiled from the skill's own canon. If this file passes, a prompt
// built on this machine matches the one the app produced — with no checkout.
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  LOCAL_DATA_DIR,
  LOCAL_FIXTURES_DIR,
  fixturesDir,
  loadLocalCompiler,
  loadRegistry,
} from '../scripts/lib/resolve.mjs';

const local = await loadLocalCompiler();
const registry = loadRegistry(LOCAL_DATA_DIR);

const specDir = join(LOCAL_FIXTURES_DIR, 'specs');
const expDir = join(LOCAL_FIXTURES_DIR, 'expected');
const specs = readdirSync(specDir).filter((f) => f.endsWith('.json')).sort();

const expectedFor = (file) => {
  const [set, frame] = file.replace(/\.json$/, '').split('--');
  return join(expDir, `sets_${set}_specs_${frame}.json.prompt.txt`);
};

test('the skill carries the fixture baseline', () => {
  assert.equal(fixturesDir(), LOCAL_FIXTURES_DIR);
  assert.ok(existsSync(specDir), 'test/fixtures/specs is missing');
  assert.ok(existsSync(expDir), 'test/fixtures/expected is missing');
  assert.equal(specs.length, 9, `expected 9 fixture specs, found ${specs.length}`);
  assert.equal(readdirSync(expDir).filter((f) => f.endsWith('.prompt.txt')).length, 9);
});

for (const file of specs) {
  test(`${file}: legacy voice is byte-identical to the recorded prompt`, () => {
    const spec = local.loadSpec(join(specDir, file));
    const got = local.compileSpec(spec, registry, LOCAL_DATA_DIR, { voice: 'legacy' });
    const expected = readFileSync(expectedFor(file), 'utf8');
    assert.equal(got.length, expected.length, `length differs: ${got.length} vs ${expected.length}`);
    assert.equal(got, expected);
  });

  test(`${file}: positive voice is deterministic and carries no garment negation`, () => {
    const spec = local.loadSpec(join(specDir, file));
    const a = local.compileSpec(spec, registry, LOCAL_DATA_DIR, { voice: 'positive' });
    const b = local.compileSpec(spec, registry, LOCAL_DATA_DIR, { voice: 'positive' });
    assert.equal(a, b, 'positive voice is not deterministic');
    assert.doesNotMatch(a, /never the /, "positive voice emits a 'never the' enumeration");
    assert.doesNotMatch(a, /^NEGATIVES:/m, 'positive voice still labels negatives');
  });
}

test('the two voices actually differ — positive is not a silent alias', () => {
  const spec = local.loadSpec(join(specDir, specs[0]));
  const legacy = local.compileSpec(spec, registry, LOCAL_DATA_DIR, { voice: 'legacy' });
  const positive = local.compileSpec(spec, registry, LOCAL_DATA_DIR, { voice: 'positive' });
  assert.notEqual(positive, legacy);
});

test('the compiler refuses a spec with a hole in it, with a named code', () => {
  const spec = local.loadSpec(join(specDir, specs[0]));
  const broken = structuredClone(spec);
  delete broken.moment;
  assert.throws(
    () => local.compileSpec(broken, registry, LOCAL_DATA_DIR, { voice: 'positive' }),
    (err) => err?.name === 'CompileError' && err.code === 'MISSING_FIELD',
  );
});

test('an unknown cast member is refused rather than silently dropped', () => {
  const spec = local.loadSpec(join(specDir, specs[0]));
  const broken = structuredClone(spec);
  broken.cast[0].character = 'luci';
  assert.throws(
    () => local.compileSpec(broken, registry, LOCAL_DATA_DIR, { voice: 'positive' }),
    (err) => err?.name === 'CompileError' && ['MISSING_FIELD', 'UNKNOWN_CHARACTER'].includes(err.code),
  );
});

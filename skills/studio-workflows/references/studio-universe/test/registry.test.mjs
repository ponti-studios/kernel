// Registry access: the shipped canon must be complete, valid and portable.
// These tests read ONLY files inside the skill — no studio checkout is involved,
// which is the property the whole port exists to guarantee.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';

import {
  LOCAL_DATA_DIR,
  character,
  hasRegistry,
  listCharacters,
  listOutfits,
  loadRegistry,
  referencedFiles,
  registryPath,
  validateRegistry,
} from '../scripts/lib/resolve.mjs';

const data = LOCAL_DATA_DIR;
const registry = loadRegistry(data);
const scratch = mkdtempSync(join(tmpdir(), 'universe-registry-'));
after(() => rmSync(scratch, { recursive: true, force: true }));

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(path));
    else out.push(path);
  }
  return out;
}

test('the skill ships a registry and a bible directory', () => {
  assert.ok(existsSync(join(data, 'registry.json')), 'data/registry.json is missing');
  assert.ok(statSync(join(data, 'bibles')).isDirectory(), 'data/bibles/ is missing');
});

test('the shipped registry is structurally valid', () => {
  assert.doesNotThrow(() => validateRegistry(registry));
  assert.equal(typeof registry.version, 'number');
  assert.ok(Object.keys(registry.shared_blocks).length >= 1, 'no shared blocks');
});

test('every character has a bible that exists and holds its declared markers', () => {
  for (const id of listCharacters(registry)) {
    const c = character(registry, id);
    const biblePath = join(data, c.bible);
    assert.ok(existsSync(biblePath), `${id}: bible ${c.bible} does not exist`);
    const text = readFileSync(biblePath, 'utf8');
    const rules = [
      ['identity_block', c.identity_block],
      ...Object.entries(c.tails ?? {}).map(([k, r]) => [`tails.${k}`, r]),
      ...(c.mask_negative_block ? [['mask_negative_block', c.mask_negative_block]] : []),
    ];
    for (const [label, rule] of rules) {
      assert.ok(text.includes(rule.start_marker), `${id} ${label}: missing start marker ${rule.start_marker}`);
      assert.ok(text.includes(rule.end_marker), `${id} ${label}: missing end marker ${rule.end_marker}`);
      assert.ok(
        text.indexOf(rule.end_marker) > text.indexOf(rule.start_marker),
        `${id} ${label}: end marker precedes start marker`,
      );
    }
  }
});

test('every file the registry points at is present in the skill data', () => {
  const refs = referencedFiles(registry);
  assert.ok(refs.length >= listCharacters(registry).length, 'registry points at fewer files than characters');
  for (const ref of refs) {
    assert.ok(
      existsSync(join(data, ref.relpath)),
      `${ref.character} ${ref.kind} "${ref.id}": missing ${ref.relpath}`,
    );
  }
});

test('the canon data carries no .DS_Store litter', () => {
  const junk = walk(data).filter((p) => p.endsWith('.DS_Store'));
  assert.deepEqual(junk, [], 'stray .DS_Store files were copied into data/');
});

test('each character directory under bibles/ is declared in the registry', () => {
  const onDisk = readdirSync(join(data, 'bibles'), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  assert.deepEqual(onDisk, listCharacters(registry).sort(), 'bibles/ and registry.characters disagree');
});

test('outfits are look-up-able per character', () => {
  assert.ok(listOutfits(registry, 'lucy').length > 0, 'lucy should have outfits');
  assert.deepEqual(listOutfits(registry, 'cyndi'), [], 'cyndi is a costume character with no outfits');
});

test('an unknown character is refused with the known cast listed', () => {
  assert.throws(
    () => character(registry, 'luci'),
    (err) => err.message.includes('unknown character "luci"') && err.message.includes('lucy'),
  );
});

test('registryPath prefers the flat file then the nested checkout layout', () => {
  const flat = join(scratch, 'flat');
  mkdirSync(flat, { recursive: true });
  writeFileSync(join(flat, 'registry.json'), '{"version":1}');
  assert.equal(registryPath(flat), join(flat, 'registry.json'));

  const nested = join(scratch, 'nested');
  mkdirSync(join(nested, 'registry'), { recursive: true });
  writeFileSync(join(nested, 'registry', 'registry.json'), '{"version":1}');
  assert.equal(registryPath(nested), join(nested, 'registry', 'registry.json'));
});

test('a directory with no registry says exactly where it looked', () => {
  const empty = join(scratch, 'empty');
  mkdirSync(empty, { recursive: true });
  assert.equal(hasRegistry(empty), false);
  assert.throws(
    () => registryPath(empty),
    (err) => err.message.includes(join(empty, 'registry.json')) && err.message.includes('registry/registry.json'),
  );
});

test('invalid JSON and an invalid registry are refused with the file named', () => {
  const dir = join(scratch, 'broken');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'registry.json'), '{not json');
  assert.throws(() => loadRegistry(dir), /is not valid JSON/);

  writeFileSync(join(dir, 'registry.json'), JSON.stringify({ version: 1, shared_blocks: {}, characters: {} }));
  assert.throws(
    () => loadRegistry(dir),
    (err) => err.message.includes(join(dir, 'registry.json')) && err.message.includes('characters'),
  );
});

test('validation can be skipped for a raw read', () => {
  const dir = join(scratch, 'raw');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'registry.json'), '{"version":2}');
  assert.deepEqual(loadRegistry(dir, { validate: false }), { version: 2 });
});

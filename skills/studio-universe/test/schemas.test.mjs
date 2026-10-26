// Shape validation without zod: the checks have to throw a message a human can
// act on, naming the exact field and what was found instead.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  LOCAL_DATA_DIR,
  SchemaError,
  validateCastEntry,
  validateExtractionRule,
  validateFrameSpec,
  validatePlate,
  validateRegistry,
} from '../scripts/lib/resolve.mjs';

const registryPath = join(LOCAL_DATA_DIR, 'registry.json');
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
const clone = () => structuredClone(registry);

const throwsAt = (fn, path) =>
  assert.throws(fn, (err) => {
    assert.ok(err instanceof SchemaError, `expected SchemaError, got ${err?.name}: ${err?.message}`);
    assert.ok(
      err.message.startsWith(`${path}:`),
      `expected the message to name ${path}, got "${err.message}"`,
    );
    return true;
  });

test('the real registry passes', () => {
  assert.doesNotThrow(() => validateRegistry(clone()));
});

test('a missing character field names the field and the character', () => {
  const reg = clone();
  delete reg.characters.lucy.display_name;
  throwsAt(() => validateRegistry(reg), 'registry.characters.lucy.display_name');
});

test('a wrongly typed height reports what was found', () => {
  const reg = clone();
  reg.characters.wyatt.height_cm = '178';
  throwsAt(() => validateRegistry(reg), 'registry.characters.wyatt.height_cm');
});

test('an empty cast list is refused — a registry with no characters is broken', () => {
  const reg = clone();
  reg.characters = {};
  throwsAt(() => validateRegistry(reg), 'registry.characters');
});

test('an absolute bible path is refused: canon must travel with its root', () => {
  const reg = clone();
  reg.characters.lucy.bible = '/Users/someone/studio/universe/bibles/lucy/PROMPT.md';
  throwsAt(() => validateRegistry(reg), 'registry.characters.lucy.bible');
});

test('a bible path that exists relative to the root is accepted', () => {
  const reg = clone();
  reg.characters.lucy.bible = 'bibles/lucy/PROMPT.md';
  assert.doesNotThrow(() => validateRegistry(reg));
});

test('an extraction rule with an empty marker is refused', () => {
  assert.throws(
    () => validateExtractionRule({ start_marker: '  ', end_marker: '<!-- end -->' }),
    (err) => err instanceof SchemaError && err.message.startsWith('rule.start_marker'),
  );
  assert.throws(
    () => validateExtractionRule({ start_marker: '<!-- start -->' }),
    (err) => err instanceof SchemaError && err.message.includes('rule.end_marker'),
  );
});

test('a plate needs a path and a register, but derived_from is optional', () => {
  assert.doesNotThrow(() => validatePlate({ path: 'bibles/lucy/turnaround.webp', register: 'animated-cel' }));
  throwsAt(() => validatePlate({ register: 'animated-cel' }), 'plate.path');
  throwsAt(() => validatePlate({ path: 'x.webp' }), 'plate.register');
});

test('a cast entry without outfit_id is refused, even for a character with no outfits', () => {
  const base = {
    character: 'cyndi',
    anchor: 'stage:left',
    depth: 'midground',
    action: 'holds a paper cone',
    gaze_target: 'the floor',
  };
  assert.throws(
    () => validateCastEntry(base),
    (err) => err instanceof SchemaError && err.message.startsWith('cast[].outfit_id') && err.message.includes('null'),
  );
  assert.doesNotThrow(() => validateCastEntry({ ...base, outfit_id: null }));
  assert.doesNotThrow(() => validateCastEntry({ ...base, outfit_id: 'cyndi.costume' }));
});

// A minimal spec that satisfies every required field, so each test can break
// exactly one thing and see the path it names.
function minimalSpec() {
  return {
    frame: 1,
    title: 'Test frame',
    set: 'test-set',
    register: 'animated-cel',
    master: { width: 1200, height: 1500, aspect_ratio: '4:5' },
    floorplan: { camera: 'eye level', anchors: { stage: 'the stage boards' } },
    cast: [
      {
        character: 'lucy',
        outfit_id: 'lucy.tee_jeans',
        anchor: 'stage:centre',
        depth: 'foreground',
        action: 'stands still',
        gaze_target: 'the camera',
      },
    ],
    moment: 'the moment before the door opens',
    environment: 'an empty theatre',
    lighting: 'one hard key from stage left',
    colour: 'black, white, one coral accent',
    negatives: ['no text'],
  };
}

test('a minimal frame spec validates and survives Round-Trip', () => {
  const spec = minimalSpec();
  assert.doesNotThrow(() => validateFrameSpec(spec));
  assert.deepEqual(validateFrameSpec(spec), spec);
});

test('a frame spec missing a prose field names it', () => {
  const spec = minimalSpec();
  delete spec.lighting;
  throwsAt(() => validateFrameSpec(spec), 'spec.lighting');
});

test('negatives are required — an absent list is not the same as an empty one', () => {
  const spec = minimalSpec();
  delete spec.negatives;
  throwsAt(() => validateFrameSpec(spec), 'spec.negatives');
  assert.doesNotThrow(() => validateFrameSpec({ ...minimalSpec(), negatives: [] }));
});

test('cast is required and cannot be empty', () => {
  const spec = minimalSpec();
  spec.cast = [];
  throwsAt(() => validateFrameSpec(spec), 'spec.cast');
});

test('malformed props and block edits are caught by index and key', () => {
  const spec = { ...minimalSpec(), props: [{ item: 'case', owner: 'lucy' }, { item: 'tray' }] };
  throwsAt(() => validateFrameSpec(spec), 'spec.props[1].owner');

  const spec2 = { ...minimalSpec(), block_edits: { lucy: { omit_sentences: ['x', 7] } } };
  throwsAt(() => validateFrameSpec(spec2), 'spec.block_edits.lucy.omit_sentences[1]');
});

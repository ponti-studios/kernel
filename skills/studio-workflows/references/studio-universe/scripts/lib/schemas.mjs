// Registry and frame-spec shapes — plain checks, no zod.
//
// Ported from `packages/universe/src/registry.ts`, which described every shape
// with zod. This skill has zero npm dependencies, so the same shapes are
// expressed as ordinary functions that throw a named `SchemaError` carrying the
// exact field path. Two deliberate differences from the zod originals:
//
//   1. `plate.derived_from` is OPTIONAL here. zod required it, but the derived
//      crops were retired after the October 2026 blind test (see SKILL.md), so
//      the shipped registry carries `path` + `register` + `note` only and a
//      faithful zod port would reject the canon it is meant to protect.
//   2. Unknown keys are allowed and ignored, as zod's default strip behaviour
//      effectively did. Only known fields are type-checked.
//
// Validation is structural, never semantic: it proves a registry is shaped like
// a registry, not that its prose is true. Truth lives in the bibles.

export class SchemaError extends Error {
  /**
   * @param {string} path field path, e.g. `characters.lucy.height_cm`
   * @param {string} message what is wrong and what was found
   */
  constructor(path, message) {
    super(`${path}: ${message}`);
    this.name = 'SchemaError';
    this.path = path;
    this.code = 'SCHEMA';
  }
}

const isObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);

function fail(path, expected, got) {
  throw new SchemaError(path, `expected ${expected}, got ${describe(got)}`);
}

function describe(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return `array(${v.length})`;
  if (typeof v === 'string') return v.length > 40 ? `string(${v.length})` : `string "${v}"`;
  return `${typeof v} ${JSON.stringify(v)}`;
}

function obj(v, path) {
  if (!isObject(v)) fail(path, 'an object', v);
  return v;
}

function str(v, path, { nonEmpty = false } = {}) {
  if (typeof v !== 'string') fail(path, 'a string', v);
  if (nonEmpty && v.trim() === '') throw new SchemaError(path, 'expected a non-empty string, got ""');
  return v;
}

function num(v, path) {
  if (typeof v !== 'number' || Number.isNaN(v)) fail(path, 'a number', v);
  return v;
}

function bool(v, path) {
  if (typeof v !== 'boolean') fail(path, 'a boolean', v);
  return v;
}

function arr(v, path) {
  if (!Array.isArray(v)) fail(path, 'an array', v);
  return v;
}

function rec(v, path) {
  if (!isObject(v)) fail(path, 'an object of keyed entries', v);
  return v;
}

/** Required field: throws when the key is absent. */
function need(holder, key, path) {
  if (!(key in holder)) throw new SchemaError(`${path}.${key}`, 'field is required but missing');
  return holder[key];
}

/** Optional field: runs `check` only when the key is present and not undefined. */
function opt(holder, key, path, check) {
  if (!(key in holder) || holder[key] === undefined) return undefined;
  return check(holder[key], `${path}.${key}`);
}

function strArray(v, path) {
  arr(v, path).forEach((item, i) => str(item, `${path}[${i}]`));
  return v;
}

// ---------------------------------------------------------------------------
// leaf shapes
// ---------------------------------------------------------------------------

/** Marker-to-marker extraction rule. Markers are compared by substring. */
export function validateExtractionRule(rule, path = 'rule') {
  obj(rule, path);
  str(need(rule, 'start_marker', path), `${path}.start_marker`, { nonEmpty: true });
  str(need(rule, 'end_marker', path), `${path}.end_marker`, { nonEmpty: true });
  opt(rule, 'strip_blockquote_prefix', path, bool);
  opt(rule, 'strip_outer_quotes', path, bool);
  return rule;
}

export function validateOutfit(outfit, path = 'outfit') {
  obj(outfit, path);
  str(need(outfit, 'short', path), `${path}.short`, { nonEmpty: true });
  str(need(outfit, 'description', path), `${path}.description`, { nonEmpty: true });
  opt(outfit, 'default', path, bool);
  opt(outfit, 'at_home_only', path, bool);
  return outfit;
}

export function validatePlate(plate, path = 'plate') {
  obj(plate, path);
  str(need(plate, 'path', path), `${path}.path`, { nonEmpty: true });
  str(need(plate, 'register', path), `${path}.register`, { nonEmpty: true });
  // Optional on purpose — derived crops are retired, see the module comment.
  opt(plate, 'derived_from', path, str);
  opt(plate, 'note', path, str);
  opt(plate, 'generated', path, bool);
  return plate;
}

export function validateCharacter(character, path = 'character') {
  obj(character, path);
  str(need(character, 'display_name', path), `${path}.display_name`, { nonEmpty: true });
  str(need(character, 'bible', path), `${path}.bible`, { nonEmpty: true });
  validateExtractionRule(need(character, 'identity_block', path), `${path}.identity_block`);
  if (character.mask_negative_block !== undefined) {
    validateExtractionRule(character.mask_negative_block, `${path}.mask_negative_block`);
  }
  if (character.tails !== undefined) {
    rec(character.tails, `${path}.tails`);
    for (const [tail, rule] of Object.entries(character.tails)) {
      validateExtractionRule(rule, `${path}.tails.${tail}`);
    }
  }
  opt(character, 'height_cm', path, num);
  opt(character, 'height_note', path, str);
  opt(character, 'proportions', path, str);
  opt(character, 'constants', path, strArray);
  opt(character, 'reference_images', path, strArray);
  opt(character, 'reference_images_note', path, str);
  if (character.plates !== undefined) {
    rec(character.plates, `${path}.plates`);
    for (const [name, plate] of Object.entries(character.plates)) {
      validatePlate(plate, `${path}.plates.${name}`);
    }
  }
  if (character.outfits !== undefined) {
    rec(character.outfits, `${path}.outfits`);
    for (const [id, outfit] of Object.entries(character.outfits)) {
      validateOutfit(outfit, `${path}.outfits.${id}`);
    }
  }
  return character;
}

export function validateCastEntry(entry, path = 'cast[]') {
  obj(entry, path);
  str(need(entry, 'character', path), `${path}.character`, { nonEmpty: true });
  // Required as a value, nullable for characters with no outfits. Omitting the
  // key entirely is a refusal in the compiler, so it is refused here too.
  if (!('outfit_id' in entry)) {
    throw new SchemaError(
      `${path}.outfit_id`,
      'field is required (use null for a character with no outfits)',
    );
  }
  if (entry.outfit_id !== null) str(entry.outfit_id, `${path}.outfit_id`, { nonEmpty: true });
  str(need(entry, 'anchor', path), `${path}.anchor`, { nonEmpty: true });
  str(need(entry, 'depth', path), `${path}.depth`, { nonEmpty: true });
  str(need(entry, 'action', path), `${path}.action`, { nonEmpty: true });
  str(need(entry, 'gaze_target', path), `${path}.gaze_target`, { nonEmpty: true });
  opt(entry, 'in_scale', path, bool);
  return entry;
}

export function validateProp(prop, path = 'prop') {
  obj(prop, path);
  str(need(prop, 'item', path), `${path}.item`, { nonEmpty: true });
  str(need(prop, 'owner', path), `${path}.owner`, { nonEmpty: true });
  opt(prop, 'anchor', path, str);
  opt(prop, 'description', path, str);
  opt(prop, 'state', path, str);
  opt(prop, 'contains', path, str);
  return prop;
}

// ---------------------------------------------------------------------------
// documents
// ---------------------------------------------------------------------------

/** Registry: pointers, extraction rules and structured data — never block prose. */
export function validateRegistry(registry, path = 'registry') {
  obj(registry, path);
  num(need(registry, 'version', path), `${path}.version`);
  opt(registry, 'source_of_truth', path, str);
  opt(registry, 'delimiter_convention', path, str);
  opt(registry, 'layout', path, str);
  if (registry.units !== undefined) {
    rec(registry.units, `${path}.units`);
    for (const [unit, value] of Object.entries(registry.units)) {
      str(value, `${path}.units.${unit}`);
    }
  }
  rec(need(registry, 'shared_blocks', path), `${path}.shared_blocks`);
  for (const [id, block] of Object.entries(registry.shared_blocks)) {
    str(block, `${path}.shared_blocks.${id}`, { nonEmpty: true });
  }
  const characters = rec(need(registry, 'characters', path), `${path}.characters`);
  const ids = Object.keys(characters);
  if (ids.length === 0) {
    throw new SchemaError(`${path}.characters`, 'registry declares no characters — every registry needs cast');
  }
  for (const [id, character] of Object.entries(characters)) {
    validateCharacter(character, `${path}.characters.${id}`);
    // A bible path must be relative to the universe root, never absolute: the
    // root is resolved per-machine and the canon has to travel with it.
    if (character.bible.startsWith('/')) {
      throw new SchemaError(
        `${path}.characters.${id}.bible`,
        `expected a path relative to the universe root, got the absolute path ${character.bible}`,
      );
    }
  }
  return registry;
}

export function validateFrameSpec(spec, path = 'spec') {
  obj(spec, path);
  num(need(spec, 'frame', path), `${path}.frame`);
  str(need(spec, 'title', path), `${path}.title`, { nonEmpty: true });
  str(need(spec, 'set', path), `${path}.set`, { nonEmpty: true });
  opt(spec, 'set_slug', path, str);
  str(need(spec, 'register', path), `${path}.register`, { nonEmpty: true });

  const master = obj(need(spec, 'master', path), `${path}.master`);
  num(need(master, 'width', `${path}.master`), `${path}.master.width`);
  num(need(master, 'height', `${path}.master`), `${path}.master.height`);
  str(need(master, 'aspect_ratio', `${path}.master`), `${path}.master.aspect_ratio`, { nonEmpty: true });

  const floorplan = obj(need(spec, 'floorplan', path), `${path}.floorplan`);
  str(need(floorplan, 'camera', `${path}.floorplan`), `${path}.floorplan.camera`, { nonEmpty: true });
  const anchors = rec(need(floorplan, 'anchors', `${path}.floorplan`), `${path}.floorplan.anchors`);
  for (const [name, description] of Object.entries(anchors)) {
    str(description, `${path}.floorplan.anchors.${name}`);
  }

  const cast = arr(need(spec, 'cast', path), `${path}.cast`);
  if (cast.length === 0) {
    throw new SchemaError(`${path}.cast`, 'frame has no cast — a frame is people in a place');
  }
  cast.forEach((entry, i) => validateCastEntry(entry, `${path}.cast[${i}]`));

  if (spec.props !== undefined) {
    arr(spec.props, `${path}.props`).forEach((prop, i) => validateProp(prop, `${path}.props[${i}]`));
  }

  for (const key of ['moment', 'environment', 'lighting', 'colour']) {
    str(need(spec, key, path), `${path}.${key}`, { nonEmpty: true });
  }
  strArray(need(spec, 'negatives', path), `${path}.negatives`);
  opt(spec, 'references', path, strArray);
  opt(spec, 'denylist', path, strArray);
  opt(spec, 'shared_outfits', path, strArray);

  if (spec.block_overrides !== undefined) {
    rec(spec.block_overrides, `${path}.block_overrides`);
    for (const [block, text] of Object.entries(spec.block_overrides)) {
      str(text, `${path}.block_overrides.${block}`, { nonEmpty: true });
    }
  }
  if (spec.block_edits !== undefined) {
    rec(spec.block_edits, `${path}.block_edits`);
    for (const [block, edit] of Object.entries(spec.block_edits)) {
      const at = `${path}.block_edits.${block}`;
      obj(edit, at);
      if (edit.omit_sentences !== undefined) strArray(edit.omit_sentences, `${at}.omit_sentences`);
    }
  }
  return spec;
}

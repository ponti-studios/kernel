// Registry access — the port of `packages/universe/src/registry.ts`.
//
// `registry.ts` carried two things: the zod shapes (now `schemas.mjs`) and, by
// convention, the fact that the registry is the one file the compiler loads.
// This module owns the second half: where the registry file lives, how it is
// read, and how a character is looked up.
//
// The registry holds pointers and extraction rules — never copied block prose
// ("one fact, one home"). Everything a frame needs is either in here or in the
// bible it points at.
//
// Layout note: the shipped canon keeps the file at `data/registry.json` (flat),
// while a studio checkout keeps it at `universe/registry/registry.json`. Both
// are accepted, flat first, so the skill's own data always wins over a stale
// `--root` that predates the flattening.
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { validateRegistry } from './schemas.mjs';

export { validateRegistry } from './schemas.mjs';

/** Candidate registry locations under a universe root, in precedence order. */
export const REGISTRY_CANDIDATES = ['registry.json', join('registry', 'registry.json')];

/**
 * Resolve the registry file under `root`.
 * @param {string} root universe root (the directory holding `bibles/`)
 * @returns {string} absolute path
 */
export function registryPath(root) {
  const base = resolve(root);
  for (const rel of REGISTRY_CANDIDATES) {
    const candidate = join(base, rel);
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(
    `no registry found under ${base}\nTried:\n  ${REGISTRY_CANDIDATES.map((rel) => join(base, rel)).join('\n  ')}\n` +
      `A universe root holds registry.json (or registry/registry.json) and bibles/.`,
  );
}

/** True when `root` looks like a universe root (has a registry file). */
export function hasRegistry(root) {
  try {
    registryPath(root);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load and (by default) validate the registry.
 *
 * The returned object is the parsed JSON untouched — the compiler is
 * byte-sensitive, so nothing here normalises, defaults or reorders.
 *
 * @param {string} root universe root
 * @param {{ validate?: boolean, file?: string }} [options]
 * @returns {object} registry
 */
export function loadRegistry(root, options = {}) {
  const file = options.file ?? registryPath(root);
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch (err) {
    throw new Error(`cannot read registry ${file}: ${err.message}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(`${file} is not valid JSON: ${err.message}`);
  }
  if (options.validate !== false) {
    try {
      validateRegistry(parsed);
    } catch (err) {
      throw new Error(`${file} is not a valid registry — ${err.message}`);
    }
  }
  return parsed;
}

/** Character id present in the registry? */
export function hasCharacter(registry, id) {
  return Object.hasOwn(registry.characters, id);
}

/**
 * Look one character up, refusing with the known cast listed — a missing id is
 * always a typo in a spec, and the list is the fix.
 */
export function character(registry, id) {
  if (!hasCharacter(registry, id)) {
    throw new Error(
      `unknown character "${id}" — registry knows: ${Object.keys(registry.characters).join(', ')}`,
    );
  }
  return registry.characters[id];
}

/** Character ids, in registry order. */
export function listCharacters(registry) {
  return Object.keys(registry.characters);
}

/** Absolute path to a character's bible. */
export function biblePath(root, id, registry) {
  const reg = registry ?? loadRegistry(root);
  return join(root, character(reg, id).bible);
}

/** Outfit ids for a character (empty array when it has none). */
export function listOutfits(registry, id) {
  return Object.keys(character(registry, id).outfits ?? {});
}

/** Tail block ids for a character (empty array when it has none). */
export function listTails(registry, id) {
  return Object.keys(character(registry, id).tails ?? {});
}

/**
 * Every file the registry points at, as { character, kind, id, relpath }.
 * Used by the tests and `registry-report.sh` to prove the canon data set is
 * complete without compiling anything.
 */
export function referencedFiles(registry) {
  const out = [];
  for (const [id, c] of Object.entries(registry.characters)) {
    out.push({ character: id, kind: 'bible', id: 'bible', relpath: c.bible });
    for (const relpath of c.reference_images ?? []) {
      out.push({ character: id, kind: 'reference_image', id: relpath, relpath });
    }
    for (const [plateId, plate] of Object.entries(c.plates ?? {})) {
      out.push({ character: id, kind: 'plate', id: plateId, relpath: plate.path });
    }
  }
  return out;
}

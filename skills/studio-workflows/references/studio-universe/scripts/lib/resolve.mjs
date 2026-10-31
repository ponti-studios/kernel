// Locating canon: this is the ONE place that knows where anything lives.
//
// The skill is self-contained. Its canon, compiler and fixture baseline all sit
// inside this skill directory, and NOTHING here requires a studio checkout, a
// `pnpm build`, or an npm install to compile a prompt:
//
//   data/registry.json + data/bibles/**          the canon
//   scripts/lib/compile.mjs                      the ported compiler
//   test/fixtures/{specs,expected}               the byte-exact baseline
//
// A studio checkout is still *understood*, because app-parity checks want the
// original TypeScript build while the monorepo exists — but every repo path is
// optional here, resolved lazily, and never imported at module load. A missing
// checkout is a normal state, not a startup crash.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { hasRegistry } from './registry.mjs';

export {
  SchemaError,
  validateCastEntry,
  validateCharacter,
  validateExtractionRule,
  validateFrameSpec,
  validateOutfit,
  validatePlate,
  validateProp,
  validateRegistry,
} from './schemas.mjs';
export {
  REGISTRY_CANDIDATES,
  biblePath,
  character,
  hasCharacter,
  hasRegistry,
  listCharacters,
  listOutfits,
  listTails,
  loadRegistry,
  referencedFiles,
  registryPath,
} from './registry.mjs';

// ---------------------------------------------------------------------------
// where this skill lives
// ---------------------------------------------------------------------------

export const SKILL_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
/** Canon root shipped with the skill: registry.json + bibles/. */
export const LOCAL_DATA_DIR = join(SKILL_DIR, 'data');
/** The ported compiler — byte-exact against the TypeScript original. */
export const LOCAL_COMPILER = join(SKILL_DIR, 'scripts', 'lib', 'compile.mjs');
/** Fixture baseline that travels with the compiler. */
export const LOCAL_FIXTURES_DIR = join(SKILL_DIR, 'test', 'fixtures');

// ---------------------------------------------------------------------------
// user configuration (~/.pontistudios.studio.yml)
// ---------------------------------------------------------------------------

// The same flat "key: value" parser the studio app uses, so one file configures
// the app and the CLI skills identically. Precedence is fixed and documented:
// flag > environment variable > this file > built-in default.
export const userConfigPath =
  process.env.STUDIO_CONFIG ?? join(homedir(), '.pontistudios.studio.yml');

/** @returns {Record<string, string>} */
export function parseUserConfig(text) {
  const out = {};
  for (const raw of text.split('\n')) {
    const line = raw.replace(/(^|\s)#.*$/, '').trim();
    if (!line || !line.includes(':')) continue;
    const at = line.indexOf(':');
    const key = line.slice(0, at).trim();
    let value = line.slice(at + 1).trim();
    if (!key || !value) continue;
    // ~ expands at the start of the value and after a scheme prefix like file:
    value = value
      .replace(/^["']|["']$/g, '')
      .replace(/(^|:)~(?=\/|$)/g, (_m, lead) => lead + homedir());
    out[key] = value;
  }
  return out;
}

/** Raw config-file contents (flat keys). A missing file is an empty object. */
export function fileConfig() {
  return existsSync(userConfigPath) ? parseUserConfig(readFileSync(userConfigPath, 'utf8')) : {};
}

/** True when the config file is readable by anyone but the owner. */
export function configFileIsGroupOrWorldReadable() {
  if (!existsSync(userConfigPath)) return false;
  return (statSync(userConfigPath).mode & 0o077) !== 0;
}

/**
 * Resolve one setting: environment variable, then config-file key, then fallback.
 * @param {string} envName e.g. `STUDIO_UNIVERSE_ROOT`
 * @param {string} key config-file key, e.g. `universe_root`
 * @param {string | (() => string)} fallback
 */
export function setting(envName, key, fallback) {
  if (process.env[envName]) return process.env[envName];
  const fromFile = fileConfig()[key];
  if (fromFile) return fromFile;
  return typeof fallback === 'function' ? fallback() : fallback;
}

// ---------------------------------------------------------------------------
// the studio checkout (optional)
// ---------------------------------------------------------------------------

/** Where a studio checkout would be, if there is one. */
export function studioRoot() {
  return setting('STUDIO_ROOT', 'studio_root', () => join(homedir(), 'Developer', 'studio'));
}

/**
 * The built TypeScript compiler, when a checkout with a build is present.
 * @returns {string | null} null means "no app-parity check possible here"
 */
export function distCompilerEntry() {
  const candidates = [
    process.env.STUDIO_UNIVERSE_ENTRY,
    join(studioRoot(), 'packages/universe/dist/index.js'),
  ].filter(Boolean);
  return candidates.find((p) => existsSync(p)) ?? null;
}

/**
 * @returns {string} the dist entry
 * @throws when no build exists — says how to get one, never guesses
 */
export function universeEntry() {
  const found = distCompilerEntry();
  if (found) return found;
  throw new Error(
    'the TypeScript compiler is not available — this skill compiles prompts from its own\n' +
      'data/ with scripts/lib/compile.mjs, so nothing is broken. Only app-parity checks\n' +
      '(--compiler dist) need the original build:\n' +
      `  expected ${join(studioRoot(), 'packages/universe/dist/index.js')}\n` +
      '  or set STUDIO_UNIVERSE_ENTRY to a built dist/index.js',
  );
}

// ---------------------------------------------------------------------------
// the universe root
// ---------------------------------------------------------------------------

/**
 * Why this root was chosen — `env`, `config`, `skill`, or `repo`. Reporting
 * code prints it so "which canon did that prompt come from?" is answerable.
 * @param {string} root
 */
export function universeRootSource(root) {
  if (root === process.env.STUDIO_UNIVERSE_ROOT) return 'env STUDIO_UNIVERSE_ROOT';
  if (root === fileConfig().universe_root) return `config universe_root (${userConfigPath})`;
  if (root === LOCAL_DATA_DIR) return 'skill data/';
  if (root === join(studioRoot(), 'universe')) return 'studio checkout';
  return 'explicit --root';
}

/**
 * Where the canon is.
 *
 * Precedence — the skill's own data/ comes before any checkout:
 *   1. `STUDIO_UNIVERSE_ROOT`   (a stale or moved path is skipped, not fatal)
 *   2. config key `universe_root`
 *   3. the skill's own `data/`  ← the normal answer, always present
 *   4. `<STUDIO_ROOT>/universe` (a checkout, while one still exists)
 *
 * A candidate only counts if it actually holds a registry, so an environment
 * variable left over from a deleted checkout cannot shadow the canon that
 * shipped with the skill.
 *
 * @returns {string} absolute universe root
 */
export function universeRoot() {
  const candidates = [
    process.env.STUDIO_UNIVERSE_ROOT,
    fileConfig().universe_root,
    LOCAL_DATA_DIR,
    join(studioRoot(), 'universe'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (!hasRegistry(candidate)) continue;
    const envRoot = process.env.STUDIO_UNIVERSE_ROOT;
    if (envRoot && candidate !== envRoot) {
      // Still resolved, but say so: a set-but-empty root is a mistake worth seeing.
      process.stderr.write(`# note: STUDIO_UNIVERSE_ROOT=${envRoot} holds no registry; using ${candidate}\n`);
    }
    return candidate;
  }
  throw new Error(
    `no canon found. Tried:\n  ${candidates.join('\n  ')}\n` +
      `The skill ships canon at ${LOCAL_DATA_DIR} — if that is missing, reinstall the skill.`,
  );
}

/** The fixture baseline: `<dir>/specs/*.json` + `<dir>/expected/*.prompt.txt`. */
export function fixturesDir() {
  if (existsSync(join(LOCAL_FIXTURES_DIR, 'specs'))) return LOCAL_FIXTURES_DIR;
  // A checkout's fixtures are the same records; accept them so an app-parity run
  // still works if the skill copy was pruned.
  const repo = join(studioRoot(), 'packages/universe/test/fixtures');
  return existsSync(join(repo, 'specs')) ? repo : LOCAL_FIXTURES_DIR;
}

// ---------------------------------------------------------------------------
// compilers
// ---------------------------------------------------------------------------

const REQUIRED_EXPORTS = ['compileSpec', 'loadRegistry', 'loadSpec', 'validate'];

async function assertCompiler(mod, label) {
  for (const fn of REQUIRED_EXPORTS) {
    if (typeof mod[fn] !== 'function') throw new Error(`${label} is missing ${fn}()`);
  }
  return mod;
}

/**
 * The ported compiler. Supports both voices; needs no build and no checkout.
 * It is loaded from this skill by path, never through the resolved entry, so
 * "compile a prompt" cannot quietly start depending on the monorepo again.
 */
export async function loadLocalCompiler() {
  const mod = await import(LOCAL_COMPILER);
  return assertCompiler(mod, 'the local compiler (scripts/lib/compile.mjs)');
}

/** The original TypeScript build — legacy voice only, for app parity. */
export async function loadCompiler() {
  const entry = universeEntry();
  const mod = await import(entry);
  return assertCompiler(mod, `the dist compiler at ${entry} — wrong or stale build?`);
}

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// Every studio skill sits beside the others; there is no repo checkout and no build
// step. Config parsing, providers and usage handling all come from studio-core.
import { apiKey, setting } from '../../../studio-core/scripts/lib/config.mjs';

export { setting };
export { apiKey };

const SKILLS = join(import.meta.dirname, '..', '..', '..');
const CORE = join(SKILLS, 'studio-core', 'scripts/lib');
// Locates the studio image toolchain.
//
// The ONLY place that knows where the implementation lives. At port time set
// these env vars at the ported modules and nothing else changes.


export function studioRoot() {
  return setting('STUDIO_ROOT', 'studio_root', () => SKILLS);
}

// The canon lives inside the studio-universe skill.
export function universeRoot() {
  return setting('STUDIO_UNIVERSE_ROOT', 'universe_root', () => join(SKILLS, 'studio-universe', 'data'));
}

const MODULES = {
  config: () => import(join(CORE, 'config.mjs')),
  providers: async () => ({
    ...(await import(join(CORE, 'images.mjs'))),
    ...(await import(join(CORE, 'video.mjs'))),
    ...(await import(join(CORE, 'speech.mjs'))),
    ...(await import(join(CORE, 'text.mjs'))),
    ...(await import(join(CORE, 'media.mjs'))),
    ...(await import(join(CORE, 'usage.mjs'))),
  }),
  editorial: () => import(join(SKILLS, 'scene-schema', 'schema.mjs')),
  universe: () => import(join(SKILLS, 'studio-universe', 'scripts/lib/compile.mjs')),
};

export async function load(which) {
  const mod = MODULES[which];
  if (!mod) throw new Error(`unknown module '${which}' (have: ${Object.keys(MODULES).join(', ')})`);
  return mod();
}



export const IMAGE_MIME = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

// A frame spec may be the bare spec or an artifact wrapper. Structural check
// only: the authoritative validation is the compiler's own validate(), which
// refuses with a named code — the ported compiler deliberately does not ship a
// duplicate schema.
export async function readSpec(path) {
  const { compileSpec, loadRegistry } = await load('universe');
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  const candidate = raw?.frameSpec ?? raw?.draft ?? raw;
  if (!candidate || typeof candidate !== 'object') {
    throw new Error(`${path} does not contain a frame spec object`);
  }
  for (const field of ['frame', 'title', 'master', 'floorplan', 'cast']) {
    if (!(field in candidate)) {
      throw new Error(`${path} is not a frame spec: missing ${field}`);
    }
  }
  return candidate;
}

// Validate a spec against a registry, reporting the compiler's named code.
export async function validateSpec(spec) {
  const { validate, loadRegistry } = await load('universe');
  validate(spec, loadRegistry(universeRoot()));
}

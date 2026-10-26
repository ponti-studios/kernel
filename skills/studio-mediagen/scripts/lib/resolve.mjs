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
// Locates the studio media toolchain.
//
// The ONLY place that knows where the implementation lives. At port time set
// these env vars at the ported modules and nothing else changes.

const STUDIO = setting('STUDIO_ROOT', 'studio_root', () => join(homedir(), 'Developer', 'studio'));

export function studioRoot() {
  return setting('STUDIO_ROOT', 'studio_root', () => SKILLS);
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
  editorial: () => import(join(SKILLS, 'studio-scenes', 'scripts/lib/schema.mjs')),
  universe: () => import(join(SKILLS, 'studio-universe', 'scripts/lib/compile.mjs')),
};

export async function load(which) {
  const mod = MODULES[which];
  if (!mod) throw new Error(`unknown module '${which}' (have: ${Object.keys(MODULES).join(', ')})`);
  return mod();
}



// Voice resolution, mirroring the app (apps/web/src/lib/server/api.ts):
// an explicit voice_id wins; the named voices fall back to the default when
// their env var is unset or empty.
export function voiceIdForScene(scene, env) {
  if (scene.voice_id) return { id: scene.voice_id, why: 'scene.voice_id' };
  if (scene.voice === 'peter' && env.PETER_VOICE_ID) {
    return { id: env.PETER_VOICE_ID, why: 'PETER_VOICE_ID' };
  }
  if (scene.voice === 'stewie' && env.STEWIE_VOICE_ID) {
    return { id: env.STEWIE_VOICE_ID, why: 'STEWIE_VOICE_ID' };
  }
  const fellBack = scene.voice ? ` (scene asked for '${scene.voice}', not configured)` : '';
  return { id: env.DEFAULT_VOICE_ID, why: `DEFAULT_VOICE_ID${fellBack}` };
}

// A scenes draft is a top-level JSON array of scene objects; accept an artifact
// wrapper too, and validate through the editorial schema.
export async function readScenes(path) {
  const { scenesDraftSchema } = await load('editorial');
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  const candidate = Array.isArray(raw) ? raw : (raw.scenes ?? raw.draft);
  try {
    return scenesDraftSchema.parse(candidate);
  } catch (err) {
    throw new Error(`${path} is not a scenes draft: ${err.message}`);
  }
}

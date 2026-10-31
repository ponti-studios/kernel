// Configuration for the studio skills.
//
// Ported from studio packages/config/src/index.ts, minus zod and minus the
// monorepo: this file is the single parser for the user config file, and it has
// to be able to locate that file with nothing else built.
//
// Configuration has exactly two sources: the environment, and one user-level
// file (~/.pontistudios.studio.yml, or $STUDIO_CONFIG). There is no .env, no
// dotenv and no search path — an exported variable wins over the file, and that
// is the whole rule.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const userConfigPath = process.env.STUDIO_CONFIG ?? join(homedir(), '.pontistudios.studio.yml');

export function parseUserConfig(text) {
  const out = {};
  for (const raw of String(text).split('\n')) {
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

/** Config-file keys that name an environment variable, applied only when unset. */
const USER_CONFIG_TO_ENV = {
  studio_root: 'STUDIO_ROOT',
  press_root: 'STUDIO_PRESS_ROOT',
  usage_dir: 'STUDIO_USAGE_DIR',
  inbox: 'STUDIO_INBOX',
  drafts_dir: 'STUDIO_DRAFTS_DIR',
  openrouter_api_key: 'OPENROUTER_API_KEY',
  model_text: 'OPENROUTER_TEXT_MODEL',
  model_image: 'OPENROUTER_IMAGE_MODEL',
  model_video: 'OPENROUTER_VIDEO_MODEL',
  model_speech: 'OPENROUTER_SPEECH_MODEL',
};

export function applyUserConfig(path = userConfigPath) {
  if (!existsSync(path)) return [];
  const applied = [];
  for (const [key, value] of Object.entries(parseUserConfig(readFileSync(path, 'utf8')))) {
    const envName = USER_CONFIG_TO_ENV[key];
    if (!envName || process.env[envName]) continue;
    process.env[envName] = value;
    applied.push(envName);
  }
  return applied;
}

// Same import-time side effect as the original module: the file fills any
// OPENROUTER_*/STUDIO_* variable the environment has not already set.
applyUserConfig();

/** Raw config-file contents (flat keys), for callers that need several at once. */
export function fileConfig(path = userConfigPath) {
  return existsSync(path) ? parseUserConfig(readFileSync(path, 'utf8')) : {};
}

/**
 * Resolve one setting: environment variable, then config-file key, then fallback.
 * There is one parse rule for the app and the skills, and it lives here.
 */
export function setting(envName, key, fallback) {
  if (process.env[envName]) return process.env[envName];
  const fromFile = fileConfig()[key];
  if (fromFile) return fromFile;
  return typeof fallback === 'function' ? fallback() : fallback;
}

/** True when the config file is readable by anyone but the owner. */
export function configFileIsGroupOrWorldReadable(path = userConfigPath) {
  if (!existsSync(path)) return false;
  return (statSync(path).mode & 0o077) !== 0;
}

/**
 * The key, or a message that says exactly where to put it. Skills call this
 * instead of reading OPENROUTER_API_KEY directly so the warning about a
 * world-readable file is issued once, in one place.
 */
export function apiKey(path = userConfigPath) {
  if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY;
  const fromFile = parseUserConfig(existsSync(path) ? readFileSync(path, 'utf8') : '')
    .openrouter_api_key;
  if (fromFile) {
    if (configFileIsGroupOrWorldReadable(path)) {
      console.error(
        `warning: ${path} holds a key and is readable by other users — chmod 600 it`,
      );
    }
    return fromFile;
  }
  throw new Error(
    `OPENROUTER_API_KEY is not set. Export it, or add openrouter_api_key to ${path}.`,
  );
}

// Defaults mirror the app's env schema. Everything is a string; nothing is
// guessed. zod's enum is replaced by the plain check in loadEnv().
const ENV_DEFAULTS = {
  NODE_ENV: 'development',
  STUDIO_ROOT: () => join(homedir(), 'Developer', 'studio'),
  OPENROUTER_API_KEY: '',
  OPENROUTER_TEXT_MODEL: 'deepseek/deepseek-chat-v3-0324',
  OPENROUTER_VIDEO_MODEL: 'kwaivgi/kling-v3.0-std',
  OPENROUTER_SPEECH_MODEL: 'elevenlabs/eleven-multilingual-v2',
  OPENROUTER_IMAGE_MODEL: 'qwen/qwen-image-2.1-turbo',
  PETER_VOICE_ID: '',
  STEWIE_VOICE_ID: '',
  DEFAULT_VOICE_ID: 'pNInz6obpgDQGcFmaJgB',
  STUDIO_PRESS_ROOT: '',
};

const NODE_ENVS = ['development', 'test', 'production'];

/** Defaults, for callers that want to render them without reading any file. */
export function envDefaults() {
  const out = {};
  for (const [key, value] of Object.entries(ENV_DEFAULTS)) {
    out[key] = typeof value === 'function' ? value() : value;
  }
  return out;
}

/**
 * The whole environment as one object, defaults applied.
 *
 * Precedence is the same as `setting()`: process.env (already filled from the
 * file by applyUserConfig at import) then overrides then defaults. The original
 * memoised this when called with no overrides; this port re-reads every time,
 * because a cached environment is how a skill ends up ignoring a key the user
 * exported a second ago.
 */
export function loadEnv(overrides = {}) {
  const env = envDefaults();
  for (const key of Object.keys(ENV_DEFAULTS)) {
    const value = overrides[key] ?? process.env[key];
    if (value !== undefined) env[key] = value;
  }
  const nodeEnv = env.NODE_ENV;
  if (!NODE_ENVS.includes(nodeEnv)) {
    throw new Error(`NODE_ENV must be one of ${NODE_ENVS.join(', ')} (got "${nodeEnv}")`);
  }
  return env;
}

import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';

// The module resolves the config path once, at import, exactly like the app
// does. Each case therefore imports a fresh instance with STUDIO_CONFIG set,
// runs the assertions while that environment is in place, and restores the
// environment afterwards so cases cannot leak into one another.
let counter = 0;
async function withConfig(env, fn) {
  const saved = { ...process.env };
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    const mod = await import(`../scripts/lib/config.mjs?case=${++counter}`);
    return await fn(mod);
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in saved)) delete process.env[key];
    Object.assign(process.env, saved);
  }
}

let dir;
let configPath;

before(() => {
  dir = mkdtempSync(join(tmpdir(), 'studio-core-config-'));
  configPath = join(dir, '.pontistudios.studio.yml');
  writeFileSync(
    configPath,
    [
      '# studio config',
      'inbox: ~/Pictures/imagegen/_inbox',
      'press_root: "/tmp/press"   # trailing comment',
      'model_image: qwen/qwen-image-2.1-turbo',
      'drafts_dir: file:/tmp/out',
      'usage_dir: file:~/usage',
      'openrouter_api_key: from-file',
      'quoted: \'single\'',
      'empty:',
      'key:with:colons',
      'not a pair',
    ].join('\n'),
  );
});

after(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('parseUserConfig', () => {
  it('parses flat keys, comments, quotes and ~ expansion', async () => {
    await withConfig({}, ({ parseUserConfig }) => {
      const parsed = parseUserConfig(
        [
          '# studio config',
          'inbox: ~/Pictures/imagegen/_inbox',
          'press_root: "/tmp/press"   # trailing comment',
          'model_image: qwen/qwen-image-2.1-turbo',
          'drafts_dir: file:/tmp/out',
          'not a pair',
        ].join('\n'),
      );
      assert.equal(parsed.inbox, join(homedir(), 'Pictures/imagegen/_inbox'));
      assert.equal(parsed.inbox.startsWith('~'), false);
      assert.equal(parsed.press_root, '/tmp/press');
      assert.equal(parsed.model_image, 'qwen/qwen-image-2.1-turbo');
      assert.equal(parsed.drafts_dir, 'file:/tmp/out');
      assert.equal(parsed['not a pair'], undefined);
    });
  });

  it('expands a tilde after a scheme prefix', async () => {
    await withConfig({}, ({ parseUserConfig }) => {
      const parsed = parseUserConfig('usage_dir: file:~/usage\nvault: studio:~/vault');
      assert.equal(parsed.usage_dir, `file:${homedir()}/usage`);
      // the source rule expands after ANY ":" — a scheme is just the common case
      assert.equal(parsed.vault, `studio:${homedir()}/vault`);
    });
  });

  it('strips a pair of surrounding quotes', async () => {
    await withConfig({}, ({ parseUserConfig }) => {
      const parsed = parseUserConfig('a: "quoted"\nb: \'single\'\nc: "mixed\n');
      assert.equal(parsed.a, 'quoted');
      assert.equal(parsed.b, 'single');
      assert.equal(parsed.c, 'mixed');
    });
  });

  it('keeps colons inside the value and skips empty values', async () => {
    await withConfig({}, ({ parseUserConfig }) => {
      const parsed = parseUserConfig('key:with:colons\nempty:\n   \n:novalue\n');
      assert.equal(parsed.key, 'with:colons');
      assert.equal(parsed.empty, undefined);
      assert.equal(parsed[''], undefined);
    });
  });

  it('does not expand a tilde in the middle of a path', async () => {
    await withConfig({}, ({ parseUserConfig }) => {
      assert.equal(parseUserConfig('p: /tmp/~user/x').p, '/tmp/~user/x');
    });
  });
});

describe('userConfigPath', () => {
  it('defaults to ~/.pontistudios.studio.yml', async () => {
    await withConfig({ STUDIO_CONFIG: undefined }, ({ userConfigPath }) => {
      assert.equal(userConfigPath, join(homedir(), '.pontistudios.studio.yml'));
    });
  });

  it('honours $STUDIO_CONFIG', async () => {
    await withConfig({ STUDIO_CONFIG: configPath }, ({ userConfigPath }) => {
      assert.equal(userConfigPath, configPath);
    });
  });
});

describe('fileConfig and setting', () => {
  it('reads the file as flat keys', async () => {
    await withConfig({ STUDIO_CONFIG: configPath }, ({ fileConfig }) => {
      const parsed = fileConfig();
      assert.equal(parsed.openrouter_api_key, 'from-file');
      assert.equal(parsed.usage_dir, `file:${homedir()}/usage`);
      assert.equal(parsed.model_image, 'qwen/qwen-image-2.1-turbo');
    });
  });

  it('returns {} when the file is absent', async () => {
    await withConfig({ STUDIO_CONFIG: join(dir, 'nope.yml') }, ({ fileConfig }) => {
      assert.deepEqual(fileConfig(), {});
    });
  });

  it('prefers the environment over the file', async () => {
    await withConfig(
      { STUDIO_CONFIG: configPath, OPENROUTER_API_KEY: 'from-env' },
      ({ setting }) => {
        assert.equal(setting('OPENROUTER_API_KEY', 'openrouter_api_key', ''), 'from-env');
      },
    );
  });

  it('falls back to the file when the variable is unset', async () => {
    await withConfig({ STUDIO_CONFIG: configPath }, ({ setting }) => {
      delete process.env.OPENROUTER_API_KEY;
      assert.equal(setting('OPENROUTER_API_KEY', 'openrouter_api_key', ''), 'from-file');
    });
  });

  it('falls back to the default when neither is set', async () => {
    await withConfig({ STUDIO_CONFIG: configPath }, ({ setting }) => {
      delete process.env.STUDIO_PRESS_ROOT;
      assert.equal(setting('STUDIO_PRESS_ROOT', 'missing_key', 'fallback'), 'fallback');
      assert.equal(setting('STUDIO_PRESS_ROOT', 'missing_key', () => '/computed'), '/computed');
    });
  });

  it('reads an empty environment variable as unset', async () => {
    await withConfig(
      { STUDIO_CONFIG: configPath, OPENROUTER_TEXT_MODEL: '' },
      ({ setting }) => {
        // '' is falsy, so the file (then the default) wins — the original rule.
        assert.equal(setting('OPENROUTER_TEXT_MODEL', 'model_text', 'default'), 'default');
      },
    );
  });
});

describe('applyUserConfig', () => {
  it('fills only the variables the environment has not set, and reports them', async () => {
    await withConfig(
      { STUDIO_CONFIG: configPath, OPENROUTER_TEXT_MODEL: 'from-env' },
      ({ applyUserConfig }) => {
        delete process.env.OPENROUTER_API_KEY;
        delete process.env.STUDIO_INBOX;
        const applied = applyUserConfig(configPath);
        assert.equal(process.env.OPENROUTER_API_KEY, 'from-file');
        assert.equal(process.env.STUDIO_INBOX, join(homedir(), 'Pictures/imagegen/_inbox'));
        assert.equal(process.env.OPENROUTER_TEXT_MODEL, 'from-env');
        assert.ok(applied.includes('OPENROUTER_API_KEY'));
        assert.equal(applied.includes('OPENROUTER_TEXT_MODEL'), false);
      },
    );
  });

  it('applies nothing when the file is absent', async () => {
    const missing = join(dir, 'nope.yml');
    await withConfig({ STUDIO_CONFIG: missing }, ({ applyUserConfig }) => {
      assert.deepEqual(applyUserConfig(missing), []);
    });
  });
});

describe('configFileIsGroupOrWorldReadable', () => {
  it('flags a 644 file and passes a 600 file', async () => {
    await withConfig({ STUDIO_CONFIG: configPath }, ({ configFileIsGroupOrWorldReadable }) => {
      chmodSync(configPath, 0o644);
      assert.equal(configFileIsGroupOrWorldReadable(), true);
      chmodSync(configPath, 0o600);
      assert.equal(configFileIsGroupOrWorldReadable(), false);
      assert.equal(configFileIsGroupOrWorldReadable(join(dir, 'nope.yml')), false);
    });
  });
});

describe('apiKey', () => {
  it('reads env, then the key in the file, then throws with the path', async () => {
    await withConfig(
      { STUDIO_CONFIG: configPath, OPENROUTER_API_KEY: 'env-key' },
      ({ apiKey }) => {
        assert.equal(apiKey(), 'env-key');

        delete process.env.OPENROUTER_API_KEY;
        chmodSync(configPath, 0o600);
        assert.equal(apiKey(), 'from-file');

        const empty = join(dir, 'empty.yml');
        writeFileSync(empty, 'inbox: /tmp/in\n');
        assert.throws(() => apiKey(empty), /OPENROUTER_API_KEY is not set/);
      },
    );
  });
});

describe('loadEnv', () => {
  it('defaults the models the same way the app does', async () => {
    const cleared = {};
    for (const key of [
      'OPENROUTER_TEXT_MODEL',
      'OPENROUTER_VIDEO_MODEL',
      'OPENROUTER_SPEECH_MODEL',
      'OPENROUTER_IMAGE_MODEL',
      'OPENROUTER_API_KEY',
      'DEFAULT_VOICE_ID',
      'NODE_ENV',
    ]) {
      cleared[key] = undefined;
    }
    await withConfig({ ...cleared, STUDIO_CONFIG: join(dir, 'env-defaults.yml') }, ({ loadEnv }) => {
      const env = loadEnv();
      assert.equal(env.OPENROUTER_TEXT_MODEL, 'deepseek/deepseek-chat-v3-0324');
      assert.equal(env.OPENROUTER_VIDEO_MODEL, 'kwaivgi/kling-v3.0-std');
      assert.equal(env.OPENROUTER_SPEECH_MODEL, 'elevenlabs/eleven-multilingual-v2');
      assert.equal(env.OPENROUTER_IMAGE_MODEL, 'qwen/qwen-image-2.1-turbo');
      assert.equal(env.OPENROUTER_API_KEY, '');
      assert.equal(env.DEFAULT_VOICE_ID, 'pNInz6obpgDQGcFmaJgB');
      assert.equal(env.NODE_ENV, 'development');
    });
  });

  it('lets overrides win, then the environment', async () => {
    const noFile = join(dir, 'env-overrides.yml');
    await withConfig({ OPENROUTER_TEXT_MODEL: 'from-env', STUDIO_CONFIG: noFile }, ({ loadEnv }) => {
      assert.equal(loadEnv().OPENROUTER_TEXT_MODEL, 'from-env');
      assert.equal(
        loadEnv({ OPENROUTER_TEXT_MODEL: 'from-override' }).OPENROUTER_TEXT_MODEL,
        'from-override',
      );
    });
  });

  it('rejects an invalid NODE_ENV', async () => {
    await withConfig({ STUDIO_CONFIG: join(dir, 'env-node-env.yml') }, ({ loadEnv }) => {
      assert.throws(() => loadEnv({ NODE_ENV: 'staging' }), /NODE_ENV must be one of/);
      assert.equal(loadEnv({ NODE_ENV: 'test' }).NODE_ENV, 'test');
    });
  });
});

// Root resolution: the skill's own data/ is the canon, and a stale environment
// variable left over from a deleted checkout must not shadow it. This is the
// test that proves the port is not quietly reading the monorepo.
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';

import { LOCAL_DATA_DIR, LOCAL_FIXTURES_DIR, universeRoot } from '../scripts/lib/resolve.mjs';

const scratch = mkdtempSync(join(tmpdir(), 'universe-resolve-'));
after(() => rmSync(scratch, { recursive: true, force: true }));

const ENV_KEYS = ['STUDIO_UNIVERSE_ROOT', 'STUDIO_ROOT', 'STUDIO_CONFIG', 'STUDIO_UNIVERSE_ENTRY'];

/** Run `fn` with a clean slate for the variables this module reads. */
async function withEnv(vars, fn) {
  const saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  for (const k of ENV_KEYS) delete process.env[k];
  Object.assign(process.env, vars);
  try {
    return await fn();
  } finally {
    for (const k of ENV_KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  }
}

/** Import a fresh copy of resolve.mjs so module-level config is re-read. */
const freshResolve = () => import(`../scripts/lib/resolve.mjs?fresh=${Math.random()}`);

test('with no configuration at all, canon resolves to the skill data directory', async () => {
  await withEnv({ STUDIO_CONFIG: join(scratch, 'absent.yml') }, async () => {
    const mod = await freshResolve();
    assert.equal(mod.universeRoot(), LOCAL_DATA_DIR);
  });
});

test('a STUDIO_UNIVERSE_ROOT that holds no registry falls back to the skill data', async () => {
  await withEnv(
    { STUDIO_CONFIG: join(scratch, 'absent.yml'), STUDIO_UNIVERSE_ROOT: join(scratch, 'gone') },
    async () => {
      const mod = await freshResolve();
      assert.equal(mod.universeRoot(), LOCAL_DATA_DIR);
    },
  );
});

test('a valid STUDIO_UNIVERSE_ROOT is honoured', async () => {
  const root = join(scratch, 'checkout-universe');
  mkdirSync(root, { recursive: true });
  copyFileSync(join(LOCAL_DATA_DIR, 'registry.json'), join(root, 'registry.json'));
  await withEnv({ STUDIO_CONFIG: join(scratch, 'absent.yml'), STUDIO_UNIVERSE_ROOT: root }, async () => {
    const mod = await freshResolve();
    assert.equal(mod.universeRoot(), root);
  });
});

test('a config-file universe_root is honoured only when it holds canon', async () => {
  const root = join(scratch, 'configured-universe');
  mkdirSync(join(root, 'registry'), { recursive: true });
  copyFileSync(join(LOCAL_DATA_DIR, 'registry.json'), join(root, 'registry', 'registry.json'));

  const good = join(scratch, 'good.yml');
  writeFileSync(good, `universe_root: ${root}\n`);
  await withEnv({ STUDIO_CONFIG: good }, async () => {
    const mod = await freshResolve();
    assert.equal(mod.universeRoot(), root);
    assert.match(mod.universeRootSource(root), /config universe_root/);
  });

  const stale = join(scratch, 'stale.yml');
  writeFileSync(stale, `universe_root: ${join(scratch, 'not-there')}\n`);
  await withEnv({ STUDIO_CONFIG: stale }, async () => {
    const mod = await freshResolve();
    assert.equal(mod.universeRoot(), LOCAL_DATA_DIR, 'a stale config root must not win');
  });
});

test('setting: environment beats the config file, which beats the default', async () => {
  const cfg = join(scratch, 'precedence.yml');
  writeFileSync(cfg, 'studio_root: ~/from-the-file\n');
  await withEnv({ STUDIO_CONFIG: cfg }, async () => {
    const mod = await freshResolve();
    const expanded = join(homedir(), 'from-the-file');
    assert.equal(mod.setting('STUDIO_ROOT', 'studio_root', '/default'), expanded);
    assert.equal(mod.setting('STUDIO_ROOT', 'studio_root', () => '/computed'), expanded);
    assert.equal(mod.setting('NOT_SET_ANYWHERE', 'missing_key', '/default'), '/default');
    process.env.STUDIO_ROOT = '/from-the-env';
    assert.equal(mod.setting('STUDIO_ROOT', 'studio_root', '/default'), '/from-the-env');
  });
});

test('the config parser handles comments, quotes and ~ expansion', async () => {
  await withEnv({ STUDIO_CONFIG: join(scratch, 'parse.yml') }, async () => {
    const mod = await freshResolve();
    const parsed = mod.parseUserConfig(
      ['# a comment', 'key: value', 'quoted: "spaced value"', 'home: ~/pictures', 'bad line', 'empty: '].join('\n'),
    );
    assert.equal(parsed.key, 'value');
    assert.equal(parsed.quoted, 'spaced value');
    assert.match(parsed.home, /^\/.*\/pictures$/);
    assert.equal(parsed.empty, undefined);
    assert.equal(parsed['bad line'], undefined);
  });
});

test('the fixture baseline resolves inside the skill', async () => {
  await withEnv({ STUDIO_CONFIG: join(scratch, 'absent.yml') }, () => {
    assert.equal(universeRoot(), LOCAL_DATA_DIR);
    assert.ok(LOCAL_FIXTURES_DIR.startsWith(LOCAL_DATA_DIR.replace(/\/data$/, '')));
  });
});

test('the local compiler loads with no checkout and no build', async () => {
  await withEnv({ STUDIO_CONFIG: join(scratch, 'absent.yml'), STUDIO_ROOT: join(scratch, 'no-repo') }, async () => {
    const mod = await freshResolve();
    assert.equal(mod.distCompilerEntry(), null, 'no dist build should be found under a fake STUDIO_ROOT');
    assert.throws(() => mod.universeEntry(), /TypeScript compiler is not available/);
    const compiler = await mod.loadLocalCompiler();
    assert.equal(typeof compiler.compileSpec, 'function');
    assert.equal(typeof compiler.loadRegistry, 'function');
  });
});

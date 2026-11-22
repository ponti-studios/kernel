import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const scripts = resolve(import.meta.dirname, '../scripts');
const universeData = resolve(import.meta.dirname, '../../studio-universe/data');
const universeSpec = resolve(import.meta.dirname, '../../studio-universe/test/fixtures/specs/example-set--frame1-the-arrival.json');
const run = (cmd, args, env = {}) => spawnSync(cmd, args, { encoding: 'utf8', env: { ...process.env, ...env } });

test('keyframes compile Universe specs, resolve each reference source, and preserve the old entrypoint', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'videogen-keyframes-'));
  try {
    const canon = join(dir, 'universe');
    cpSync(universeData, canon, { recursive: true });
    const canonRef = join(canon, 'bibles/example-hero/keyframe-ref.png');
    mkdirSync(join(dir, 'scene-refs'));
    const sceneRef = join(dir, 'scene-refs/prompt-ref.png');
    writeFileSync(canonRef, 'canon-ref');
    writeFileSync(sceneRef, 'scene-ref');

    const spec = JSON.parse(readFileSync(universeSpec, 'utf8'));
    spec.references = ['bibles/example-hero/keyframe-ref.png'];
    const specPath = join(dir, 'frame.json');
    writeFileSync(specPath, JSON.stringify(spec));
    const scenes = join(dir, 'scenes.json');
    writeFileSync(scenes, JSON.stringify([
      { id: 'from-spec', spec: 'frame.json' },
      { id: 'from-prompt', prompt: 'A hand-painted city street', references: ['scene-refs/prompt-ref.png'] },
    ]));

    const dry = run(join(scripts, 'keyframes.sh'), ['--scenes', scenes, '--out', join(dir, 'dry')], {
      STUDIO_UNIVERSE_ROOT: canon,
      STUDIO_USAGE_DIR: join(dir, 'usage'),
    });
    assert.equal(dry.status, 0, dry.stderr + dry.stdout);
    assert.match(dry.stdout, /Dry run/);
    assert.match(dry.stdout, /from-spec/);

    const captures = join(dir, 'requests.jsonl');
    const preload = join(dir, 'mock-provider.mjs');
    writeFileSync(preload, `import { appendFileSync } from 'node:fs';
      globalThis.fetch = async (url, options={}) => {
        if (!String(url).endsWith('/images')) throw new Error('unexpected provider request: '+url);
        appendFileSync(process.env.REQUEST_CAPTURE, JSON.stringify(JSON.parse(options.body))+'\\n');
        return Response.json({data:[{b64_json:Buffer.from('mock-image').toString('base64')}],usage:{cost:0.01}});
      };`);
    const out = join(dir, 'keyframes');
    const rendered = run(join(scripts, 'keyframes.sh'), ['--scenes', scenes, '--out', out, '--yes', '--concurrency', '1'], {
      NODE_OPTIONS: `--import=${preload}`,
      OPENROUTER_API_KEY: 'mock-key',
      REQUEST_CAPTURE: captures,
      STUDIO_UNIVERSE_ROOT: canon,
      STUDIO_USAGE_DIR: join(dir, 'usage'),
      STUDIO_LEDGER_ROOT: join(dir, 'ledger'),
    });
    assert.equal(rendered.status, 0, rendered.stderr + rendered.stdout);
    assert.equal(readFileSync(join(out, 'from-spec.png'), 'utf8'), 'mock-image');
    assert.equal(readFileSync(join(out, 'from-prompt.png'), 'utf8'), 'mock-image');

    const requests = readFileSync(captures, 'utf8').trim().split('\n').map((line) => JSON.parse(line));
    assert.equal(requests.length, 2);
    const { compileSpec, loadRegistry } = await import('../../studio-universe/scripts/lib/compile.mjs');
    const expectedPrompt = compileSpec(spec, loadRegistry(canon), canon);
    const specRequest = requests.find((request) => request.prompt === expectedPrompt);
    const promptRequest = requests.find((request) => request.prompt === 'A hand-painted city street');
    assert.ok(specRequest, 'spec scene should send the compiled Universe prompt');
    assert.equal(specRequest.aspect_ratio, '16:9');
    assert.equal(specRequest.input_references[0].image_url.url, `data:image/png;base64,${Buffer.from('canon-ref').toString('base64')}`);
    assert.ok(promptRequest, 'verbatim scene prompt should be preserved');
    assert.equal(promptRequest.input_references[0].image_url.url, `data:image/png;base64,${Buffer.from('scene-ref').toString('base64')}`);

    const compatibility = run(resolve(import.meta.dirname, '../../studio-imagegen/scripts/keyframes.sh'), ['--scenes', scenes, '--only', 'from-prompt', '--out', join(dir, 'compat')], {
      STUDIO_UNIVERSE_ROOT: canon,
      STUDIO_USAGE_DIR: join(dir, 'usage'),
    });
    assert.equal(compatibility.status, 0, compatibility.stderr + compatibility.stdout);
    assert.match(compatibility.stdout, /Dry run/);
    assert.match(compatibility.stdout, /from-prompt/);
    assert.doesNotMatch(compatibility.stdout, /from-spec/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('keyframes reject a missing reference before provider submission', () => {
  const dir = mkdtempSync(join(tmpdir(), 'videogen-keyframes-missing-'));
  try {
    const scenes = join(dir, 'scenes.json');
    writeFileSync(scenes, JSON.stringify([{ id: 'one', prompt: 'A still', references: ['missing.png'] }]));
    const preload = join(dir, 'unexpected-provider.mjs');
    writeFileSync(preload, `globalThis.fetch = async () => { throw new Error('provider must not be called'); };`);
    const result = run(join(scripts, 'keyframes.sh'), ['--scenes', scenes, '--out', join(dir, 'out'), '--yes'], {
      NODE_OPTIONS: `--import=${preload}`,
      OPENROUTER_API_KEY: 'mock-key',
      STUDIO_USAGE_DIR: join(dir, 'usage'),
    });
    assert.equal(result.status, 2, result.stderr + result.stdout);
    assert.match(result.stderr, /reference image missing/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

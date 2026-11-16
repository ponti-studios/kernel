import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readdirSync, readFileSync, rmSync, renameSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const scripts = resolve(import.meta.dirname, '../scripts');
const run = (cmd, args, env = {}) => spawnSync(cmd, args, { encoding: 'utf8', env: { ...process.env, ...env } });
function ff(...args) { const r = run('ffmpeg', ['-y', '-loglevel', 'error', ...args]); assert.equal(r.status, 0, r.stderr); }
test('assemble and deliver keep scene audio and reject truncation', () => {
  const dir = mkdtempSync(join(tmpdir(), 'videogen-test-'));
  try {
    const clips = join(dir, 'clips'); const vo = join(dir, 'vo'); mkdirSync(clips); mkdirSync(vo);
    ff('-f','lavfi','-i','color=c=blue:s=160x90:r=24:d=2','-c:v','libx264','-pix_fmt','yuv420p',join(clips,'one.mp4'));
    ff('-f','lavfi','-i','sine=frequency=440:duration=1','-c:a','libmp3lame',join(vo,'one.mp3'));
    const scenes = join(dir, 'scenes.json'); writeFileSync(scenes, JSON.stringify([{id:'one', prompt:'locked-off', duration_seconds:2, voiceover:'hello'}]));
    const video = join(dir,'cut.mp4'); const env = {STUDIO_USAGE_DIR: join(dir,'usage')};
    let r = run(join(scripts,'assemble.sh'), ['--clips',clips,'--voiceover',vo,'--scenes',scenes,'--out',video], env);
    assert.equal(r.status, 0, r.stderr + r.stdout);
    const quotedClips = join(dir, "Charlie’s 'clips'"); mkdirSync(quotedClips);
    copyFileSync(join(clips,'one.mp4'), join(quotedClips,'one.mp4'));
    r = run(join(scripts,'assemble.sh'), ['--clips',quotedClips,'--voiceover',vo,'--scenes',scenes,'--out',join(dir,'quoted.mp4')], env);
    assert.equal(r.status,0,r.stderr+r.stdout);
    mkdirSync(join(clips,'takes')); renameSync(join(clips,'one.mp4'), join(clips,'takes','take.mp4'));
    writeFileSync(join(clips,'selection.json'), JSON.stringify({one:'takes/take.mp4'}));
    r = run(join(scripts,'assemble.sh'), ['--clips',clips,'--voiceover',vo,'--scenes',scenes,'--out',video], env);
    assert.equal(r.status, 0, r.stderr + r.stdout);
    r = spawnSync(join(scripts,'assemble.sh'), ['--clips','clips','--voiceover','vo','--scenes','scenes.json','--out','relative.mp4'], {cwd:dir, encoding:'utf8', env:{...process.env,...env}});
    assert.equal(r.status, 0, r.stderr + r.stdout);
    writeFileSync(join(clips,'selection.json'), JSON.stringify({one:{path:'takes/take.mp4',test_capped:true}}));
    r = run(join(scripts,'assemble.sh'), ['--clips',clips,'--voiceover',vo,'--scenes',scenes,'--out',video], env);
    assert.equal(r.status,2); assert.match(r.stderr,/capped test clip/);
    r = run(join(scripts,'assemble.sh'), ['--clips',clips,'--voiceover',vo,'--scenes',scenes,'--out',video,'--allow-test-clips'], env);
    assert.equal(r.status,0,r.stderr+r.stdout);
    writeFileSync(join(clips,'selection.json'), JSON.stringify({one:'takes/take.mp4'}));
    const out = join(dir,'delivery'); r = run(join(scripts,'deliver.sh'), ['--video',video,'--audio',join(vo,'one.mp3'),'--out',out]);
    assert.equal(r.status, 0, r.stderr); assert.deepEqual(readdirSync(out).sort(), ['audio.mp3','video.mp4']);
    r = run(join(scripts,'deliver.sh'), ['--video',video,'--audio',join(vo,'one.mp3'),'--out',out]); assert.equal(r.status, 2);
    ff('-f','lavfi','-i','sine=frequency=440:duration=3','-c:a','libmp3lame',join(vo,'one.mp3'));
    r = run(join(scripts,'assemble.sh'), ['--clips',clips,'--voiceover',vo,'--scenes',scenes,'--out',video], env);
    assert.equal(r.status, 2); assert.match(r.stderr,/exceeds/);
  } finally { rmSync(dir, {recursive:true, force:true}); }
});

test('paid clips require explicit mode and reviewed animatic before upload', () => {
  const dir = mkdtempSync(join(tmpdir(), 'videogen-gate-'));
  try {
    const scenes = join(dir, 'scenes.json');
    writeFileSync(scenes, JSON.stringify([{id:'one',prompt:'locked-off hold final pose',duration_seconds:5}]));
    const keyframes = join(dir, 'keyframes'); mkdirSync(keyframes);
    ff('-f','lavfi','-i','color=blue:s=160x90','-frames:v','1',join(keyframes,'one.png'));
    const preload = join(dir,'fetch.mjs');
    writeFileSync(preload, `globalThis.fetch = async (url) => { if (!String(url).endsWith('/videos/models')) throw new Error('unexpected paid request'); return {ok:true,json:async()=>({data:[{id:'test/model',supported_durations:[5],supported_resolutions:['720p'],supported_aspect_ratios:['16:9'],supported_frame_images:['first_frame'],pricing_skus:{duration_seconds:'0.1'}}]})}; };`);
    const env = {NODE_OPTIONS:`--import=${preload}`,OPENROUTER_API_KEY:'test',STUDIO_USAGE_DIR:join(dir,'usage')};
    let r = run(join(scripts,'clips.sh'), ['--scenes',scenes,'--model','test/model','--yes'], env);
    assert.equal(r.status, 2); assert.match(r.stderr,/explicitly select --text-to-video/);
    r = run(join(scripts,'clips.sh'), ['--scenes',scenes,'--model','test/model','--keyframes',keyframes,'--yes'], env);
    assert.equal(r.status, 2); assert.match(r.stderr,/reviewed --animatic/);
    r = run(join(scripts,'clips.sh'), ['--scenes',scenes,'--model','test/model','--text-to-video','--keyframes',keyframes,'--yes'], env);
    assert.equal(r.status,2); assert.match(r.stderr,/either --keyframes/);
    r = run(join(scripts,'clips.sh'), ['--scenes',scenes,'--model','test/model','--text-to-video','--yes','--timeout-ms','NaN'], env);
    assert.equal(r.status,2); assert.match(r.stderr,/timeout-ms/);
    r = run(join(scripts,'clips.sh'), ['--scenes',scenes,'--model','unknown/model','--text-to-video','--yes'], env);
    assert.equal(r.status,2); assert.match(r.stderr,/per-second estimate/);
    r = run(join(scripts,'clips.sh'), ['--scenes',scenes,'--model','test/model','--text-to-video','--resolution','1080p','--yes'], env);
    assert.equal(r.status,2); assert.match(r.stderr,/does not offer resolution/);
    r = run(join(scripts,'clips.sh'), ['--scenes',scenes,'--model','test/model','--text-to-video','--yes','--dry-run'], env);
    assert.equal(r.status, 0, r.stderr); assert.match(r.stdout,/Dry run/);
  } finally { rmSync(dir,{recursive:true,force:true}); }
});

test('approved image-to-video submits a keyframe and records a selectable take', () => {
  const dir = mkdtempSync(join(tmpdir(), 'videogen-provider-'));
  try {
    const scenes = join(dir, 'scenes.json');
    writeFileSync(scenes, JSON.stringify([{id:'one',prompt:'locked-off hold final pose',duration_seconds:5}]));
    const keyframes = join(dir, 'keyframes'); mkdirSync(keyframes);
    ff('-f','lavfi','-i','color=blue:s=160x90','-frames:v','1',join(keyframes,'one.png'));
    const fixture = join(dir,'fixture.mp4');
    ff('-f','lavfi','-i','color=blue:s=160x90:r=24:d=1','-c:v','libx264','-pix_fmt','yuv420p',fixture);
    const animatic = join(dir,'animatic.mp4'); copyFileSync(fixture, animatic);
    const preload = join(dir,'provider.mjs');
    writeFileSync(preload, `import { readFileSync, writeFileSync } from 'node:fs';
      globalThis.fetch = async (url, options={}) => {
        url=String(url);
        if (url.endsWith('/videos/models')) return Response.json({data:[{id:'test/model',supported_durations:[5],supported_resolutions:['720p'],supported_aspect_ratios:['16:9','9:16'],supported_frame_images:['first_frame'],pricing_skus:{duration_seconds:'0.1'}}]});
        if (url.startsWith('https://r2.example/')) return new Response('',{status:200});
        if (url.endsWith('/videos') && options.method==='POST') { writeFileSync(process.env.REQUEST_CAPTURE,options.body); return Response.json({id:'job-1',polling_url:'https://mock/poll'},{status:202}); }
        if (url==='https://mock/poll') return Response.json({status:'completed',unsigned_urls:['https://mock/video'],usage:{cost:0.5}});
        if (url==='https://mock/video') return new Response(readFileSync(process.env.VIDEO_FIXTURE));
        throw new Error('unexpected request '+url);
      };`);
    const out = join(dir,'clips');
    const env = {NODE_OPTIONS:`--import=${preload}`, OPENROUTER_API_KEY:'test', R2_S3_API_ENDPOINT:'https://r2.example', R2_ACCESS_KEY_ID:'a'.repeat(32), R2_SECRET_ACCESS_KEY:'b'.repeat(64), R2_BUCKET:'test', STUDIO_USAGE_DIR:join(dir,'usage'), STUDIO_JOBS_DIR:join(dir,'jobs'), STUDIO_VIDEO_RUNS:join(dir,'runs.jsonl'), REQUEST_CAPTURE:join(dir,'request.json'), VIDEO_FIXTURE:fixture};
    const mismatch = run(join(scripts,'clips.sh'), ['--scenes',scenes,'--model','test/model','--keyframes',keyframes,'--animatic',animatic,'--animatic-approved','--vertical','--out',out,'--yes'], env);
    assert.equal(mismatch.status,2); assert.match(mismatch.stderr,/readable 9:16 video/);
    const r = run(join(scripts,'clips.sh'), ['--scenes',scenes,'--model','test/model','--keyframes',keyframes,'--animatic',animatic,'--animatic-approved','--out',out,'--yes'], env);
    assert.equal(r.status,0,r.stderr+r.stdout);
    const request = JSON.parse(readFileSync(join(dir,'request.json'),'utf8'));
    assert.equal(request.frame_images[0].frame_type,'first_frame');
    assert.equal(request.generate_audio,false);
    const selection = JSON.parse(readFileSync(join(out,'selection.json'),'utf8'));
    assert.match(selection.one.path,/^takes\/.+\.mp4$/); assert.equal(selection.one.test_capped,false);
    assert.equal(readdirSync(join(out,'takes')).length,1);
  } finally { rmSync(dir,{recursive:true,force:true}); }
});

test('voiceover defaults to dry run and scene ids cannot escape the output', () => {
  const dir = mkdtempSync(join(tmpdir(), 'videogen-voice-'));
  try {
    const scenes = join(dir,'scenes.json'); const out = join(dir,'voice');
    writeFileSync(scenes, JSON.stringify([{id:'one',prompt:'still',voiceover:'hello'}]));
    let r = run(join(scripts,'voiceover.sh'),['--scenes',scenes,'--out',out],{OPENROUTER_API_KEY:'test'});
    assert.equal(r.status,0,r.stderr); assert.match(r.stdout,/Dry run/); assert.equal(readdirSync(dir).includes('voice'),false);
    writeFileSync(scenes, JSON.stringify([{id:'../escape',prompt:'still',voiceover:'hello'}]));
    r = run(join(scripts,'voiceover.sh'),['--scenes',scenes,'--out',out],{OPENROUTER_API_KEY:'test'});
    assert.notEqual(r.status,0); assert.match(r.stderr,/scene id must be unique/);
  } finally { rmSync(dir,{recursive:true,force:true}); }
});

test('a silent scene remains silent and later narration starts with its clip', () => {
  const dir = mkdtempSync(join(tmpdir(), 'videogen-timing-'));
  try {
    const clips=join(dir,'clips'), vo=join(dir,'voice'); mkdirSync(clips); mkdirSync(vo);
    for (const id of ['one','two']) ff('-f','lavfi','-i','color=black:s=160x90:r=24:d=2','-c:v','libx264','-pix_fmt','yuv420p',join(clips,`${id}.mp4`));
    ff('-f','lavfi','-i','sine=frequency=440:duration=1','-c:a','libmp3lame',join(vo,'two.mp3'));
    ff('-f','lavfi','-i','sine=frequency=440:duration=1','-c:a','libmp3lame',join(vo,'one.mp3'));
    const scenes=join(dir,'scenes.json'); writeFileSync(scenes,JSON.stringify([{id:'one',prompt:'still',duration_seconds:2},{id:'two',prompt:'still',voiceover:'hello',duration_seconds:2}]));
    const video=join(dir,'cut.mp4');
    renameSync(join(clips,'one.mp4'), join(clips,'missing.mp4'));
    const missing=run(join(scripts,'assemble.sh'),['--clips',clips,'--voiceover',vo,'--scenes',scenes,'--out',video],{STUDIO_USAGE_DIR:join(dir,'usage')});
    assert.equal(missing.status,2); assert.match(missing.stderr,/no clip for scene one/);
    renameSync(join(clips,'missing.mp4'), join(clips,'one.mp4'));
    const r=run(join(scripts,'assemble.sh'),['--clips',clips,'--voiceover',vo,'--scenes',scenes,'--out',video],{STUDIO_USAGE_DIR:join(dir,'usage')});
    assert.equal(r.status,0,r.stderr+r.stdout);
    writeFileSync(scenes,JSON.stringify([{id:'one',prompt:'still',duration_seconds:7},{id:'two',prompt:'still',voiceover:'hello',duration_seconds:9}]));
    const captions=run(join(scripts,'captions.sh'),['--video',video,'--scenes',scenes,'--clips',clips,'--out',join(dir,'captioned.mp4'),'--dry-run']);
    assert.equal(captions.status,0,captions.stderr+captions.stdout); assert.match(captions.stdout,/2\.0s–4\.0s/);
    const scan=run('ffmpeg',['-hide_banner','-i',video,'-af','silencedetect=noise=-40dB:d=0.5','-f','null','-']);
    assert.equal(scan.status,0,scan.stderr);
    const match=scan.stderr.match(/silence_end: ([0-9.]+)/);
    assert.ok(match,scan.stderr); assert.ok(Number(match[1]) > 1.9 && Number(match[1]) < 2.15,match[1]);
  } finally { rmSync(dir,{recursive:true,force:true}); }
});

test('animatic applies a camera move to the keyframe', () => {
  const dir=mkdtempSync(join(tmpdir(),'videogen-animatic-'));
  try {
    const keyframes=join(dir,'keyframes'); mkdirSync(keyframes);
    ff('-f','lavfi','-i','testsrc=size=640x360:rate=1','-frames:v','1',join(keyframes,'one.png'));
    const scenes=join(dir,'scenes.json'); writeFileSync(scenes,JSON.stringify({scenes:[{id:'one',prompt:'still',duration_seconds:1,camera:'push in'}]}));
    const video=join(dir,'animatic.mp4');
    const r=run(join(scripts,'animatic.sh'),['--scenes',scenes,'--keyframes',keyframes,'--out',video]);
    assert.equal(r.status,0,r.stderr+r.stdout); assert.match(r.stdout,/push in/);
    const hashes=run('ffmpeg',['-v','error','-i',video,'-vf','select=eq(n\\,0)+eq(n\\,20)','-fps_mode','vfr','-f','framemd5','-']);
    assert.equal(hashes.status,0,hashes.stderr);
    const frames=hashes.stdout.split('\n').filter((line)=>line && !line.startsWith('#'));
    assert.equal(frames.length,2); assert.notEqual(frames[0].split(',').at(-1).trim(),frames[1].split(',').at(-1).trim());
    const vertical=join(dir,'vertical.mp4');
    const portrait=run(join(scripts,'animatic.sh'),['--scenes',scenes,'--keyframes',keyframes,'--out',vertical,'--aspect','9:16']);
    assert.equal(portrait.status,0,portrait.stderr+portrait.stdout);
    const size=run('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=p=0:s=x',vertical]);
    assert.equal(size.stdout.trim(),'720x1280');
  } finally { rmSync(dir,{recursive:true,force:true}); }
});

test('timing preserves scene wrappers and relative specs, and refuses missing speech', () => {
  const dir = mkdtempSync(join(tmpdir(), 'videogen-timings-'));
  try {
    const voice = join(dir, 'voice'); const target = join(dir, 'target'); mkdirSync(voice); mkdirSync(target);
    const scenes = join(dir, 'scenes.json'); const out = join(target, 'timed.json');
    const draft = { title: 'example', scenes: [
      { id: 'one', spec: 'specs/one.json', voiceover: 'hello', camera: 'push in' },
      { id: 'two', prompt: 'still', duration_seconds: 4 },
    ] };
    writeFileSync(scenes, JSON.stringify(draft));
    let r = run(join(scripts, 'timings.sh'), ['--scenes', scenes, '--voiceover', voice, '--out', out]);
    assert.equal(r.status, 2); assert.match(r.stderr, /missing narration/);
    ff('-f','lavfi','-i','sine=frequency=440:duration=1','-c:a','libmp3lame',join(voice,'one.mp3'));
    ff('-f','lavfi','-i','sine=frequency=440:duration=1','-c:a','libmp3lame',join(voice,'two.mp3'));
    r = run(join(scripts, 'timings.sh'), ['--scenes', scenes, '--voiceover', voice, '--out', out]);
    assert.equal(r.status, 0, r.stderr); const result = JSON.parse(readFileSync(out, 'utf8'));
    assert.equal(result.title, 'example'); assert.equal(result.scenes[0].spec, '../specs/one.json');
    assert.equal(result.scenes[0].camera, 'push in'); assert.equal(result.scenes[1].duration_seconds, 4);
    r = run(join(scripts, 'timings.sh'), ['--scenes', scenes, '--voiceover', voice, '--out', scenes]);
    assert.equal(r.status, 2); assert.deepEqual(JSON.parse(readFileSync(scenes, 'utf8')), draft);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

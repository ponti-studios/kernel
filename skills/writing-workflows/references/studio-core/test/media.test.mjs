import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assembleVideo, contactSheet, probeDuration } from '../scripts/lib/media.mjs';

function fakeRun(responses) {
  const calls = [];
  const run = async (cmd, args) => {
    calls.push([cmd, ...args]);
    const key = `${cmd} ${args[args.length - 1]}`;
    return { stdout: responses[key] ?? responses[cmd] ?? '' };
  };
  return { run, calls };
}

describe('probeDuration', () => {
  it('parses ffprobe output and passes the path through', async () => {
    const { run, calls } = fakeRun({ ffprobe: '3.04\n' });
    assert.equal(await probeDuration('/v/clip.mp4', run), 3.04);
    assert.equal(calls[0]?.[0], 'ffprobe');
    assert.ok(calls[0].includes('/v/clip.mp4'));
  });

  it('rejects non-numeric output', async () => {
    const { run } = fakeRun({ ffprobe: 'n/a\n' });
    await assert.rejects(probeDuration('/v/clip.mp4', run), /non-numeric/);
  });
});

describe('contactSheet', () => {
  it('builds a 3-frame tile', async () => {
    const { run, calls } = fakeRun({});
    await contactSheet('/v/a.mp4', '/r/a.jpg', run);
    const args = calls[0] ?? [];
    assert.equal(args[0], 'ffmpeg');
    assert.ok(args.includes('/v/a.mp4'));
    assert.ok(args.includes('/r/a.jpg'));
    assert.ok(args.join(' ').includes('tile=3x1'));
  });
});

describe('assembleVideo', () => {
  it('concats clips under the voiceover and flags truncation', async () => {
    const { run, calls } = fakeRun({ ffprobe: '8.0\n' });
    const writes = {};
    const removed = [];
    const result = await assembleVideo(
      {
        clips: ['/v/a.mp4', '/v/b.mp4'],
        voiceover: '/v/vo.mp3',
        out: '/v/final.mp4',
        writeList: (p, c) => {
          writes[p] = c;
        },
        removeList: (p) => removed.push(p),
      },
      run,
    );
    // 8s voiceover vs 8+8s video: fits.
    assert.equal(result.truncated, false);
    assert.equal(result.videoSeconds, 16);
    assert.equal(result.voiceoverSeconds, 8);
    const listPath = Object.keys(writes)[0];
    assert.equal(writes[listPath], "file '/v/a.mp4'\nfile '/v/b.mp4'\n");
    assert.ok(calls.some((c) => c.includes('/v/final.mp4')));
    assert.deepEqual(removed, [listPath]);
  });

  it('lays the voiceover at the 800ms default delay', async () => {
    let args;
    const run = async (cmd, a) => {
      if (cmd === 'ffmpeg') args = a;
      return { stdout: '4.0\n' };
    };
    await assembleVideo(
      { clips: ['/v/a.mp4'], voiceover: '/v/vo.mp3', out: '/v/o.mp4', writeList: () => {}, removeList: () => {} },
      run,
    );
    assert.equal(args[args.indexOf('-filter_complex') + 1], '[1:a]adelay=800|800,apad[a]');
  });

  it('flags a voiceover longer than the footage', async () => {
    const responses = { 'ffprobe /v/vo.mp3': '20.0\n', 'ffprobe /v/a.mp4': '8.0\n' };
    const { run } = fakeRun(responses);
    const result = await assembleVideo(
      {
        clips: ['/v/a.mp4'],
        voiceover: '/v/vo.mp3',
        out: '/v/final.mp4',
        writeList: () => {},
        removeList: () => {},
      },
      run,
    );
    assert.equal(result.truncated, true);
  });

  it('rejects an empty clip list before probing anything', async () => {
    const { run, calls } = fakeRun({});
    await assert.rejects(assembleVideo({ clips: [], voiceover: '/v/vo.mp3', out: '/v/final.mp4' }, run), /no clips/);
    assert.equal(calls.length, 0);
  });
});

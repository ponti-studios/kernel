import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readPodcastSource } from '../scripts/lib/resolve.mjs';

test('untrusted segment IDs cannot escape work directory or collide', () => {
  const dir = mkdtempSync(join(tmpdir(), 'podcast-source-'));
  try {
    const source = join(dir, 'source.json');
    writeFileSync(source, JSON.stringify([
      { id: '../../outside', text: 'One.' },
      { id: '../../outside', text: 'Two.' },
      { id: '/absolute/path', text: 'Three.' },
    ]));
    const segments = readPodcastSource(source);
    assert.equal(segments.length, 3);
    assert.equal(new Set(segments.map(s => s.id)).size, 3);
    for (const segment of segments) {
      assert.equal(join(dir, segment.id + '.mp3').startsWith(dir + '/'), true);
      assert.match(segment.id, /^part-\d+$/);
    }
    assert.equal(segments[0].label, '../../outside');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

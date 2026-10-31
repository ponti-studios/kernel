import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fitDurations, secondsForNarration } from '../scripts/lib/timing.mjs';

test('narration drives duration at the measured rate', () => {
  // 183 characters measured 12.21s in real speech
  assert.equal(secondsForNarration('x'.repeat(183)), 12.5);
  assert.equal(secondsForNarration('x'.repeat(90)), 6);
});

test('a short line never collapses a scene below the floor', () => {
  assert.equal(secondsForNarration('hi'), 3);
  assert.equal(secondsForNarration(''), undefined);
  assert.equal(secondsForNarration(undefined), undefined);
});

test('a speaking scene lasts its line plus a beat — not the model\'s guess', () => {
  const [scene] = fitDurations([{ id: 'a', duration_seconds: 10, voiceover: 'x'.repeat(84) }]);
  assert.equal(scene.duration_seconds, 6.5); // 6s of speech, rounded to a half second, + 0.5s tail — not 10
});

test('a long line still grows a scene the model under-sized', () => {
  const [scene] = fitDurations([{ id: 'a', duration_seconds: 2, voiceover: 'x'.repeat(150) }]);
  assert.equal(scene.duration_seconds, 10.5);
});

test('silent scenes keep the duration the model asked for', () => {
  const [silent] = fitDurations([{ id: 'a', duration_seconds: 7 }]);
  assert.equal(silent.duration_seconds, 7);
});

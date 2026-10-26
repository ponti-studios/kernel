// Scene duration is not a matter of taste: a shot has to last as long as the line
// spoken over it, or the cut either truncates the narration or sits in silence.
//
// Measured from real output: eleven-multilingual-v2 narration runs at about
// 15 characters per second (183 characters -> 12.21s). Derive the duration from the
// text, then keep the model's number only when the scene is silent.

export const CHARS_PER_SECOND = 15;
export const MIN_SCENE_SECONDS = 3;

/** Seconds of speech in a line, rounded up to the next half second. */
export function secondsForNarration(text) {
  if (!text || typeof text !== 'string') return undefined;
  const raw = text.trim().length / CHARS_PER_SECOND;
  if (raw <= 0) return undefined;
  return Math.max(MIN_SCENE_SECONDS, Math.ceil(raw * 2) / 2);
}

/** Breathing room after a line before the next shot — half a second of air. */
export const NARRATION_TAIL_SECONDS = 0.5;

/**
 * Give every scene a duration that fits its narration.
 *
 * For a scene that speaks, the line is the authority: the model's duration is a
 * pacing wish, and on real output it ran 4-5 seconds past the words, which is what
 * turned a 48s cut into 30s of silence. Silent scenes keep the duration asked for,
 * because there the model's instinct is all there is.
 * @param {Array<Record<string, unknown>>} scenes
 */
export function fitDurations(scenes) {
  return scenes.map((scene) => {
    const spoken = secondsForNarration(scene.voiceover);
    if (spoken === undefined) return scene;
    return { ...scene, duration_seconds: spoken + NARRATION_TAIL_SECONDS };
  });
}

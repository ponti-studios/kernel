// Draft validation for this skill. Combinators come from studio-core.

import { array, number, object, string } from '../../../studio-core/scripts/lib/validate.mjs';

export const tweetDraftSchema = object({
  tweets: array(string({ min: 1 }), { min: 1 }),
});

export const xPostBatchDraftSchema = object({
  posts: array(
    object({
      id: number({ int: true, positive: true }),
      type: string({ min: 1 }),
      text: string({ min: 1, max: 280 }),
    }),
    { length: 5 },
  ),
});

export const linkedinPostDraftSchema = object({
  content: string({ min: 1 }),
});

// Shot list for video generation: the handoff between script, audio, and
// video. Mirrors the genmedia scenes contract (duration in seconds,
// voice/voice_id pick the narrator, seed pins a deterministic take).

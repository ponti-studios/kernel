// Draft validation for this skill. Combinators come from studio-core.

import { array, object, string } from '../../../studio-core/scripts/lib/validate.mjs';

export const youtubeScriptDraftSchema = object({
  title: string({ min: 1 }),
  hook: string({ min: 1 }),
  segments: array(
    object({
      heading: string({ min: 1 }),
      script: string({ min: 1 }),
    }),
    { min: 1 },
  ),
  callToAction: string({ min: 1 }),
});

export const shortVideoScriptDraftSchema = object({
  hook: string({ min: 1 }),
  beats: array(string({ min: 1 }), { min: 1 }),
  callToAction: string({ min: 1 }),
});

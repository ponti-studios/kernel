// Draft validation for this skill. Combinators come from studio-core.

import { array, object, string } from '../../../studio-core/scripts/lib/validate.mjs';

export const socialClipDraftSchema = object({
  tiktok_clips: array(
    object({
      hook: string({ min: 1 }),
      timestamp: string({ min: 1 }),
      visual: string({ min: 1 }),
      caption: string({ min: 1 }),
    }),
    { min: 0 },
  ),
});

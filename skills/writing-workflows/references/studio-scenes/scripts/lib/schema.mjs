// Draft validation for this skill. Combinators come from studio-core.

import { array, boolean, number, object, optional, string } from '../../../studio-core/scripts/lib/validate.mjs';

export const sceneSchema = object({
  id: string({ min: 1 }),
  prompt: string({ min: 1 }),
  duration_seconds: optional(number({ positive: true })),
  // Cinematography the shot is built around. The animatic uses `camera` to move the
  // still, so a shot's intended motion is judged before any footage is bought.
  framing: optional(string()),
  camera: optional(string()),
  dog: optional(boolean()),
  voiceover: optional(string()),
  voice: optional(string()),
  voice_id: optional(string()),
  seed: optional(number({ int: true })),
});

export const scenesDraftSchema = array(sceneSchema, { min: 1 });

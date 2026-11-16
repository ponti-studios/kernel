// Draft validation for this skill. Combinators come from studio-core.

import {
  array,
  boolean,
  number,
  object,
  optional,
  string,
} from "../studio-core/scripts/lib/validate.mjs";

export const sceneSchema = object({
  id: string({ min: 1 }),
  // Exactly one of prompt or spec (checked in readScenes). A spec is compiled from
  // canon and is the default for character scenes; a prompt is used verbatim.
  prompt: optional(string({ min: 1 })),
  spec: optional(string({ min: 1 })),
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
  // Things the shot must not show. Sent only when the model has a negative field (Kling);
  // otherwise the linter warns and it is dropped. Keep it short.
  negative: optional(string()),
});

export const scenesDraftSchema = array(sceneSchema, { min: 1 });

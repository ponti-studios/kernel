// Stage generators. Model-agnostic: each function takes the text model first, so
// tests inject a fake and the CLI injects the real client from studio-core.
// Nothing here touches the network.

import { generateJson } from '../../../studio-core/scripts/lib/drafts.mjs';
import { SOCIAL_CLIP_SYSTEM_PROMPT, SOCIAL_CLIP_USER_PROMPT } from './prompts.mjs';
import { socialClipDraftSchema } from './schema.mjs';

export const STAGES = ['social-clips'];

export const generators = {
  'social-clips': (text, script, options = {}) =>
    generateJson(text, socialClipDraftSchema, {
      system: SOCIAL_CLIP_SYSTEM_PROMPT,
      user: SOCIAL_CLIP_USER_PROMPT(script),
      options: { ...options },
    }),
};

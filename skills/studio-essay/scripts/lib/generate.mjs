// Stage generators. Model-agnostic: each function takes the text model first, so
// tests inject a fake and the CLI injects the real client from studio-core.
// Nothing here touches the network.

import { generateJson } from '../../../studio-core/scripts/lib/drafts.mjs';
import { ESSAY_SYSTEM_PROMPT, ESSAY_USER_PROMPT } from './prompts.mjs';
import { essayDraftSchema } from './schema.mjs';

export const STAGES = ['essay'];

export const generators = {
  'essay': (text, script, options = {}) =>
    generateJson(text, essayDraftSchema, {
      system: ESSAY_SYSTEM_PROMPT,
      user: ESSAY_USER_PROMPT(script),
      options: { ...options },
    }),
};

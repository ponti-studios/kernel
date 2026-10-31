// Stage generators. Model-agnostic: each function takes the text model first, so
// tests inject a fake and the CLI injects the real client from studio-core.
// Nothing here touches the network.

import { generateJson, scriptDraftSchema } from '../../../studio-core/scripts/lib/drafts.mjs';
import { SCRIPT_SYSTEM_PROMPT, SCRIPT_USER_PROMPT } from './prompts.mjs';

export const STAGES = ['script'];

export const generators = {
  script: (text, brief, options = {}) =>
    generateJson(text, scriptDraftSchema, {
      system: SCRIPT_SYSTEM_PROMPT,
      user: SCRIPT_USER_PROMPT(brief),
      options: { ...options },
    }),
};

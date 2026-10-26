// Stage generators. Model-agnostic: each function takes the text model first, so
// tests inject a fake and the CLI injects the real client from studio-core.
// Nothing here touches the network.

import { generateJson } from '../../../studio-core/scripts/lib/drafts.mjs';
import { SCENES_SYSTEM_PROMPT, SCENES_USER_PROMPT } from './prompts.mjs';
import { scenesDraftSchema } from './schema.mjs';

export const STAGES = ['scenes'];

export const generators = {
  'scenes': (text, script, options = {}) =>
    generateJson(text, scenesDraftSchema, {
      system: SCENES_SYSTEM_PROMPT,
      user: SCENES_USER_PROMPT(script),
      options: { ...options, jsonMode: false },
    }),
};

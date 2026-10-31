// Stage generators. Model-agnostic: each function takes the text model first, so
// tests inject a fake and the CLI injects the real client from studio-core.
// Nothing here touches the network.

import { generateJson } from '../../../studio-core/scripts/lib/drafts.mjs';
import { SHORT_VIDEO_SCRIPT_SYSTEM_PROMPT, SHORT_VIDEO_SCRIPT_USER_PROMPT, YOUTUBE_SCRIPT_SYSTEM_PROMPT, YOUTUBE_SCRIPT_USER_PROMPT } from './prompts.mjs';
import { shortVideoScriptDraftSchema, youtubeScriptDraftSchema } from './schema.mjs';

export const STAGES = ['youtube', 'short-video'];

export const generators = {
  'youtube': (text, script, options = {}) =>
    generateJson(text, youtubeScriptDraftSchema, {
      system: YOUTUBE_SCRIPT_SYSTEM_PROMPT,
      user: YOUTUBE_SCRIPT_USER_PROMPT(script),
      options: { ...options },
    }),
  'short-video': (text, script, options = {}) =>
    generateJson(text, shortVideoScriptDraftSchema, {
      system: SHORT_VIDEO_SCRIPT_SYSTEM_PROMPT,
      user: SHORT_VIDEO_SCRIPT_USER_PROMPT(script),
      options: { ...options },
    }),
};

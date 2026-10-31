// Stage generators. Model-agnostic: each function takes the text model first, so
// tests inject a fake and the CLI injects the real client from studio-core.
// Nothing here touches the network.

import { generateJson } from '../../../studio-core/scripts/lib/drafts.mjs';
import { LINKEDIN_POST_SYSTEM_PROMPT, LINKEDIN_POST_USER_PROMPT, TWEET_SYSTEM_PROMPT, TWEET_USER_PROMPT, X_POST_BATCH_SYSTEM_PROMPT, X_POST_BATCH_USER_PROMPT } from './prompts.mjs';
import { linkedinPostDraftSchema, tweetDraftSchema, xPostBatchDraftSchema } from './schema.mjs';

export const STAGES = ['tweet', 'x-posts', 'linkedin'];

export const generators = {
  'tweet': (text, script, options = {}) =>
    generateJson(text, tweetDraftSchema, {
      system: TWEET_SYSTEM_PROMPT,
      user: TWEET_USER_PROMPT(script),
      options: { ...options },
    }),
  'x-posts': (text, script, options = {}) =>
    generateJson(text, xPostBatchDraftSchema, {
      system: X_POST_BATCH_SYSTEM_PROMPT,
      user: X_POST_BATCH_USER_PROMPT(script),
      options: { ...options },
    }),
  'linkedin': (text, script, options = {}) =>
    generateJson(text, linkedinPostDraftSchema, {
      system: LINKEDIN_POST_SYSTEM_PROMPT,
      user: LINKEDIN_POST_USER_PROMPT(script),
      options: { ...options },
    }),
};

import { createAdapter } from './base.js';

export const continueAdapter = createAdapter({
  toolId: 'continue',
  toolName: 'Continue',
  skillsDir: '.continue',
  commandDir: 'prompts',
  commandExt: '.prompt',
});

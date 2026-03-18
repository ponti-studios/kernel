import { createAdapter } from './base.js';

export const githubCopilotAdapter = createAdapter({
  toolId: 'github-copilot',
  toolName: 'GitHub Copilot',
  skillsDir: '.github',
  commandDir: 'prompts',
  commandExt: '.prompt.md',
});

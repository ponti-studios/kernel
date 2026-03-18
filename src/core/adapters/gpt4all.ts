import { createAdapter } from './base.js';
export const gpt4allAdapter = createAdapter({ toolId: 'gpt4all', toolName: 'GPT4All', skillsDir: '.gpt4all' });

import { createAdapter } from './base.js';
export const ollamaAdapter = createAdapter({ toolId: 'ollama', toolName: 'Ollama', skillsDir: '.ollama' });

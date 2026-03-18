import { createAdapter } from './base.js';
export const mistralAdapter = createAdapter({ toolId: 'mistral', toolName: 'Mistral', skillsDir: '.mistral' });

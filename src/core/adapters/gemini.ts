import { createAdapter } from './base.js';
export const geminiAdapter = createAdapter({ toolId: 'gemini', toolName: 'Gemini', skillsDir: '.gemini' });

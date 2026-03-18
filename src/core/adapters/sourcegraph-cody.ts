import { createAdapter } from './base.js';
export const sourcegraphCodyAdapter = createAdapter({ toolId: 'sourcegraph-cody', toolName: 'Sourcegraph Cody', skillsDir: '.cody' });

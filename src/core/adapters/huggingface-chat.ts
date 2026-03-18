import { createAdapter } from './base.js';
export const huggingfaceChatAdapter = createAdapter({ toolId: 'huggingface-chat', toolName: 'HuggingFace Chat', skillsDir: '.hfchat' });

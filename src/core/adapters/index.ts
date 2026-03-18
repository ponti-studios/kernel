/**
 * Command adapters index
 *
 * Re-exports all tool command adapters and creates a populated registry.
 */

export { opencodeAdapter } from './opencode.js';
export { cursorAdapter } from './cursor.js';
export { claudeAdapter } from './claude.js';
export { codexAdapter } from './codex.js';
export { githubCopilotAdapter } from './github-copilot.js';
export { continueAdapter } from './continue.js';
export { clineAdapter } from './cline.js';
export { amazonQAdapter } from './amazon-q.js';
export { windsurfAdapter } from './windsurf.js';
export { augmentAdapter } from './augment.js';
export { supermavenAdapter } from './supermaven.js';
export { tabnineAdapter } from './tabnine.js';
export { codeiumAdapter } from './codeium.js';
export { sourcegraphCodyAdapter } from './sourcegraph-cody.js';
export { geminiAdapter } from './gemini.js';
export { mistralAdapter } from './mistral.js';
export { ollamaAdapter } from './ollama.js';
export { lmStudioAdapter } from './lm-studio.js';
export { textGenerationWebuiAdapter } from './text-generation-webui.js';
export { koboldcppAdapter } from './koboldcpp.js';
export { tabbyAdapter } from './tabby.js';
export { gpt4allAdapter } from './gpt4all.js';
export { janAdapter } from './jan.js';
export { huggingfaceChatAdapter } from './huggingface-chat.js';
export { phindAdapter } from './phind.js';

export { createAdapterRegistry, adapterRegistry } from './registry.js';
export type { ToolCommandAdapter, CommandContent, GeneratedFile, AdapterRegistry } from './types.js';

import { createAdapterRegistry } from './registry.js';
import { opencodeAdapter } from './opencode.js';
import { cursorAdapter } from './cursor.js';
import { claudeAdapter } from './claude.js';
import { codexAdapter } from './codex.js';
import { githubCopilotAdapter } from './github-copilot.js';
import { continueAdapter } from './continue.js';
import { clineAdapter } from './cline.js';
import { amazonQAdapter } from './amazon-q.js';
import { windsurfAdapter } from './windsurf.js';
import { augmentAdapter } from './augment.js';
import { supermavenAdapter } from './supermaven.js';
import { tabnineAdapter } from './tabnine.js';
import { codeiumAdapter } from './codeium.js';
import { sourcegraphCodyAdapter } from './sourcegraph-cody.js';
import { geminiAdapter } from './gemini.js';
import { mistralAdapter } from './mistral.js';
import { ollamaAdapter } from './ollama.js';
import { lmStudioAdapter } from './lm-studio.js';
import { textGenerationWebuiAdapter } from './text-generation-webui.js';
import { koboldcppAdapter } from './koboldcpp.js';
import { tabbyAdapter } from './tabby.js';
import { gpt4allAdapter } from './gpt4all.js';
import { janAdapter } from './jan.js';
import { huggingfaceChatAdapter } from './huggingface-chat.js';
import { phindAdapter } from './phind.js';
import type { AdapterRegistry } from './types.js';

/**
 * Create a fully populated adapter registry with all 25 tools
 */
export function createPopulatedAdapterRegistry(): AdapterRegistry {
  const registry = createAdapterRegistry();

  // Register all adapters
  registry.register(opencodeAdapter);
  registry.register(cursorAdapter);
  registry.register(claudeAdapter);
  registry.register(codexAdapter);
  registry.register(githubCopilotAdapter);
  registry.register(continueAdapter);
  registry.register(clineAdapter);
  registry.register(amazonQAdapter);
  registry.register(windsurfAdapter);
  registry.register(augmentAdapter);
  registry.register(supermavenAdapter);
  registry.register(tabnineAdapter);
  registry.register(codeiumAdapter);
  registry.register(sourcegraphCodyAdapter);
  registry.register(geminiAdapter);
  registry.register(mistralAdapter);
  registry.register(ollamaAdapter);
  registry.register(lmStudioAdapter);
  registry.register(textGenerationWebuiAdapter);
  registry.register(koboldcppAdapter);
  registry.register(tabbyAdapter);
  registry.register(gpt4allAdapter);
  registry.register(janAdapter);
  registry.register(huggingfaceChatAdapter);
  registry.register(phindAdapter);

  return registry;
}

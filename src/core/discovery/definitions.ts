/**
 * Tool definitions
 *
 * Metadata for all 24 supported AI coding assistants.
 */

import type { ToolDefinition } from '../config/schema.js';

/**
 * All supported AI tools with their metadata
 */
export const TOOL_DEFINITIONS: ToolDefinition[] = [
  // Primary Platforms
  {
    id: 'opencode',
    name: 'OpenCode',
    skillsDir: '.opencode',
    available: true,
    successLabel: 'OpenCode',
    notes: 'Primary development platform with full jinn support',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    skillsDir: '.cursor',
    available: true,
    successLabel: 'Cursor',
    notes: 'VS Code-based AI editor with excellent IDE integration',
  },
  {
    id: 'claude',
    name: 'Claude Code',
    skillsDir: '.claude',
    available: true,
    successLabel: 'Claude Code',
    notes: 'Anthropic CLI tool with superior reasoning capabilities',
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    skillsDir: '.github',
    available: true,
    successLabel: 'GitHub Copilot',
    notes: 'GitHub AI assistant. Commands in .github/prompts/',
  },

  // Open Source & Extensions
  {
    id: 'continue',
    name: 'Continue',
    skillsDir: '.continue',
    available: true,
    successLabel: 'Continue',
    notes: 'Open-source AI coding assistant for VS Code/JetBrains',
  },
  {
    id: 'cline',
    name: 'Cline',
    skillsDir: '.cline',
    available: true,
    successLabel: 'Cline',
    notes: 'Autonomous coding agent for VS Code',
  },

  // Enterprise & Cloud
  {
    id: 'amazon-q',
    name: 'Amazon Q Developer',
    skillsDir: '.amazonq',
    available: true,
    successLabel: 'Amazon Q Developer',
    notes: 'AWS AI assistant for cloud development',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    skillsDir: '.windsurf',
    available: true,
    successLabel: 'Windsurf',
    notes: 'AI-powered IDE by Codeium',
  },
  {
    id: 'augment',
    name: 'Augment',
    skillsDir: '.augment',
    available: true,
    successLabel: 'Augment',
    notes: 'AI coding assistant for enterprise teams',
  },

  // Completion Services
  {
    id: 'supermaven',
    name: 'Supermaven',
    skillsDir: '.supermaven',
    available: true,
    successLabel: 'Supermaven',
    notes: 'Fast code completion service',
  },
  {
    id: 'tabnine',
    name: 'Tabnine',
    skillsDir: '.tabnine',
    available: true,
    successLabel: 'Tabnine',
    notes: 'AI code completion with privacy focus',
  },
  {
    id: 'codeium',
    name: 'Codeium',
    skillsDir: '.codeium',
    available: true,
    successLabel: 'Codeium',
    notes: 'Free AI code completion tool',
  },
  {
    id: 'sourcegraph-cody',
    name: 'Sourcegraph Cody',
    skillsDir: '.cody',
    available: true,
    successLabel: 'Sourcegraph Cody',
    notes: 'AI coding assistant with codebase intelligence',
  },

  // Model-Specific Tools
  {
    id: 'gemini',
    name: 'Gemini',
    skillsDir: '.gemini',
    available: true,
    successLabel: 'Gemini',
    notes: 'Google Gemini AI assistant',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    skillsDir: '.mistral',
    available: true,
    successLabel: 'Mistral',
    notes: 'Mistral AI coding assistant',
  },

  // Local & Self-Hosted
  {
    id: 'ollama',
    name: 'Ollama',
    skillsDir: '.ollama',
    available: true,
    successLabel: 'Ollama',
    notes: 'Run LLMs locally on your machine',
  },
  {
    id: 'lm-studio',
    name: 'LM Studio',
    skillsDir: '.lmstudio',
    available: true,
    successLabel: 'LM Studio',
    notes: 'Desktop app for running local LLMs',
  },
  {
    id: 'text-generation-webui',
    name: 'Text Generation WebUI',
    skillsDir: '.webui',
    available: true,
    successLabel: 'Text Generation WebUI',
    notes: 'Gradio web UI for running LLMs',
  },
  {
    id: 'koboldcpp',
    name: 'KoboldCPP',
    skillsDir: '.koboldcpp',
    available: true,
    successLabel: 'KoboldCPP',
    notes: 'Easy-to-use LLM runner for GGML/GGUF models',
  },
  {
    id: 'tabby',
    name: 'Tabby',
    skillsDir: '.tabby',
    available: true,
    successLabel: 'Tabby',
    notes: 'Self-hosted AI coding assistant',
  },
  {
    id: 'gpt4all',
    name: 'GPT4All',
    skillsDir: '.gpt4all',
    available: true,
    successLabel: 'GPT4All',
    notes: 'Free chatbot that runs locally',
  },
  {
    id: 'jan',
    name: 'Jan',
    skillsDir: '.jan',
    available: true,
    successLabel: 'Jan',
    notes: 'ChatGPT-alternative that runs locally',
  },

  // Web-Based
  {
    id: 'huggingface-chat',
    name: 'Hugging Face Chat',
    skillsDir: '.hfchat',
    available: true,
    successLabel: 'Hugging Face Chat',
    notes: 'Chat interface for HF models',
  },
  {
    id: 'phind',
    name: 'Phind',
    skillsDir: '.phind',
    available: true,
    successLabel: 'Phind',
    notes: 'AI search engine for developers',
  },
];

/**
 * Get a tool definition by ID
 */
export function getToolDefinition(toolId: string): ToolDefinition | undefined {
  return TOOL_DEFINITIONS.find((tool) => tool.id === toolId);
}

/**
 * Get all tool definitions
 */
export function getAllToolDefinitions(): ToolDefinition[] {
  return TOOL_DEFINITIONS;
}

/**
 * Get only available/supported tools
 */
export function getAvailableTools(): ToolDefinition[] {
  return TOOL_DEFINITIONS.filter((tool) => tool.available);
}


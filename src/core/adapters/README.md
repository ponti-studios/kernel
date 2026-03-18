# Tool Adapters

Tool-specific format adapters for 24 AI coding assistants.

## Purpose

Each adapter implements the `ToolCommandAdapter` interface to format jinn content for a specific AI tool's expected format and directory structure.

## Supported Tools (24 Total)

1. **opencode** - OpenCode (primary platform)
2. **cursor** - Cursor (VS Code-based AI editor)
3. **claude** - Claude Code (Anthropic CLI)
4. **github-copilot** - GitHub Copilot
5. **continue** - Continue (open-source assistant)
6. **cline** - Cline (autonomous coding agent)
7. **amazon-q** - Amazon Q Developer
8. **windsurf** - Windsurf (AI-powered IDE)
9. **augment** - Augment
10. **supermaven** - Supermaven
11. **tabnine** - Tabnine
12. **codeium** - Codeium
13. **sourcegraph-cody** - Sourcegraph Cody
14. **gemini** - Gemini
15. **mistral** - Mistral
16. **ollama** - Ollama
17. **lm-studio** - LM Studio
18. **text-generation-webui** - Text Generation WebUI
19. **koboldcpp** - KoboldCPP
20. **tabby** - Tabby
21. **gpt4all** - GPT4All
22. **jan** - Jan
23. **huggingface-chat** - Hugging Face Chat
24. **phind** - Phind

## Adapter Interface

See `types.ts` for the complete `ToolCommandAdapter` interface definition.

## Adding a New Tool

To add support for a new AI tool:

1. Add tool definition to `src/core/discovery/definitions.ts`
2. Create adapter in `src/core/adapters/<tool-id>.ts`
3. Register adapter in `src/core/adapters/registry.ts`
4. Add tests in `src/core/adapters/__tests__/<tool-id>.test.ts`

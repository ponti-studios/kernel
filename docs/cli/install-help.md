# Install Help

## Examples

```bash
$ bunx ghostwire install
$ bunx ghostwire install --no-tui --claude=max20 --openai=yes --gemini=yes --copilot=no
$ bunx ghostwire install --no-tui --claude=no --gemini=no --copilot=yes --ghostwire-zen=yes
```

## Model Providers (Priority: OpenCode standardized)

- **OpenCode** — Standardized `opencode/kimi-k2.5` model for all agents
- **Claude** — Native anthropic/ models (legacy, being phased out)
- **OpenAI** — Native openai/ models (legacy, being phased out)
- **Gemini** — Native google/ models (legacy, being phased out)
- **Copilot** — github-copilot/ models (legacy fallback)
- **Ghostwire Zen** — ghostwire/ models (legacy)
- **Z.ai** — zai-coding-plan/ models (legacy)
- **Kimi** — kimi-for-coding/ models (legacy)

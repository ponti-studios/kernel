# Jinn ✨

Your magical AI assistant for all personal computing tasks.

## What is Jinn?

Jinn is an AI-powered assistant that works across 24+ AI coding tools (OpenCode, Cursor, Claude Code, GitHub Copilot, and more) to help you get things done. Whether it's coding, research, automation, or general computing tasks—Jinn has you covered.

## Features

- **Multi-Tool Support** - Works with OpenCode, Cursor, Claude Code, GitHub Copilot, and 20+ other AI tools
- **Rich Workflows** - Built-in commands for planning, exploring, implementing, and completing work
- **Beautiful CLI** - Modern TUI with spinners, colored output, and progress indicators
- **Harness-Agnostic** - Same great experience across any AI tool you use

## Install

```bash
npm install -g @hackefeller/jinn
```

Or use directly with bun:

```bash
bunx jinn init
```

## Quick Start

```bash
# Initialize jinn in your project
jinn init

# Detect available AI tools
jinn detect

# View configuration
jinn config
```

## Commands

| Command | Description |
|---------|-------------|
| `jinn init` | Initialize jinn in your project |
| `jinn update` | Regenerate jinn files |
| `jinn detect` | Detect available AI tools |
| `jinn config` | View/modify configuration |

## Use in Your AI Tool

After initialization, use these commands in your AI tool:

```
/jinn:propose    - Start a new change
/jinn:explore    - Explore ideas and investigate problems  
/jinn:plan       - Create detailed work plans
/jinn:apply      - Implement tasks
/jinn:archive    - Complete and archive work
```

## Development

```bash
# Build
bun run build

# Run CLI
bun run dev:cli
```

## License

SUL-1.0

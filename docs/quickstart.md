# Jinn Quick Start Guide

## Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/jinn.git
cd jinn

# Install dependencies (if needed)
bun install
```

## Quick Start

### 1. Initialize Your Project

```bash
# Navigate to your project
cd your-project

# Initialize jinn with auto-detection
jinn init --yes

# Or specify tools manually
jinn init --tools opencode,cursor
```

### 2. Use Jinn Commands

In your AI tool, use these commands:

```
/jinn:propose - Start a new change
/jinn:explore - Explore a problem space
/jinn:apply - Implement changes
/jinn:archive - Complete and document work
```

### 3. Update Generated Files

```bash
# Regenerate all files
jinn update

# Update specific tool
jinn update --tool cursor
```

## Configuration

Jinn creates `.jinn/config.yaml`:

```yaml
version: "1.0.0"
tools:
  - opencode
  - cursor
profile: core
delivery: both
```

### Profiles

- **core** - Essential commands and agents
- **extended** - Full command set

### Delivery Modes

- **commands** - Only commands
- **skills** - Only skills
- **both** - Commands and skills

## Supported Tools

Jinn supports 6 AI coding tools:

| Tool           | ID               | Directory   |
| -------------- | ---------------- | ----------- |
| OpenCode       | `opencode`       | `.opencode/` |
| Claude Code    | `claude`         | `.claude/`  |
| OpenAI Codex   | `codex`          | `.agents/`  |
| GitHub Copilot | `github-copilot` | `.github/`  |
| Google Gemini  | `gemini`         | `.gemini/`  |
| Cursor         | `cursor`         | `.cursor/`  |

## Example Workflows

### Starting New Work

1. Use `/jinn:propose` to define the change
2. Use `/jinn:explore` if you need to research
3. Use `/jinn:apply` to implement
4. Use `/jinn:archive` when done

### Code Review

1. Use `/jinn:code:review` to review changes
2. Agents will analyze and provide feedback

### Performance Optimization

1. Use `/jinn:code:optimize` with target
2. Agents will profile and optimize

## Troubleshooting

### No tools detected

```bash
# Check what tools are available
jinn detect
```

### Config issues

```bash
# View current config
jinn config show
```

### Regenerate files

```bash
# Force regeneration
jinn update --force
```

## Next Steps

- Read the [Architecture Overview](./docs/architecture.md)
- Check [Configuration Reference](./docs/config.md)
- Explore [Available Commands](./docs/commands.md)

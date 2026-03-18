# Example: Multi-Tool Setup

Multiple AI tools with extended profile.

## Files

### .jinn/config.yaml
```yaml
version: "1.0.0"
tools:
  - opencode
  - cursor
  - claude
  - github-copilot
profile: extended
delivery: both
```

## Usage

```bash
# Initialize with all tools
jinn init --tools all --profile extended

# Commands work in all tools
/jinn:propose
/jinn:code:review
/jinn:project:deploy
```

## What You Get

- All 40+ commands
- All 40+ agents
- All skills
- Works in OpenCode, Cursor, Claude Code, GitHub Copilot
# Example: Minimal Setup

Minimal jinn setup with just OpenCode.

## Files

### .jinn/config.yaml
```yaml
version: "1.0.0"
tools:
  - opencode
profile: core
delivery: both
```

## Usage

```bash
# Initialize
jinn init --tools opencode --yes

# Use commands
/jinn:propose
/jinn:apply
```

## What You Get

- 4 workflow commands
- 4 code commands
- 4 git commands
- 4 agents
- 2 skills
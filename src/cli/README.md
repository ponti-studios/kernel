# CLI

Command-line interface for jinn.

## Commands

- **jinn init** - Initialize jinn in a project
- **jinn update** - Update all configured tools
- **jinn config** - Manage configuration
- **jinn validate** - Validate installation

## Usage Examples

```bash
# Initialize with detected tools
jinn init

# Initialize with specific tools
jinn init --tools opencode,cursor

# Update all configured tools
jinn update

# Change profile
jinn config profile extended
```

## Implementation

Each command is implemented as a separate module:
- **init.ts** - Initialization logic
- **update.ts** - Update logic
- **config.ts** - Configuration commands
- **validate.ts** - Validation logic
- **index.ts** - CLI entry point

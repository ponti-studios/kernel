# CLI

Command-line interface for ghostwire.

## Commands

- **ghostwire init** - Initialize ghostwire in a project
- **ghostwire update** - Update all configured tools
- **ghostwire config** - Manage configuration
- **ghostwire validate** - Validate installation

## Usage Examples

```bash
# Initialize with detected tools
gghostwire init

# Initialize with specific tools
gghostwire init --tools opencode,cursor

# Update all configured tools
gghostwire update

# Change profile
gghostwire config profile extended
```

## Implementation

Each command is implemented as a separate module:
- **init.ts** - Initialization logic
- **update.ts** - Update logic
- **config.ts** - Configuration commands
- **validate.ts** - Validation logic
- **index.ts** - CLI entry point

## Why

Ghostwire's current CLI uses basic Commander.js without any TUI polish. Users deserve a beautiful, modern CLI experience comparable to tools like openspec, GitHub CLI, or Turborepo. We need:

- Rich TUI with spinners, progress bars, and colored output
- Interactive prompts with autocomplete
- Nice error handling and helpful messages
- Command icons and visual hierarchy

## What Changes

- Replace Commander.js with OCLIF framework
- Add @oclif/plugin-spinners for loading states
- Add @oclif/plugin-interactive for autocomplete prompts
- Add chalk or picocolors for colored output
- Create custom TUI components (progress, tables, trees)
- Add ASCII art banner on init
- Add interactive wizard for first-time setup

## Capabilities

### New Capabilities

- `oclif-cli`: Production CLI framework with TUI
- `rich-output`: Colored, formatted console output
- `interactive-prompts`: Autocomplete and selection prompts
- `progress-indicators`: Spinners, progress bars, tables

### Modified Capabilities

- `ghostwire-cli`: Rewrite existing CLI commands in OCLIF

## Impact

- New dependencies: oclif, @oclif/plugin-spinners, @oclif/plugin-interactive, chalk
- CLI commands remain the same but with better UX
- Package size increases slightly

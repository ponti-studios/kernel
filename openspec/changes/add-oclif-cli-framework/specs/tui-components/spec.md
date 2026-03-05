## ADDED Requirements

### Requirement: ASCII Banner
Ghostwire CLI SHALL display ASCII banner on init.

#### Scenario: Init command starts
- **WHEN** user runs `ghostwire init`
- **THEN** display:
```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   ██████╗ ██╗     ██████╗  ██████╗ ███████╗ ██████╗      ║
║  ██╔════╝ ██║     ██╔══██╗██╔═══██╗██╔════╝██╔═══██╗     ║
║  ██║  ███╗██║     ██████╔╝██║   ██║███████╗██████╔╝      ║
║  ██║   ██║██║     ██╔══██╗██║   ██║╚════██║██╔══██╗      ║
║  ╚██████╔╝███████╗██████╔╝╚██████╔╝███████║██║  ██║      ║
║   ╚═════╝ ╚══════╝╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝      ║
║                                                            ║
║   AI Agent Distribution Platform                           ║
╚════════════════════════════════════════════════════════════╝
```

### Requirement: Tool Detection Display
Ghostwire CLI SHALL display detected tools in tree format.

#### Scenario: Detect command runs
- **WHEN** `ghostwire detect` executes
- **THEN** show:
```
🔍 Detected Tools:
├── ✓ OpenCode (.opencode/)
├── ✓ Cursor (.cursor/)
└── ✗ Claude Code (not installed)
```

### Requirement: Progress Table
Ghostwire CLI SHALL display file generation progress in table.

#### Scenario: Init generates files
- **WHEN** generating files
- **THEN** show:
```
📁 Generating Files...
┌─────────────────────────┬──────────┐
│ Command                 │ Status   │
├─────────────────────────┼──────────│
│ ghostwire-propose       │ ✓        │
│ ghostwire-explore       │ ✓        │
│ ghostwire-apply         │ ✓        │
└─────────────────────────┴──────────┘
```

### Requirement: Success/Failure Summary
Ghostwire CLI SHALL show clear summary at end of commands.

#### Scenario: Init completes
- **WHEN** all files generated
- **THEN** show:
```
✅ Successfully initialized ghostwire!

📁 Generated 146 files across 2 tools
  • 73 files for OpenCode
  • 73 files for GitHub Copilot

Next steps:
  • Run 'ghostwire update' to regenerate files
  • Run 'ghostwire config show' to view configuration
```

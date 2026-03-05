## Context

Ghostwire CLI currently uses vanilla Commander.js for CLI parsing. OCLIF provides a more robust framework with built-in TUI features, auto-generated help, and plugin ecosystem.

## Goals / Non-Goals

**Goals:**
- Replace Commander.js with OCLIF
- Add spinners for async operations
- Add colored output using chalk
- Add interactive prompts for user input
- Keep existing command structure (init, update, config, detect)

**Non-Goals:**
- Change command arguments/flags (backwards compatible)
- Add new commands (keep scope minimal)
- Add analytics/telemetry

## Decisions

1. **Framework**: Use OCLIF (oclif v5) - mature, well-documented, TypeScript-first

2. **Output Library**: Use `chalk` (v5) for colors - widely used, tree-shakeable

3. **Spinners**: Use built-in OCLIF spinner or `nanospinner` (already in deps)

4. **Prompts**: Use `@oclif/plugin-interactive` for autocomplete

5. **Structure**:
   ```
   src/cli/
   ├── main.ts           # OCLIF entry point
   └── commands/        # Individual command files
       ├── init.ts
       ├── update.ts
       ├── config.ts
       └── detect.ts
   ```

## Commands Design

### Init Command
- Show ASCII banner on start
- Spinner while detecting tools
- Progress indicator while generating files
- Success message with next steps

### Update Command  
- Check for updates spinner
- Diff display for changed files
- Confirmation prompt before overwriting

### Config Command
- Use table for config display
- Interactive prompt for setting values

### Detect Command
- Tree view for detected tools
- Icons for each tool type
- Color-coded status

## Risks / Trade-offs

- [Risk] OCLIF bin size - Mitigation: Only include needed plugins
- [Risk] Breaking changes - Mitigation: Keep same CLI interface
- [Risk] Bun compatibility - OCLIF is Node-first, may need adjustments

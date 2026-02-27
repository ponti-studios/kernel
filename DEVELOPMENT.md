# Ghostwire Development Guide

## Architecture

Ghostwire uses a **self-contained, location-independent plugin architecture**:

### How It Works

1. **Build-time manifest generation**
   - Scans `agents` directory for markdown agent definitions
   - Extracts all metadata and prompts
   - Generates `src/execution/features/agents-manifest.ts` with embedded agent data.

2. **Smart loading** in `src/orchestration/agents/load-markdown-agents.ts`
   - Primary: Load from embedded manifest (no filesystem needed)
   - Fallback: Load from directory if available (dev mode)
   - Works from any directory/installation

3. **Global plugin wrapper** at `~/.config/opencode/plugins/ghostwire.mjs`
   - Simple ES module that imports from local `dist/index.js`
   - Allows dev changes to be immediately available in OpenCode

## Development Workflow

### Setup (One-time)

```bash
# Build the project and create the global plugin wrapper
cd ~/Developer/ghostwire
bun run build
bunx ghostwire install --no-tui --openai=no --gemini=no --copilot=no --local-sync

# Verify the global plugin exists
ls -la ~/.config/opencode/plugins/ghostwire.mjs
```

### Local Development Loop

**Terminal 1: Watch mode**

```bash
cd ~/Developer/ghostwire
bun run dev
# Watches src/ for changes, auto-rebuilds to dist/
```

**Terminal 2: Use OpenCode**

```bash
# Open any project
cd ~/your-project
opencode .
# Changes from bun run dev are immediately available
```

### Full Build (with types, schema, CLI)

```bash
bun run dev:full
# Builds: plugin + types + schema + CLI
```

### Manual Sync to Global (if needed)

```bash
bun run build
bunx ghostwire install --no-tui --openai=no --gemini=no --copilot=no --local-sync
# Copies local dist/index.js to ~/.config/opencode/plugins/ghostwire.mjs
```

## File Structure

```
.
├── src/
│   ├── orchestration/agents/       # 38 agent markdown files
│   ├── execution/features/agents-manifest.ts  # AUTO-GENERATED
│   └── index.ts                    # Plugin entry point
├── dist/
│   └── index.js                    # Built plugin (2.95MB)
├── script/
│   ├── build-agents-manifest.ts    # Manifest generator
│   └── build-schema.ts             # JSON schema generator
└── package.json                    # Build scripts
```

## Scripts

| Command             | Purpose                                                                |
| ------------------- | ---------------------------------------------------------------------- |
| `bun run dev`       | Watch + rebuild to dist/ (for local testing)                           |
| `bun run dev:full`  | Full build: plugin + types + schema + CLI                              |
| `bun run build`     | Build without types/schema/CLI                                         |
| `ghostwire install --local-sync` | Sync local dist/index.js to ~/.config/opencode/plugins/ghostwire.mjs |
| `bun run typecheck` | Type check only                                                        |
| `bun test`          | Run all tests (1929 tests)                                             |

## How Agents Are Loaded

### In Development

1. `bun run dev` → generates manifest → builds to `dist/`
2. OpenCode loads `~/.config/opencode/plugins/ghostwire.mjs`
3. Plugin imports from `/Users/charlesponti/Developer/ghostwire/dist/index.js`
4. Bundle includes manifest → agents load from manifest (no filesystem access)

### In Production (after npm publish)

1. Plugin installed via npm
2. Agents load from embedded manifest
3. No filesystem dependencies - works anywhere

## Why This Architecture

✅ **Location-independent** - Plugin works from any directory  
✅ **Self-contained** - No runtime filesystem dependencies  
✅ **Dev-friendly** - Still syncs with local source during development  
✅ **Production-ready** - Can be published to npm  
✅ **Type-safe** - Full TypeScript support

## Troubleshooting

### Plugin not loading in OpenCode

```bash
# Verify wrapper exists
cat ~/.config/opencode/plugins/ghostwire.mjs

# Verify dist exists
ls -lh ~/Developer/ghostwire/dist/index.js

# Rebuild
cd ~/Developer/ghostwire
bun run build && bunx ghostwire install --no-tui --openai=no --gemini=no --copilot=no --local-sync
```

### Manifest out of sync

```bash
# Regenerate manifest if you add new agents
bun run script/build-agents-manifest.ts
bun run dev:full
```

### Type errors

```bash
bun run typecheck
# Fix errors, then rebuild
bun run dev:full
```

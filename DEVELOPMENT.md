# Ghostwire Development Guide

## Architecture

Ghostwire uses a **self-contained, location-independent plugin architecture**:

### How It Works

1. **Build-time manifest generation**
   - Scans `agents` directory for markdown agent definitions
   - Extracts all metadata and prompts
   - Generates `src/execution/agents-manifest.ts` with embedded agent data.

2. **Smart loading** in `src/orchestration/agents/load-markdown-agents.ts`
   - Primary: Load from embedded manifest (no filesystem needed)
   - Fallback: Load from directory if available (dev mode)
   - Works from any directory/installation

3. **Global plugin symlink** at `~/.config/opencode/plugins/ghostwire.mjs`
   - Symlink points to local `dist/index.js`
   - Allows dev changes to be immediately available in OpenCode

## Development Workflow

### Setup (One-time)

```bash
# Create the symlink to your local development build
ln -sf ~/Developer/ghostwire/dist/index.js ~/.config/opencode/plugins/ghostwire.mjs
```

### Local Development

```bash
cd ~/Developer/ghostwire
bun run dev
```

This will:
1. Ensure the symlink exists (create if missing)
2. Watch `src/` for changes and rebuild to `dist/`
3. Changes are immediately available in OpenCode

### Full Build (with types, schema, CLI)

```bash
bun run dev:full
# Builds: plugin + types + schema + CLI
```

## File Structure

```
.
├── src/
│   ├── orchestration/agents/       # Agent markdown definitions
│   ├── execution/agents-manifest.ts  # AUTO-GENERATED
│   └── index.ts                    # Plugin entry point
├── dist/
│   └── index.js                    # Built plugin
├── script/
│   ├── build-agents-manifest.ts    # Manifest generator
│   └── build-schema.ts             # JSON schema generator
└── package.json                    # Build scripts
```

## Scripts

| Command          | Purpose                                           |
| ---------------- | ------------------------------------------------- |
| `bun run dev`    | Watch + rebuild to dist/ (for local testing)     |
| `bun run dev:full` | Full build: plugin + types + schema + CLI       |
| `bun run build`  | Build without types/schema/CLI                   |
| `bun run typecheck` | Type check only                                |
| `bun test`       | Run all tests                                    |

## How Agents Are Loaded

### In Development

1. `bun run dev` → generates manifest → builds to `dist/`
2. Symlink at `~/.config/opencode/plugins/ghostwire.mjs` → `dist/index.js`
3. OpenCode loads the plugin via the symlink
4. Bundle includes manifest → agents load from manifest (no filesystem access)

### In Production (after npm publish)

1. Plugin installed via npm
2. Agents load from embedded manifest
3. No filesystem dependencies - works anywhere

## Why This Architecture

- **Location-independent** - Plugin works from any directory
- **Self-contained** - No runtime filesystem dependencies
- **Dev-friendly** - Symlink provides instant local changes
- **Production-ready** - Can be published to npm
- **Type-safe** - Full TypeScript support

## Troubleshooting

### Plugin not loading in OpenCode

```bash
# Verify symlink exists and points to correct location
ls -la ~/.config/opencode/plugins/ghostwire.mjs

# Verify dist exists
ls -lh ~/Developer/ghostwire/dist/index.js

# Rebuild
cd ~/Developer/ghostwire
bun run build
```

### Manifest out of sync

```bash
# Regenerate manifest if you add new agents
bun run agents
bun run dev:full
```

### Type errors

```bash
bun run typecheck
# Fix errors, then rebuild
bun run dev:full
```

import type { CommandDefinition } from "../../claude-code-command-loader";
export const NAME = "ghostwire:project:map";
export const DESCRIPTION =
  "Map project structure and generate hierarchical AGENTS.md knowledge base";
export const TEMPLATE = `
# /init-deep
Generate hierarchical AGENTS.md files. Root + complexity-scored subdirectories.
## Usage
\`\`\`
/init-deep                      # Update mode: modify existing + create new where warranted
/init-deep --create-new         # Read existing → remove all → regenerate from scratch
/init-deep --max-depth=2        # Limit directory depth (default: 3)
\`\`\`
---
## Workflow (High-Level)
1. **Discovery + Analysis** (concurrent)
   - Fire background profile.researcher_codebase agents immediately
   - Main session: bash structure + LSP codemap + read existing AGENTS.md
2. **Score & Decide** - Determine AGENTS.md locations from merged findings
3. **Generate** - Root first, then subdirs in parallel
4. **Review** - Deduplicate, trim, validate
<critical>
**TodoWrite ALL phases. Mark in_progress → completed in real-time.**
\`\`\`
TodoWrite([
  { id: "discovery", content: "Fire profile.researcher_codebase agents + LSP codemap + read existing", status: "pending", priority: "high" },
  { id: "scoring", content: "Score directories, determine locations", status: "pending", priority: "high" },
  { id: "generate", content: "Generate AGENTS.md files (root + subdirs)", status: "pending", priority: "high" },
  { id: "review", content: "Deduplicate, validate, trim", status: "pending", priority: "medium" }
])
\`\`\`
</critical>
`;
export const ARGUMENT_HINT = "[--create-new] [--max-depth=N]";
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};

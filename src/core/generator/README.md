# File Generator

Orchestrates generation of jinn files across all configured AI tools.

## Files

- **index.ts** - Main Generator class orchestrating all generation
- **command-gen.ts** - Command file generation
- **skill-gen.ts** - Skill file generation
- **agent-gen.ts** - Agent file generation

## Generation Flow

1. Load configuration (which tools, which profile)
2. Load template registries (commands, skills, agents)
3. For each configured tool:
   - Get tool adapter
   - Generate command files
   - Generate skill files
   - Generate agent files
4. Write all files to appropriate directories

## Usage

```typescript
import { Generator } from './generator/index.js';
import { loadConfig } from './config/loader.js';

const config = await loadConfig(projectPath);
const generator = new Generator(config);

const result = await generator.generateAll(projectPath);

console.log(`Generated: ${result.generated.length} files`);
console.log(`Failed: ${result.failed.length} files`);
```

## Output

Generated files follow tool-specific conventions:

```
.opencode/
├── commands/jinn-propose.md
├── skills/jinn-planner/SKILL.md
└── ...

.cursor/
├── commands/jinn-propose.md
├── skills/jinn-planner/SKILL.md
└── ...
```

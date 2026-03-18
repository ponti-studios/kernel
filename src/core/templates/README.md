# Template System

Type definitions and registry for jinn templates.

## Types

### SkillTemplate
Defines an agent skill with instructions and metadata.

### CommandTemplate
Defines a slash command with content and metadata.

### AgentTemplate
Extends SkillTemplate for AI personas with additional capabilities.

## Registry

The `TemplateRegistry` class manages:
- Command templates
- Skill templates
- Agent templates

## Usage

```typescript
import { createTemplateRegistry } from './templates/registry.js';

const registry = createTemplateRegistry();

// Get a command template
const proposeTemplate = registry.getCommand('propose');

// Get all core commands
const coreCommands = registry.getCoreCommands();

// Get an agent template
const plannerTemplate = registry.getAgent('planner');
```

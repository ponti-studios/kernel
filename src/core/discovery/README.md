# Discovery

Tool detection and registry for jinn.

## Tool Detection

Detects which AI coding assistants are installed in a project by scanning for their configuration directories.

## Tool Definitions

Defines metadata for 24 AI tools including:
- Tool ID and name
- Skills directory location
- Capabilities
- Availability status

## Usage

```typescript
import { detectAvailableTools } from './detector.js';
import { TOOL_DEFINITIONS } from './definitions.js';

const tools = await detectAvailableTools('/path/to/project');
```

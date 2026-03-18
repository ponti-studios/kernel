# Utils

Core utility functions for jinn.

## Modules

- `file-system.ts` - Async file operations
- `path.ts` - Cross-platform path utilities  
- `version.ts` - Version comparison utilities

## Usage

```typescript
import { readJsonFile, writeJsonFile } from './file-system.js';
import { normalizeProjectPath } from './path.js';
import { compareVersions } from './version.js';
```

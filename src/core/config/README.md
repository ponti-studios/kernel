# Config

Jinn configuration system.

## Schema

Zod schemas for validating jinn configuration.

## Loader

YAML configuration file I/O operations.

## Validation

Configuration validation with helpful errors.

## Defaults

Default configuration values.

## Usage

```typescript
import { loadConfig } from './loader.js';
import { validateConfig } from './validation.js';

const config = await loadConfig('/path/to/project');
const result = validateConfig(config);
```

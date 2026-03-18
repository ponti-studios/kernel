# Jinn Core

Core infrastructure for harness-agnostic architecture.

## Directory Structure

- **adapters/** - Tool-specific format adapters for 24 AI tools
- **config/** - Configuration management (loading, validation, defaults)
- **discovery/** - Tool detection and registry
- **generator/** - File generation orchestration
- **templates/** - Template type definitions and registry
- **utils/** - Shared utility functions

## Overview

The core module provides the foundation for jinn's harness-agnostic architecture:

1. **Adapters** translate generic templates to tool-specific formats
2. **Config** manages jinn configuration files
3. **Discovery** detects which AI tools are installed
4. **Generator** orchestrates file generation across all tools
5. **Templates** defines the template system types
6. **Utils** provides cross-cutting utilities

---
description: Intelligent refactoring with full codebase awareness
---

# Ghostwire: Refactor

Intelligent, deterministic refactoring with full codebase awareness.

## Overview

This command understands your intent, maps the codebase, assesses risk, plans meticulously, executes precisely, and verifies constantly.

## Process

### Phase 1: Intent Gate
- Classify and validate request
- Identify target clearly
- Create initial todos

### Phase 2: Codebase Analysis
- Launch parallel research agents
- Use LSP tools for precise analysis
- Use AST-grep for pattern analysis

### Phase 3: Build Codemap
- Map dependencies
- Identify impact zones
- Find established patterns

### Phase 4: Test Assessment
- Detect test infrastructure
- Analyze test coverage
- Determine verification strategy

### Phase 5: Plan Generation
- Create detailed refactoring plan
- Break into atomic steps
- Each step independently verifiable

### Phase 6: Execute Refactoring
- Execute step-by-step
- Verify after each change
- Never proceed with failing tests

### Phase 7: Final Verification
- Run full test suite
- Type check clean
- Lint clean

## Rules

### NEVER
- Skip diagnostics check
- Proceed with failing tests
- Use as any or ts-ignore
- Delete tests to pass
- Commit broken code

### ALWAYS
- Understand before changing
- Preview before applying
- Verify after every change
- Follow existing patterns
- Keep todos updated
- Commit at checkpoints

# Agent Markdown Format Contract

**Status**: Formal Specification  
**Date**: 2026-02-20  
**Scope**: All agents in `src/orchestration/agents/*.md`

---

## Overview

All agents in ghostwire will be defined as markdown files with YAML frontmatter metadata. This format replaces the previous dual system of TypeScript code-defined agents and separate plugin markdown agents.

**Location**: `src/orchestration/agents/[agent-id].md`  
**Naming**: kebab-case identifiers (e.g., `reviewer-security.md`, `oracle-performance.md`)

---

## File Structure

```
src/orchestration/agents/
├── reviewer-security.md          # Security code review agent
├── validator-bugs.md             # Bug reproduction validation agent
├── oracle-performance.md         # Performance optimization agent
├── analyzer-patterns.md          # Pattern recognition agent
└── [35 more agents...]           # Total: 38 agents
```

---

## Markdown Format (Complete Schema)

### 1. YAML Frontmatter (Required)

All agents MUST include YAML frontmatter between `---` delimiters with the following fields:

```yaml
---
id: reviewer-security                                    # [REQUIRED] Kebab-case identifier, unique within agents/
name: Security Code Reviewer                            # [REQUIRED] Display name (human-readable)
purpose: Review code for security vulnerabilities       # [REQUIRED] One-line purpose statement
models:                                                  # [REQUIRED] Model configuration
  primary: claude-opus-4.5                              # [REQUIRED] Primary LLM to use
  fallback: gpt-5.2                                     # [OPTIONAL] Fallback model if primary unavailable
temperature: 0.1                                         # [OPTIONAL] LLM temperature (0.0-2.0, default: 0.1)
tags:                                                    # [OPTIONAL] Searchable tags (array of strings)
  - security
  - code-review
  - vulnerability
category: review                                         # [OPTIONAL] Agent category (review, research, design, docs, workflow)
cost: HIGH                                               # [OPTIONAL] Relative cost (LOW, MEDIUM, HIGH)
triggers:                                                # [OPTIONAL] When to use this agent
  - domain: Security auditing
    trigger: When performing security audits on code
useWhen:                                                 # [OPTIONAL] Recommended use cases (array of strings)
  - Auditing code for security vulnerabilities
  - Performing security reviews before deployment
  - Analyzing third-party dependencies
avoidWhen:                                               # [OPTIONAL] NOT recommended for (array of strings)
  - Quick performance optimizations
  - Rapid prototyping tasks
  - Non-security code reviews
---
```

### 2. Markdown Content (Required)

After frontmatter, include markdown content with:

- **H1 Title**: Must match `name` from frontmatter
- **Description**: Brief (2-3 sentences) explaining what the agent does
- **System Prompt**: Detailed instructions for the LLM (core agent behavior)
- **Guidelines**: Best practices, constraints, edge cases
- **Examples** (optional): Usage examples showing typical interactions

**Minimum structure**:

```markdown
---
[YAML frontmatter here]
---

# Security Code Reviewer

Your role is to conduct thorough security reviews of code submissions, identifying potential vulnerabilities, security anti-patterns, and compliance issues.

## System Prompt

You are an expert security code reviewer with deep knowledge of:
- Common security vulnerabilities (OWASP Top 10)
- Secure coding practices
- Threat modeling
- Risk assessment

When reviewing code:
1. Analyze for injection vulnerabilities (SQL, Command, Template)
2. Check authentication and authorization logic
3. Verify cryptographic implementations
4. Assess data exposure risks
5. Evaluate error handling for security leaks

## Guidelines

- Focus on real security risks, not style issues
- Provide actionable remediation advice
- Rate severity (Critical, High, Medium, Low)
- Avoid false positives

## Examples

### Example 1: SQL Injection Detection
```

---

## Field Specifications

### Required Fields

| Field | Type | Example | Rules |
|-------|------|---------|-------|
| `id` | string | `reviewer-security` | Kebab-case, 2-30 chars, unique, alphanumeric + hyphens |
| `name` | string | `Security Code Reviewer` | Max 100 chars, no trailing whitespace |
| `purpose` | string | `Review code for security...` | Max 200 chars, one-line description |
| `models.primary` | string | `claude-opus-4.5` | Valid OpenAI/Anthropic/Google model ID |

### Optional Fields

| Field | Type | Default | Rules |
|-------|------|---------|-------|
| `models.fallback` | string | null | Valid alternative model ID |
| `temperature` | number | 0.1 | Range: 0.0 - 2.0 |
| `tags` | array | [] | Max 10 tags, kebab-case strings |
| `category` | string | null | One of: review, research, design, docs, workflow |
| `cost` | string | MEDIUM | One of: LOW, MEDIUM, HIGH |
| `triggers` | object | null | Object with `domain` (string) and `trigger` (string) properties |
| `useWhen` | array | [] | Array of use case strings |
| `avoidWhen` | array | [] | Array of avoid case strings |

---

## Validation Rules

### Field Validation

1. **id**
   - Must be kebab-case (only lowercase letters, numbers, hyphens)
   - Must be unique within `src/orchestration/agents/`
   - Must be 2-30 characters long
   - Must match filename (e.g., `reviewer-security.md` for id: `reviewer-security`)

2. **name**
   - Must be non-empty string
   - Max 100 characters
   - Should be title case or proper sentence case
   - No leading/trailing whitespace

3. **purpose**
   - Must be non-empty string
   - Max 200 characters (one-line summary)
   - Should end with a period or appropriate punctuation
   - No leading/trailing whitespace

4. **models.primary**
   - Must be valid LLM identifier
   - Examples: `claude-opus-4.5`, `gpt-5.2`, `gemini-2-flash`
   - No null or empty values allowed

5. **models.fallback** (optional)
   - If present, must be valid LLM identifier
   - Must be different from primary
   - Can be null/omitted

6. **temperature** (optional)
   - Must be number between 0.0 and 2.0
   - Defaults to 0.1 if omitted
   - Code agents typically use 0.1 (deterministic)

7. **tags** (optional)
   - Must be array of strings
   - Each tag: kebab-case, 2-20 characters
   - Max 10 tags per agent
   - Can be empty array or omitted

8. **category** (optional)
   - Must be one of: `review`, `research`, `design`, `docs`, `workflow`
   - Can be null/omitted

9. **cost** (optional)
   - Must be one of: `LOW`, `MEDIUM`, `HIGH`
   - Defaults to `MEDIUM` if omitted

10. **triggers** (optional)
    - Must be object with `domain` (string) and `trigger` (string) properties
    - Both properties required if present
    - Can be omitted entirely

11. **useWhen** (optional)
    - Must be array of strings
    - Each string 10-200 characters
    - Max 5 items
    - Can be empty or omitted

12. **avoidWhen** (optional)
    - Must be array of strings
    - Each string 10-200 characters
    - Max 5 items
    - Can be empty or omitted

---

## Examples

### Example 1: Minimal Agent

```yaml
---
id: basic-agent
name: Basic Agent
purpose: A minimal example agent
models:
  primary: claude-opus-4.5
---

# Basic Agent

This is a basic agent that does simple work.

## System Prompt

You are a helpful assistant.
```

### Example 2: Full-Featured Agent

```yaml
---
id: reviewer-security
name: Security Code Reviewer
purpose: Identify and fix security vulnerabilities in code
models:
  primary: claude-opus-4.5
  fallback: gpt-5.2
temperature: 0.1
tags:
  - security
  - code-review
  - vulnerability-assessment
category: review
cost: HIGH
triggers:
  - domain: Security auditing
    trigger: When performing security code reviews
useWhen:
  - Auditing code for security vulnerabilities
  - Evaluating third-party dependencies
  - Pre-deployment security checks
avoidWhen:
  - Performance optimization work
  - Style or formatting reviews
---

# Security Code Reviewer

Conduct thorough security reviews of code, identifying vulnerabilities and recommending fixes.

## System Prompt

You are an expert security code reviewer...

## Guidelines

- Focus on real security risks
- Provide actionable remediation
- Rate severity appropriately

## Examples

### SQL Injection Detection
[example content]
```

---

## Parsing and Loading

### YAML Frontmatter Extraction

1. Read file from disk
2. Split content by `---` delimiter
3. Extract content between first and second `---`
4. Parse YAML using standard YAML parser
5. Validate against schema

**Pseudocode**:
```
content = readFile(path)
parts = content.split('---')
if parts.length < 3:
  throw InvalidFrontmatterError
frontmatter = parts[1]
markdown = parts[2]
metadata = parseYAML(frontmatter)
validate(metadata, AGENT_SCHEMA)
return {metadata, markdown}
```

### Validation During Loading

- Validate YAML structure (required fields, types)
- Check id uniqueness across all agents
- Verify filename matches id
- Validate file encoding (UTF-8)
- Report helpful errors with file path and field name

---

## Migration from Code-Defined Agents

Agents defined as TypeScript factories in `src/orchestration/agents/*.ts` are migrated to markdown format using this process:

1. Extract `AgentPromptMetadata` from TypeScript file
2. Map metadata fields to YAML frontmatter fields
3. Extract system prompt and guidelines from factory function's prompt string
4. Create `.md` file with same identifier as TypeScript filename (without `.ts`)
5. Preserve all behavior, prompts, and metadata exactly
6. Delete original TypeScript file

**Field Mapping**:
```
TypeScript AgentPromptMetadata  →  YAML Frontmatter
──────────────────────────────────────────────────────
id                              →  id
category                        →  category
cost (derived)                  →  cost
promptAlias                     →  (name)
triggers                        →  triggers
useWhen                         →  useWhen
avoidWhen                       →  avoidWhen
temperature                     →  temperature
prompt (markdown)               →  markdown content
modelConfig.primary            →  models.primary
modelConfig.fallback           →  models.fallback
```

---

## Loading System Integration

### Expected Interface

The `loadMarkdownAgents()` function must return an object compatible with the existing agent interface:

```typescript
interface LoadedAgent {
  id: string
  name: string
  purpose: string
  models: {
    primary: string
    fallback?: string
  }
  temperature: number
  tags?: string[]
  category?: string
  cost?: 'LOW' | 'MEDIUM' | 'HIGH'
  triggers?: Array<{ domain: string; trigger: string }>
  useWhen?: string[]
  avoidWhen?: string[]
  prompt: string  // Full markdown content (frontmatter + body)
}
```

---

## Directory Structure After Consolidation

```
src/orchestration/agents/
├── index.ts                          # Agent registry exports
├── types.ts                          # Type definitions
├── utils.ts                          # Utility functions
├── load-markdown-agents.ts           # Markdown loader (new)
├── agent-schema.ts                   # Zod validation schema (new)
├── parse-yaml-frontmatter.ts         # YAML parser utility (new)
├── reviewer-security.md              # Security code review agent
├── validator-bugs.md                 # Bug validation agent
├── oracle-performance.md             # Performance optimization agent
├── analyzer-patterns.md              # Pattern recognition agent
├── reviewer-races.md                 # Frontend race conditions agent
└── [33 more markdown files...]       # Total: 38 agents

src/plugin/agents/
├── [community/user agents only]      # No duplicates with src/orchestration/agents/
```

---

## Backwards Compatibility

### Agent References

Existing code that references agents by ID will continue to work:
- `agents.get('reviewer-security')` ✅ Works (matches markdown agent id)
- `agents.get('security-sentinel')` ❌ Won't work (old plugin name)

### Migration Path

For users with custom agents using old plugin agent names:
1. Plugin agents with different names are aliases/duplicates
2. Preferred: Migrate custom references to kebab-case names
3. Alternative: Create aliases in config if backwards compatibility critical

---

## Quality Standards

### Consistency Requirements

1. All agents must follow this format exactly
2. No arbitrary additional YAML fields
3. All required frontmatter fields must be present
4. Markdown content must be valid (no HTML entities needed)
5. File encoding must be UTF-8

### Code Style

- YAML: 2-space indentation
- Markdown: Standard CommonMark
- Line length: No strict limit (for flexibility in prose)
- No trailing whitespace

---

## References

- **Loading System**: `src/orchestration/agents/load-markdown-agents.ts`
- **Validation Schema**: `src/orchestration/agents/agent-schema.ts`
- **Agent Registry**: `src/orchestration/agents/index.ts`
- **Config Merging**: `src/platform/opencode/config-composer.ts` lines 317-334
- **Previous TypeScript Agents**: Removed during Phase 8

---

## Document History

| Date | Change | Author |
|------|--------|--------|
| 2026-02-20 | Initial formal specification | OpenCode Agent |

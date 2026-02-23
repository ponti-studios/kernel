# Modes

Ghostwire provides several operational modes that optimize agent behavior for different types of work. Modes can be activated via keywords, commands, or configuration.

## Ultrawork Mode

**Activation**: Include `ultrawork` or `ulw` in your prompt

The default "just do it" mode that maximizes agent performance through:

- **Parallel agent execution**: Multiple specialized agents work simultaneously
- **Background task delegation**: Long-running tasks happen in parallel
- **Aggressive exploration**: Deep codebase analysis before implementation
- **Automatic planning**: Agent creates and manages its own task lists
- **Relentless execution**: Continues until task completion

### Usage Examples

```
ulw add authentication to my Next.js app
ulw refactor the payment module to use Stripe
ulw fix all TypeScript errors in the codebase
```

### What Happens Automatically

1. **Scout Recon** explores codebase structure and patterns
2. **Archive Researcher** looks up best practices and documentation
3. Main agent coordinates implementation with parallel subtasks
4. **Diagnostics** and **tests** run automatically for verification
5. Continues working until completion criteria met

### Configuration

Enable/disable via keyword detection (on by default):

```json
{
  "disabled_hooks": ["grid-keyword-detector"]
}
```

## planner Mode

**Activation**: Press **Tab** to switch to planner (Planner) agent

Precision mode for complex, multi-step projects requiring careful planning.

### Workflow

1. **Interview Phase**: planner asks clarifying questions
2. **Research Phase**: Archive Researcher investigates codebase
3. **Plan Generation**: Detailed work plan with tasks and acceptance criteria
4. **Validation** (optional): Glitch Auditor reviews plan
5. **Execution**: Run `/jack-in-work` to execute with orchestrator orchestrator

### When to Use

- Multi-day or multi-session projects
- Critical production changes
- Complex refactoring spanning many files
- When you want documented decision trails
- Architectural changes requiring careful coordination

### Usage Examples

```
[Press Tab - enters planner mode]

I need to migrate from REST to GraphQL

[planner interviews you, generates plan]

/jack-in-work
[orchestrator orchestrator executes the plan]
```

### Configuration

```json
{
  "agents": {
    "planner": {
      "model": "opencode/kimi-k2.5"
    }
  }
}
```

## Search Mode

**Activation**: Include `search`, `find`, or `locate` in your prompt

Optimized for exploration and information gathering.

### Characteristics

- **Scout Recon** takes lead for fast codebase exploration
- **Archive Researcher** lookups documentation and examples
- Parallel searches across multiple sources
- Results compiled into comprehensive findings

### Usage Examples

```
Search for all authentication middleware implementations
Find where the payment processing happens
Locate all usages of the User type
```

## Analyze Mode

**Activation**: Include `analyze`, `investigate`, or `debug` in your prompt

Deep analysis mode for understanding complex issues.

### Characteristics

- **Seer Advisor** provides strategic analysis
- **Archive Researcher** gathers context
- Focus on root cause identification
- Evidence-based conclusions

### Usage Examples

```
Analyze why the API response times are degrading
Investigate the memory leak in the worker process
Debug this intermittent test failure
```

## Ralph Loop Mode

**Activation**: `/overclock-loop "task description"`

Self-referential development loop that runs until completion.

### Characteristics

- Named after Anthropic's Ralph Wiggum plugin
- Agent continuously works toward goal
- Auto-continues if stopped without completion
- Detects `<promise>DONE</promise>` for completion

### Commands

```
/overclock-loop "Build a REST API with authentication"
/overclock-loop "Refactor the payment module" --max-iterations=50
/ulw-overclock "Fix all lint errors"  // Ultrawork version
/cancel-overclock  // Stop the loop
```

### Configuration

```json
{
  "ralph_loop": {
    "enabled": true,
    "default_max_iterations": 100
  }
}
```

## Think Mode

**Activation**: Include "think deeply", "ultrathink", or similar phrases

Extended thinking for complex reasoning tasks.

### Characteristics

- Automatically enables 32k thinking budget
- Activates extended reasoning for Claude models
- Optimized for architectural decisions
- More thorough analysis before action

### Usage Examples

```
Think deeply about the database schema design
Ultrathink the API versioning strategy
Consider deeply: should we use microservices?
```

## Background Task Mode

**Activation**: Add `background: true` to delegate_task

Run tasks in parallel while continuing work.

### Characteristics

- Tasks execute in separate sessions
- OS notifications on completion (if enabled)
- Results retrievable via `background_output`
- Tmux integration for visual monitoring

### Usage Examples

```typescript
delegate_task({
  agent: "researcher-codebase",
  prompt: "Find all API endpoints",
  background: true
})

// Continue working...

background_output({ task_id: "bg_abc123" })
```

### Visual Multi-Agent (Tmux)

Enable tmux panes to see background agents working:

```json
{
  "tmux": {
    "enabled": true,
    "layout": "main-vertical",
    "main_pane_size": 60
  }
}
```

## Interactive Bash Mode

**Activation**: Use `interactive_bash` tool with tmux commands

For interactive terminal applications requiring persistent sessions.

### Use Cases

- TUI applications (vim, htop, pudb)
- Interactive debuggers
- Long-running processes with streaming output
- Tools requiring terminal interaction

### Usage Examples

```typescript
// Create and manage tmux sessions
interactive_bash({ tmux_command: "new-session -d -s dev" })
interactive_bash({ tmux_command: "send-keys -t dev 'vim main.py' Enter" })
interactive_bash({ tmux_command: "capture-pane -p -t dev" })
```

## Claude Code Compatibility Mode

**Activation**: Automatic when Claude Code configs detected

Full compatibility with Claude Code configurations.

### Features

- Reads `~/.claude/settings.json` hooks
- Loads commands from `~/.claude/commands/`
- Imports skills from `~/.claude/skills/`
- Supports MCP servers from `.mcp.json`
- Compatible with todos and transcripts

### Configuration Toggle

```json
{
  "claude_code": {
    "mcp": true,
    "commands": true,
    "skills": true,
    "agents": true,
    "hooks": true
  }
}
```

## Non-Interactive Mode

**Activation**: Automatic when TTY not detected

Handles headless/CI environments gracefully.

### Characteristics

- Disables interactive prompts
- Prevents TUI applications
- Optimized for scripting
- Better error messages for automation

## Category-Based Delegation Modes

Task-specific modes activated via `delegate_task` categories:

### Quick Mode
- **Category**: `quick`
- **Purpose**: Fast, cheap tasks
- **Default Model**: `opencode/kimi-k2.5`

### Visual Mode
- **Category**: `visual`
- **Purpose**: UI/frontend implementation
- **Default Model**: `opencode/kimi-k2.5`

### Business Logic Mode
- **Category**: `business-logic`
- **Purpose**: Backend implementation
- **Default Model**: Provider-specific optimal

### Exploration Mode
- **Category**: `exploration`
- **Purpose**: Codebase exploration
- **Default Model**: `opencode/kimi-k2.5`

### Documentation Mode
- **Category**: `documentation`
- **Purpose**: Writing and docs
- **Default Model**: Provider-specific optimal

### Testing Mode
- **Category**: `testing`
- **Purpose**: Test writing and verification
- **Default Model**: Provider-specific optimal

## Mode Comparison

| Mode | Speed | Depth | Planning | Best For |
|------|-------|-------|----------|----------|
| Ultrawork | Fast | Medium | Automatic | Quick tasks, prototyping |
| planner | Slower | Deep | Explicit | Complex projects, production |
| Search | Fast | Shallow | None | Exploration, discovery |
| Analyze | Medium | Deep | Structured | Debugging, investigation |
| Ralph Loop | Continuous | Variable | Self-managed | Long-running tasks |
| Background | Parallel | Variable | User-managed | Multi-tasking |

## Switching Modes

Modes can be combined and switched dynamically:

```
[Press Tab] Enter planner mode
Create detailed plan

/jack-in-work  // Execute with orchestration

ulw fix the edge cases  // Switch to ultrawork for quick fixes

/overclock-loop "Complete remaining tasks"  // Ralph Loop for completion
```

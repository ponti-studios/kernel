# Ghostwire

> **The best AI agent harness.** Batteries-included OpenCode plugin with multi-model orchestration, parallel background agents, and crafted LSP/AST tools.

Ghostwire transforms your AI coding assistant into a powerful team of specialized agents that work together—background agents explore in parallel, semantic refactoring happens via LSP, frontend experts handle UI, and if you get stuck, specialists jump in automatically.

## ✨ What Makes Ghostwire Different

| Feature | Why It Matters |
|---------|---|
| **Multi-model orchestration** | Claude, GPT, Gemini, Grok—each excels at different tasks. Ghostwire routes work to the best tool. |
| **Parallel background agents** | While main agent develops, cheaper models explore codebase, docs, and GitHub in the background. |
| **LSP + AST-Grep refactoring** | No hallucinations. Surgical, deterministic code transformations validated by TypeScript. |
| **Todo continuation** | Agent gets stuck? System auto-resumes it. Work doesn't stop until complete. |
| **Comment intelligence** | AI-generated code stays clean. Comments only when necessary, indistinguishable from human code. |
| **39 lifecycle hooks** | Automate workflows at every stage—pre-execution, post-tool, context recovery, keyword detection, and more. |

## 🚀 Get Started in 30 Seconds

### Option 1: Let an Agent Do It (Recommended)

Copy this into Claude Code, Cursor, or your LLM agent:

```
Install and configure ghostwire by following:
https://raw.githubusercontent.com/hackefeller/ghostwire/refs/heads/main/docs/getting-started/installation.md
```

We recommend agents handle setup—they're better at it than humans.

### Option 2: Manual Setup

```bash
npm install -g ghostwire
opencode --init  # Then select ghostwire in config
```

See [Installation Guide](docs/getting-started/installation.md) for detailed instructions.

## 🪄 The Magic: `ultrawork`

Don't want to read the docs? Just add **`ultrawork`** (or `ulw`) to your prompt.

That's it. Ghostwire detects it and:
- Spawns parallel background agents to map the territory
- Routes complex tasks to domain experts automatically
- Continues execution until your task is 100% done
- Manages context across multiple agents seamlessly

```
"ultrawork: implement dark mode in the React app"
```

Done. Coffee break. Your work is complete.

## 🛠️ What You Get Out of the Box

### 10 Specialized Agents

| Agent | Superpower | Model |
|-------|-----------|-------|
| **Cipher Operator** | Main orchestrator, deep analysis | opencode/kimi-k2.5 |
| **Seer Advisor** | Architecture decisions, debugging | opencode/kimi-k2.5 |
| **Frontend UI/UX** | React, styling, animations | opencode/kimi-k2.5 |
| **Archive Researcher** | Docs, open-source patterns, history | opencode/kimi-k2.5 |
| **Scout Recon** | Lightning-fast codebase exploration | opencode/kimi-k2.5 |
| **Security Reviewer** | Vulnerability assessment | Specialized agent |
| **Planner** | Feature planning, task breakdown | Specialized agent |
| **Context Analyzer** | Token management, context recovery | Specialized agent |
| **LSP Refactorer** | Type-safe transformations | Specialized agent |
| **Git Master** | Atomic commits, history search | Specialized agent |

### 39 Lifecycle Hooks

Wire into every stage of development:

```yaml
PreToolUse: Validate input before execution
PostToolUse: Process results intelligently  
UserPromptSubmit: Intercept and enhance prompts
PreAgent: Setup before agent runs
PostAgent: Cleanup after agent completes
ContextRecovery: Handle token limit overflow
KeywordDetector: Trigger agents by keywords
TodoContinuation: Force completion of incomplete work
```

...and 31 more. See [Hook Reference](docs/reference/lifecycle-hooks.md).

### 50+ Built-in Commands

```bash
/ghostwire:workflows:plan          # Feature → actionable plan
/ghostwire:code:refactor           # Safe refactoring with LSP
/ghostwire:git:smart-commit        # Atomic commits following conventions
/ghostwire:project:test            # Run tests with coverage
/ghostwire:code:review             # Multi-agent code review
/ghostwire:security:audit          # Find vulnerabilities
/ghostwire:docs:deploy             # Build and deploy docs
```

Full list in [Commands Reference](docs/reference/commands.md).

### 3 Built-in MCPs

```
Exa (Web Search)           → Current information, research
Context7 (Live Docs)       → Official documentation, tutorials  
Grep.app (GitHub Search)   → Real-world code patterns
```

Configure or add your own in `.opencode/mcp.json`.

## 📋 How It Works

### The Team Structure

```
You (Human)
  ↓
Cipher Operator (Main Agent)
  ├─→ Background Task 1: Scout explores codebase
  ├─→ Background Task 2: Archive digs into docs
  ├─→ When stuck: Seer Advisor (GPT 5.2) joins
  ├─→ For frontend: UI Expert (Gemini 3 Pro) takes over
  ├─→ Code changes via LSP (type-safe, no hallucinations)
  └─→ Todo enforcement: Forces completion
```

### Real Example: "Ultrawork: Add authentication to the API"

1. **Second 0-2**: Cipher Operator parses the prompt, detects `ultrawork`
2. **Second 2-5**: Background agents spawn in parallel:
   - Scout scans `src/` for existing auth patterns
   - Archive fetches OAuth2 best practices
   - Researcher checks npm for auth libraries
3. **Second 5-10**: Cipher Operator designs the solution with full context
4. **Second 10-60**: Implementation:
   - Core logic via Cipher Operator
   - Type checking via LSP validation
   - Frontend UI via Gemini 3 Pro expert
   - Git commit via Git Master (atomic, well-written)
5. **Second 60+**: Tests run, todos enforced, work continues until 100% complete

**Key difference**: Traditional agents hunt for files themselves, wasting context. Ghostwire has cheaper models explore in parallel, then feeds Cipher Operator the treasure map.

## ⚙️ Configuration

Ghostwire works out of the box. Customize as needed:

```json
{
  "agents": {
    "cipher-operator": {
      "model": "opencode/kimi-k2.5",
      "temperature": 0.1
    },
    "seer-advisor": {
      "enabled": true,
      "model": "opencode/kimi-k2.5"
    }
  },
  "hooks": {
    "todo-continuation": {
      "enabled": true,
      "max-retries": 3
    },
    "context-recovery": {
      "enabled": true,
      "threshold": 0.9
    }
  },
  "features": {
    "comment-checker": { "enabled": true },
    "lsp-refactoring": { "enabled": true },
    "background-agents": { 
      "enabled": true,
      "max-parallel": 4 
    }
  }
}
```

See [Configuration Reference](docs/reference/configurations.md) for all options.

## 📚 Documentation

- **[Installation Guide](docs/getting-started/installation.md)** — Setup for different systems
- **[Agent Reference](docs/reference/agents.md)** — What each agent does, when to use it
- **[Hook Reference](docs/reference/lifecycle-hooks.md)** — 39 hooks explained
- **[Configuration Guide](docs/reference/configurations.md)** — All config options
- **[Troubleshooting](docs/troubleshooting/)** — Common issues and fixes
- **[Architecture Guide](docs/architecture.md)** — How Ghostwire works internally

## 💻 Development

Built with Bun, using TypeScript and full LSP support.

```bash
# Install dependencies
bun install

# Run tests (594 test files)
bun test

# Type check
bun run typecheck

# Build
bun run build

# Dev mode with hot reload
bun run dev
```

## 🏗️ Project Structure

```
ghostwire/
├── src/
│   ├── orchestration/        # Agents & Hooks
│   │   ├── agents/          # Agent definitions + prompts
│   │   └── hooks/           # Lifecycle hooks (39 total)
│   ├── execution/           # Features & Tools
│   │   ├── features/        # Skills, commands, background agents
│   │   └── tools/           # LSP, AST-Grep, delegation, etc.
│   ├── integration/         # MCPs & Utilities
│   │   ├── mcp/            # Built-in MCPs (Exa, Context7, Grep.app)
│   │   └── shared/         # Logger, parser, comment checker
│   ├── platform/           # Config & Compatibility
│   │   ├── opencode/       # OpenCode-specific
│   │   └── claude/         # Claude Code compatibility
│   └── cli/               # CLI commands
├── docs/                   # Documentation
├── script/                # Build scripts
├── packages/              # Platform-specific binaries (9)
└── tests/                 # Test files (594)
```

## 🎯 Key Design Principles

1. **Battery-included, nothing required** — Works perfectly out of the box
2. **Deterministic over creative** — LSP/AST for code changes, not hallucinations
3. **Parallel over sequential** — Background agents explore while main agent builds
4. **Reliable over smart** — Todo enforcement ensures work completes
5. **Clean over verbose** — AI-generated code shouldn't look AI-generated
6. **Delegated over centralized** — Each agent excels at one thing

## 🔗 Quick Links

- **Issues?** [GitHub Issues](https://github.com/hackefeller/ghostwire/issues)
- **Contributing?** [CONTRIBUTING.md](CONTRIBUTING.md)
- **Want to contribute?** We'd love your help. See [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License

SUL-1.0 (Sustainable Use License)

## 👤 Author

Built by the Hackefeller team. Originally created by [@pontistudios](https://github.com/pontistudios).

---

**Have 5 minutes?** Read [Getting Started](docs/getting-started/overview.md) for a guided tour.

**Have 30 seconds?** Add `ultrawork` to your prompt and let Ghostwire do the rest.

**Have zero minutes?** Copy the installation link above into Claude Code and let it set up for you.

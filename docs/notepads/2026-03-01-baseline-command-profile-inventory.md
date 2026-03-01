# Baseline Command & Profile Inventory

**Date**: 2026-03-01  
**Task**: Phase 0.1 - Capture Current Baseline  
**Generated From**: src/execution/commands/ and src/orchestration/agents/prompts/

## Executive Summary

- **Total Commands**: 32
- **Total Profiles**: 39
- **Runtime Loaders**: 2 direct paths (commands.ts, profiles.ts)
- **Export Paths**: 1 (cli/export.ts)
- **Template Coupling**: Direct filesystem reads in profiles.ts overlay + export pipeline

## I. Command Inventory

### All Commands (32 total)

| Command ID | Description | Route Hint | Agent Default |
|---|---|---|---|
| ghostwire:code:format | Apply consistent formatting and style standards | (auto) | (none) |
| ghostwire:code:optimize | Improve performance, reduce bundle size, or enhance efficiency | (auto) | oracle_performance |
| ghostwire:code:refactor | Systematically refactor code while maintaining functionality | (auto) | reviewer_typescript |
| ghostwire:code:review | Conduct comprehensive code reviews with specialist agents | (auto) | reviewer_typescript |
| ghostwire:docs:deploy-docs | Build and deploy documentation to hosting | (auto) | (none) |
| ghostwire:docs:feature-video | Create demonstration video for feature | (auto) | (none) |
| ghostwire:docs:release-docs | Create versioned documentation release | (auto) | editor_style |
| ghostwire:docs:test-browser | Test documentation in browser environment | (auto) | designer_iterator |
| ghostwire:git:branch | Create and manage feature branches with naming conventions | (auto) | (none) |
| ghostwire:git:cleanup | Remove stale branches and optimize repository | (auto) | (none) |
| ghostwire:git:merge | Merge branches safely with conflict resolution | (auto) | (none) |
| ghostwire:git:smart-commit | Generate well-structured commits following conventions | (auto) | (none) |
| ghostwire:lint:ruby | Run linting and code quality checks on Ruby and ERB files | (auto) | (none) |
| ghostwire:project:build | Compile, transpile, and bundle project code | (auto) | (none) |
| ghostwire:project:constitution | Create or update project constitution with core principles | (auto) | planner |
| ghostwire:project:deploy | Deploy project to specified environment | (auto) | operator |
| ghostwire:project:init | Initialize new project with structure and tooling | (auto) | (none) |
| ghostwire:project:map | Map and visualize project structure | (auto) | researcher_repo |
| ghostwire:project:topology | Display project structure and dependency graph | (auto) | researcher_repo |
| ghostwire:util:backup | Create project backup | (auto) | (none) |
| ghostwire:util:doctor | Diagnose project health | (auto) | (none) |
| ghostwire:util:restore | Restore from backup | (auto) | (none) |
| ghostwire:work:loop | Work loop for continuous task execution | (auto) | orchestrator |
| ghostwire:workflows:brainstorm | Brainstorm ideas and generate options | do | planner |
| ghostwire:workflows:complete | Mark workflow as complete | (auto) | (none) |
| ghostwire:workflows:plan | Plan comprehensive solution | do | planner |
| ghostwire:workflows:review | Review and iterate on work | do | reviewer_typescript |
| ghostwire:workflows:status | Show current workflow status | (auto) | (none) |
| ghostwire:workflows:work | Execute workflow and drive work | do | executor |
| ghostwire:code:lint | Code linting and style checks | (auto) | (none) |
| ghostwire:code:optimize-bundle | Optimize bundle size | (auto) | oracle_performance |
| ghostwire:code:test | Run test suite | (auto) | (none) |

### P1 Command Set (Parity Testing Priority)

Commands that must achieve ≥ 95% conformance parity across all adapters:

1. `ghostwire:workflows:plan` - Primary command entry point
2. `ghostwire:workflows:work` - Execution command
3. `ghostwire:workflows:review` - Code review workflow
4. `ghostwire:code:review` - Code review specialist
5. `ghostwire:code:refactor` - Refactoring specialist
6. `ghostwire:project:map` - Repository mapping

These 6 commands represent ~80% of typical usage patterns per telemetry.

---

## II. Profile Inventory

### All Profiles (39 total)

| Profile ID | Role | Intent | Runtime Route | Required Tools | Default Command |
|---|---|---|---|---|---|
| advisor_architecture | Reviewer | Validate architecture for agent-native parity and system cohesion | do | read, search, delegate_task | ghostwire:workflows:review |
| advisor_plan | Planner | Provide high-rigor planning and debugging reasoning | do | read, search, delegate_task | ghostwire:workflows:plan |
| advisor_strategy | Strategist | Pre-plan strategy synthesis and hidden requirement extraction | do | read, search, delegate_task | ghostwire:workflows:plan |
| analyzer_design | Designer | Assess implementation against visual design specifications | research | read, delegate_task, look_at | ghostwire:workflows:review |
| analyzer_media | Analyst | Extract and interpret non-code media artifacts | research | read, delegate_task, look_at | ghostwire:workflows:review |
| analyzer_patterns | Architect | Detect system patterns, anti-patterns, and consistency gaps | do | read, search, delegate_task | ghostwire:code:refactor |
| designer_builder | Implementer | Produce high-quality production-ready UX implementation outputs | do | read, delegate_task, edit | ghostwire:docs:test-browser |
| designer_flow | Designer | Model user journeys and interaction edge cases | do | read, search, delegate_task | ghostwire:project:map |
| designer_iterator | Refiner | Iterative UX quality refinement across feedback cycles | do | read, delegate_task, look_at, edit | ghostwire:docs:test-browser |
| designer_sync | Synchronizer | Synchronize implementation and design references | do | read, delegate_task, look_at, edit | ghostwire:docs:test-browser |
| editor_style | Editor | Apply style-guide conformity to written outputs | do | read, edit, delegate_task | ghostwire:docs:release-docs |
| executor | Implementer | Execute implementation tasks with strict verification loops | do | read, edit, bash, delegate_task | ghostwire:workflows:execute |
| expert_migrations | Expert | Validate data migration integrity and rollback safety | do | read, search, delegate_task | ghostwire:workflows:review |
| guardian_data | Guardian | Review database constraints, transactions, and data consistency | do | read, search, delegate_task | ghostwire:workflows:review |
| operator | Coordinator | Coordinate execution flows and task routing | do | read, delegate_task, task | ghostwire:workflows:execute |
| oracle_performance | Specialist | Detect and remediate performance bottlenecks | do | read, search, delegate_task, bash | ghostwire:code:optimize |
| orchestrator | Coordinator | Plan and enforce completion of task graphs | do | read, delegate_task, task | ghostwire:workflows:execute |
| planner | Planner | Produce comprehensive executable plans from user goals | do | read, search, delegate_task | ghostwire:workflows:plan |
| researcher_codebase | Researcher | Search local codebase and extract implementation patterns | research | read, search, delegate_task | ghostwire:project:map |
| researcher_data | Researcher | Fetch external docs, examples, and data-driven references | research | web, read, delegate_task | ghostwire:workflows:plan |
| researcher_docs | Researcher | Collect official documentation and best-practice references | research | web, read, delegate_task | ghostwire:workflows:plan |
| researcher_git | Researcher | Analyze repository history for origin and evolution context | research | read, search, bash, delegate_task | ghostwire:workflows:review |
| researcher_learnings | Researcher | Retrieve prior institutional learnings and known solutions | research | read, search, delegate_task | ghostwire:workflows:learnings |
| researcher_practices | Researcher | Gather industry practices and implementation references | research | web, read, delegate_task | ghostwire:workflows:plan |
| researcher_repo | Researcher | Map repository structure and conventions | research | read, search, delegate_task | ghostwire:project:map |
| resolver_pr | Reviewer | Resolve PR comments and align implementation with review feedback | do | read, edit, delegate_task | ghostwire:workflows:review |
| reviewer_python | Reviewer | Review Python changes for correctness and maintainability | do | read, search, delegate_task | ghostwire:code:review |
| reviewer_races | Reviewer | Detect race conditions and timing hazards | do | read, search, delegate_task | ghostwire:code:review |
| reviewer_rails | Reviewer | Review Rails code for conventions and correctness | do | read, search, delegate_task | ghostwire:code:review |
| reviewer_rails_dh | Reviewer | Review Rails code from DHH perspective (opinionated) | do | read, search, delegate_task | ghostwire:code:review |
| reviewer_security | Reviewer | Review security vulnerabilities and best practices | do | read, search, delegate_task | ghostwire:code:review |
| reviewer_simplicity | Reviewer | Ensure code changes are as simple and minimal as possible | do | read, edit, delegate_task | ghostwire:code:review |
| reviewer_typescript | Reviewer | Review TypeScript changes for correctness and maintainability | do | read, search, delegate_task | ghostwire:code:review |
| validator_audit | Validator | Validate work plans against clarity and completeness standards | do | read, search, delegate_task | ghostwire:workflows:review |
| validator_bugs | Validator | Reproduce and validate reported issues | do | read, search, delegate_task | ghostwire:workflows:review |
| validator_deployment | Validator | Create deployment checklists for risky changes | do | read, search, delegate_task | ghostwire:workflows:plan |
| writer_gem | Writer | Write Ruby gems following community patterns | do | read, edit, bash, delegate_task | ghostwire:code:refactor |
| writer_readme | Writer | Create and update README documentation | do | read, edit, delegate_task | ghostwire:docs:release-docs |

### Profile Categories by Function

**Planning & Strategy** (3): advisor_plan, advisor_strategy, planner  
**Architecture & Design** (7): advisor_architecture, analyzer_design, analyzer_patterns, designer_builder, designer_flow, designer_iterator, designer_sync  
**Research & Analysis** (8): analyzer_media, researcher_codebase, researcher_data, researcher_docs, researcher_git, researcher_learnings, researcher_practices, researcher_repo  
**Code Review & Quality** (9): reviewer_python, reviewer_rails, reviewer_rails_dh, reviewer_security, reviewer_simplicity, reviewer_typescript, reviewer_races, resolver_pr, validator_audit  
**Implementation & Execution** (5): executor, operator, orchestrator, expert_migrations, guardian_data  
**Specialized** (6): editor_style, oracle_performance, validator_bugs, validator_deployment, writer_gem, writer_readme  

### Runtime Route Distribution

- **do**: 24 profiles (61%)
- **research**: 15 profiles (39%)

### Tool Policy Summary

**Most Common Tool Policies**:
- read, search, delegate_task (14 profiles)
- read, delegate_task, edit (4 profiles)
- web, read, delegate_task (4 profiles)

**Highest-Permission Tools**:
- bash: executor, oracle_performance, researcher_git, writer_gem (4 profiles)
- edit: designer_builder, designer_iterator, designer_sync, editor_style, resolver_pr, reviewer_simplicity, writer_gem, writer_readme (8 profiles)
- web: researcher_data, researcher_docs, researcher_practices (3 profiles)

---

## III. Current Loading Paths

### Runtime Path (commands.ts → commands-manifest.ts)

```
src/execution/commands/commands-manifest.ts (generated)
  ↓ consumed by
src/execution/commands/commands.ts (COMMAND_DEFINITIONS proxy)
  ↓ consumed by
src/execution/claude-code-command-loader.ts (runtime)
```

**Key Facts**:
- Manifest is auto-generated from `src/execution/commands/commands/*.ts` files.
- Proxy pattern lazily resolves command definitions on first access.
- Template content is wrapped with `<command-instruction>` tags.

### Profile Path (profiles.ts)

```
src/execution/commands/profiles.ts (COMMAND_PROFILE_REGISTRY)
  ↑ overlays agent prompts from
src/orchestration/agents/prompts/index.ts (AGENT_PROMPTS)
  ↑ aggregates individual profile prompts from
src/orchestration/agents/prompts/<profile-id>.ts (individual prompt files)
```

**Key Facts**:
- Profile registry is static, hand-coded.
- Profile prompts are loaded as immutable text.
- Profile "intent" field duplicates data from AGENTS.md.
- Runtime route ("do" vs "research") is specified per-profile.

### Export Path (export.ts)

```
src/cli/export.ts
  ↓ reads
src/execution/commands/templates/* (direct filesystem)
  ↓ + 
src/execution/commands/profiles.ts (for overlay text)
  ↓ outputs
docs/export/
```

**Key Facts**:
- Export independently reads template files from filesystem.
- No reference to generated manifest; separate loading path.
- Creates divergence risk between runtime and export.

---

## IV. Dependency Graph Summary

### Command → Profile Dependencies

**Single Profile Default** (most commands):
- ghostwire:workflows:plan → planner
- ghostwire:workflows:work → executor
- ghostwire:code:review → reviewer_typescript (but can multi-delegate to 7+ reviewers)
- ghostwire:code:refactor → reviewer_typescript (+ analyzer_patterns)

**Multi-Profile Workflows** (10+ profiles may be invoked per command):
- ghostwire:workflows:plan → Can delegate to: advisor_plan, advisor_strategy, planner, researcher_* (5), validator_*
- ghostwire:code:review → Can delegate to: reviewer_* (9), oracle_performance, validator_bugs
- ghostwire:workflows:work → Can delegate to: executor, operator, orchestrator, + specialized profiles

### Cross-File Dependencies

**Profile → Tool Dependencies**:
- All profiles require: read, search OR read, web
- 8 profiles require: edit (for implementation/documentation)
- 4 profiles require: bash (for execution)
- 30+ profiles require: delegate_task (for sub-task routing)

**Command Templates → Profile Prompts**:
- No direct imports; overlay happens at runtime via profiles.ts
- Implicit coupling: commands mention profile usage in template text

---

## V. P1 Command Set Detail

### ghostwire:workflows:plan

```
ID: ghostwire:workflows:plan
Description: Plan comprehensive solution
Route Hint: do
Default Profile: planner
Accepts Arguments: <request> [--context=file/dir]
Handoff Profile: advisor_strategy, validator_audit
```

### ghostwire:workflows:work

```
ID: ghostwire:workflows:work
Description: Execute workflow and drive work
Route Hint: do
Default Profile: executor
Accepts Arguments: <task> [--scope=full|incremental]
Handoff Profile: orchestrator, guardian_data
```

### ghostwire:workflows:review

```
ID: ghostwire:workflows:review
Description: Review and iterate on work
Route Hint: do
Default Profile: reviewer_typescript
Accepts Arguments: <target> [--type=code|design|plan]
Handoff Profile: reviewer_security, validator_bugs, resolver_pr
```

### ghostwire:code:review

```
ID: ghostwire:code:review
Description: Conduct comprehensive code reviews with specialist agents
Route Hint: (auto)
Default Profile: reviewer_typescript
Accepts Arguments: [file-path or PR-number] [--type=architecture|security|performance]
Handoff Profile: reviewer_rails, reviewer_python, oracle_performance, reviewer_security
```

### ghostwire:code:refactor

```
ID: ghostwire:code:refactor
Description: Systematically refactor code while maintaining functionality
Route Hint: (auto)
Default Profile: reviewer_typescript
Accepts Arguments: <target> [--scope=file|module|project] [--strategy=safe|aggressive]
Handoff Profile: analyzer_patterns, reviewer_simplicity
```

### ghostwire:project:map

```
ID: ghostwire:project:map
Description: Map and visualize project structure
Route Hint: (auto)
Default Profile: researcher_repo
Accepts Arguments: [directory] [--depth=N]
Handoff Profile: researcher_codebase, analyzer_patterns
```

---

## VI. Current Issues Identified

### Issue 1: Dual Loading Paths
- **Evidence**: commands.ts uses commands-manifest (generated), export.ts reads templates (direct)
- **Risk**: Divergence between runtime and export behavior
- **Severity**: Medium
- **Mitigation**: Phase 2 task 2.4 unifies both paths to generated catalog

### Issue 2: Profile Metadata Duplication
- **Evidence**: profile_id appears in profiles.ts AND AGENTS.md, intent duplicated
- **Risk**: Update one source forgets other → inconsistency
- **Severity**: Medium
- **Mitigation**: Phase 1 schema makes profile intent canonical

### Issue 3: Implicit Tool Policy
- **Evidence**: Tool policies hardcoded in profiles.ts, no validation schema
- **Risk**: Typos in tool names don't fail until runtime
- **Severity**: Low-Medium
- **Mitigation**: Phase 1.2 schema + validators enforce tool name correctness

### Issue 4: Template Coupling via Profiles
- **Evidence**: profiles.ts imports AGENT_PROMPTS and overlays on command templates
- **Risk**: Changes to profile text auto-inject into templates, hard to reason about
- **Severity**: Low
- **Mitigation**: Phase 3+ adapters explicitly separate prompt staging

---

## VII. Extraction & Migration Estimate

| Item | Count | Effort | Notes |
|---|---|---|---|
| Convert commands to CommandIntentSpec | 32 | ~16h | Straightforward schema mapping |
| Convert profiles to AgentProfileSpec | 39 | ~20h | Tool policy normalization needed |
| Extract prompt assets | 39 | ~8h | Copy prompts to immutable asset layer |
| Implement generation pipeline | 3 generators | ~24h | Command, agent, execution-plan catalogs |
| Implement adapters (3 harnesses) | 3 adapters | ~40h | Claude, Codex, Copilot |
| Build conformance suite | (P1 set) | ~16h | Command + agent parity fixtures |
| **Total Estimate** | | **~124h** | ~3-4 weeks at 30h/week |

---

## VIII. Success Evidence for Phase 0.1

- [ ] All 32 commands enumerated with descriptions and default profiles
- [ ] All 39 profiles enumerated with intent, route, and tool policies
- [ ] 6 P1 commands identified for conformance testing
- [ ] Current loading paths documented and topology illustrated
- [ ] Dual-path risk acknowledged and mitigation planned
- [ ] Extraction estimate baselined at ~124 labor hours

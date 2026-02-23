---
title: feat: Phase 2 Core Integration - Compound Engineering Components  
type: feat
date: 2026-02-07
---

# feat: Phase 2 Core Integration - Compound Engineering Components

## Overview

Execute Phase 2 of the true merge implementation: integrate all 125+ ghostwire components (28 agents, 24 commands, 73 skills) directly into ghostwire architecture, removing the import/bundle system and establishing unified component management with `grid:` namespace prefix.

This builds on the completed Phase 1 foundation (backup, mapping strategy, directory structure, migration system design) and implements the core integration work.

## Problem Statement

**Current State (Post-Phase 1):**
- ✅ Phase 1 complete: Foundation established, strategy documented, directories created
- ✅ Import/bundle system functional but targeted for removal  
- ✅ Component mapping strategy defined (125+ components catalogued)
- ✅ Configuration migration system designed
- ✅ Test suite foundation established

**Required Change:**
Users want direct access to all ghostwire components without external plugin dependencies. The current import system adds complexity and startup overhead that direct integration would eliminate.

**Business Impact:**
- **User Experience**: Simplified setup, all features immediately available
- **Performance**: Remove import layer overhead, faster startup  
- **Maintenance**: Single codebase instead of plugin system complexity
- **Adoption**: Lower barrier to entry for ghostwire features

## Proposed Solution

### **Core Integration Architecture**

Implement direct component integration using established ghostwire patterns:

1. **Agent Integration**: Convert 28 ghostwire agents to TypeScript agent factories following Seer Advisor/Cipher Operator patterns
2. **Command Integration**: Convert 24 compound commands to builtin command templates following overclock-loop/jack-in-work patterns  
3. **Skill Integration**: Convert 73 compound skills to builtin skill definitions following playwright/git-master patterns
4. **Configuration Migration**: Implement automatic migration from import config to unified config
5. **Import System Removal**: Clean removal of src/features/imports/ and src/features/bundles/

### **Component Organization Strategy**

**Namespace Consistency**: All components use `grid:` prefix
- Agents: `grid:kieran-rails-reviewer`, `grid:dhh-rails-reviewer`
- Commands: `grid:workflows:plan`, `grid:code:refactor`  
- Skills: `grid:frontend-design`, `grid:andrew-kane-gem-writer`

**Directory Structure**: Organized by component type and functional grouping
```typescript
src/agents/compound/{review,research,design,workflow,docs}/
src/features/builtin-commands/compound/{workflows,code,git,project,util,docs}/
src/features/builtin-skills/compound/{development,design,devops,documentation,analysis}/
```

## Technical Approach

### **Architecture**

#### **Agent Factory Implementation Pattern**
Based on `src/agents/seer-advisor.ts` pattern:

```typescript
// Example: src/agents/compound/review/kieran-rails-reviewer.ts
export function createKieranRailsReviewerAgent(model: string): AgentConfig {
  const restrictions = createAgentToolRestrictions([
    "write", "edit", "delegate_task"  
  ])
  
  return {
    description: "Rails code review with Kieran's strict conventions and taste preferences",
    model,
    temperature: 0.1,
    prompt: KIERAN_RAILS_REVIEWER_PROMPT,
    ...restrictions,
  }
}

// Agent metadata for Cipher Operator integration
export const KIERAN_RAILS_REVIEWER_METADATA: AgentPromptMetadata = {
  category: "review",
  cost: "MODERATE",
  promptAlias: "Kieran Rails Reviewer", 
  triggers: [
    { domain: "Rails code changes", trigger: "After implementing features, modifying existing code, creating new Rails components" }
  ],
  useWhen: ["Rails code review", "Convention compliance checking"],
  avoidWhen: ["Non-Rails code", "Initial exploration"],
}
```

#### **Command Template Implementation Pattern**  
Based on `src/features/builtin-commands/commands.ts` pattern:

```typescript
// Example: src/features/builtin-commands/compound/workflows/plan.ts
export const WORKFLOWS_PLAN_TEMPLATE = `You are a master planning agent creating comprehensive implementation plans.

## Planning Process
1. **Analyze Requirements**: Break down the feature request into core components
2. **Research Context**: Examine existing patterns and architectural decisions
3. **Design Approach**: Create structured implementation phases
4. **Identify Dependencies**: Map out prerequisite work and blockers
5. **Define Success Criteria**: Establish measurable completion targets

## Output Format
Create a detailed markdown plan following project conventions with phases, tasks, and acceptance criteria.`

// Register in BUILTIN_COMMAND_DEFINITIONS
"grid:workflows:plan": {
  description: "Create comprehensive implementation plans",
  template: `<command-instruction>
${WORKFLOWS_PLAN_TEMPLATE}  
</command-instruction>

<user-task>
$ARGUMENTS
</user-task>`,
  argumentHint: '"feature description"',
},
```

#### **Skill Definition Implementation Pattern**
Based on `src/features/builtin-skills/skills.ts` pattern:

```typescript
// Example: src/features/builtin-skills/compound/design/frontend-design.ts  
const frontendDesignSkill: BuiltinSkill = {
  name: "grid:frontend-design", 
  description: "This skill should be used when creating distinctive, production-grade frontend interfaces with high design quality",
  template: `# Frontend Design Skill

You are creating frontend interfaces that avoid generic AI aesthetics and deliver polished, production-ready experiences.

## Core Principles
- **Distinctive Design**: Avoid generic AI/template aesthetics
- **Production Quality**: Code that's ready for real users
- **Performance First**: Optimized, accessible, responsive
- **User Experience**: Intuitive, delightful interactions

## Implementation Approach
1. Analyze design requirements and user context
2. Research contemporary design patterns and trends  
3. Create component hierarchy and interaction flows
4. Implement with semantic HTML, modern CSS, and progressive enhancement
5. Test across devices and accessibility requirements

## Deliverables
- Semantic, accessible HTML structure
- Modern CSS with custom properties and logical layouts
- Progressive enhancement with JavaScript
- Responsive design across all device sizes
- Performance optimized (fast loading, smooth interactions)`,
  mcpConfig: undefined
}
```

#### **Registration System Updates**

**Agent Registration** (`src/agents/utils.ts`):
```typescript
const agentSources: Record<BuiltinAgentName, AgentSource> = {
  // ... existing agents
  "grid:kieran-rails-reviewer": createKieranRailsReviewerAgent,
  "grid:kieran-python-reviewer": createKieranPythonReviewerAgent, 
  "grid:dhh-rails-reviewer": createDHHRailsReviewerAgent,
  "grid:framework-docs-researcher": createFrameworkDocsResearcherAgent,
  "grid:figma-design-sync": createFigmaDesignSyncAgent,
  // ... all 28 compound agents
}
```

**Command Registration** (`src/features/builtin-commands/commands.ts`):
```typescript
const COMPOUND_COMMAND_DEFINITIONS: Record<string, Omit<CommandDefinition, "name">> = {
  "grid:workflows:plan": workflowsPlanCommand,
  "grid:workflows:review": workflowsReviewCommand,
  "grid:code:refactor": codeRefactorCommand,
  "grid:git:smart-commit": gitSmartCommitCommand,
  // ... all 24 compound commands
}

// Merge with existing builtin commands
const BUILTIN_COMMAND_DEFINITIONS: Record<BuiltinCommandName, Omit<CommandDefinition, "name">> = {
  // ... existing commands
  ...COMPOUND_COMMAND_DEFINITIONS
}
```

**Skill Registration** (`src/features/builtin-skills/skills.ts`):
```typescript
const compoundSkills: BuiltinSkill[] = [
  frontendDesignSkill,
  figmaDesignSyncSkill, 
  andrewKaneGemWriterSkill,
  everyStyleEditorSkill,
  // ... all 73 compound skills
]

export function createBuiltinSkills(options: CreateBuiltinSkillsOptions = {}): BuiltinSkill[] {
  const coreSkills = [playwrightSkill, frontendUiUxSkill, gitMasterSkill, devBrowserSkill]
  return [...coreSkills, ...compoundSkills]
}
```

### **Configuration Schema Updates**

Update `src/config/schema.ts` to support new components:

```typescript
// Add all compound agents to schema
export const BuiltinAgentNameSchema = z.enum([
  "cipher-operator", "zen-planner", "seer-advisor", "archive-researcher", "scout-recon", "optic-analyst", "tactician-strategist", "glitch-auditor", "nexus-orchestrator",
  // Compound Review Agents
  "grid:kieran-rails-reviewer", "grid:kieran-python-reviewer", "grid:kieran-typescript-reviewer",
  "grid:dhh-rails-reviewer", "grid:code-simplicity-reviewer",
  // Compound Research Agents  
  "grid:framework-docs-researcher", "grid:learnings-researcher", 
  "grid:best-practices-researcher", "grid:git-history-analyzer",
  // ... all 28 compound agents
])

// Add compound commands to schema
export const BuiltinCommandNameSchema = z.enum([
  "init-deep", "jack-in-work",
  // Compound Commands
  "grid:workflows:plan", "grid:workflows:review", "grid:code:refactor",
  // ... all 24 compound commands  
])

// Update unified configuration schema
export const UnifiedCompoundEngineeringConfigSchema = z.object({
  enabled: z.boolean().default(true),
  components: z.object({
    agents: z.boolean().default(true),
    commands: z.boolean().default(true), 
    skills: z.boolean().default(true),
  }),
  namespace: z.string().default("compound"),
  disabled_components: z.array(z.string()).default([]),
  migration_version: z.string().default("1.0.0"),
  migrated_at: z.string().optional(),
}).optional()
```

### **Implementation Phases**

#### **Phase 2A: Agent Integration (Days 1-3)**

**Objective**: Convert and integrate all 28 ghostwire agents

**Tasks:**
- [ ] **Convert Review Agents (5 components)**
  - kieran-rails-reviewer.ts
  - kieran-python-reviewer.ts  
  - kieran-typescript-reviewer.ts
  - dhh-rails-reviewer.ts
  - code-simplicity-reviewer.ts
- [ ] **Convert Research Agents (4 components)**
  - framework-docs-researcher.ts
  - learnings-researcher.ts
  - best-practices-researcher.ts
  - git-history-analyzer.ts
- [ ] **Convert Design Agents (4 components)**
  - figma-design-sync.ts
  - design-implementation-reviewer.ts
  - design-iterator.ts  
  - frontend-design.ts
- [ ] **Convert Workflow Agents (3 components)**
  - spec-flow-analyzer.ts
  - agent-native-architecture.ts
  - deployment-verification-agent.ts  
- [ ] **Convert Documentation Agents (12 components)**
  - ankane-readme-writer.ts through agent-native-audit.ts
- [ ] **Update agent registration in src/agents/utils.ts**
- [ ] **Update schema with all agent names**
- [ ] **Write agent factory tests**

**Success Criteria:**
- All 28 agent factories created and tested
- Agent registration system updated  
- Schema validation passing
- All agents discoverable in Cipher Operator prompt building

#### **Phase 2B: Command Integration (Days 4-5)**

**Objective**: Convert and integrate all 24 ghostwire commands

**Tasks:**
- [ ] **Convert Workflow Commands (4 components)**
  - workflows/plan.ts, create.ts, status.ts, complete.ts
- [ ] **Convert Code Commands (4 components)**  
  - code/refactor.ts, review.ts, optimize.ts, format.ts
- [ ] **Convert Git Commands (4 components)**
  - git/smart-commit.ts, branch.ts, merge.ts, cleanup.ts
- [ ] **Convert Project Commands (4 components)**
  - project/init.ts, build.ts, deploy.ts, test.ts
- [ ] **Convert Utility Commands (4 components)**
  - util/clean.ts, backup.ts, restore.ts, doctor.ts
- [ ] **Convert Documentation Commands (4 components)** 
  - docs/deploy-docs.ts, release-docs.ts, feature-video.ts, test-browser.ts
- [ ] **Update command registration system**
- [ ] **Update schema with all command names**
- [ ] **Write command template tests**

**Success Criteria:**
- All 24 command templates created and tested
- Command registration system updated
- All commands accessible via /grid: prefix
- Template argument parsing working correctly

#### **Phase 2C: Skill Integration (Days 6-8)**  

**Objective**: Convert and integrate all 73 ghostwire skills

**Tasks:**
- [ ] **Convert Development Skills (25 components)**
  - Language/framework specific programming skills
- [ ] **Convert Design Skills (18 components)**
  - frontend-design, figma-design-sync, design-implementation-reviewer, etc.
- [ ] **Convert DevOps Skills (12 components)**
  - Infrastructure, deployment, monitoring skills
- [ ] **Convert Documentation Skills (10 components)**  
  - andrew-kane-gem-writer, ankane-readme-writer, every-style-editor, etc.
- [ ] **Convert Analysis Skills (8 components)**
  - framework-docs-researcher, learnings-researcher, best-practices-researcher, etc.
- [ ] **Update skill registration in createBuiltinSkills()**
- [ ] **Add MCP configurations where applicable**
- [ ] **Write skill integration tests**

**Success Criteria:**
- All 73 skill definitions created and tested
- Skill loading system updated
- Skills discoverable in task delegation
- MCP integrations working properly

#### **Phase 2D: System Integration (Days 9-10)**

**Objective**: Complete system integration and remove import system

**Tasks:**
- [ ] **Implement configuration migration system**
  - detectMigrationNeeded() function
  - migrateConfiguration() function  
  - automatic backup creation
  - rollback support
- [ ] **Update main plugin initialization (src/index.ts)**
  - Remove import system initialization
  - Add compound component loading
  - Add migration trigger
- [ ] **Remove import/bundle system entirely**
  - Delete src/features/imports/ directory
  - Delete src/features/bundles/ directory  
  - Clean up any references in other files
- [ ] **Update configuration loading**
  - Remove import schema sections
  - Add unified compound configuration
  - Update validation logic
- [ ] **Performance optimization**
  - Implement lazy loading for P1/P2/P3 components
  - Add component indexing for fast lookup
  - Optimize memory usage for large component sets

**Success Criteria:**
- Configuration migration working automatically
- Import system completely removed
- Performance impact < 100MB additional memory
- Startup time < 5 seconds with all components enabled

#### **Phase 2E: Testing & Validation (Days 11-12)**

**Objective**: Comprehensive testing of integrated system

**Tasks:**
- [ ] **Unit tests for all components**
  - Agent factory tests (28 test files)
  - Command template tests (24 test files)  
  - Skill definition tests (73 test files)
- [ ] **Integration tests**
  - Component interaction testing
  - Cross-component dependencies
  - Configuration migration testing
- [ ] **Performance tests**
  - Startup time benchmarking  
  - Memory usage profiling
  - Component loading performance
- [ ] **End-to-end workflow tests**
  - Complete user workflows
  - Migration scenarios
  - Error handling and recovery
- [ ] **Regression testing**  
  - Existing functionality preservation
  - No breaking changes to current features

**Success Criteria:**
- All 125+ components have unit tests
- Integration test suite passing
- Performance benchmarks met
- No regressions in existing functionality

## Alternative Approaches Considered

### **Option A: Gradual Migration (Rejected)**
**Approach**: Keep import system, gradually move components to builtin
- **Rejected**: Increased complexity, user confusion, dual maintenance
- **Pros**: Lower risk, easier rollback
- **Cons**: Complex migration path, ongoing maintenance burden

### **Option B: Hybrid System (Rejected)**  
**Approach**: Support both import and builtin components simultaneously
- **Rejected**: Architectural complexity, performance overhead
- **Pros**: Maximum flexibility, easier transition
- **Cons**: Complex codebase, confusing for users

### **Option C: Selected Direct Integration**
**Approach**: Complete migration to builtin components with namespace isolation
- **Selected**: Clean architecture, best performance, clear user experience
- **Pros**: Simplified codebase, optimal performance, easier maintenance
- **Cons**: Higher implementation effort, migration complexity

## Acceptance Criteria

### **Functional Requirements**

- [ ] All 125+ ghostwire components integrated and functional
- [ ] Namespace isolation with `grid:` prefix for all components
- [ ] Automatic configuration migration from import to unified system
- [ ] Component-level disable/enable functionality working
- [ ] Import/bundle system completely removed
- [ ] Existing ghostwire functionality preserved

### **Non-Functional Requirements**

- [ ] Startup time increase < 50% from pre-integration baseline
- [ ] Memory usage increase < 100MB additional overhead  
- [ ] Component loading performance < 2 seconds per component type
- [ ] Migration success rate > 95% in testing scenarios
- [ ] Rollback capability tested and working
- [ ] Zero breaking changes to existing APIs

### **Quality Gates**

- [ ] 95%+ test coverage for all new components
- [ ] All integration tests passing
- [ ] Performance benchmarks met or exceeded
- [ ] Security audit passed for integrated components  
- [ ] Documentation completeness 100%
- [ ] Migration testing across various configurations

## Success Metrics

### **Technical Metrics**
- **Component Integration Success Rate**: 100% (all 125+ components working)
- **Test Coverage**: > 95% for all new code
- **Performance Regression**: < 50% startup time increase
- **Migration Success Rate**: > 95% across test scenarios
- **Memory Usage**: < 100MB additional overhead

### **User Experience Metrics**  
- **Setup Time**: 80% reduction from import-based setup
- **Feature Discovery Time**: < 60 seconds to find relevant component
- **User Satisfaction**: > 4.5/5 in feedback surveys
- **Support Request Volume**: < 10% increase from baseline

### **Quality Metrics**
- **Bug Reports**: < 5 issues per 1000 components in first month
- **Documentation Completeness**: 100% of components documented
- **Code Review Approval**: All changes approved without major revisions

## Dependencies & Prerequisites

### **Completed Prerequisites (Phase 1)**
- ✅ Component mapping strategy documented
- ✅ Configuration migration system designed  
- ✅ Directory structure created
- ✅ Test suite foundation established
- ✅ Backup created with rollback capability

### **External Dependencies**
- **No external dependencies**: All ghostwire components are now integrated
- **Development environment**: Bun, TypeScript, existing ghostwire build system
- **Testing framework**: Existing test infrastructure
- **All patterns**: Consistent with existing ghostwire architecture

### **Technical Prerequisites**
- **Schema build system**: `bun run build:schema` working
- **Test runner**: `bun test` functional
- **Type checking**: `bun run typecheck` passing
- **Development workflow**: Git, CI/CD pipeline operational

## Risk Analysis & Mitigation

### **High Risk Items**

#### **Memory Usage Explosion**
**Risk**: 125+ components significantly increase memory consumption
**Probability**: High (70%)
**Impact**: High (poor user experience, system instability)
**Mitigation**:
- Implement lazy loading for P1/P2/P3 priority components  
- Use component pooling and weak references where possible
- Add memory usage monitoring and alerts
- Establish maximum memory budget (100MB additional)

#### **Startup Performance Degradation**
**Risk**: Component loading significantly slows startup time
**Probability**: Medium (60%)
**Impact**: High (user frustration, abandonment)  
**Mitigation**:
- Implement performance benchmarking before/after
- Use asynchronous component loading where possible
- Optimize component indexing and caching
- Set maximum startup time budget (5 seconds total)

#### **Configuration Migration Failures**
**Risk**: Users lose existing configurations during migration
**Probability**: Medium (40%)  
**Impact**: High (data loss, system unusable)
**Mitigation**:
- Create automatic configuration backups before migration
- Implement comprehensive migration validation
- Provide manual rollback procedures
- Test migration across diverse configuration scenarios

### **Medium Risk Items**

#### **Component Registration Conflicts**
**Risk**: Namespace conflicts or registration failures break system
**Probability**: Medium (50%)
**Impact**: Medium (features broken, confusing errors)
**Mitigation**:
- Implement comprehensive conflict detection
- Use `grid:` namespace isolation consistently  
- Add validation for component name uniqueness
- Provide clear error messages for conflicts

#### **Development Productivity Impact**  
**Risk**: Large codebase becomes harder to maintain and develop
**Probability**: Medium (45%)
**Impact**: Medium (slower development, more bugs)
**Mitigation**:
- Follow established patterns consistently
- Maintain comprehensive test coverage
- Use automated code generation where possible
- Document architectural decisions thoroughly

#### **User Overwhelm from Component Quantity**
**Risk**: 125+ components confuse users, reduce adoption
**Probability**: High (65%)
**Impact**: Medium (poor UX, feature underutilization)  
**Mitigation**:
- Implement component categorization and search
- Create guided discovery workflows
- Provide usage examples and documentation
- Add smart recommendations based on context

### **Low Risk Items**

#### **Test Suite Maintenance Overhead**
**Risk**: 125+ test files become difficult to maintain
**Probability**: Medium (50%)
**Impact**: Low (slower testing, potential tech debt)
**Mitigation**:
- Use consistent testing patterns
- Implement automated test generation
- Regular test suite refactoring
- Clear test organization structure

## Resource Requirements

### **Development Team Requirements**
- **Core Developer**: 1 full-time (12 days Phase 2 execution)
- **Integration Specialist**: 0.5 full-time (days 9-12)
- **QA Engineer**: 0.5 full-time (days 11-12)
- **Technical Writer**: 0.3 full-time (days 10-12)
- **Total Effort**: ~15 person-days

### **Technical Infrastructure**
- **Development Environment**: Existing setup sufficient
- **Testing Resources**: Additional memory/CPU for comprehensive testing
- **CI/CD Capacity**: Extended build times for larger test suite
- **No new infrastructure**: All work within existing systems

### **Time Requirements**
- **Total Duration**: 12 working days (2.5 weeks)
- **Critical Path**: Phase 2A → 2B → 2C → 2D  
- **Parallel Work**: Documentation can start during Phase 2C
- **Buffer Time**: 2 days included for unexpected issues

## Future Considerations

### **Extensibility**

#### **Component Update Delivery**
- Framework for component versioning and updates
- Automated synchronization with ghostwire source
- Conflict resolution for component changes
- User notification of available updates

#### **Additional Integration Sources**
- Pattern established for integrating other plugin ecosystems
- Namespace system supports multiple sources (e.g., `other:component`)
- Automated conversion tools for common plugin formats
- Plugin marketplace integration potential

### **Scalability**

#### **Performance Optimization**  
- Advanced lazy loading with predictive preloading
- Component usage analytics for optimization  
- Automatic performance regression detection
- Resource pooling for memory efficiency

#### **Developer Experience**
- Code generation tools for new component integration
- Automated testing scaffold generation
- Documentation generation from component metadata
- Integration quality metrics and monitoring

### **Maintenance Strategy**

#### **Component Lifecycle Management**
- Deprecation pathway for obsolete components
- Breaking change management across component versions
- Migration tools for component API changes  
- Community contribution integration process

## Documentation Plan

### **Technical Documentation**

#### **Architecture Decision Records (ADRs)**
- [ ] **ADR-004**: Direct integration vs import system architecture
- [ ] **ADR-005**: Component namespace strategy and conflict resolution  
- [ ] **ADR-006**: Configuration migration approach and rollback strategy
- [ ] **ADR-007**: Performance optimization strategy for large component sets

#### **Implementation Documentation**  
- [ ] **Component Integration Guide**: Step-by-step process for adding new components
- [ ] **Testing Strategy Guide**: Patterns and requirements for component testing
- [ ] **Performance Monitoring Guide**: Benchmarking and optimization procedures  
- [ ] **Migration Troubleshooting Guide**: Common issues and resolution steps

#### **API Documentation**
- [ ] **Component Factory API**: Agent, command, and skill factory patterns
- [ ] **Configuration Schema API**: Updated schema documentation with examples
- [ ] **Registration System API**: How components are discovered and loaded
- [ ] **Migration System API**: Configuration migration functions and rollback

### **User Documentation**

#### **User Guides**
- [ ] **Component Discovery Guide**: How to find and use 125+ integrated components
- [ ] **Configuration Management**: How to enable/disable components and optimize performance
- [ ] **Migration Guide**: What to expect during the import-to-unified transition
- [ ] **Troubleshooting Guide**: Common issues and solutions post-integration

#### **Component Reference**
- [ ] **Agent Reference**: Complete catalog of all 28 integrated agents with usage examples
- [ ] **Command Reference**: Documentation for all 24 integrated commands with syntax
- [ ] **Skill Reference**: Guide to all 73 integrated skills with use cases
- [ ] **Quick Reference Card**: Searchable index of all components by category and use case

## References & Research

### **Internal References**

- **Phase 1 Foundation**: docs/plans/2026-02-06-feat-true-merge-ghostwire-plan.md  
- **Component Mapping**: docs/plans/2026-02-06-component-mapping-strategy.md
- **Configuration Migration**: docs/plans/2026-02-06-configuration-migration-system.md
- **Agent Patterns**: src/agents/seer-advisor.ts:1, src/agents/cipher-operator.ts:1
- **Command Patterns**: src/features/builtin-commands/commands.ts:9  
- **Skill Patterns**: src/features/builtin-skills/skills.ts:4
- **Schema Management**: src/config/schema.ts:19
- **Test Patterns**: src/agents/glitch-auditor.test.ts:1

### **External References**

- **Integrated Components**: src/agents/compound/, src/features/builtin-commands/, src/features/builtin-skills/
- **Oh-my-opencode Architecture**: README.md, AGENTS.md, agents.yml
- **TypeScript Factory Patterns**: [TypeScript Handbook - Modules](https://www.typescriptlang.org/docs/handbook/modules.html)
- **Zod Schema Validation**: [Zod Documentation](https://zod.dev/)

### **Related Work**

- **Pre-merge Backup**: Git tag `pre-merge-v1.0` with complete import system
- **Directory Structure**: Created compound component directories
- **Test Foundation**: tests/compound/foundation.test.ts with baseline tests
- **Performance Baseline**: Established current system performance metrics

### **Component Inventory Reference**

#### **Agents (28 total by category)**
- **Review (5)**: kieran-rails-reviewer, kieran-python-reviewer, kieran-typescript-reviewer, dhh-rails-reviewer, code-simplicity-reviewer
- **Research (4)**: framework-docs-researcher, learnings-researcher, best-practices-researcher, git-history-analyzer  
- **Design (4)**: figma-design-sync, design-implementation-reviewer, design-iterator, frontend-design
- **Workflow (3)**: spec-flow-analyzer, agent-native-architecture, deployment-verification-agent
- **Documentation (12)**: ankane-readme-writer, every-style-editor, andrew-kane-gem-writer, brainstorming, creating-agent-skills, skill-creator, compound-docs, file-todos, agent-browser, rclone, git-worktree, agent-native-audit

#### **Commands (24 total by category)**
- **Workflows (4)**: workflows:plan, workflows:review, workflows:status, workflows:complete
- **Code (4)**: code:refactor, code:review, code:optimize, code:format
- **Git (4)**: git:smart-commit, git:branch, git:merge, git:cleanup
- **Project (4)**: project:init, project:build, project:deploy, project:test
- **Utility (4)**: util:clean, util:backup, util:restore, util:doctor  
- **Documentation (4)**: deploy-docs, release-docs, feature-video, test-browser

#### **Skills (73 total by category)**
- **Development (25)**: Language/framework specific programming skills
- **Design (18)**: frontend-design, figma-design-sync, design-implementation-reviewer, design-iterator, etc.
- **DevOps (12)**: Infrastructure, deployment, monitoring skills
- **Documentation (10)**: andrew-kane-gem-writer, ankane-readme-writer, every-style-editor, compound-docs, skill-creator, etc.
- **Analysis (8)**: framework-docs-researcher, learnings-researcher, best-practices-researcher, git-history-analyzer, etc.

## Implementation Checklist

### **Pre-Implementation Setup**
- [ ] Verify Phase 1 completion (backup, directories, planning)
- [ ] Confirm ghostwire source access
- [ ] Establish performance baseline measurements
- [ ] Prepare development environment for large-scale changes

### **Phase 2A: Agent Integration**
- [ ] Create all 28 agent factory TypeScript files
- [ ] Implement agent metadata for Cipher Operator integration
- [ ] Update src/agents/utils.ts registration
- [ ] Update configuration schema with agent names
- [ ] Write comprehensive agent factory tests
- [ ] Verify agent discovery and loading

### **Phase 2B: Command Integration**  
- [ ] Create all 24 command template TypeScript files
- [ ] Update src/features/builtin-commands/commands.ts registration
- [ ] Update configuration schema with command names
- [ ] Write comprehensive command template tests
- [ ] Verify command execution and argument parsing

### **Phase 2C: Skill Integration**
- [ ] Create all 73 skill definition TypeScript files
- [ ] Update src/features/builtin-skills/skills.ts registration
- [ ] Add MCP configurations where applicable  
- [ ] Write comprehensive skill integration tests
- [ ] Verify skill loading and task delegation

### **Phase 2D: System Integration**
- [ ] Implement configuration migration functions
- [ ] Update main plugin initialization (src/index.ts)
- [ ] Remove src/features/imports/ and src/features/bundles/
- [ ] Update configuration schema (remove imports, add unified)
- [ ] Implement performance optimizations (lazy loading)

### **Phase 2E: Testing & Validation**
- [ ] Execute all unit tests (125+ component tests)
- [ ] Run integration test suite
- [ ] Perform performance benchmarking
- [ ] Execute end-to-end workflow tests
- [ ] Validate migration scenarios and rollback capability

### **Final Verification**
- [ ] All acceptance criteria met
- [ ] Performance targets achieved
- [ ] Documentation complete
- [ ] No breaking changes to existing functionality
- [ ] Ready for production deployment

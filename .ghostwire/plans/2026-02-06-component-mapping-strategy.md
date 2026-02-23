# Component Mapping Strategy - True Merge

## Overview

This document defines the mapping strategy for integrating 125+ ghostwire components into ghostwire architecture.

## Component Analysis

### Current Compound-Engineering Inventory

#### **Agents (28 total)**
```yaml
Review Agents (5):
  - kieran-rails-reviewer
  - kieran-python-reviewer  
  - kieran-typescript-reviewer
  - dhh-rails-reviewer
  - code-simplicity-reviewer

Research Agents (4):
  - framework-docs-researcher
  - learnings-researcher
  - best-practices-researcher
  - git-history-analyzer

Design Agents (4):
  - figma-design-sync
  - design-implementation-reviewer
  - design-iterator
  - frontend-design

Workflow Agents (3):
  - spec-flow-analyzer
  - agent-native-architecture
  - deployment-verification-agent

Documentation Agents (12):
  - ankane-readme-writer
  - every-style-editor
  - andrew-kane-gem-writer
  - brainstorming
  - creating-agent-skills
  - skill-creator
  - compound-docs
  - file-todos
  - agent-browser
  - rclone
  - git-worktree
  - agent-native-audit
```

#### **Commands (24 total)**
```yaml
Workflow Commands (4):
  - workflows:plan
  - workflows:create
  - workflows:status  
  - workflows:complete

Code Commands (4):
  - code:refactor
  - code:review
  - code:optimize
  - code:format

Git Commands (4):
  - git:smart-commit
  - git:branch
  - git:merge
  - git:cleanup

Project Commands (4):
  - project:init
  - project:build
  - project:deploy
  - project:test

Utility Commands (4):
  - util:clean
  - util:backup
  - util:restore
  - util:doctor

Documentation Commands (4):
  - deploy-docs
  - release-docs
  - feature-video
  - test-browser
```

#### **Skills (73 total)**
```yaml
Development Skills (25):
  # Language/Framework specific programming skills

Design Skills (18):
  - frontend-design
  - figma-design-sync
  - design-implementation-reviewer
  - design-iterator

DevOps Skills (12):
  # Infrastructure, deployment, monitoring

Documentation Skills (10):
  - andrew-kane-gem-writer
  - ankane-readme-writer
  - every-style-editor
  - compound-docs
  - skill-creator

Analysis Skills (8):
  - framework-docs-researcher
  - learnings-researcher
  - best-practices-researcher
  - git-history-analyzer
```

## Integration Mapping Strategy

### **1. Namespace Strategy**

**Primary Namespace**: `grid:` prefix for all merged components

**Rationale**: 
- Clear identification of ghostwire origin
- Prevents naming conflicts with existing ghostwire components
- Maintains traceability for debugging and documentation
- Allows selective enabling/disabling by namespace

**Examples**:
- `grid:kieran-rails-reviewer`
- `grid:workflows:plan`
- `grid:frontend-design`

### **2. Directory Structure Mapping**

#### **Agents Integration**
```
src/agents/compound/
├── review/                    # 5 review agents
│   ├── kieran-rails-reviewer.ts
│   ├── kieran-python-reviewer.ts
│   ├── kieran-typescript-reviewer.ts
│   ├── dhh-rails-reviewer.ts
│   └── code-simplicity-reviewer.ts
├── research/                  # 4 research agents
│   ├── framework-docs-researcher.ts
│   ├── learnings-researcher.ts
│   ├── best-practices-researcher.ts
│   └── git-history-analyzer.ts
├── design/                    # 4 design agents
│   ├── figma-design-sync.ts
│   ├── design-implementation-reviewer.ts
│   ├── design-iterator.ts
│   └── frontend-design.ts
├── workflow/                  # 3 workflow agents
│   ├── spec-flow-analyzer.ts
│   ├── agent-native-architecture.ts
│   └── deployment-verification-agent.ts
└── docs/                       # 12 docs agents
    ├── ankane-readme-writer.ts
    ├── every-style-editor.ts
    ├── andrew-kane-gem-writer.ts
    ├── brainstorming.ts
    ├── creating-agent-skills.ts
    ├── skill-creator.ts
    ├── compound-docs.ts
    ├── file-todos.ts
    ├── agent-browser.ts
    ├── rclone.ts
    ├── git-worktree.ts
    └── agent-native-audit.ts
```

#### **Commands Integration**
```
src/features/builtin-commands/compound/
├── workflows/                   # 4 workflow commands
│   ├── plan.ts
│   ├── create.ts
│   ├── status.ts
│   └── complete.ts
├── code/                        # 4 code commands
│   ├── refactor.ts
│   ├── review.ts
│   ├── optimize.ts
│   └── format.ts
├── git/                         # 4 git commands
│   ├── smart-commit.ts
│   ├── branch.ts
│   ├── merge.ts
│   └── cleanup.ts
├── project/                     # 4 project commands
│   ├── init.ts
│   ├── build.ts
│   ├── deploy.ts
│   └── test.ts
├── util/                        # 4 utility commands
│   ├── clean.ts
│   ├── backup.ts
│   ├── restore.ts
│   └── doctor.ts
└── docs/                        # 4 documentation commands
    ├── deploy-docs.ts
    ├── release-docs.ts
    ├── feature-video.ts
    └── test-browser.ts
```

#### **Skills Integration**
```
src/features/builtin-skills/compound/
├── development/                 # 25 development skills
├── design/                      # 18 design skills
│   ├── frontend-design.ts
│   ├── figma-design-sync.ts
│   ├── design-implementation-reviewer.ts
│   └── design-iterator.ts
├── devops/                      # 12 devops skills
├── documentation/                # 10 documentation skills
│   ├── andrew-kane-gem-writer.ts
│   ├── ankane-readme-writer.ts
│   ├── every-style-editor.ts
│   ├── compound-docs.ts
│   └── skill-creator.ts
└── analysis/                    # 8 analysis skills
    ├── framework-docs-researcher.ts
    ├── learnings-researcher.ts
    ├── best-practices-researcher.ts
    └── git-history-analyzer.ts
```

### **3. Conflict Analysis**

#### **Potential Naming Conflicts**
```typescript
// Existing ghostwire agents
const existingAgents = [
  'cipher-operator', 'seer-advisor', 'archive-researcher', 'scout-recon', 'zen-planner'
];

// Compound agents (no conflicts - all have descriptive names)
const compoundAgents = [
  'kieran-rails-reviewer', 'kieran-python-reviewer', 'framework-docs-researcher'
  // ... all unique names
];

// Resolution: Use grid: prefix
const finalAgentNames = compoundAgents.map(name => `grid:${name}`);
```

#### **Command Conflicts**
```typescript
// Potential conflicts with existing commands
const existingCommands = [
  'ulw', 'overclock-loop', 'refactor', 'init-deep', 'jack-in-work'
];

// Compound commands (potential conflicts)
const conflicts = [
  'refactor', 'init', 'test', 'review'
];

// Resolution: grid: prefix maintains uniqueness
const compoundCommands = [
  'grid:workflows:plan',
  'grid:code:refactor', 
  'grid:project:test'
];
```

#### **Skill Conflicts**
```typescript
// Minimal skill name conflicts expected
// Most compound skills have unique, descriptive names
const compoundSkills = [
  'frontend-design', 'figma-design-sync', 'andrew-kane-gem-writer'
  // ... all unique
];

// Resolution: grid: prefix for consistency
const finalSkillNames = compoundSkills.map(name => `grid:${name}`);
```

### **4. Integration Patterns**

#### **Agent Factory Pattern**
```typescript
// Example: kieran-rails-reviewer.ts
export function createKieranRailsReviewerAgent(): AgentConfig {
  return {
    name: "grid:kieran-rails-reviewer",
    model: "anthropic/claude-opus-4-5",
    temperature: 0.1,
    description: "Rails code review with Kieran's strict conventions",
    prompt: `You are Kieran, conducting Rails code review...`,
    toolRestrictions: createAgentToolRestrictions(['lsp', 'ast_grep', 'delegate_task'])
  };
}
```

#### **Command Template Pattern**
```typescript
// Example: workflows:plan.ts
export const workflowsPlanCommand: Omit<CommandDefinition, "name"> = {
  name: "grid:workflows:plan",
  description: "Create implementation plans",
  template: `<command-instruction>
You are a master planning agent. Create comprehensive implementation plans.
${TEMPLATE}
</command-instruction>`,
  argumentHint: "[feature description]",
};
```

#### **Skill Definition Pattern**
```typescript
// Example: frontend-design.ts
export const frontendDesignSkill: BuiltinSkill = {
  name: "grid:frontend-design",
  description: "This skill should be used when creating distinctive, production-grade frontend interfaces",
  template: `# Frontend Design Skill

You are creating frontend interfaces that avoid generic AI aesthetics...
`,
  mcpConfig: undefined
};
```

## **5. Migration Strategy**

### **Configuration Migration**
```typescript
// Before: Import configuration
interface ImportConfig {
  compound_engineering: {
    enabled: boolean;
    path: string;
    namespace: string;
  }
}

// After: Unified configuration  
interface CompoundConfig {
  enabled: boolean;
  components: {
    agents: boolean;
    commands: boolean;
    skills: boolean;
  };
  disabled_components: string[];
  namespace: string; // Default: "compound"
}

// Migration function
export function migrateConfig(oldConfig: ImportConfig): CompoundConfig {
  return {
    enabled: oldConfig.compound_engineering?.enabled ?? true,
    components: {
      agents: true,
      commands: true,
      skills: true,
    },
    disabled_components: [],
    namespace: "compound"
  };
}
```

### **Registration Updates**
```typescript
// src/agents/utils.ts - Update agent sources
export const agentSources: Record<BuiltinAgentName, AgentSource> = {
  // ... existing agents
  "grid:kieran-rails-reviewer": createKieranRailsReviewerAgent,
  "grid:dhh-rails-reviewer": createDHHRailsReviewerAgent,
  // ... all 26 compound agents
};

// src/features/builtin-commands/commands.ts
export const COMPOUND_COMMAND_DEFINITIONS: Record<string, Omit<CommandDefinition, "name">> = {
  "grid:workflows:plan": workflowsPlanCommand,
  "grid:code:refactor": codeRefactorCommand,
  // ... all 22 compound commands
};

// src/features/builtin-skills/skills.ts
const compoundSkills: BuiltinSkill[] = [
  frontendDesignSkill,
  figmaDesignSyncSkill,
  // ... all 71 compound skills
];
```

## **Implementation Priority**

### **Phase 1 Execution Order**
1. **Directory Structure Creation** (Day 1)
2. **Agent Integration** (Days 1-2) - 28 components
3. **Command Integration** (Days 2-3) - 24 components  
4. **Skill Integration** (Days 3-4) - 73 components
5. **Registration System Updates** (Day 4)
6. **Configuration Migration System** (Day 5)

### **Critical Success Factors**
- **Namespace Consistency**: All components use `grid:` prefix
- **Performance Impact**: < 100MB additional memory overhead
- **Startup Time**: < 5 seconds with all components enabled
- **Conflict Resolution**: Zero naming conflicts after namespacing
- **Backward Compatibility**: Existing configurations auto-migrate

## **Next Steps**

1. Create directory structure for compound components
2. Begin agent integration (28 components)
3. Implement command templates (24 components)
4. Convert skill definitions (73 components)
5. Update all registration systems
6. Implement configuration migration
7. Comprehensive testing

This mapping strategy provides a clear, systematic approach to integrating all 125+ ghostwire components while maintaining system stability and performance.

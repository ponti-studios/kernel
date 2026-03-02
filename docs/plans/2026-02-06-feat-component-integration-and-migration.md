---
title: Component Integration & Configuration Migration
type: feat
date: '2026-02-06'
status: completed
version: 1.0.0
created: '2026-02-06'
---

# Unified Plugin Architecture: Component Mapping & Configuration Migration

## Executive Summary

This consolidated plan covers two complementary initiatives for integrating 125+ ghostwire components into the unified architecture:

1. **Component Mapping Strategy** - Define integration approach, namespace strategy, and directory structure for all 125+ components (28 agents, 24 commands, 73 skills)
2. **Configuration Migration System** - Implement automatic migration from import-based to unified configuration with rollback support

Together, these plans establish a cohesive strategy for bringing external components into the core system while maintaining backward compatibility and data integrity.

---

## Table of Contents

- [Part 1: Component Mapping Strategy](#part-1-component-mapping-strategy)
- [Part 2: Configuration Migration System](#part-2-configuration-migration-system)
- [Implementation Priority](#implementation-priority)
- [Success Criteria](#success-criteria)

---

## Part 1: Component Mapping Strategy

### Overview

This document defines the mapping strategy for integrating 125+ ghostwire components into ghostwire architecture.

### Component Analysis

#### **Agents (28 total)**

```yaml
Review Agents (5):
  - kieran-rails-reviewer
  - kieran-python-reviewer
  - kieran-typescript-reviewer
  - rails-reviewer
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

### Integration Mapping Strategy

#### **1. Namespace Strategy**

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

#### **2. Directory Structure Mapping**

##### **Agents Integration**

```
src/agents/compound/
├── review/                    # 5 review agents
│   ├── kieran-rails-reviewer.ts
│   ├── kieran-python-reviewer.ts
│   ├── kieran-typescript-reviewer.ts
│   ├── rails-reviewer.ts
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

##### **Commands Integration**

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

##### **Skills Integration**

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

#### **3. Conflict Analysis**

##### **Potential Naming Conflicts**

```typescript
// Existing ghostwire agents
const existingAgents = [
  "cipher-operator",
  "seer-advisor",
  "archive-researcher",
  "scout-recon",
  "zen-planner",
];

// Compound agents (no conflicts - all have descriptive names)
const compoundAgents = [
  "kieran-rails-reviewer",
  "kieran-python-reviewer",
  "framework-docs-researcher",
  // ... all unique names
];

// Resolution: Use grid: prefix
const finalAgentNames = compoundAgents.map((name) => `grid:${name}`);
```

##### **Command Conflicts**

```typescript
// Potential conflicts with existing commands
const existingCommands = ["ulw", "overclock-loop", "refactor", "init-deep", "jack-in-work"];

// Compound commands (potential conflicts)
const conflicts = ["refactor", "init", "test", "review"];

// Resolution: grid: prefix maintains uniqueness
const compoundCommands = ["grid:workflows:plan", "grid:code:refactor", "grid:project:test"];
```

##### **Skill Conflicts**

```typescript
// Minimal skill name conflicts expected
// Most compound skills have unique, descriptive names
const compoundSkills = [
  "frontend-design",
  "figma-design-sync",
  "andrew-kane-gem-writer",
  // ... all unique
];

// Resolution: grid: prefix for consistency
const finalSkillNames = compoundSkills.map((name) => `grid:${name}`);
```

#### **4. Integration Patterns**

##### **Agent Factory Pattern**

```typescript
// Example: kieran-rails-reviewer.ts
export function createKieranRailsReviewerAgent(): AgentConfig {
  return {
    name: "grid:kieran-rails-reviewer",
    model: "anthropic/claude-opus-4-5",
    temperature: 0.1,
    description: "Rails code review with Kieran's strict conventions",
    prompt: `You are Kieran, conducting Rails code review...`,
    toolRestrictions: createAgentToolRestrictions(["lsp", "ast_grep", "delegate_task"]),
  };
}
```

##### **Command Template Pattern**

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

##### **Skill Definition Pattern**

```typescript
// Example: frontend-design.ts
export const frontendDesignSkill: BuiltinSkill = {
  name: "grid:frontend-design",
  description:
    "This skill should be used when creating distinctive, production-grade frontend interfaces",
  template: `# Frontend Design Skill

You are creating frontend interfaces that avoid generic AI aesthetics...
`,
  mcpConfig: undefined,
};
```

#### **5. Migration Strategy**

##### **Configuration Migration**

```typescript
// Before: Import configuration
interface ImportConfig {
  compound_engineering: {
    enabled: boolean;
    path: string;
    namespace: string;
  };
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
    namespace: "compound",
  };
}
```

##### **Registration Updates**

```typescript
// src/agents/utils.ts - Update agent sources
export const agentSources: Record<BuiltinAgentName, AgentSource> = {
  // ... existing agents
  "grid:kieran-rails-reviewer": createKieranRailsReviewerAgent,
  "grid:rails-reviewer": createDHHRailsReviewerAgent,
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

### Implementation Priority

#### **Phase 1 Execution Order**

1. **Directory Structure Creation** (Day 1)
2. **Agent Integration** (Days 1-2) - 28 components
3. **Command Integration** (Days 2-3) - 24 components
4. **Skill Integration** (Days 3-4) - 73 components
5. **Registration System Updates** (Day 4)
6. **Configuration Migration System** (Day 5)

### Critical Success Factors

- **Namespace Consistency**: All components use `grid:` prefix
- **Performance Impact**: < 100MB additional memory overhead
- **Startup Time**: < 5 seconds with all components enabled
- **Conflict Resolution**: Zero naming conflicts after namespacing
- **Backward Compatibility**: Existing configurations auto-migrate

---

## Part 2: Configuration Migration System

### Overview

Design automatic migration system for transitioning from import-based configuration to unified ghostwire configuration.

### Configuration Schema Evolution

#### **Phase 1: Import System Configuration** (Current)

```typescript
interface ImportConfiguration {
  imports: {
    claude: {
      enabled: boolean;
      path?: string;
      plugin_name?: string;
    };
  };
  features: {
    compound_engineering: {
      enabled: boolean;
      source: "local";
      path?: string;
      plugin_name?: string;
    };
  };
}
```

#### **Phase 2: Unified Configuration** (Target)

```typescript
interface UnifiedConfiguration {
  features: {
    compound_engineering: {
      enabled: boolean;
      components: {
        agents: boolean;
        commands: boolean;
        skills: boolean;
      };
      namespace: string; // Default: "compound"
      disabled_components: string[];
      migration_version: string; // Track migration status
    };
  };
  // Remove imports section entirely
}
```

### Migration Logic

#### **Automatic Detection**

```typescript
export function detectMigrationNeeded(config: any): MigrationStatus {
  const hasOldImportConfig =
    config.imports?.claude?.enabled || config.features?.compound_engineering?.path;

  const hasNewUnifiedConfig = config.features?.compound_engineering?.components !== undefined;

  if (hasOldImportConfig && !hasNewUnifiedConfig) {
    return {
      required: true,
      from: "import",
      to: "unified",
      version: "1.0.0",
    };
  }

  return { required: false };
}
```

#### **Migration Function**

```typescript
export function migrateConfiguration(oldConfig: ImportConfiguration): UnifiedConfiguration {
  const compoundConfig = oldConfig.features?.compound_engineering;

  return {
    features: {
      compound_engineering: {
        enabled: compoundConfig?.enabled ?? true,
        components: {
          agents: true,
          commands: true,
          skills: true,
        },
        namespace: "compound",
        disabled_components: extractDisabledComponents(oldConfig),
        migration_version: "1.0.0",
        migrated_at: new Date().toISOString(),
      },
    },
  };
}

function extractDisabledComponents(oldConfig: ImportConfiguration): string[] {
  // Extract any component-specific disable settings from old config
  const disabled = [];

  // From old import config
  if (oldConfig.features?.compound_engineering?.enabled === false) {
    disabled.push("*"); // All components disabled
  }

  return disabled;
}
```

#### **Configuration Validation**

```typescript
export const UnifiedConfigSchema = z
  .object({
    features: z.object({
      compound_engineering: z
        .object({
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
        })
        .optional(),
    }),
  })
  .transform(detectAndMigrateConfiguration);
```

### Migration Implementation

#### **Transformer Function**

```typescript
export function detectAndMigrateConfiguration(config: any): UnifiedConfiguration {
  const migrationStatus = detectMigrationNeeded(config);

  if (migrationStatus.required) {
    console.log(
      `Migrating configuration from ${migrationStatus.from} to ${migrationStatus.to} v${migrationStatus.version}`,
    );

    // Create backup of old config
    const backupPath = path.join(os.homedir(), ".opencode", `config-backup-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(config, null, 2));

    // Perform migration
    return migrateConfiguration(config);
  }

  // Already migrated or no migration needed
  return UnifiedConfigurationSchema.parse(config);
}
```

#### **Rollback Support**

```typescript
export function rollbackConfiguration(configPath: string): boolean {
  // Find most recent backup
  const backupDir = path.join(os.homedir(), ".opencode");
  const backups = fs
    .readdirSync(backupDir)
    .filter((f) => f.startsWith("config-backup-"))
    .sort()
    .reverse();

  if (backups.length === 0) {
    return false; // No backup available
  }

  const latestBackup = path.join(backupDir, backups[0]);
  const backupContent = fs.readFileSync(latestBackup, "utf-8");

  // Restore backup
  fs.writeFileSync(configPath, backupContent);

  // Clean up backup files
  backups.forEach((backup) => {
    if (backup !== backups[0]) {
      fs.unlinkSync(path.join(backupDir, backup));
    }
  });

  return true;
}
```

### User Experience

#### **Migration Notification**

```typescript
export function showMigrationNotification(config: UnifiedConfiguration): void {
  const compoundConfig = config.features?.compound_engineering;

  if (compoundConfig?.migrated_at) {
    const migratedDate = new Date(compoundConfig.migrated_at);
    const timeSince = Date.now() - migratedDate.getTime();
    const daysAgo = Math.floor(timeSince / (1000 * 60 * 60 * 24));

    if (daysAgo === 0) {
      console.log("✅ Configuration migrated to unified ghostwire system today");
      console.log(`📦 ${getComponentCount(compoundConfig)} components now available directly`);
      console.log(`🔧 Use 'grid:' prefix to access ghostwire features`);
    }
  }
}

function getComponentCount(compoundConfig: any): string {
  const enabled = compoundConfig?.components;
  const count =
    (enabled?.agents ? 28 : 0) + (enabled?.commands ? 24 : 0) + (enabled?.skills ? 73 : 0);
  return count.toString();
}
```

#### **Configuration Examples**

##### **Before Migration** (External Compound Plugin)

```json
{
  "agents": {
    "kieran-rails-reviewer": {
      "model": "anthropic/claude-opus-4-5"
    }
  },
  "// Note": "External plugin was separately loaded and configured"
}
```

##### **After Migration** (Unified System)

```json
{
  "features": {
    "compound_engineering": {
      "enabled": true,
      "components": {
        "agents": true,
        "commands": true,
        "skills": true
      },
      "namespace": "compound",
      "disabled_components": ["grid:kieran-rails-reviewer"],
      "migration_version": "1.0.0",
      "migrated_at": "2026-02-06T15:30:00.000Z"
    }
  }
}
```

### Testing Strategy

#### **Migration Tests**

```typescript
describe("Configuration Migration", () => {
  test("migrates old import config to unified config", () => {
    const oldConfig = {
      imports: { claude: { enabled: true, path: "/test/path" } },
      features: { compound_engineering: { enabled: true } },
    };

    const newConfig = migrateConfiguration(oldConfig);

    expect(newConfig.features?.compound_engineering?.components?.agents).toBe(true);
    expect(newConfig.features?.compound_engineering?.namespace).toBe("compound");
    expect(newConfig.features?.compound_engineering?.migration_version).toBe("1.0.0");
  });

  test("handles disabled components", () => {
    const oldConfig = {
      features: { compound_engineering: { enabled: false } },
    };

    const newConfig = migrateConfiguration(oldConfig);

    expect(newConfig.features?.compound_engineering?.disabled_components).toContain("*");
  });

  test("creates backup file", () => {
    const oldConfig = {
      /* test config */
    };

    migrateConfiguration(oldConfig);

    // Verify backup file was created
    const backupDir = path.join(os.homedir(), ".opencode");
    const backups = fs.readdirSync(backupDir).filter((f) => f.startsWith("config-backup-"));
    expect(backups.length).toBeGreaterThan(0);
  });
});
```

### Documentation Updates

#### **Configuration Guide Updates**

- Remove import system documentation sections
- Add unified ghostwire configuration examples
- Document migration process and rollback procedures
- Update troubleshooting section for new configuration format

#### **API Documentation Updates**

- Document new configuration schema
- Update component registration API documentation
- Add migration function documentation

### Deployment Considerations

#### **Gradual Rollout**

1. **Phase 1**: Deploy migration system without removing import system
2. **Phase 2**: Monitor migration success rates
3. **Phase 3**: Remove import system after 95% migration rate

#### **Error Handling**

- Graceful fallback if migration fails
- Clear error messages with resolution steps
- Automatic rollback on critical errors

#### **Performance Impact**

- Migration runs once at startup
- Minimal overhead after migration
- Configuration caching for fast access

---

## Implementation Priority

### **Combined Execution Order**

**Phase 1 (Foundation)** - Days 1-2
- Namespace strategy finalized
- Directory structure created
- Configuration schema defined and validated

**Phase 2 (Component Integration)** - Days 2-4
- Agent integration (28 components)
- Command integration (24 components)
- Skill integration (73 components)

**Phase 3 (Migration System)** - Day 4-5
- Migration detection and functions
- Rollback support
- Configuration transformation

**Phase 4 (Registration)** - Day 5-6
- Update all registration systems
- Agent sources mapping
- Command definitions mapping
- Skill definitions mapping

**Phase 5 (Testing & Validation)** - Days 6-7
- Unit tests for migration logic
- Integration tests for all components
- Performance testing
- Backward compatibility verification

### Critical Success Factors

- **Namespace Consistency**: All components use `grid:` prefix
- **Migration Reliability**: Automatic detection, backup, and rollback capabilities
- **Performance**: < 100MB overhead, < 5 seconds startup
- **Conflict Resolution**: Zero naming conflicts
- **Backward Compatibility**: Smooth migration path for existing users

---

## Success Criteria

✅ **All 125+ components integrated**:
- 28 agents with `grid:` prefix
- 24 commands with `grid:` prefix
- 73 skills with `grid:` prefix

✅ **Configuration migration system operational**:
- Automatic detection of old import configs
- Transparent migration to unified configuration
- Rollback capability with backup preservation

✅ **Zero naming conflicts** after namespacing strategy applied

✅ **Backward compatibility maintained** with old command/skill names

✅ **Performance targets met**:
- < 100MB additional memory overhead
- < 5 seconds startup time with all components enabled

✅ **All tests passing**:
- Unit tests for migration logic
- Integration tests for component registration
- Performance tests for resource usage

✅ **Documentation complete**:
- Component mapping documented
- Migration process documented
- Configuration examples provided

---

## Next Steps

1. Create directory structure for compound components
2. Begin agent integration (28 components)
3. Implement command templates (24 components)
4. Convert skill definitions (73 components)
5. Update all registration systems
6. Implement configuration migration system
7. Comprehensive testing
8. Documentation delivery

This unified plan provides a clear, systematic approach to integrating all 125+ components while implementing a robust migration system for existing users.

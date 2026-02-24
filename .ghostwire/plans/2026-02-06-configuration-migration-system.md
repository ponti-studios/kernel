# Configuration Migration System Design

**Status**: ✅ COMPLETED (Historical plan from Feb 2026)
**Created**: 2026-02-06

## Overview

Design automatic migration system for transitioning from import-based configuration to unified ghostwire configuration.

## Configuration Schema Evolution

### **Phase 1: Import System Configuration** (Current)
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

### **Phase 2: Unified Configuration** (Target)
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

## Migration Logic

### **Automatic Detection**
```typescript
export function detectMigrationNeeded(config: any): MigrationStatus {
  const hasOldImportConfig = config.imports?.claude?.enabled || 
                          config.features?.compound_engineering?.path;
  
  const hasNewUnifiedConfig = config.features?.compound_engineering?.components !== undefined;
  
  if (hasOldImportConfig && !hasNewUnifiedConfig) {
    return {
      required: true,
      from: "import",
      to: "unified",
      version: "1.0.0"
    };
  }
  
  return { required: false };
}
```

### **Migration Function**
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
      }
    }
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

### **Configuration Validation**
```typescript
export const UnifiedConfigSchema = z.object({
  features: z.object({
    compound_engineering: z.object({
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
    }).optional(),
  }),
}).transform(detectAndMigrateConfiguration);
```

## Migration Implementation

### **Transformer Function**
```typescript
export function detectAndMigrateConfiguration(config: any): UnifiedConfiguration {
  const migrationStatus = detectMigrationNeeded(config);
  
  if (migrationStatus.required) {
    console.log(`Migrating configuration from ${migrationStatus.from} to ${migrationStatus.to} v${migrationStatus.version}`);
    
    // Create backup of old config
    const backupPath = path.join(os.homedir(), '.opencode', `config-backup-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(config, null, 2));
    
    // Perform migration
    return migrateConfiguration(config);
  }
  
  // Already migrated or no migration needed
  return UnifiedConfigurationSchema.parse(config);
}
```

### **Rollback Support**
```typescript
export function rollbackConfiguration(configPath: string): boolean {
  // Find most recent backup
  const backupDir = path.join(os.homedir(), '.opencode');
  const backups = fs.readdirSync(backupDir)
    .filter(f => f.startsWith('config-backup-'))
    .sort()
    .reverse();
  
  if (backups.length === 0) {
    return false; // No backup available
  }
  
  const latestBackup = path.join(backupDir, backups[0]);
  const backupContent = fs.readFileSync(latestBackup, 'utf-8');
  
  // Restore backup
  fs.writeFileSync(configPath, backupContent);
  
  // Clean up backup files
  backups.forEach(backup => {
    if (backup !== backups[0]) {
      fs.unlinkSync(path.join(backupDir, backup));
    }
  });
  
  return true;
}
```

## User Experience

### **Migration Notification**
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
  const count = (enabled?.agents ? 28 : 0) + 
                (enabled?.commands ? 24 : 0) + 
                (enabled?.skills ? 73 : 0);
  return count.toString();
}
```

### **Configuration Examples**

#### **Before Migration** (External Compound Plugin)
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

#### **After Migration** (Unified System)
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

## Testing Strategy

### **Migration Tests**
```typescript
describe('Configuration Migration', () => {
  test('migrates old import config to unified config', () => {
    const oldConfig = {
      imports: { claude: { enabled: true, path: "/test/path" } },
      features: { compound_engineering: { enabled: true } }
    };
    
    const newConfig = migrateConfiguration(oldConfig);
    
    expect(newConfig.features?.compound_engineering?.components?.agents).toBe(true);
    expect(newConfig.features?.compound_engineering?.namespace).toBe("compound");
    expect(newConfig.features?.compound_engineering?.migration_version).toBe("1.0.0");
  });
  
  test('handles disabled components', () => {
    const oldConfig = {
      features: { compound_engineering: { enabled: false } }
    };
    
    const newConfig = migrateConfiguration(oldConfig);
    
    expect(newConfig.features?.compound_engineering?.disabled_components).toContain("*");
  });
  
  test('creates backup file', () => {
    const oldConfig = { /* test config */ };
    
    migrateConfiguration(oldConfig);
    
    // Verify backup file was created
    const backupDir = path.join(os.homedir(), '.opencode');
    const backups = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('config-backup-'));
    expect(backups.length).toBeGreaterThan(0);
  });
});
```

## Documentation Updates

### **Configuration Guide Updates**
- Remove import system documentation sections
- Add unified ghostwire configuration examples
- Document migration process and rollback procedures
- Update troubleshooting section for new configuration format

### **API Documentation Updates**
- Document new configuration schema
- Update component registration API documentation
- Add migration function documentation

## Deployment Considerations

### **Gradual Rollout**
1. **Phase 1**: Deploy migration system without removing import system
2. **Phase 2**: Monitor migration success rates
3. **Phase 3**: Remove import system after 95% migration rate

### **Error Handling**
- Graceful fallback if migration fails
- Clear error messages with resolution steps
- Automatic rollback on critical errors

### **Performance Impact**
- Migration runs once at startup
- Minimal overhead after migration
- Configuration caching for fast access

This migration system ensures smooth transition from import-based to unified configuration while maintaining data integrity and providing rollback capabilities.
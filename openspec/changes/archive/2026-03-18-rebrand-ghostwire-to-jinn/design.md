## Context

Rebranding ghostwire to jinn requires updates across the entire codebase.

## Scope

### Package Changes
```
package.json:
  name: @hackefeller/jinn
  version: 0.0.1
  bin: jinn
```

### CLI Changes
```
src/cli/main.ts:
  - name: jinn
  - commands: jinn init, jinn update, jinn config, jinn detect
```

### Config Path Changes
- `.ghostwire/config.yaml` → `.jinn/config.yaml`

### Template Changes
- Command prefix: `/ghostwire:` → `/jinn:`
- Skill names: `ghostwire-*` → `jinn-*`
- Generated file names updated

## Risks / Trade-offs

- [Risk] Breaking change for existing users - but we haven't released yet
- [Risk] Test updates needed - verify all commands work
- [Risk] Documentation needs updating - minimal impact

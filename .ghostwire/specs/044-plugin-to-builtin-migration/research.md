# Research: Plugin to Builtin Migration

## Decision: Migrate plugin components to builtin directories

### Rationale

1. **Single source of truth**: Having commands and skills in two locations creates confusion about which takes precedence
2. **Consistent with existing pattern**: 5 skills and 14 command templates already in builtin directories
3. **Removes namespace overhead**: Plugin commands require `ghostwire:` prefix; builtin commands are directly accessible

### Alternatives Considered

**Option A: Keep plugin system as-is**
- Rejected: Maintains dual system, ongoing confusion

**Option B: Reverse migration (builtin → plugin)**
- Rejected: Would require significant refactoring of command loader

**Option C: Hybrid (migrate to builtin)**
- Selected: Aligns with existing pattern, removes namespace, simplifies loading

## Command Loading Architecture

### Current State

| Location | Loader | Namespace | Format |
|----------|--------|-----------|--------|
| `src/plugin/commands/*.md` | `claude-code-plugin-loader` | `ghostwire:` | Markdown |
| `src/execution/features/builtin-commands/templates/*.ts` | Direct import | None | TypeScript |

### Migration Impact

- Commands currently loaded via plugin system will now be built-in
- Remove `ghostwire:` prefix requirement
- Register directly in `commands.ts` instead of dynamic loading

## Skill Loading Architecture

### Current State

| Location | Loader | Format |
|----------|--------|--------|
| `src/plugin/skills/*/SKILL.md` | `claude-code-plugin-loader` | Markdown |
| `src/execution/features/builtin-skills/*/SKILL.md` | Direct import | Markdown |

### Migration Impact

- Skills loaded via skill loader from builtin directory
- Update import paths in `skills.ts`
- Assets (images, templates) move with skill

## Testing Strategy

- Run full test suite (594 tests) before and after
- Verify command templates load correctly
- Verify skills appear in skill list
- Check no orphaned references to old paths

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Breaking command execution | Test each command after migration |
| Skill loader path changes | Verify loader finds skills at new location |
| Namespace conflicts | Ensure no name collisions with existing commands |

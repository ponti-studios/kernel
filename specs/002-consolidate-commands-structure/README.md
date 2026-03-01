# Spec: Consolidate Commands, Prompts, Templates & Migrate Profiles

**Date**: 2026-02-28  
**Branch**: `002-consolidate-commands-structure`  
**Status**: Complete - Ready for Implementation

## Overview

This specification defines the consolidation of the mixed-purpose `src/execution/commands/` directory and migration of profile-specific prompts to `src/orchestration/agents/prompts/`.

**Problem**: Commands directory has multiple purposes (commands, prompts, templates, profiles), creating confusion about what belongs where.

**Solution**: Consolidate into clean structure with `src/execution/commands/` containing only `templates/` and `prompts/`, and migrate profile prompts to `src/orchestration/agents/prompts/`.

## Artifacts

### 📋 Core Documents

| Document | Size | Purpose |
|----------|------|---------|
| **spec.md** | 7.1 KB | Feature specification with user scenarios and acceptance criteria |
| **plan.md** | 15 KB | Implementation plan with phases, timeline, and risk assessment |
| **research.md** | 12 KB | Research findings on current structure and dependencies |
| **data-model.md** | 14 KB | Entity definitions, relationships, and validation rules |
| **quickstart.md** | 7.6 KB | Developer guide with common tasks and troubleshooting |
| **tasks.md** | 16 KB | 32 detailed implementation tasks with dependencies |

### 📄 Contracts

| Document | Size | Purpose |
|----------|------|---------|
| **contracts/command-structure-contract.yaml** | 7.7 KB | Directory structure, exports, imports, and verification contracts |

## Key Findings

### Import Updates Required
- **Files affected**: 6
- **References to update**: 13
- **Symbol rename**: `PROFILE_PROMPTS` → `AGENT_PROMPTS`

### Directory Changes
- **Create**: `src/orchestration/agents/prompts/`
- **Delete**: `src/execution/commands/profiles/`
- **Result**: Clean structure with only `templates/` and `prompts/`

### Build Scripts
- **Export pipeline**: No changes needed (doesn't reference old paths)
- **Manifest generation**: May need review for agent prompt loading
- **Template copy**: No changes needed

## Success Criteria

✅ **10 Success Criteria Defined**:

1. Directory structure is clean (only `templates/` and `prompts/`)
2. No `src/execution/commands/profiles/` directory exists
3. All profile prompts in `src/orchestration/agents/prompts/`
4. Zero old import paths (`grep -r "profiles/prompts" src/` = 0)
5. All symbols renamed to `AGENT_PROMPTS`
6. Test suite passes (100% success rate)
7. Export pipeline generates correct output
8. Manifest generation succeeds
9. Documentation updated to reflect new structure
10. No TypeScript errors or lint violations

## Implementation Timeline

| Phase | Tasks | Effort | Status |
|-------|-------|--------|--------|
| Phase 0: Research | 4 | 1 hour | ✅ Complete |
| Phase 1: Design | 3 | 1.5 hours | ✅ Complete |
| Phase 2: Implementation | 11 | 2 hours | ⏳ Ready |
| Phase 3: Build Scripts | 3 | 40 min | ⏳ Ready |
| Phase 4: Documentation | 4 | 50 min | ⏳ Ready |
| Phase 5: Verification | 7 | 1 hr 15 min | ⏳ Ready |
| **Total** | **32** | **~7 hours** | ✅ Planned |

## Verification Checklist

**Pre-Implementation**:
- [ ] Review all specification documents
- [ ] Confirm acceptance of plan
- [ ] Create feature branch

**Post-Implementation**:
- [ ] Directory structure is clean
- [ ] No old import paths remain
- [ ] All symbols renamed correctly
- [ ] TypeScript compilation passes
- [ ] Test suite passes (100%)
- [ ] Export pipeline works correctly
- [ ] Manifest generation succeeds
- [ ] Documentation updated
- [ ] No outstanding issues

## How to Use This Spec

### For Developers

1. **Understand the change**: Read `spec.md` for user scenarios and acceptance criteria
2. **Learn the plan**: Read `plan.md` for implementation approach
3. **Get started**: Read `quickstart.md` for common tasks
4. **Execute tasks**: Follow `tasks.md` for step-by-step implementation

### For Reviewers

1. **Verify requirements**: Check `spec.md` for acceptance criteria
2. **Review design**: Check `data-model.md` and `contracts/` for design decisions
3. **Validate implementation**: Use verification checklist in `tasks.md`
4. **Confirm success**: Verify all success criteria are met

### For Maintainers

1. **Understand structure**: Read `data-model.md` for entity relationships
2. **Know the contracts**: Review `contracts/command-structure-contract.yaml`
3. **Troubleshoot issues**: Check `quickstart.md` for troubleshooting guide
4. **Update documentation**: Follow `tasks.md` Phase 4 for documentation updates

## Related Documentation

- **Repository**: `/Users/charlesponti/Developer/ghostwire`
- **Branch**: `002-consolidate-commands-structure`
- **Related Spec**: `001-simplify-agent-framework`
- **Export Docs**: `docs/export.md`
- **Agent Docs**: `AGENTS.md`
- **TypeScript Conventions**: `.github/instructions/typescript.instructions.md`
- **Test Conventions**: `.github/instructions/tests.instructions.md`

## Next Steps

1. ✅ **Specification Complete** - All documents created and reviewed
2. ⏳ **Create Feature Branch** - `git checkout -b 002-consolidate-commands-structure`
3. ⏳ **Execute Phase 0** - Run research tasks to verify findings
4. ⏳ **Execute Phase 2** - Implement directory migration and import updates
5. ⏳ **Execute Phase 3** - Verify build scripts work correctly
6. ⏳ **Execute Phase 4** - Update documentation
7. ⏳ **Execute Phase 5** - Run verification checklist
8. ⏳ **Create Pull Request** - Submit for review

## Questions?

Refer to the appropriate document:

- **"What are we building?"** → `spec.md`
- **"How will we build it?"** → `plan.md`
- **"What did we learn?"** → `research.md`
- **"What are the entities?"** → `data-model.md`
- **"How do I do X?"** → `quickstart.md`
- **"What are the tasks?"** → `tasks.md`
- **"What are the contracts?"** → `contracts/command-structure-contract.yaml`

---

**Created**: 2026-02-28  
**Status**: Ready for Implementation  
**Effort**: ~7 hours  
**Risk Level**: Medium (broad refactor, well-defined changes)

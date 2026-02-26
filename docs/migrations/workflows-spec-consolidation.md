# Workflows/Spec Lifecycle Consolidation

Date: 2026-02-26

## Change

The canonical lifecycle is now:

1. `/ghostwire:workflows:plan`
2. `/ghostwire:workflows:create`
3. `/ghostwire:workflows:work`

`ghostwire:spec:*` aliases have been removed.

## Alias Mapping

All legacy `ghostwire:spec:*` commands are invalid. Use canonical `ghostwire:workflows:*` commands directly.

## Artifact Model

Canonical artifact root: `.ghostwire/plans/`

Optional per-plan detail directory:

- `.ghostwire/plans/<plan-id>/spec.md`
- `.ghostwire/plans/<plan-id>/research.md`
- `.ghostwire/plans/<plan-id>/data-model.md`
- `.ghostwire/plans/<plan-id>/contracts/`
- `.ghostwire/plans/<plan-id>/quickstart.md`
- `.ghostwire/plans/<plan-id>/tasks.md`
- `.ghostwire/plans/<plan-id>/analysis.md`
- `.ghostwire/plans/<plan-id>/checklists/`

Legacy compatibility adapter behavior:

- If a legacy path under `.ghostwire/specs/<branch>/` is provided, the system attempts to resolve an existing canonical plan in `.ghostwire/plans/` containing `<branch>` in the filename.
- If no canonical candidate exists, the original legacy path is preserved.

## Compatibility Window

- Alias window is closed.
- This change is intentionally breaking for `ghostwire:spec:*` command invocations.

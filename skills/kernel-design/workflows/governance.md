# UI Governance Workflow

Use this workflow for changes to shared UI tokens, components, variants,
public props, themes, or design-system behavior.

## 1. Classify the Change

| Level | Use when | Examples |
| --- | --- | --- |
| Major | Existing consumers must change | Remove or rename a token, prop, variant, or component; change default anatomy or semantic meaning |
| Minor | Existing consumers continue to work | Add a token, component, variant, optional prop, or supported state |
| Patch | Behavior or documentation is corrected within the contract | Fix contrast, keyboard behavior, visual bug, token value, or documentation |

If a change both adds a feature and breaks an existing contract, classify it as
major. Record the decision before implementation.

## 2. Check Ownership and Need

For a new shared component or token:

1. Identify at least two real consuming surfaces or repeated use cases.
2. Confirm the behavior belongs in `@ponti-studios/ui`, not an app or feature
   package.
3. Check existing primitives, tokens, variants, and comparable components.
4. Prefer extension of an existing primitive over a parallel abstraction.
5. Define the public API, supported states, accessibility behavior, token
   mappings, and migration impact before coding.

Do not promote a one-off product need into shared UI without evidence.

## 3. Apply the Quality Contract

Every shared component must:

- Use exported semantic tokens and shared primitives.
- Preserve the underlying accessible primitive's props and escape hatches.
- Cover base, hover, pressed, focus-visible, disabled, selected/open, loading,
  and error or validation states where relevant.
- Preserve keyboard behavior, focus visibility, target size, and contrast.
- Keep state changes from altering geometry unless the behavior requires it.
- Respect reduced motion and avoid unnecessary runtime dependencies.
- Include tests, stories, or equivalent usage evidence for public behavior.

## 4. Deprecate Safely

For a removal or replacement:

1. Record the reason and replacement.
2. Mark the old API deprecated with the planned removal version.
3. Keep the old API working for at least one minor release cycle unless the
   change is a security or correctness emergency.
4. Add a migration table mapping every old token, prop, or component to its
   replacement.
5. Update examples and consumers.
6. Remove it only in the planned major release.

Do not silently rename or remove public UI APIs.

## 5. Record and Verify

Record:

- SemVer level and rationale.
- Public API and token changes.
- Consumers checked.
- Changelog entry or release-note location.
- Deprecation and migration details, when applicable.
- Validation commands and results.

Verify token resolution, contrast when colors changed, component states,
keyboard behavior, reduced motion, and generated artifacts. If the consuming
project provides validators, run them and confirm generated output is current.

## Output

Return the change classification, ownership and usage evidence, API/token
impact, migration plan, verification results, and release communication.

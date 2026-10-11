# Figma Integration Workflow

Use this workflow when synchronizing design tokens, components, or screens
between Figma and code.

## 1. Establish Authority

Record:

- Token source of truth: code or Figma.
- Figma file, page, and node IDs in scope.
- Code package and token/component paths in scope.
- Synchronization tool: Tokens Studio, Figma Variables API, Figma MCP, or a
  repository script.
- Whether the change is token-only, component-only, or both.

Choose exactly one authoritative direction:

- **Code to Figma:** code tokens and components are authoritative; Figma is a
  published representation.
- **Figma to code:** Figma Variables and component properties are authoritative;
  code is generated or extracted from them.

Never hand-edit both sides for the same value.

## 2. Map the Token Model

Map the shared token hierarchy to Figma collections:

| Token tier | Figma collection | Rule |
| --- | --- | --- |
| Primitive | `Primitives` | Raw values; not consumed directly by components |
| Semantic | `Semantic` | Roles such as text, surface, border, action, and feedback |
| Component | `Component` | Component-specific aliases and states |

Map light, dark, brand, and density variants to Figma Modes. Preserve aliases;
do not flatten semantic tokens into copied literals.

Every UI value must resolve to an exported token from `@ponti-studios/ui` or to
a project token that is explicitly mapped to it. Do not introduce orphan hex,
font, spacing, radius, shadow, or motion values in Figma.

## 3. Sync Tokens

1. Export or read the authoritative token source.
2. Resolve aliases and compare names, types, values, modes, and descriptions.
3. Apply only the selected sync direction.
4. Record additions, removals, renames, and changed values.
5. Check that generated output contains no manual edits.
6. Re-run the project token validator after import or generation.

If Figma MCP is available, use its design-system and Variable tools for the
selected direction. If it is unavailable, use the project's documented API or
Tokens Studio workflow. Do not claim parity without inspecting both sides.

## 4. Check Component Parity

For each component in scope, compare:

- Component name and code path.
- Variant and size properties.
- Default values.
- Base, disabled, hover, pressed, focus-visible, selected, loading, and error
  states.
- Keyboard and semantic behavior represented by the code component.
- Code Connect mapping, when Code Connect is used.

Figma visual variants do not replace code accessibility behavior. Flag any
state or property that cannot be represented consistently.

## 5. Verify

The workflow is complete only when:

- Every Figma Variable resolves to a token in the configured source.
- The chosen sync direction is recorded and the generated side has no hand edits.
- Figma and code names, values, modes, and aliases match for the scoped set.
- Component variants cover the required states and sizes.
- Code Connect points to the intended component path, when applicable.
- Contrast, focus, keyboard, reduced-motion, and semantic-state checks pass.

## Output

Return the authority decision, token crosswalk, component parity table, changed
nodes/files, verification evidence, and unresolved mismatches.

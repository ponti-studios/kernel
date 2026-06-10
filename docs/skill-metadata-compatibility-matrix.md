# Skill Metadata Compatibility Matrix

This matrix covers the metadata keys currently used in `src/templates/skills/*/SKILL.md`.

## Legend

- `✓` supported directly in that provider’s skill metadata
- `~` supported only via a provider-specific equivalent or sidecar file
- `✗` not supported as shared skill metadata and should not stay in common frontmatter

Copilot support here refers to the repo’s current Copilot skill adapter conventions; treat lifecycle fields as provider-specific rather than portable.

## Matrix

| Key | Current templates | Claude | Codex | Copilot | Portable? | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| `name` | present in every template | ✓ | ✓ | ✓ | yes | Keep in shared frontmatter. |
| `description` | present in every template | ✓ | ✓ | ✓ | yes | Keep in shared frontmatter. |
| `kind` | present | ✗ | ✗ | ✗ | no | Remove from `SKILL.md`; this is internal catalog metadata. |
| `tags` | present | ✗ | ✗ | ✗ | no | Remove from `SKILL.md`; keep tags in catalog/index metadata instead. |
| `profile` | present | ✗ | ✗ | ✗ | no | Remove from `SKILL.md`; this is a distribution selector, not skill metadata. |
| `license` | present | ✗ | ✗ | ✓ | no | Keep only if you need Copilot-specific metadata; otherwise move to body/reference docs. |
| `compatibility` | present | ✗ | ✗ | ✓ | no | Keep only if you need Copilot-specific metadata; otherwise move to body/reference docs. |
| `metadata` | present | ✗ | ✗ | ✓ | no | Keep only for Copilot-specific metadata; do not treat as portable frontmatter. |
| `when` | present | ✗ (`when_to_use` instead) | ✗ | ✓ | no | Rename for Claude as `when_to_use`; otherwise move trigger guidance into `description` or body text. |
| `applicability` | present | ✗ | ✗ | ✓ | no | Keep only for Copilot-specific lifecycle guidance. |
| `termination` | present | ✗ | ✗ | ✓ | no | Keep only for Copilot-specific lifecycle guidance. |
| `outputs` | present | ✗ | ✗ | ✓ | no | Keep only for Copilot-specific lifecycle guidance. |
| `dependencies` | present | ✗ | ✗ | ✓ | no | Keep only for Copilot-specific lifecycle guidance. |
| `disableModelInvocation` | present in some templates | ✓ | ~ (`policy.allow_implicit_invocation = false` in `agents/openai.yaml`) | ✓ | partial | Keep, but render per provider. |
| `userInvocable` | present in some templates | ✓ | ✗ | ✓ | partial | Keep only if you need Claude/Copilot menu visibility controls. |
| `argumentHint` | present in some templates | ✓ | ✗ | ✓ | partial | Keep only if you need Claude/Copilot argument hints. |
| `allowedTools` | present in some templates | ✓ | ~ (`dependencies.tools` in `agents/openai.yaml`) | ✓ | partial | Keep only if you need provider-specific tool allowlists. |

## Pruning rule

If a field is marked `✗` for every provider, it should not remain in shared skill frontmatter.

For the current templates, the fields that are clearly not portable to any provider are:

- `kind`
- `tags`
- `profile`

Everything else is either provider-specific or has a provider-specific equivalent.

## Practical split

- **Shared across all providers:** `name`, `description`
- **Provider-mapped controls:** `disableModelInvocation`, `userInvocable`, `argumentHint`, `allowedTools`
- **Copilot-only descriptive lifecycle metadata:** `license`, `compatibility`, `metadata`, `when`, `applicability`, `termination`, `outputs`, `dependencies`
- **Remove from skill frontmatter:** `kind`, `tags`, `profile`


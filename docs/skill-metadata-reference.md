# Supported Skill Metadata by Provider

This page documents the metadata we can safely use when emitting skill files for Claude Code, OpenAI Codex, and GitHub Copilot.

## Claude Code

Claude Code skill files use YAML frontmatter in `SKILL.md`.

| Metadata | Description | Notes |
| --- | --- | --- |
| `name` | Display label for the skill. | Optional; defaults to the directory name for skills under `.claude/skills/`. |
| `description` | What the skill does and when Claude should use it. | Recommended; drives automatic skill selection. |
| `when_to_use` | Extra trigger context for automatic selection. | Appended to `description` in the skill listing. |
| `argument-hint` | Hint shown when the user invokes the skill with arguments. | Useful for slash-command style workflows. |
| `arguments` | Named positional arguments for `$name` substitution in the skill body. | Accepts a space-separated string or a YAML list. |
| `disable-model-invocation` | Prevents Claude from auto-invoking the skill. | Use for side-effecting workflows that should only run manually. |
| `user-invocable` | Controls whether the skill appears in the user menu. | `false` hides it from the `/` menu. |
| `allowed-tools` | Tools Claude can use without per-use approval while the skill is active. | Does not remove other tools; it only pre-approves the listed ones. |
| `disallowed-tools` | Tools removed from Claude’s available pool while the skill is active. | Useful for restricting autonomous workflows. |
| `model` | Model override while the skill is active. | Resumes the session model after the current turn. |
| `effort` | Effort level while the skill is active. | Overrides the session effort level. |
| `context` | Execution context for the skill. | Use `fork` to run in an isolated subagent. |
| `agent` | Subagent type to use when `context: fork` is set. | Built-in or custom agent name. |
| `hooks` | Lifecycle hooks scoped to the skill. | Useful for deterministic behavior enforcement. |
| `paths` | Glob patterns that limit when the skill auto-loads. | Matches the same path-specific rule format used by Claude. |
| `shell` | Shell used for `!` command execution in the skill body. | `bash` by default; `powershell` on supported Windows setups. |

## OpenAI Codex

Codex skill files use `SKILL.md` too, but the frontmatter surface is intentionally small.

### `SKILL.md` frontmatter

| Metadata | Description | Notes |
| --- | --- | --- |
| `name` | Display name for the skill. | Required by Codex. |
| `description` | What the skill does and when Codex should use it. | Required by Codex. |

### Optional `agents/openai.yaml`

Use `agents/openai.yaml` when you need Codex-specific UI or policy metadata.

| Metadata | Description | Notes |
| --- | --- | --- |
| `interface.display_name` | User-facing label for the skill or agent. | Optional. |
| `interface.short_description` | Short summary shown in the Codex UI. | Optional. |
| `interface.icon_small` | Path to a small icon asset. | Optional. |
| `interface.icon_large` | Path to a large icon asset. | Optional. |
| `interface.brand_color` | Accent color used in the UI. | Optional. |
| `interface.default_prompt` | Default surrounding prompt or scaffold. | Optional. |
| `policy.allow_implicit_invocation` | Controls whether Codex can auto-invoke the skill. | Set to `false` for manual-only skills. |
| `dependencies.tools` | Declares tool dependencies for the skill. | Use this when the skill relies on specific tools or MCP servers. |

## GitHub Copilot

The current Copilot skill templates in this repo use a richer YAML frontmatter shape.
This table reflects the repo’s current Copilot skill adapter conventions; individual Copilot surfaces can differ, so treat the lifecycle fields as informational.

| Metadata | Description | Notes |
| --- | --- | --- |
| `name` | Display name for the skill. | Usually matches the skill directory name. |
| `description` | What the skill does and when it should be used. | Primary trigger text for automatic selection. |
| `license` | License string for the skill. | Descriptive metadata. |
| `compatibility` | Compatibility notes for the skill. | Describes which environments or toolchains the skill fits. |
| `metadata` | Free-form nested metadata block. | The repo uses it for author, version, category, and tags. |
| `disable-model-invocation` | Prevents automatic invocation. | Manual-only skills should set this to `true`. |
| `user-invocable` | Controls whether the skill is visible to users. | `false` hides it from direct selection. |
| `argument-hint` | Hint shown when the skill expects arguments. | Useful for skill autocomplete and invocation hints. |
| `allowed-tools` | Tools the skill may use without prompting. | Rendered as a YAML list or inline list. |
| `when` | Trigger conditions or usage cues. | Informational lifecycle metadata in this repo’s adapter. |
| `applicability` | Conditions under which the skill applies. | Informational lifecycle metadata. |
| `termination` | Signals that indicate the skill is done. | Informational lifecycle metadata. |
| `outputs` | Expected artifacts or results from the skill. | Informational lifecycle metadata. |
| `dependencies` | Other skills or resources the skill depends on. | Informational lifecycle metadata. |

## Fields to avoid in shared skill frontmatter

These fields are internal to the catalog/template system and should not stay in common provider output:

- `kind`
- `tags`
- `profile`

If you need those values, keep them in the catalog layer or document them in the skill body instead.

## Reference sources

- Claude Code skills: https://code.claude.com/docs/en/skills
- OpenAI Codex skills: https://developers.openai.com/codex/skills
- GitHub Copilot custom agents: https://docs.github.com/en/copilot/reference/custom-agents-configuration

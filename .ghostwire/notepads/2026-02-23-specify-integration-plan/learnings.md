
## 2026-02-23 03:04:57 -0800

- Root cause: `createConfigHandler()` always generated Ghostwire builtin agents and merged them into OpenCode `config.agent`, which makes Ghostwire agents appear in the *global* OpenCode config layer (because `config` composition runs for global config too).
- Fix: Gate builtin-agent injection behind explicit project-level configuration presence (`.opencode/opencode.json{,c}` or `.opencode/ghostwire.json{,c}`), so global config composition does not get Ghostwire agents by default.
- Related: When builtin agents are not injected, `config.permission.delegate_task` is no longer forced to `deny` (avoids breaking plugin-provided agents that rely on default permission behavior).

## 2026-02-23 08:06:54 -0800

- Revert: Removed project-level gating so Ghostwire builtin agents are injected into OpenCode config unconditionally (including global config composition).
- Permission behavior: `config.permission.delegate_task` is again forced to `deny` by default; operator/planner explicitly allow `delegate_task` via their per-agent permissions.

## 2026-02-23 08:15:32 -0800

- Implemented configurable toggle: `inject_agents_globally` (boolean, optional, default: true).
- When `inject_agents_globally: false` in ghostwire.json, builtin agents are NOT injected into OpenCode config (neither global nor project).
- When `inject_agents_globally: true` (or not set), builtin agents are injected globally (original behavior).
- Operator enablement now depends on both `shouldInjectAgents` AND `pluginConfig.operator?.disabled !== true`.
- Permission behavior: `delegate_task: "deny"` is only set when `shouldInjectAgents` is true.
- Tests updated: added test for `inject_agents_globally: false` case.

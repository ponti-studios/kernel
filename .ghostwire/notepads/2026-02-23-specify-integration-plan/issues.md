
## 2026-02-23 03:04:57 -0800

- Potential behavior change: Projects without `.opencode/opencode.json{,c}` *and* without `.opencode/ghostwire.json{,c}` will no longer receive Ghostwire builtin agents via config composition.
  - If users rely on global-only OpenCode config + Ghostwire, we may need an explicit opt-in (e.g., a config flag) to allow global agent injection without reintroducing the leak.

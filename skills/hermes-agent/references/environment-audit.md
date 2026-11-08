# Read-Only Environment Audit

Use when auditing OpenCode and Hermes runtime configuration without changing anything. All commands below are read-only; report exact values, never print API keys, tokens, or `.env` values.

## OpenCode

1. Version: `opencode --version`
2. Config files (in order of precedence): `~/.config/opencode/opencode.json`, `~/.config/opencode/opencode.jsonc`, plus `cli.json` and `service.json`. Resolve the effective config with `opencode debug config`.
3. Output caps: search the JSON files for `limit.output`, `maxOutputTokens`, or `max_tokens`. If none are present, report "none configured" rather than assuming a default.
4. Switchyard worker sessions: provider and model come from `fleet/config.json` (`worker.model`) and the `WORKER_MODEL` constant in `backend/lib/config.ts` (e.g. `opencode-go` / `deepseek-v4.1-flash`).
5. Billing posture: `opencode auth list`. `opencode-go` backed by "OpenCode Console" is a flat subscription; a named provider with an API key is per-token. Report the provider/auth name only, never key values.

## Hermes

1. Read `${HERMES_HOME:-~/.hermes}/config.yaml` (or `$HERMES_HOME/config.yaml`). Report `model.default`, `model.provider`.
2. `auxiliary` may contain only `free_only: true`; when per-task blocks are absent, every auxiliary task (including `compression`) inherits the main model via provider `auto` / empty model. Resolve an auxiliary model's context window with `agent.model_metadata.get_model_context_length(model, provider=...)` before claiming it is smaller than the main model's.
3. Report `compression.enabled`, `threshold`, `target_ratio`, `protect_last_n`.
4. Run `hermes prompt-size` and report the top contributors (system prompt blocks, tool schemas, largest toolsets, skills index).
5. Delegation: report whatever keys are actually set in `delegation:` (commonly only `max_iterations`); unset keys fall back to defaults (`max_concurrent_children: 10`, `independent_completions: false`, model/provider inherit parent). `profile_routes` lives under `gateway`, not `delegation`.
6. Approvals (read-only): run `hermes approvals suggest` (default 90-day scan). It never writes unless `--apply` is passed; do not apply or save allowlist changes during an audit. Summarise proposed entries by class and count.
7. Checkpoints: run `hermes checkpoints` (alias `status`). Global default is off; enable with the `checkpoints.enabled` config key or per session with `hermes chat --checkpoints`. Do not enable during an audit.
8. Cron: run `hermes cron list`. Report `cron.model` from config; unset means `""` and falls through to the main agent model at fire time.

## Invariants

- Audit tasks are read-only: no config, file, or setting changes.
- Never use `hermes -z`.
- Never print API keys, tokens, or `.env` values; use provider/auth names only.
- Settings are read at process start, so a config change is not verified by absent output in the same session.

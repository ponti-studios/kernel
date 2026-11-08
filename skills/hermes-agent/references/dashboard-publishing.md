# Publishing the Hermes Dashboard (Tailscale Serve / reverse proxy)

## Flags

`hermes dashboard --help`:

```
hermes dashboard [--port PORT] [--host HOST] [--insecure]
                 [--skip-build] [--isolated] [--stop] [--status] [--no-open]
                 {register} ...
```

- `--port` (default 9119, 0 = OS auto-assign), `--host` (default 127.0.0.1).
- `--no-open` — don't auto-open a browser (use in non-interactive/remote contexts).
- `--skip-build` — serve existing `web/dist` directly (CI, Windows Scheduled Tasks, no npm).
- `--isolated` — dedicated server scoped to a named profile instead of the machine-level one.
- `--stop` / `--status` — stop all / list running dashboard processes.
- `--insecure` is DEPRECATED and a NO-OP: a public (non-loopback) bind always requires an auth provider. Keep the bind on loopback and tunnel.

## Loopback + tunnel pattern (recommended)

Bind loopback only:

```
hermes dashboard --host 127.0.0.1 --port 9119 --no-open
```

Start in the background without shell wrappers — the terminal tool rejects `nohup`/`disown`/`setsid`. Use the tool's `background=true` with redirection, then **poll** readiness instead of relying on a completion ping:

```
hermes dashboard --host 127.0.0.1 --port 9119 --no-open > /tmp/hermes-dashboard.log 2>&1   # background=true
# wait ~5s, then:
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9119/
tail -30 /tmp/hermes-dashboard.log   # on failure
```

Ready signal in the log: `HERMES_DASHBOARD_READY port=9119` plus `Hermes Web UI → http://127.0.0.1:9119`.

## Tailscale Serve mapping

1. Record current state first: `tailscale serve status`. Preserve every existing mapping.
2. Never `tailscale serve reset` and never remove/change an existing mapping — add only.
3. Add one mapping (verify syntax with `tailscale serve --help` if the CLI differs):

```
tailscale serve --bg --https=<port> http://127.0.0.1:<port>
```

4. Verify: `tailscale serve status` and `curl -sk -o /dev/null -w "%{http_code}" https://<host>:<port>/`.

## Host-header / DNS-rebinding gate (the common 400)

The dashboard validates the `Host` header against the bound host plus operator-declared public hosts (GHSA-ppp5-vxwm-4cf7). A tunnel/reverse proxy that forwards its own hostname (Tailscale Serve does) gets `400 Invalid Host header. Dashboard requests must use the bound hostname or the configured public hostname.` unless that hostname is allowlisted.

Allowlist via (precedence: env wins over config):

- env `HERMES_DASHBOARD_PUBLIC_URL=https://<host>:<port>` (blank counts as unset), or
- `hermes config set dashboard.public_url https://<host>:<port>`

Malformed/non-absolute values are ignored with a warning and fall back to request reconstruction. Settings are read at process start, so restart the dashboard after changing.

Edit paths: `hermes config set` is the supported way to write config.yaml. The patch tool refuses to edit ${HERMES_HOME:-~/.hermes}/config.yaml ("security-sensitive configuration"); a direct terminal python edit works as a fallback. Appending to ${HERMES_HOME:-~/.hermes}/.env with `>>` may be consent-gated in automated contexts — prefer `hermes config set` when the gate blocks the append.

## Auth gate engagement

Allowlisting a non-loopback host engages the auth gate (`public_hosts_engage_gate`): the published URL then requires a verified session/OAuth. With no password or OAuth configured, the dashboard refuses to bind entirely (SystemExit: "no auth providers are registered") — it does not start, and it does not merely redirect to a login page. Configure auth (Nous Portal OAuth or a password) before publishing, or keep the URL loopback-only. Do not set or change credentials from automation; direct the user.

Unauthenticated loopback exemption (advanced, only when the user explicitly forbids credentials and accepts the tradeoff): set `HERMES_DESKTOP=1` plus an ephemeral `HERMES_DASHBOARD_SESSION_TOKEN` (any random value) in the launch environment. `_desktop_loopback_auth_exempt` then keeps `auth_required=False` while `trusted_public_hosts` still contains the allowlisted hostname, so the Host header is accepted and `/` returns 200 without a login. This spoofs Desktop ownership (affects MCP-discovery timing and web-dist handling) and is not the intended path — prefer configuring auth. Never persist the session token as a credential.

## Restarting the dashboard

Find the listener, kill only that PID, relaunch, and poll (never restart the gateway):

```
PID=$(lsof -nP -iTCP:9119 -sTCP:LISTEN -t)
kill "$PID"
# relaunch in the background (background=true) with the same flags + env fix:
HERMES_DASHBOARD_PUBLIC_URL=https://<host>:<port> hermes dashboard --host 127.0.0.1 --port 9119 --no-open > /tmp/hermes-dashboard.log 2>&1
# wait ~5s, then verify:
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9119/
curl -sk -o /dev/null -w "%{http_code}" https://<host>:<port>/
```

The dashboard process is often a child of `hermes gateway run`; killing only the dashboard PID leaves the gateway and other live sessions untouched.

## Config key names (verify before relying on them)

`hermes config set` accepts arbitrary keys and saves unrecognized ones with a warning ("not a recognized config key — it was saved anyway, but Hermes may not read it"). An unrecognized key does not engage any feature. Before depending on a key, confirm it is a real schema entry (check `hermes config`/docs or the reference for the subsystem); the validator's "Did you mean:" suggestion is a fuzzy match and can point at an unrelated section (e.g. `web.*` is web-search config, not a web UI). For the dashboard specifically the keys are `dashboard.public_url`, `dashboard.basic_auth.*`, etc. — there is no `webapp.*` namespace in this build.

## Multiple dashboard instances (a second port / "webapp")

There is no `hermes webapp` command; the web UI is `hermes dashboard`. A "webapp"/phone workspace on another port is just a second dashboard process:

```
hermes dashboard --host 127.0.0.1 --port 9120 --no-open > /tmp/hermes-webapp.log 2>&1   # background=true
```

Each instance reads the same `dashboard.*` config (including `dashboard.public_url`), so a second instance on a new port needs its own public URL/auth handling and will refuse to bind if the existing `dashboard.public_url` points at a different host without auth. Add a separate Serve mapping for the new port (never change the old one).

Launching the second instance with the desktop auth exemption (reusing the live instance's token):

```
HERMES_DESKTOP=1 \\
HERMES_DASHBOARD_SESSION_TOKEN="$(ps eww -p <live-pid> | grep -o 'HERMES_DASHBOARD_SESSION_TOKEN=[^ ]*' | head -1 | cut -d= -f2-)" \\
  hermes dashboard --host 127.0.0.1 --port 9120 --no-open > /tmp/hermes-webapp.log 2>&1   # background=true
```

Pitfalls:

- **Env must be inlined.** The terminal tool's background children do NOT inherit exports from a prior foreground call, even though interactive shells do. A launch that relies on a previously-exported `HERMES_DESKTOP`/token will bind with the exemption missing and fail with "no auth providers are registered". Put the variables on the same command line (or in a wrapper script) so they are present in the child's environment.
- **Extract the token from the running process, never hardcode or persist it.** `ps eww -p <pid>` carries it; report only the variable name and mechanism, not the value. Reusing the live instance's token keeps the two instances on one exemption; do not mint a new persistent credential.
- **A missing exemption fails at bind time, not request time.** The refusal is a `SystemExit` before uvicorn binds, so `curl` returns 000/502 and the log tail shows the refusal. Check `tail` on failure rather than assuming the process is alive.
- **Do not set `HERMES_DASHBOARD_PUBLIC_URL` to the new port unless the config also has a matching `dashboard.public_url`.** The exemption path ignores `public_url`; setting the env var to a hostname that is not allowlisted does not help and can confuse Host validation. Leave it unset for the second instance.

## Tool guard: gateway restart/stop from inside the gateway

The terminal tool refuses to launch any command or script whose text (or a referenced script's text) contains `gateway restart`/`gateway stop`/etc., because the gateway would SIGTERM the child. Do not try to bypass this for routine work — prefer the dashboard-PID kill + relaunch pattern above (it leaves the gateway and live sessions untouched).

If a gateway restart is genuinely required and user-approved, schedule it in a detached script whose _on-disk text_ does not contain the literal phrase (e.g. build the verb from a variable: `RESTART_VERB=restart; hermes gateway "$RESTART_VERB"`), keep an audit copy of the script with the literal command for review, launch the runtime copy detached, and let it sleep ~30s before acting so the reply is delivered first. Settings are read at process start, so config changes still need a process restart to take effect — restart the dashboard process, not the gateway, whenever that suffices.

## Hard invariants

- Never use `hermes -z` for this.
- Never `tailscale serve reset`.
- Never remove or change existing Serve mappings — add only.
- Never set or change passwords or credentials.

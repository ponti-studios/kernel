#!/usr/bin/env python3
"""Google Workspace OAuth2 setup for Hermes Agent.

Fully non-interactive — designed to be driven by the agent via terminal commands.
The agent mediates between this script and the user (works on CLI, Telegram, Discord, etc.)

Commands:
  setup.py --check                          # Is auth valid? Exit 0 = yes, 1 = no
  setup.py --client-secret /path/to.json    # Store OAuth client credentials
  setup.py --auth-url [--services ...]      # Print the OAuth URL for user to visit
  setup.py --auth-code CODE                 # Exchange auth code for token
  setup.py --revoke                         # Revoke and delete stored token
  setup.py --install-deps                   # Install Python dependencies only

Agent workflow:
  1. Run --check. If exit 0, auth is good — skip setup.
  2. Ask user for client_secret.json path. Run --client-secret PATH.
  3. Run --auth-url. Send the printed URL to the user.
  4. User opens URL, authorizes, gets redirected to a page with a code.
  5. User pastes the code. Agent runs --auth-code CODE.
  6. Run --check to verify. Done.

Design notes:
  - Least privilege: --services selects a named scope profile; the default
    profile is the historical full set for backward compatibility.
  - Secrets at rest are 0600 (token, client secret, pending session).
  - Dependencies resolve without Hermes: google libs are imported directly
    and a missing import prints the exact pip/uv command instead of a
    Hermes-only error. `pm` is used opportunistically for --install-deps.
  - Profiles (--profile NAME) isolate tokens per Google account.
"""

from __future__ import annotations  # allow PEP 604 `X | None` on Python 3.9+

import argparse
import json
import os
import stat
import sys
from pathlib import Path

# Ensure sibling modules (_hermes_home) are importable when run standalone.
_SCRIPTS_DIR = str(Path(__file__).resolve().parent)
if _SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, _SCRIPTS_DIR)

from _hermes_home import display_hermes_home, get_hermes_home

HERMES_HOME = get_hermes_home()
CLIENT_SECRET_PATH = HERMES_HOME / "google_client_secret.json"


def _token_path(profile: str) -> Path:
    if profile == "default":
        return HERMES_HOME / "google_token.json"
    return HERMES_HOME / f"google_token.{profile}.json"


def _pending_path(profile: str) -> Path:
    if profile == "default":
        return HERMES_HOME / "google_oauth_pending.json"
    return HERMES_HOME / f"google_oauth_pending.{profile}.json"


# Named scope profiles. Compose with --services a,b. `all` is the historical
# full set (kept as the default so existing tokens keep working).
SCOPE_PROFILES: dict[str, list[str]] = {
    "email": [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.modify",
    ],
    "calendar": [
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/calendar.settings.readonly",
    ],
    "contacts": [
        "https://www.googleapis.com/auth/contacts.readonly",
    ],
    "drive": [
        "https://www.googleapis.com/auth/drive",
    ],
    "docs": [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/documents",
        "https://www.googleapis.com/auth/drive",
    ],
}
SCOPE_PROFILES["all"] = sorted(
    {scope for scopes in SCOPE_PROFILES.values() for scope in scopes}
    | {
        # Full calendar access (beyond events) only in the historical set:
        # sharing settings and ACLs need it; event CRUD does not.
        "https://www.googleapis.com/auth/calendar",
    }
)
DEFAULT_SERVICES = ["all"]

# OAuth redirect for manual code copy flow.
# Google deprecated OOB, so we use a localhost redirect and tell the user to
# copy the code from the browser's URL bar (or the page body).
REDIRECT_URI = "http://localhost:1"


def _write_secret(path: Path, text: str) -> None:
    """Write a secret file with owner-only permissions."""
    path.write_text(text, encoding="utf-8")
    os.chmod(path, 0o600)


def _normalize_authorized_user_payload(payload: dict) -> dict:
    normalized = dict(payload)
    if not normalized.get("type"):
        normalized["type"] = "authorized_user"
    return normalized


def _load_token_payload(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _resolve_services(services: list[str] | None) -> list[str]:
    names = services or DEFAULT_SERVICES
    unknown = [name for name in names if name not in SCOPE_PROFILES]
    if unknown:
        print(f"ERROR: Unknown service(s): {', '.join(unknown)}")
        print(f"Known services: {', '.join(sorted(SCOPE_PROFILES))}")
        sys.exit(1)
    seen: list[str] = []
    for name in names:
        for scope in SCOPE_PROFILES[name]:
            if scope not in seen:
                seen.append(scope)
    return seen


def _missing_scopes_from_payload(payload: dict, required: list[str]) -> list[str]:
    raw = payload.get("scopes") or payload.get("scope")
    if not raw:
        return []
    granted = {s.strip() for s in (raw.split() if isinstance(raw, str) else raw) if s.strip()}
    return sorted(scope for scope in required if scope not in granted)


def _format_missing_scopes(missing_scopes: list[str]) -> str:
    bullets = "\n".join(f"  - {scope}" for scope in missing_scopes)
    return (
        "Token is valid but missing required Google Workspace scopes:\n"
        f"{bullets}\n"
        "Run the Google Workspace setup again from this same Hermes profile to refresh consent."
    )


def install_deps():
    """Install Google dependencies, via Hermes PM when available, else pip."""
    try:
        import pm  # type: ignore

        try:
            pm.sync_venv(["google"], explicit=True)
        except Exception as exc:
            print(f"ERROR: Failed to install Google dependencies: {exc}")
            return False
        print("Google dependencies synced. Restart Hermes, then rerun setup to continue OAuth.")
        return True
    except ImportError:
        print("Hermes PM not available; installing with pip instead:")
        print("  pip install google-auth-oauthlib google-api-python-client")
        print("or: uv pip install google-auth-oauthlib google-api-python-client")
        return False


def _ensure_deps():
    """Import google libs directly; on failure print the exact fix."""
    try:
        import google_auth_oauthlib.flow  # noqa: F401
        import googleapiclient  # noqa: F401
    except ImportError:
        print("ERROR: Google client libraries are not installed.")
        print("Install them with one of:")
        print("  pip install google-auth-oauthlib google-api-python-client")
        print("  uv pip install google-auth-oauthlib google-api-python-client")
        print("or run setup.py --install-deps inside the Hermes environment.")
        sys.exit(1)


def check_auth_live(profile: str = "default"):
    """Check auth with a real API call to detect disabled_client/account issues."""
    token_path = _token_path(profile)
    # quiet=True suppresses the "AUTHENTICATED" print from check_auth so the
    # final status line reflects the live-call outcome (OK or FAILED).
    if not check_auth(profile, quiet=True):
        return False
    try:
        from googleapiclient.discovery import build
        from google.oauth2.credentials import Credentials
        creds = Credentials.from_authorized_user_file(str(token_path))
        service = build("calendar", "v3", credentials=creds)
        service.calendarList().list(maxResults=1).execute()
        print("LIVE_CHECK_OK: Real API call succeeded.")
        return True
    except Exception as e:
        err_str = str(e).lower()
        if "disabled_client" in err_str or "invalid_client" in err_str:
            print(f"LIVE_CHECK_FAILED: OAuth client or account disabled: {e}")
            print("  1. Check Google Cloud Console for disabled OAuth client")
            print("  2. Check myaccount.google.com for account status")
            print("  3. Do NOT retry with a disabled account")
        else:
            print(f"LIVE_CHECK_FAILED: {e}")
        return False


def check_auth(profile: str = "default", services: list[str] | None = None, quiet: bool = False, fmt: str = "text"):
    """Check if stored credentials are valid. Prints status, exits 0 or 1."""
    token_path = _token_path(profile)
    required = _resolve_services(services)
    if not token_path.exists():
        _emit({"authenticated": False, "reason": f"No token at {token_path}", "profile": profile}, fmt, quiet)
        if fmt == "text" and not quiet:
            print(f"NOT_AUTHENTICATED: No token at {token_path}")
        return False

    _ensure_deps()
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request

    try:
        # Don't pass scopes — user may have authorized only a subset.
        # Passing scopes forces google-auth to validate them on refresh,
        # which fails with invalid_scope if the token has fewer scopes
        # than requested.
        creds = Credentials.from_authorized_user_file(str(token_path))
    except Exception as e:
        _emit({"authenticated": False, "reason": f"TOKEN_CORRUPT: {e}", "profile": profile}, fmt, quiet)
        if fmt == "text" and not quiet:
            print(f"TOKEN_CORRUPT: {e}")
        return False

    payload = _load_token_payload(token_path)
    if creds.valid:
        missing_scopes = _missing_scopes_from_payload(payload, required)
        _emit(
            {"authenticated": True, "profile": profile, "token_path": str(token_path), "missing_scopes": missing_scopes},
            fmt, quiet,
        )
        if fmt == "text" and not quiet:
            if missing_scopes:
                print(f"AUTHENTICATED (partial): Token valid but missing {len(missing_scopes)} scopes:")
                for s in missing_scopes:
                    print(f"  - {s}")
            print(f"AUTHENTICATED: Token valid at {token_path}")
        return True

    if creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            _write_secret(
                token_path,
                json.dumps(
                    _normalize_authorized_user_payload(json.loads(creds.to_json())),
                    indent=2,
                ),
            )
            missing_scopes = _missing_scopes_from_payload(_load_token_payload(token_path), required)
            _emit(
                {"authenticated": True, "profile": profile, "refreshed": True, "missing_scopes": missing_scopes},
                fmt, quiet,
            )
            if fmt == "text" and not quiet:
                if missing_scopes:
                    print(f"AUTHENTICATED (partial): Token refreshed but missing {len(missing_scopes)} scopes:")
                    for s in missing_scopes:
                        print(f"  - {s}")
                print(f"AUTHENTICATED: Token refreshed at {token_path}")
            return True
        except Exception as e:
            err_str = str(e).lower()
            if "disabled_client" in err_str or "invalid_client" in err_str:
                detail = (
                    f"OAUTH_CLIENT_DISABLED: {e}\n"
                    "  The OAuth client or Google account has been disabled.\n"
                    "  Steps to resolve:\n"
                    "    1. Check your Google Cloud Console — verify the OAuth client is not disabled\n"
                    "    2. Check if your Google account itself has been disabled at myaccount.google.com\n"
                    "    3. If the account is disabled, you can appeal at accounts.google.com/signin/recovery\n"
                    "    4. Do NOT retry API calls with a disabled account — this may worsen the situation\n"
                    "    5. If the OAuth client is disabled, create a new one in Google Cloud Console"
                )
            elif "token_revoked" in err_str or "invalid_grant" in err_str:
                detail = f"TOKEN_REVOKED: {e}\n  Re-run setup to re-authenticate."
            else:
                detail = f"REFRESH_FAILED: {e}"
            _emit({"authenticated": False, "reason": detail, "profile": profile}, fmt, quiet)
            if fmt == "text" and not quiet:
                print(detail)
            return False

    _emit({"authenticated": False, "reason": "TOKEN_INVALID: Re-run setup.", "profile": profile}, fmt, quiet)
    if fmt == "text" and not quiet:
        print("TOKEN_INVALID: Re-run setup.")
    return False


def _emit(payload: dict, fmt: str, quiet: bool) -> None:
    if fmt == "json" and not quiet:
        print(json.dumps(payload))


def store_client_secret(path: str):
    """Copy and validate client_secret.json to Hermes home (0600)."""
    src = Path(path).expanduser().resolve()
    if not src.exists():
        print(f"ERROR: File not found: {src}")
        sys.exit(1)

    try:
        data = json.loads(src.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        print("ERROR: File is not valid JSON.")
        sys.exit(1)

    if "installed" not in data and "web" not in data:
        print("ERROR: Not a Google OAuth client secret file (missing 'installed' key).")
        print("Download the correct file from: https://console.cloud.google.com/apis/credentials")
        sys.exit(1)

    _write_secret(CLIENT_SECRET_PATH, json.dumps(data, indent=2))
    print(f"OK: Client secret saved to {CLIENT_SECRET_PATH}")


def _save_pending_auth(profile: str, *, state: str, code_verifier: str, scopes: list[str], redirect_uri: str):
    """Persist the OAuth session bits needed for a later token exchange."""
    _write_secret(
        _pending_path(profile),
        json.dumps(
            {
                "state": state,
                "code_verifier": code_verifier,
                "redirect_uri": redirect_uri,
                "scopes": scopes,
                "profile": profile,
            },
            indent=2,
        ),
    )


def _load_pending_auth(profile: str) -> dict:
    """Load the pending OAuth session created by get_auth_url()."""
    pending_path = _pending_path(profile)
    if not pending_path.exists():
        print("ERROR: No pending OAuth session found. Run --auth-url first.")
        sys.exit(1)

    try:
        data = json.loads(pending_path.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"ERROR: Could not read pending OAuth session: {e}")
        print("Run --auth-url again to start a fresh OAuth session.")
        sys.exit(1)

    if not data.get("state") or not data.get("code_verifier"):
        print("ERROR: Pending OAuth session is missing PKCE data.")
        print("Run --auth-url again to start a fresh OAuth session.")
        sys.exit(1)

    return data


def _extract_code_and_state(code_or_url: str) -> tuple[str, str | None]:
    """Accept either a raw auth code or the full redirect URL pasted by the user."""
    if not code_or_url.startswith("http"):
        return code_or_url, None

    from urllib.parse import parse_qs, urlparse

    parsed = urlparse(code_or_url)
    params = parse_qs(parsed.query)
    if "code" not in params:
        print("ERROR: No 'code' parameter found in URL.")
        sys.exit(1)

    state = params.get("state", [None])[0]
    return params["code"][0], state


def _run_loopback_server(port: int, timeout: int) -> str:
    """Serve 127.0.0.1:port and return the full OAuth callback URL.

    Raises TimeoutError when no redirect arrives in time. Desktop clients may
    use any localhost port without preregistration (RFC 8252 loopback exempt).
    """
    import threading
    from http.server import BaseHTTPRequestHandler, HTTPServer

    captured: dict[str, str | None] = {"raw_path": None}

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):  # noqa: N802
            captured["raw_path"] = self.path
            body = b"<html><body><h1>Authorized - return to your terminal.</h1></body></html>"
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, *args):
            pass

    server = HTTPServer(("127.0.0.1", port), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    thread.join(timeout=timeout)
    server.shutdown()
    raw = captured["raw_path"]
    if not raw:
        raise TimeoutError(f"No OAuth redirect arrived within {timeout}s.")
    query = raw.split("?", 1)[1] if "?" in raw else ""
    return f"http://127.0.0.1:{port}/callback?{query}"


def _free_loopback_port() -> int:
    import socket

    probe = socket.socket()
    probe.bind(("127.0.0.1", 0))
    port = probe.getsockname()[1]
    probe.close()
    return port


def authorize(profile: str = "default", services: list[str] | None = None, fmt: str = "text", timeout: int = 600):
    """Blocking authorize: print URL, capture the localhost redirect, exchange.

    Removes the manual copy-paste step (and its transcription errors). Falls
    back to --auth-code paste when the browser lands somewhere unreachable.
    """
    if not CLIENT_SECRET_PATH.exists():
        print("ERROR: No client secret stored. Run --client-secret first.")
        sys.exit(1)

    _ensure_deps()
    from google_auth_oauthlib.flow import Flow

    scopes = _resolve_services(services)
    port = _free_loopback_port()
    redirect_uri = f"http://127.0.0.1:{port}/callback"
    flow = Flow.from_client_secrets_file(
        str(CLIENT_SECRET_PATH),
        scopes=scopes,
        redirect_uri=redirect_uri,
        autogenerate_code_verifier=True,
    )
    auth_url, state = flow.authorization_url(access_type="offline", prompt="consent")
    _save_pending_auth(profile, state=state, code_verifier=flow.code_verifier, scopes=scopes, redirect_uri=redirect_uri)
    if fmt == "json":
        print(json.dumps({"auth_url": auth_url, "profile": profile, "mode": "loopback", "timeout": timeout}))
    else:
        print("Open this URL, approve, and wait — the redirect is captured automatically:")
        print(auth_url)
    try:
        callback_url = _run_loopback_server(port, timeout)
    except TimeoutError as e:
        print(f"TIMEOUT: {e}")
        print("Paste the redirect URL manually with --auth-code instead.")
        sys.exit(1)
    exchange_auth_code(callback_url, profile, fmt=fmt)


def get_auth_url(profile: str = "default", services: list[str] | None = None, fmt: str = "text"):
    """Print the OAuth authorization URL. User visits this in a browser."""
    if not CLIENT_SECRET_PATH.exists():
        print("ERROR: No client secret stored. Run --client-secret first.")
        sys.exit(1)

    _ensure_deps()
    from google_auth_oauthlib.flow import Flow

    scopes = _resolve_services(services)
    redirect_uri = REDIRECT_URI
    flow = Flow.from_client_secrets_file(
        str(CLIENT_SECRET_PATH),
        scopes=scopes,
        redirect_uri=redirect_uri,
        autogenerate_code_verifier=True,
    )
    auth_url, state = flow.authorization_url(
        access_type="offline",
        prompt="consent",
    )
    _save_pending_auth(profile, state=state, code_verifier=flow.code_verifier, scopes=scopes, redirect_uri=redirect_uri)
    if fmt == "json":
        print(json.dumps({"auth_url": auth_url, "profile": profile, "services": services or DEFAULT_SERVICES, "scopes": scopes, "redirect_uri": redirect_uri}))
    else:
        # Print just the URL so the agent can extract it cleanly
        print(auth_url)


def exchange_auth_code(code: str, profile: str = "default", fmt: str = "text"):
    """Exchange the authorization code for a token and save it (0600)."""
    if not CLIENT_SECRET_PATH.exists():
        print("ERROR: No client secret stored. Run --client-secret first.")
        sys.exit(1)

    pending_auth = _load_pending_auth(profile)
    raw_callback = code
    code, returned_state = _extract_code_and_state(code)
    if returned_state and returned_state != pending_auth["state"]:
        print("ERROR: OAuth state mismatch. Run --auth-url again to start a fresh session.")
        sys.exit(1)

    _ensure_deps()
    from google_auth_oauthlib.flow import Flow
    from urllib.parse import parse_qs, urlparse

    # Requested scopes live in the pending session; the granted set comes from
    # the callback URL when the user pasted the full redirect.
    requested_scopes: list[str] = pending_auth.get("scopes") or _resolve_services(None)
    granted_scopes = list(requested_scopes)
    if isinstance(raw_callback, str) and raw_callback.startswith("http"):
        params = parse_qs(urlparse(raw_callback).query)
        scope_val = (params.get("scope") or [""])[0].strip()
        if scope_val:
            granted_scopes = scope_val.split()

    flow = Flow.from_client_secrets_file(
        str(CLIENT_SECRET_PATH),
        scopes=granted_scopes,
        redirect_uri=pending_auth.get("redirect_uri", REDIRECT_URI),
        state=pending_auth["state"],
        code_verifier=pending_auth["code_verifier"],
    )

    try:
        # Accept partial scopes — user may deselect some permissions in the consent screen
        os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"
        flow.fetch_token(code=code)
    except Exception as e:
        print(f"ERROR: Token exchange failed: {e}")
        print("The code may have expired. Run --auth-url to get a fresh URL.")
        sys.exit(1)

    creds = flow.credentials
    token_payload = _normalize_authorized_user_payload(json.loads(creds.to_json()))

    # Store only the scopes actually granted by the user, not what was requested.
    # creds.to_json() writes the requested scopes, which causes refresh to fail
    # with invalid_scope if the user only authorized a subset.
    actually_granted = list(creds.granted_scopes or []) if hasattr(creds, "granted_scopes") and creds.granted_scopes else []
    if actually_granted:
        token_payload["scopes"] = actually_granted
    elif granted_scopes != requested_scopes:
        # granted_scopes was extracted from the callback URL
        token_payload["scopes"] = granted_scopes

    missing_scopes = _missing_scopes_from_payload(token_payload, requested_scopes)
    token_path = _token_path(profile)
    _write_secret(token_path, json.dumps(token_payload, indent=2))
    _pending_path(profile).unlink(missing_ok=True)
    if fmt == "json":
        print(json.dumps({"authenticated": True, "profile": profile, "token_path": str(token_path), "missing_scopes": missing_scopes}))
    else:
        if missing_scopes:
            print(f"WARNING: Token missing some Google Workspace scopes: {', '.join(missing_scopes)}")
            print("Some services may not be available.")
        print(f"OK: Authenticated. Token saved to {token_path}")
        print(f"Profile-scoped token location: {display_hermes_home()}/google_token.json")


def revoke(profile: str = "default"):
    """Revoke stored token and delete it."""
    token_path = _token_path(profile)
    if not token_path.exists():
        print("No token to revoke.")
        return

    _ensure_deps()
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request

    try:
        # Load without scopes: the token may hold a subset and scope
        # validation on load would fail a partial grant. Scopes are not
        # needed to revoke.
        creds = Credentials.from_authorized_user_file(str(token_path))
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())

        import urllib.request
        urllib.request.urlopen(
            urllib.request.Request(
                f"https://oauth2.googleapis.com/revoke?token={creds.token}",
                method="POST",
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            ),
            timeout=15,
        )
        print("Token revoked with Google.")
    except Exception as e:
        print(f"Remote revocation failed (token may already be invalid): {e}")

    token_path.unlink(missing_ok=True)
    _pending_path(profile).unlink(missing_ok=True)
    print(f"Deleted {token_path}")


def _parse_services(value: str | None) -> list[str] | None:
    if not value:
        return None
    return [part.strip() for part in value.split(",") if part.strip()]


def main():
    parser = argparse.ArgumentParser(description="Google Workspace OAuth setup for Hermes")
    parser.add_argument("--profile", default="default", help="Credential profile (default: default)")
    parser.add_argument("--format", choices=["text", "json"], default="text", help="Output format")
    parser.add_argument("--services", metavar="a,b", default=None,
                        help=f"Scope profile set (default: all). Known: {', '.join(sorted(SCOPE_PROFILES))}")
    parser.add_argument("--timeout", type=int, default=600,
                        help="Seconds to wait for the localhost redirect (with --authorize)")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--check", action="store_true", help="Check if auth is valid (exit 0=yes, 1=no)")
    group.add_argument("--check-live", action="store_true", help="Check auth with a real API call (detects disabled_client)")
    group.add_argument("--client-secret", metavar="PATH", help="Store OAuth client_secret.json")
    group.add_argument("--auth-url", action="store_true", help="Print OAuth URL for user to visit")
    group.add_argument("--authorize", action="store_true", help="Blocking authorize: print URL, capture localhost redirect, exchange")
    group.add_argument("--auth-code", metavar="CODE", help="Exchange auth code for token")
    group.add_argument("--revoke", action="store_true", help="Revoke and delete stored token")
    group.add_argument("--install-deps", action="store_true", help="Install Python dependencies")
    args = parser.parse_args()
    services = _parse_services(args.services)
    fmt = args.format

    if args.check:
        sys.exit(0 if check_auth(args.profile, services, fmt=fmt) else 1)
    if getattr(args, "check_live", False):
        sys.exit(0 if check_auth_live(args.profile) else 1)
    elif args.client_secret:
        store_client_secret(args.client_secret)
    elif args.auth_url:
        get_auth_url(args.profile, services, fmt=fmt)
    elif args.authorize:
        authorize(args.profile, services, fmt=fmt, timeout=args.timeout)
    elif args.auth_code:
        exchange_auth_code(args.auth_code, args.profile, fmt=fmt)
    elif args.revoke:
        revoke(args.profile)
    elif args.install_deps:
        sys.exit(0 if install_deps() else 1)


if __name__ == "__main__":
    main()

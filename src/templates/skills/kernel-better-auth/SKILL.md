---
name: kernel-better-auth
description: Defines the authentication contract for apps that use Better Auth as the sole auth authority. Use when choosing auth surfaces for web, mobile, CLI, or server clients, configuring Better Auth plugins, protecting routes, or migrating away from custom auth code.
license: MIT
compatibility: Any full-stack project using Better Auth for authentication.
metadata:
  author: project
  version: "1.0"
  category: Security
  tags:
    - auth
    - authentication
    - authorization
    - better-auth
    - session
    - bearer
    - protected-routes
    - rbac
    - migration
    - multi-client
when:
  - user is implementing login, logout, registration, or session handling
  - user is choosing auth surfaces for web, mobile, CLI, desktop, or SDK clients
  - user is adding auth middleware or protected routes
  - user is configuring Better Auth plugins or auth-related route behavior
  - user is migrating from custom JWT, refresh-token, or session code to Better Auth
  - user is separating authentication concerns from authorization concerns
applicability:
  - Use when implementing any authentication flow backed by Better Auth
  - Use when reviewing token, session, or client-surface choices
  - Use when aligning route middleware with Better Auth session or bearer state
  - Use when ripping out a custom auth layer in favor of Better Auth
termination:
  - The auth surface for each client type is chosen and justified
  - Better Auth is the sole authentication authority; custom auth code is removed or explicitly rejected
  - Boundary rules for auth, authz, middleware, and client usage are clear
  - The relevant implementation or migration reference has been applied
outputs:
  - Auth surface decision for each client type
  - Better Auth configuration plan
  - Route and middleware auth contract
  - Migration plan away from custom auth code
---

Define the auth contract so Better Auth is the single source of truth for authentication across clients and server boundaries.

## Standards

Better Auth owns authentication:

- session creation and renewal
- token issuance where Better Auth plugins provide it
- login and logout flows
- auth client methods
- auth-owned tables and endpoints

Do not re-implement custom JWT issuance, refresh-token rotation, password hashing, or session storage when Better Auth already covers the surface.

Authentication and authorization are separate concerns:

- `kernel-better-auth` owns who the caller is and how identity is established
- app/domain code owns what that caller is allowed to do

## Client Surface Map

Choose one auth surface per client type and keep it consistent:

- First-party web: Better Auth session cookies
- Desktop webview/electron-style client: Better Auth session cookies when the environment supports them
- Mobile / non-browser app: Better Auth JWT + bearer surface
- CLI: Better Auth device authorization
- Service-to-service: separate service credentials or signed service tokens, not end-user session flow

Never mix surfaces casually. Web should not grow ad hoc bearer-token flows, and CLI should not depend on browser session cookies.

## Process

1. Identify every client that needs to authenticate: web, mobile, CLI, desktop, SDK, or service.
2. Choose the Better Auth-native surface for each client type.
3. Keep the inbound route boundary thin: auth resolution at the boundary, business logic in services.
4. Separate authentication middleware from authorization middleware.
5. Enable only the Better Auth plugins the project actually needs.
6. If the codebase has custom auth logic, plan and remove it in a staged migration instead of layering Better Auth on top.

## Implementation References

Read only the references needed for the task:

- [surface-map.md](references/surface-map.md) for choosing auth surfaces by client type
- [server-integration.md](references/server-integration.md) for server setup, plugin config, and route middleware examples
- [client-patterns.md](references/client-patterns.md) for client setup, protected routes, and login/logout usage
- [storage-and-routes.md](references/storage-and-routes.md) for auth-owned tables, route surface, and boundary rules
- [migration.md](references/migration.md) for moving from custom auth code to Better Auth

## Guardrails

- Never implement custom session handling, JWT issuance, or password hashing when Better Auth already owns the surface.
- Never store end-user tokens in `localStorage` or `sessionStorage` unless the chosen Better Auth-native client surface explicitly requires it and the user approves the tradeoff.
- Never log tokens, session cookies, OTPs, or credentials.
- Never put authorization rules inside Better Auth config; keep role and permission checks in app middleware or services.
- Never add custom auth tables, schema remapping, or refresh/session hooks unless the project has an explicit documented need that Better Auth does not cover.
- Never remove old auth endpoints before wiring in the Better Auth-native replacement.

# Migration From Custom Auth

Use this reference when moving a codebase from custom auth code to Better Auth.

## Order Of Operations

1. Rebuild auth storage around Better Auth-native tables and enabled plugin tables.
2. Rewrite auth config to remove custom refresh/session behavior.
3. Delete custom token and session subsystems in small stages.
4. Replace deprecated auth endpoints with Better Auth-native routes.
5. Realign route middleware and client calls.
6. Replace test helpers that mint custom tokens or assume the old session model.

## Detailed Migration Steps

### 1. Rebuild The DB Foundation

- Rewrite the schema so auth exposes only Better Auth-native and enabled-plugin tables.
- Rebuild generated DB types before touching consumers.
- Fix consumers that import old auth-layer types before moving on.

### 2. Rewrite The Auth Config

- Remove custom schema remapping, extra session fields, and custom refresh hooks.
- Enable only the plugins the project actually needs.
- Verify the auth service starts and the session surface responds correctly.

### 3. Delete The Custom Token/Session Subsystem

Remove in this order:

1. Custom access-token issuance and verification
2. Custom JWKS endpoint if Better Auth already provides one
3. Custom session store
4. Custom refresh-token rotation

### 4. Remove Deprecated Endpoints

- Drop `/api/auth/refresh` and `/api/auth/token-from-session`
- Update clients to use Better Auth-native routes or client methods
- Remove custom revocation/session-cache logic

### 5. Realign Middleware And Routes

- Replace middleware that reads custom token claims with Better Auth session/bearer resolution
- Move role and permission assumptions into app-domain middleware if they were embedded in auth payloads

### 6. Replace Test Helpers

- Remove helpers that mint custom tokens
- Use Better Auth-native session establishment in integration and E2E tests
- Cover session cookies, bearer flows, device auth, passkeys, and OTP only where relevant to the project

## Validation Checklist

- Better Auth is the sole authentication authority
- No runtime references remain to custom refresh or session architecture
- Clients use the chosen Better Auth-native surfaces
- Auth middleware and protected routes align with the new contract
- Replaced endpoints and client flows work end-to-end

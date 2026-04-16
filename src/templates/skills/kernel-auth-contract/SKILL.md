---
name: kernel-auth-contract
kind: skill
tags:
  - backend
  - auth
profile: extended
description: Defines and enforces the authentication and authorization contract
  for apps and services. Use when implementing login, session management, token
  handling, protected routes, inter-service auth, or when users ask how auth
  should work.
license: MIT
compatibility: Any full-stack project with authentication requirements.
metadata:
  author: project
  version: "1.0"
  category: Security
  tags:
    - auth
    - authentication
    - authorization
    - jwt
    - session
    - tokens
    - middleware
    - protected-routes
    - rbac
when:
  - user is implementing login, logout, or registration
  - user is managing sessions, JWTs, or refresh tokens
  - user is adding auth middleware to an API
  - user is implementing protected routes in the frontend
  - user is designing role-based access control
  - user is implementing inter-service authentication
applicability:
  - Use when implementing any authentication or authorization flow
  - Use when reviewing token storage, expiry, or rotation strategy
  - Use when adding an auth guard to a frontend route
  - Use when designing inter-service credential passing
termination:
  - Session contract is defined and typed
  - Token lifecycle (access + refresh) is implemented per spec
  - API middleware verifies session before handler executes
  - Frontend auth guard handles loading, authenticated, and unauthenticated
    states
outputs:
  - Session type definition
  - Token verification middleware
  - Frontend auth guard component
  - Logout implementation that revokes server-side
---

Authentication and authorization contract for apps and services. Better-Auth owns all authentication — never implement custom session handling, JWT issuance, or password hashing.

## Toolchain

| Concern              | Tool                                                               |
| -------------------- | ------------------------------------------------------------------ |
| Auth provider        | Better-Auth                                                        |
| Session hook (React) | `better-auth/react` → `useSession()`                               |
| Server middleware    | Better-Auth Hono plugin                                            |
| Inter-service auth   | Short-lived signed tokens (custom — Better-Auth doesn't cover s2s) |

Never use: custom JWT libraries, Passport.js, NextAuth, Lucia, or hand-rolled session logic.

## Server Setup

```typescript
// packages/auth/src/index.ts
import { betterAuth } from "better-auth";
import { db } from "@your-org/db";

export const auth = betterAuth({
  database: db,
  emailAndPassword: { enabled: true },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh if older than 24h
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  trustedOrigins: [process.env.APP_URL!],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
```

## Hono Integration

```typescript
// apps/api/src/middleware/auth.ts
import { auth } from "@your-org/auth";

// Mount Better-Auth handler — handles all /api/auth/* routes
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

// Session middleware — attaches session to context
export async function sessionMiddleware(c: Context, next: Next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("session", session);
  await next();
}

// Auth guard — rejects unauthenticated requests
export async function requireAuth(c: Context, next: Next) {
  const session = c.get("session");
  if (!session) return c.json(ApiErrors.UNAUTHORIZED, 401);
  await next();
}
```

## Authorization as a Separate Layer

Better-Auth handles authentication. Role checks are app-level middleware.

```typescript
export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const session = c.get("session");
    if (!session) return c.json(ApiErrors.UNAUTHORIZED, 401);
    if (!roles.some((r) => session.user.role === r)) {
      return c.json(ApiErrors.FORBIDDEN, 403);
    }
    await next();
  };
}

// Usage — middleware chain
app.post("/api/admin/users", requireAuth, requireRole("admin"), handler);
```

Never conflate authentication and authorization in the same middleware.

## Client Setup

```typescript
// packages/auth/src/client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const { useSession, signIn, signOut, signUp } = authClient;
```

## Protected Routes (Frontend)

```tsx
import { useSession } from "@your-org/auth/client";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) return <AuthSkeleton />;

  if (!session) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} />;
  }

  return <>{children}</>;
}
```

Three states every auth guard must handle: loading, authenticated, unauthenticated.

## Login and Logout

```typescript
// Login
await signIn.email({ email, password, callbackURL: returnTo ?? "/dashboard" });

// Logout
await signOut();
queryClient.clear(); // purge all cached data after logout
```

Never POST to `/auth/login` manually — use Better-Auth's `signIn.*` methods. Never manage cookies manually.

## Inter-Service Authentication

Better-Auth does not cover service-to-service auth. Use short-lived signed tokens for this case only.

```typescript
// Service-to-service: short-lived signed token with service claim
const serviceToken = await signToken({
  sub: "service:worker",
  aud: "service:api",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 60, // 60-second lifetime
});

// Receiving service verifies aud claim
const payload = await verifyToken(token, { audience: "service:api" });
```

- Each service pair has unique credentials — never share credentials between services
- Rotate service credentials on a schedule, not only on breach

## Guardrails

- Never implement custom session handling, JWT issuance, or password hashing — Better-Auth owns all of this
- Never store tokens in `localStorage` or `sessionStorage` — Better-Auth uses httpOnly cookies
- Never log tokens, session cookies, or credentials — even in debug mode
- Never store user identity in `useState` — use `useSession()` from Better-Auth
- Never call auth endpoints manually — use Better-Auth's typed client methods
- Every API endpoint must have an explicit auth requirement (even if it's `public`)
- Authorization (role checks) is app-level — never inside Better-Auth config

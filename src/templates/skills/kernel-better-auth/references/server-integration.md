# Server Integration

Use this reference when wiring Better Auth into the inbound server boundary.

## Better Auth Setup Example

```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: db,
  emailAndPassword: { enabled: true },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  trustedOrigins: [process.env.APP_URL!],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
```

## Plugin Configuration

Enable only the plugins the project actually uses.

```typescript
import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { jwt, bearer, deviceAuthorization } from "better-auth/plugins";
import { passkey, emailOTP, multiSession, oneTimeToken } from "better-auth/plugins";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_BASE_URL!,
  trustedOrigins: [process.env.APP_URL!],
  database: db,
  plugins: [
    expo(),
    jwt(),
    bearer(),
    deviceAuthorization(),
    passkey({ rpID: process.env.RP_ID!, rpName: "Your App" }),
    emailOTP({ sendVerificationOTP: async ({ email, otp }) => { /* send */ } }),
    multiSession(),
    oneTimeToken(),
  ],
});
```

Do not add:

- role fields as auth-owned schema extensions
- custom refresh/session hooks that duplicate Better Auth behavior
- schema remapping just to fit an older auth model

## Boundary Middleware Example

```typescript
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

export async function sessionMiddleware(c: Context, next: Next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("session", session);
  await next();
}

export async function requireAuth(c: Context, next: Next) {
  const session = c.get("session");
  if (!session) return c.json(ApiErrors.UNAUTHORIZED, 401);
  await next();
}
```

## Auth vs Authorization

- Auth middleware establishes identity.
- Authorization middleware checks role, permission, ownership, or policy.
- Do not combine both concerns in the same layer unless the framework forces it.

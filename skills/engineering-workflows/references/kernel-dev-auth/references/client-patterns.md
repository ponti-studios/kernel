# Client Patterns

Use this reference when wiring Better Auth into frontend or client-facing flows.

## Client Setup Example

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const { useSession, signIn, signOut, signUp } = authClient;
```

## Protected Route Pattern

```tsx
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) return <AuthSkeleton />;
  if (!session) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} />;
  }

  return <>{children}</>;
}
```

Every auth guard must handle:

- loading
- authenticated
- unauthenticated

## Login and Logout

```typescript
await signIn.email({ email, password, callbackURL: returnTo ?? "/dashboard" });
await signOut();
queryClient.clear();
```

Do not hand-roll auth fetch calls if Better Auth already provides typed client methods.

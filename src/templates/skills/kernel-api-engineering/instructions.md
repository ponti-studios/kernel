Build type-safe, contract-first APIs with consistent error handling, explicit auth, and thin route handlers.

## Toolchain

| Concern           | Tool                                     |
| ----------------- | ---------------------------------------- |
| HTTP framework    | Hono                                     |
| Schema validation | Zod                                      |
| RPC client        | Hono RPC (`hc<typeof AppRouter>`)        |
| Auth middleware   | Better-Auth (via `kernel-auth-contract`) |

Never use: Express, Fastify, Koa, tRPC, or any other HTTP framework.

## Design Principles

- **Contract-first**: define request/response schemas before writing handlers
- **Type-safe end-to-end**: derive client types from the router; no manual duplication
- **Fail loudly**: invalid input → 422 immediately; never silently coerce bad data
- **Explicit errors**: every error has a stable code, human message, and HTTP status

## Route File Structure

```
routes/
  <resource>/
    index.ts       ← router: mounts handlers, applies middleware
    handlers.ts    ← thin handlers: validate → service → respond
    schema.ts      ← Zod schemas for request and response
    service.ts     ← business logic: no HTTP concerns
```

## Request Validation

Always validate at the boundary. Never trust raw request bodies.

```typescript
import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

// In handler:
const body = CreateUserSchema.safeParse(await c.req.json());
if (!body.success) {
  return c.json(ApiErrors.VALIDATION_FAILED(body.error.flatten()), 422);
}
```

## Response Envelope

```typescript
// Success
{ "data": <T> }

// Error
{ "error": { "code": "<STABLE_CODE>", "message": "<human>", "details"?: any } }
```

## Error Registry

Maintain a canonical `ApiErrors` constant. Never construct error objects inline in handlers.

```typescript
export const ApiErrors = {
  VALIDATION_FAILED: (details: unknown) => ({
    error: { code: "VALIDATION_FAILED", message: "Invalid request body", details },
  }),
  UNAUTHORIZED: { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
  FORBIDDEN: { error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
  NOT_FOUND: (resource: string) => ({
    error: { code: "NOT_FOUND", message: `${resource} not found` },
  }),
  CONFLICT: (message: string) => ({ error: { code: "CONFLICT", message } }),
  INTERNAL: { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
} as const;
```

## Middleware Ordering

```
request-id → auth → authz → rate-limit → validation → handler
```

Apply auth before the handler — never inside it.

```typescript
app.use("/api/*", requestId());
app.use("/api/*", authMiddleware);
app.use("/api/admin/*", requireRole("admin"));
```

## RPC Client Contract

- Derive the client type from the router type: `type ApiClient = hc<typeof AppRouter>`
- Treat the contract as immutable: version breaking changes with `/v2/` prefix
- Client never calls `fetch` directly — always through the typed RPC client

## Testing Requirements

Every endpoint needs at minimum:

| Test                 | Description                                    |
| -------------------- | ---------------------------------------------- |
| Happy path           | 200/201 with correct shape                     |
| Validation rejection | 422 with `VALIDATION_FAILED` code              |
| No auth              | 401 with `UNAUTHORIZED` code                   |
| Forbidden            | 403 with `FORBIDDEN` code (when authz applies) |

```typescript
describe("POST /api/users", () => {
  it("creates user when request is valid", async () => {
    /* ... */
  });
  it("returns 422 when email is missing", async () => {
    /* ... */
  });
  it("returns 401 when no session token", async () => {
    /* ... */
  });
  it("returns 403 when caller lacks required role", async () => {
    /* ... */
  });
});
```

## Performance

- Paginate all list endpoints — never return unbounded arrays
- Select only needed columns — never `SELECT *` in the service layer
- Avoid N+1 queries — batch lookups or use joins

## Guardrails

- No HTTP concerns (status codes, headers) in the service layer
- No `any` in schemas — if the shape is unknown, use `z.unknown()` and document it
- Every endpoint must have an explicit auth requirement (even if it's `public`)
- Never log request bodies that may contain PII or credentials
- Validate path params and query params with the same strictness as body params

---
name: kernel-dev-api
description: "Designs and reviews the inbound API boundary: routes, RPC contracts, request/response schemas, middleware, validation, and error handling. Use when shaping how external requests enter the system through server endpoints or typed RPC surfaces."
license: MIT
compatibility: Any TypeScript server project with HTTP endpoints, server actions, or typed RPC boundaries.
metadata:
  author: project
  version: "1.0"
  category: Engineering
  tags:
    - api
    - boundary
    - server
    - rpc
    - http
    - typescript
    - rest
    - openapi
    - error-handling
    - middleware
when:
  - user is designing a new API endpoint, route, server action, or RPC contract
  - user is implementing request validation or boundary error handling
  - user is reviewing server boundary code for correctness or security
  - user is working with request/response schemas, RPC definitions, or middleware
  - user is adding authentication or authorization to an inbound server boundary
applicability:
  - Use when implementing any endpoint handler, route handler, or server boundary middleware
  - Use when writing request/response schemas or API contract types
  - Use when reviewing boundary code for security, correctness, or maintainability
  - Use when designing the error response envelope for an API surface
termination:
  - Boundary implementation has validation, explicit auth requirements, and consistent error handling
  - "Route handler is thin: validate → service → respond"
  - Tests cover happy path, validation rejection, and auth boundary
outputs:
  - Type-safe boundary route or action with schema validation
  - Consistent error response envelope
  - Auth-aware middleware chain
  - Integration tests for happy path, 422, and 401/403
---

Design the inbound server boundary so external requests enter the system through clear contracts, thin handlers, and explicit validation/auth rules.

## Standards

Use the repo's actual framework and boundary primitives. Prefer the project's documented routing, schema, and middleware patterns over generic defaults.

This skill owns the inbound boundary:

- request parsing and validation
- route or action shape
- middleware ordering
- auth/authz at the boundary
- response envelope consistency
- handoff from transport layer to service layer

It does not own end-to-end subsystem tracing (`kernel-audit-trace`), auth system design (`kernel-dev-auth`), test strategy (`kernel-dev-testing`), or general type-system rules (`kernel-dev-typescript`).

## Design Principles

- **Contract-first**: define request/response schemas before writing handlers
- **Type-safe end-to-end**: derive client types from the router; no manual duplication
- **Fail loudly**: invalid input → 422 immediately; never silently coerce bad data
- **Explicit errors**: every error has a stable code, human message, and HTTP status

## Boundary File Structure

```
routes/
  <resource>/
    index.ts       ← router: mounts handlers, applies middleware
    handlers.ts    ← thin handlers: validate → service → respond
    schema.ts      ← Zod schemas for request and response
    service.ts     ← business logic: no HTTP concerns
```

This is a model, not a mandatory folder layout. Match the repo's existing structure if one already exists.

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
- Prefer a typed client or shared contract when the stack supports it instead of duplicating request shapes manually

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
- Every endpoint or action must have an explicit auth requirement (even if it's `public`)
- Never log request bodies that may contain PII or credentials
- Validate path params and query params with the same strictness as body params

## Definition of done

- Tests describe behavior, not implementation
- Each test cleans up after itself
- The chosen test layer matches the confidence needed

Tests verify behavior, not implementation. A test that passes when behavior is broken is worse than no test.

## Standards

Use the repo's actual test runner, helpers, and conventions unless the task is explicitly about changing them.

This skill owns test design and test quality:

- what kind of test to write
- where the test should live
- what behavior the test should assert
- how to choose between mocks, fakes, and real dependencies
- how to make tests reliable, readable, and maintainable

[kernel-dev-build](../kernel-dev-build/WORKFLOW.md) owns pipeline execution and first-pass failure triage. [kernel-dev-testing](WORKFLOW.md) owns whether the tests themselves are well-designed.

## Choosing the layer

Choose the smallest test that can catch the real risk. Escalate to integration or E2E only when unit coverage would miss the behavior that matters. Test pure logic with direct assertions; avoid mocking internal modules unless a seam is truly required.

## Integration Tests

Test meaningful boundaries: HTTP handlers, persistence, queues, or service composition.

Use the real local database or service when the behavior under test is that boundary. Mock external providers (MSW-style) against a set of realistic scenarios before integrating with the real thing.

```typescript
import { createTestApp } from "@/test/helpers";
import { db } from "@/database";

describe("GET /api/users/:id", () => {
  let app: Awaited<ReturnType<typeof createTestApp>>;

  beforeAll(async () => {
    app = await createTestApp();
  });
  afterEach(async () => {
    await db.deleteFrom("users").execute();
  });

  it("returns the user when found", async () => {
    const user = await db
      .insertInto("users")
      .values({ email: "a@example.com", name: "Alice" })
      .returningAll()
      .executeTakeFirstOrThrow();

    const res = await app.request(`/api/users/${user.id}`, {
      headers: { Authorization: `Bearer ${testToken(user.id)}` },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe(user.id);
  });

  it("returns 404 when user does not exist", async () => {
    const res = await app.request("/api/users/nonexistent", {
      headers: { Authorization: `Bearer ${testToken("any-id")}` },
    });
    expect(res.status).toBe(404);
  });
});
```

## Test Data

Use factory functions — not hard-coded magic values.

```typescript
// test/factories.ts
export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: crypto.randomUUID(),
    email: `user-${Date.now()}@example.com`,
    name: "Test User",
    role: "standard",
    createdAt: new Date(),
    ...overrides,
  };
}
```

## Mocking

Mock at system boundaries when the boundary itself is not the subject of the test:

- External HTTP APIs — use `msw` or `nock`
- Email/SMS providers — mock the provider client
- Payment processors — mock the provider in unit and integration tests; when exercising the real integration, use the provider's test mode, never live keys

Avoid mocking internal business logic. Mocking the database or internal modules is a tradeoff, not a default: use it only when the test is intentionally unit-level and the abstraction boundary is clear.

## Coverage

- Track coverage as a signal — do not treat it as a goal
- Measure first, then set the CI floor just under the measured number so it can only ratchet up; never set a threshold you have not measured (see [tier-1 foundation](../project-quality-gates/references/tier-1-foundation.md))
- 100% coverage does not mean the tests are good; 60% with correct assertions is better than 100% with trivial ones
- Identify uncovered paths and ask: does this path need a test, or does the code need to be deleted?

## Guardrails

- Every test must fail for the right reason
- Tests that always pass regardless of behavior are worse than no tests — validate the failure path
- Do not use `setTimeout` or `sleep` in tests — use proper async patterns or fake timers
- Each test must clean up after itself — no test should depend on another test's side effects
- Treat flaky tests as real defects in the test or system; fix, quarantine with an explicit note, or remove them deliberately rather than silently normalizing them

# API Testing with Bun and Hono

This guide covers testing the CompliBot API using Bun's built-in test runner.

## Core Patterns

### 1. Basic Request Testing
Hono apps can be tested using the `app.request()` method, which accepts a standard `Request` object or a URL string.

```typescript
import { expect, test, describe } from "bun:test";
import app from "./index";

describe("Health Check", () => {
  test("GET /health returns 200", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ok");
  });
});
```

### 2. Type-Safe Testing (Recommended)
Use `testClient` for full TypeScript support and RPC-style calling.

```typescript
import { expect, test } from "bun:test";
import { testClient } from "hono/testing";
import app from "./index";

test("Type-safe Health Check", async () => {
  const client = testClient(app);
  const res = await client.health.$get();
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.status).toBe("ok");
});
```

### 3. Testing with Authentication
When testing protected routes, include the JWT in the headers.

```typescript
test("Protected route with auth", async () => {
  const token = "your-test-jwt";
  const res = await app.request("/api/projects", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(res.status).toBe(200);
});
```

### 4. Database Mocking/Seeding
For tests requiring database access:
- Use a dedicated test database (configured via `.env.test`).
- Seed before tests and truncate after.
- Or use transaction-based tests that rollback (if supported by the driver).

## Configuration
Ensure `api/package.json` has the test script:
```json
"scripts": {
  "test": "bun test"
}
```

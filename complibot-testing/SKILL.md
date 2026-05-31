---
name: complibot-testing
description: Standardized testing workflows for CompliBot. Covers Bun-based API testing and Vitest-based Portal testing. Use when adding new features, fixing bugs, or verifying system integrity across the API and Portal.
---

# CompliBot Testing

This skill provides standardized procedures for testing the CompliBot ecosystem, ensuring reliability across both the API and the Portal.

## Quick Start

### API Testing (Bun)
Run tests in the `api/` directory:
```bash
cd api && bun test
```
See [api-testing.md](references/api-testing.md) for patterns and examples.

### Portal Testing (Vitest)
Run tests in the `portal/` directory:
```bash
cd portal && npm test
```
See [portal-testing.md](references/portal-testing.md) for patterns and examples.

## Core Workflows

### 1. Verifying a New API Route
1. Implement the route in `api/src/routes/`.
2. Create a corresponding `.test.ts` file in the same directory (or a `__tests__` folder).
3. Use `testClient` to verify the route's behavior, including:
   - Success states (200 OK)
   - Validation errors (400 Bad Request)
   - Unauthorized access (401 Unauthorized)
4. Run `bun test` to verify.

### 2. Verifying a UI Component
1. Implement the component in `portal/src/components/`.
2. Create a `.test.tsx` file.
3. Use React Testing Library to verify:
   - Correct rendering of props.
   - User interaction handling (clicks, input).
   - Mocking of external dependencies (hooks, APIs).
4. Run `npm test` to verify.

## Guidelines

- **No placeholders**: Tests must be complete and verify actual behavior.
- **Strict Types**: Use TypeScript in all test files.
- **Mocking**: Mock external services (e.g., OpenAI API) to keep tests fast and deterministic.
- **Environment**: Always use `.env.test` for database-dependent tests.

## Resources

- [API Testing Patterns](references/api-testing.md)
- [Portal Testing Patterns](references/portal-testing.md)

# Portal Testing with Vitest and React Testing Library

This guide covers testing the CompliBot Portal (Next.js 14) using Vitest.

## Core Patterns

### 1. Client Component Testing
Use React Testing Library to render and interact with components.

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import Button from '@/components/ui/button';

test('Button triggers onClick', async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Click Me</Button>);
  
  const button = screen.getByRole('button', { name: /click me/i });
  await user.click(button);
  
  expect(onClick).toHaveBeenCalledOnce();
});
```

### 2. Mocking Next.js APIs
Mock `next/navigation` for components using routing hooks.

```tsx
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/',
}));
```

### 3. Server Component Testing (Synchronous)
Synchronous server components can be tested like regular components.

### 4. Async Server Component Testing (Data Fetching)
For components that fetch data, it's often better to test the underlying service or use Playwright for E2E. If unit testing, you may need to mock the data fetching layer.

## Configuration

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

### src/test/setup.ts
```typescript
import '@testing-library/jest-dom/vitest';
```

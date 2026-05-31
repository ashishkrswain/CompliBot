import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Button } from './button';

test('Button renders children', () => {
  render(<Button>Click Me</Button>);
  expect(screen.getByText(/click me/i)).toBeInTheDocument();
});

test('Button triggers onClick when clicked', async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Click Me</Button>);
  
  const button = screen.getByRole('button', { name: /click me/i });
  await user.click(button);
  
  expect(onClick).toHaveBeenCalledOnce();
});

test('Button is disabled when disabled prop is true', () => {
  render(<Button disabled>Disabled Button</Button>);
  const button = screen.getByRole('button', { name: /disabled button/i });
  expect(button).toBeDisabled();
});

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  // Vitest globals are disabled, so Testing Library cannot register its own cleanup.
  cleanup();
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());

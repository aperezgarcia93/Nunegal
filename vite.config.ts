import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: [...configDefaults.exclude, 'tests/e2e/**'],
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    maxWorkers: 2,
    restoreMocks: true,
    clearMocks: true,
  },
});

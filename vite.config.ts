import { configDefaults, defineConfig } from 'vitest/config';
import { loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_API_BASE_URL = 'https://itx-frontend-test.onrender.com';

/**
 * Adds a restrictive Content-Security-Policy to the production HTML only; the dev server
 * needs inline scripts for fast refresh. The API origin is the only remote origin allowed
 * for data and product images (images from other origins are already rejected by the client).
 */
function contentSecurityPolicy(apiBaseUrl: string): Plugin {
  const apiOrigin = new URL(apiBaseUrl).origin;
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    `img-src 'self' ${apiOrigin}`,
    `connect-src 'self' ${apiOrigin}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml: () => [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: policy }, injectTo: 'head-prepend' }],
  };
}

export default defineConfig(({ mode }) => {
  const apiBaseUrl = loadEnv(mode, process.cwd(), 'VITE_').VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;
  return {
    plugins: [react(), contentSecurityPolicy(apiBaseUrl)],
    test: {
      include: ['src/**/*.test.{ts,tsx}'],
      exclude: [...configDefaults.exclude, 'tests/e2e/**'],
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      maxWorkers: 2,
      restoreMocks: true,
      clearMocks: true,
    },
  };
});

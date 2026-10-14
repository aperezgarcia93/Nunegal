import type { Page, Request } from '@playwright/test';
import { rawProductDetail, rawProductList } from '../fixtures/products';

export const api = 'https://itx-frontend-test.onrender.com';
export const CART_KEY = 'nunegal:cart-count:v1';

export interface ApiLog { list: number; detail: number; posts: unknown[] }

/**
 * Intercepts every request to the supplied API so browser tests never reach the live service.
 * Unhandled API paths fail loudly with 501.
 */
export async function mockApi(page: Page, overrides: {
  list?: Parameters<Page['route']>[1];
  detail?: Parameters<Page['route']>[1];
  cart?: Parameters<Page['route']>[1];
} = {}): Promise<ApiLog> {
  const log: ApiLog = { list: 0, detail: 0, posts: [] };
  await page.route(`${api}/**`, async (route) => {
    const request: Request = route.request();
    const { pathname } = new URL(request.url());
    if (pathname === '/api/product' && request.method() === 'GET') {
      log.list += 1;
      return overrides.list ? overrides.list(route, request) : route.fulfill({ json: rawProductList });
    }
    if (pathname.startsWith('/api/product/') && request.method() === 'GET') {
      log.detail += 1;
      if (overrides.detail) return overrides.detail(route, request);
      const id = decodeURIComponent(pathname.slice('/api/product/'.length));
      const match = rawProductList.find((item) => item.id === id);
      if (!match) return route.fulfill({ status: 404, json: { message: 'Not found' } });
      return route.fulfill({ json: id === rawProductDetail.id ? rawProductDetail : { ...rawProductDetail, ...match } });
    }
    if (pathname === '/api/cart' && request.method() === 'POST') {
      log.posts.push(request.postDataJSON());
      return overrides.cart ? overrides.cart(route, request) : route.fulfill({ json: { count: log.posts.length } });
    }
    if (pathname.startsWith('/images/')) return route.fulfill({ status: 404 });
    return route.fulfill({ status: 501, body: 'Unhandled API request in test' });
  });
  return log;
}

export async function seedCartCount(page: Page, count: number) {
  await page.addInitScript(([key, value]) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem(key as string, JSON.stringify({ version: 1, count: value }));
      sessionStorage.setItem('seeded', '1');
    }
  }, [CART_KEY, count] as const);
}

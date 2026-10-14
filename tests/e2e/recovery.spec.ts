import { expect, test } from '@playwright/test';
import { rawProductDetail, rawProductList } from '../fixtures/products';
import { mockApi, seedCartCount } from './support';

test('recovers from a failed catalog request with a manual retry', async ({ page }) => {
  let fail = true;
  const log = await mockApi(page, {
    list: (route) => fail ? route.fulfill({ status: 503, body: 'down' }) : route.fulfill({ json: rawProductList }),
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('The service returned an error.');
  fail = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('link', { name: /^View / })).toHaveCount(37);
  expect(log.list).toBe(2);
});

test('recovers from a failed detail request with a manual retry', async ({ page }) => {
  let fail = true;
  await mockApi(page, {
    detail: (route) => fail ? route.abort('failed') : route.fulfill({ json: rawProductDetail }),
  });
  await page.goto(`/products/${rawProductDetail.id}`);
  await expect(page.getByRole('alert')).toContainText('The service could not be reached.');
  await expect(page.getByRole('button', { name: 'Add to cart' })).toHaveCount(0);
  fail = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Iconia Talk S' })).toBeVisible();
});

test('blocks a second addition while one is pending, even after navigating to another product', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>((done) => { release = done; });
  const log = await mockApi(page, { cart: async (route) => { await gate; await route.fulfill({ json: { count: 1 } }); } });
  await page.goto(`/products/${rawProductDetail.id}`);
  await page.getByRole('radio', { name: '32 GB' }).check();
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByRole('button', { name: 'Adding…' })).toBeDisabled();

  await page.getByRole('link', { name: '← Back to catalog' }).click();
  await page.getByRole('link', { name: 'View Acer Phone Model 2', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Phone Model 2', exact: true })).toBeVisible();
  // The pending addition is global: product B cannot change options or submit until it settles.
  await expect(page.getByRole('radio', { name: '16 GB' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Adding…' })).toBeDisabled();

  release();
  await expect(page.getByLabel('Cart items: 1')).toBeVisible();
  // The late success for product A does not disturb product B's choices.
  await expect(page.getByRole('radio', { name: '16 GB' })).not.toBeChecked();
  await expect(page.getByRole('radio', { name: '32 GB' })).not.toBeChecked();
  await page.getByRole('radio', { name: '16 GB' }).check();
  await expect(page.getByRole('button', { name: 'Add to cart' })).toBeEnabled();
  expect(log.posts).toEqual([{ id: rawProductDetail.id, colorCode: 1000, storageCode: 2001 }]);
});

test('keeps the count and warns on a malformed cart response or lost connection, without replaying', async ({ page }) => {
  await seedCartCount(page, 4);
  const responses = ['malformed', 'abort'];
  const log = await mockApi(page, {
    cart: (route) => responses.shift() === 'malformed' ? route.fulfill({ json: { total: 9 } }) : route.abort('timedout'),
  });
  await page.goto(`/products/${rawProductDetail.id}`);
  await page.getByRole('radio', { name: '32 GB' }).check();
  const warning = page.getByRole('status').filter({ hasText: 'We could not confirm the addition.' });

  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(warning).toBeAttached();
  await expect(page.getByLabel('Cart items: 4')).toBeVisible();
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByRole('button', { name: 'Add to cart' })).toBeEnabled();
  await expect(warning).toBeAttached();
  await expect(page.getByLabel('Cart items: 4')).toBeVisible();
  await expect(page.getByRole('radio', { name: '32 GB' })).toBeChecked();
  expect(log.posts).toHaveLength(2);
});

test('never shows a late earlier product after navigating to another one', async ({ page }) => {
  let releaseA!: () => void;
  const gateA = new Promise<void>((done) => { releaseA = done; });
  await mockApi(page, {
    detail: async (route, request) => {
      const id = decodeURIComponent(new URL(request.url()).pathname.split('/').pop()!);
      const match = rawProductList.find((item) => item.id === id)!;
      if (id === rawProductDetail.id) await gateA;
      await route.fulfill({ json: id === rawProductDetail.id ? rawProductDetail : { ...rawProductDetail, ...match } });
    },
  });
  await page.goto(`/products/${rawProductDetail.id}`);
  await expect(page.getByText('Loading product details…')).toBeVisible();
  await page.getByRole('link', { name: '← Back to catalog' }).click();
  await page.getByRole('link', { name: 'View Acer Phone Model 2', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Phone Model 2', exact: true })).toBeVisible();
  releaseA();
  await page.waitForTimeout(200);
  await expect(page.getByRole('heading', { level: 1, name: 'Phone Model 2', exact: true })).toBeVisible();
  await expect(page.getByText('Iconia Talk S')).toHaveCount(0);
});

test('reuses cached products across reloads and refetches after one hour while keeping the cart count', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-13T10:00:00Z') });
  await seedCartCount(page, 6);
  const log = await mockApi(page);
  await page.goto('/');
  await expect(page.getByRole('link', { name: /^View / })).toHaveCount(37);
  await page.reload();
  await expect(page.getByRole('link', { name: /^View / })).toHaveCount(37);
  expect(log.list).toBe(1);

  await page.clock.setSystemTime(new Date('2026-10-13T10:59:59Z'));
  await page.reload();
  await expect(page.getByRole('link', { name: /^View / })).toHaveCount(37);
  expect(log.list).toBe(1);

  await page.clock.setSystemTime(new Date('2026-10-13T11:00:30Z'));
  await page.reload();
  await expect(page.getByRole('link', { name: /^View / })).toHaveCount(37);
  expect(log.list).toBe(2);
  await expect(page.getByLabel('Cart items: 6')).toBeVisible();
});

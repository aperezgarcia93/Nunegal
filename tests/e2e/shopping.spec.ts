import { expect, test } from '@playwright/test';
import { rawProductDetail } from '../fixtures/products';
import { mockApi, seedCartCount } from './support';

const catalogHeading = { name: 'Find your next device.' };

test('searches, opens a product, adds exact options, and restores the returned count', async ({ page }) => {
  await seedCartCount(page, 7);
  const log = await mockApi(page, { cart: (route) => route.fulfill({ json: { count: 3 } }) });

  await page.goto('/');
  await expect(page.getByRole('heading', catalogHeading)).toBeVisible();
  await expect(page.getByRole('link', { name: /^View / })).toHaveCount(37);
  await page.getByRole('searchbox', { name: 'Search by brand or model' }).fill('Talk S');
  await expect(page.getByRole('link', { name: /^View / })).toHaveCount(1);
  await page.getByRole('searchbox', { name: 'Search by brand or model' }).fill('');
  await expect(page.getByRole('link', { name: /^View / })).toHaveCount(37);
  expect(log.list).toBe(1);

  await page.getByRole('searchbox', { name: 'Search by brand or model' }).fill('Talk S');
  await page.getByRole('link', { name: 'View Acer Iconia Talk S' }).click();
  await expect(page).toHaveURL(new RegExp(`/products/${rawProductDetail.id}$`));
  await expect(page.getByRole('heading', { level: 1, name: 'Iconia Talk S' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Acer Iconia Talk S');
  await expect(page.getByLabel('Cart items: 7')).toBeVisible();
  // The sole color is preselected; storage has two options and must be chosen.
  await expect(page.getByLabel('Color')).toHaveValue('0');
  await expect(page.getByRole('button', { name: 'Add to cart' })).toBeDisabled();
  await page.getByLabel('Storage').selectOption({ label: '32 GB' });
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Acer Iconia Talk S added to your cart.' })).toBeAttached();
  // A lower count from the service replaces the stored one.
  await expect(page.getByLabel('Cart items: 3')).toBeVisible();
  expect(log.posts).toEqual([{ id: rawProductDetail.id, colorCode: 1000, storageCode: 2001 }]);
  await expect(page.getByLabel('Storage')).toHaveValue('1');

  // Direct refresh of a client route: served by the SPA fallback, detail and count come from storage.
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Iconia Talk S' })).toBeVisible();
  await expect(page.getByLabel('Cart items: 3')).toBeVisible();
  expect(log.detail).toBe(1);

  await page.getByRole('link', { name: '← Back to catalog' }).click();
  await expect(page.getByRole('heading', catalogHeading)).toBeVisible();
  await expect(page.getByLabel('Cart items: 3')).toBeVisible();
  expect(log.list).toBe(1);
});

test('accepts a zero count and repeats a deliberate addition with a new request each time', async ({ page }) => {
  await seedCartCount(page, 5);
  const counts = [0, 1];
  const log = await mockApi(page, { cart: (route) => route.fulfill({ json: { count: counts.shift() } }) });
  await page.goto(`/products/${rawProductDetail.id}`);
  await page.getByLabel('Storage').selectOption({ label: '16 GB' });
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByLabel('Cart items: 0')).toBeVisible();
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByLabel('Cart items: 1')).toBeVisible();
  expect(log.posts).toHaveLength(2);
});

test('supports browser history and the header home link', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  await page.getByRole('link', { name: 'View Acer Iconia Talk S' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Iconia Talk S' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', catalogHeading)).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1, name: 'Iconia Talk S' })).toBeVisible();
  await page.getByRole('link', { name: 'Device Shop home' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', catalogHeading)).toBeVisible();
});

test('direct entry to a product offers a return link to the catalog', async ({ page }) => {
  await mockApi(page);
  await page.goto('/products/fixture-2');
  await expect(page.getByRole('heading', { level: 1, name: 'Phone Model 2', exact: true })).toBeVisible();
  await page.getByRole('link', { name: '← Back to catalog' }).click();
  await expect(page.getByRole('heading', catalogHeading)).toBeVisible();
});

test('shows an unavailable product for an unknown identity without purchase controls', async ({ page }) => {
  await mockApi(page);
  await page.goto('/products/does-not-exist');
  await expect(page.getByRole('heading', { name: 'Product unavailable' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add to cart' })).toHaveCount(0);
});

test('keeps the shared shell available on an unknown route', async ({ page }) => {
  await mockApi(page);
  await page.goto('/not-a-commerce-page');
  await expect(page.getByRole('heading', { name: 'Let’s get you back.' })).toBeVisible();
  await expect(page.getByLabel('Cart items: 0')).toBeVisible();
  await page.getByRole('link', { name: 'Go to catalog' }).click();
  await expect(page.getByRole('heading', catalogHeading)).toBeVisible();
});

test('completes the purchase journey with the keyboard only', async ({ page, browserName }) => {
  // WebKit skips links on Tab unless the macOS "Press Tab to highlight each item" preference is on.
  test.skip(browserName === 'webkit', 'WebKit does not tab to links by default');
  const log = await mockApi(page);
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Search by brand or model' }).focus();
  await page.keyboard.type('Talk S');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'View Acer Iconia Talk S' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'Iconia Talk S' })).toBeFocused();
  await page.getByLabel('Storage').focus();
  await page.getByLabel('Storage').selectOption({ label: '32 GB' });
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Add to cart' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Cart items: 1')).toBeVisible();
  expect(log.posts).toHaveLength(1);
});

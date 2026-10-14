import { expect, test } from '@playwright/test';
import { productList, rawProductDetail } from '../fixtures/products';

const api = 'https://itx-frontend-test.onrender.com';
const rawList = productList.map(({ id, brand, model, priceText, imageUrl }) => ({
  id, brand, model, price: priceText ?? '', imgUrl: imageUrl ?? '',
}));

test('searches, opens a direct product, adds exact options, and restores returned count', async ({ page }) => {
  let listReads = 0;
  let detailReads = 0;
  await page.addInitScript(() => {
    if (!localStorage.getItem('nunegal:cart-count:v1')) {
      localStorage.setItem('nunegal:cart-count:v1', JSON.stringify({ version: 1, count: 7 }));
    }
  });
  await page.route(`${api}/api/product`, async (route) => {
    listReads += 1;
    await route.fulfill({ json: rawList });
  });
  await page.route(`${api}/api/product/${rawProductDetail.id}`, async (route) => {
    detailReads += 1;
    await route.fulfill({ json: rawProductDetail });
  });
  let posted: unknown;
  await page.route(`${api}/api/cart`, async (route) => {
    posted = route.request().postDataJSON();
    await route.fulfill({ json: { count: 3 } });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Find your next device.' })).toBeVisible();
  await expect(page.getByRole('link', { name: /^View / })).toHaveCount(37);
  await page.getByRole('searchbox', { name: 'Search by brand or model' }).fill('Talk S');
  await expect(page.getByRole('link', { name: 'View Acer Iconia Talk S' })).toBeVisible();
  await expect(page.getByRole('link', { name: /^View / })).toHaveCount(1);
  expect(listReads).toBe(1);

  await page.getByRole('link', { name: 'View Acer Iconia Talk S' }).click();
  await expect(page).toHaveURL(new RegExp(`/products/${rawProductDetail.id}$`));
  await expect(page.getByLabel('Cart items: 7')).toBeVisible();
  await page.getByLabel('Storage').selectOption({ label: '32 GB' });
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByText('Acer Iconia Talk S added to your cart.')).toBeVisible();
  await expect(page.getByLabel('Cart items: 3')).toBeVisible();
  expect(posted).toEqual({ id: rawProductDetail.id, colorCode: 1000, storageCode: 2001 });

  await page.reload();
  await expect(page.getByLabel('Cart items: 3')).toBeVisible();
  expect(detailReads).toBe(1);
  await page.getByRole('link', { name: '← Back to catalog' }).click();
  await expect(page.getByRole('heading', { name: 'Find your next device.' })).toBeVisible();
  await expect(page.getByLabel('Cart items: 3')).toBeVisible();
  expect(listReads).toBe(1);
});

test('keeps the shared shell available on an unknown route', async ({ page }) => {
  await page.goto('/not-a-commerce-page');
  await expect(page.getByRole('heading', { name: 'Let’s get you back.' })).toBeVisible();
  await page.getByRole('link', { name: 'Go to catalog' }).click();
  await expect(page.getByRole('heading', { name: 'Find your next device.' })).toBeVisible();
});

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { rawProductDetail } from '../fixtures/products';
import { mockApi } from './support';

const pages = [
  { name: 'catalog', path: '/' },
  { name: 'product detail', path: `/products/${rawProductDetail.id}` },
  { name: 'unknown route', path: '/missing-page' },
];

for (const { name, path } of pages) {
  test(`${name} has no detectable WCAG A/AA violations`, async ({ page }) => {
    await mockApi(page);
    await page.goto(path);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.getByText(/Loading/)).toHaveCount(0);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations.map(({ id, nodes }) => `${id}: ${nodes.map((node) => node.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}

const viewports = [
  { width: 320, height: 720, columns: 1 },
  // 640 CSS px is the reflow width of a 1280 px window at 200% zoom.
  { width: 640, height: 900, columns: 2 },
  { width: 768, height: 1024, columns: 3 },
  { width: 1280, height: 900, columns: 4 },
];

for (const { width, height, columns } of viewports) {
  test(`renders without horizontal overflow at ${width}px with ${columns} catalog column(s)`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await mockApi(page);
    await page.goto('/');
    const cards = page.getByRole('link', { name: /^View / });
    await expect(cards).toHaveCount(37);
    const lefts = await cards.evaluateAll((links) => links.slice(0, 8).map((link) => Math.round(link.getBoundingClientRect().left)));
    expect(new Set(lefts).size).toBe(columns);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    await page.goto(`/products/${rawProductDetail.id}`);
    await expect(page.getByRole('heading', { level: 1, name: 'Iconia Talk S' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const image = await page.getByRole('img', { name: 'Acer Iconia Talk S image unavailable' }).boundingBox();
    const heading = await page.getByRole('heading', { level: 1 }).boundingBox();
    // Image left of details on wide screens, stacked above them on narrow ones.
    if (width >= 1280) expect(image!.x + image!.width).toBeLessThanOrEqual(heading!.x);
    else if (width <= 760) expect(image!.y + image!.height).toBeLessThanOrEqual(heading!.y);
    await page.screenshot({ path: `test-results/screenshots/${test.info().project.name}-pdp-${width}.png`, fullPage: true });
  });
}

test('keeps a visible focus indicator on the search field', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: 'Search by brand or model' });
  await search.focus();
  const outline = await search.evaluate((input) => getComputedStyle(input.parentElement!).outlineStyle);
  expect(outline).toBe('solid');
});

test('runs without uncaught errors or CSP violations in the production build', async ({ page }) => {
  const problems: string[] = [];
  page.on('pageerror', (error) => problems.push(error.message));
  page.on('console', (message) => {
    const text = message.text();
    if (message.type() !== 'error' || /Failed to load resource/.test(text)) return;
    problems.push(text);
  });
  await mockApi(page);
  await page.goto('/');
  await expect(page.getByRole('link', { name: /^View / })).toHaveCount(37);
  await page.getByRole('link', { name: 'View Acer Iconia Talk S' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Iconia Talk S' })).toBeVisible();
  expect(await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content')).toContain("script-src 'self'");
  expect(problems).toEqual([]);
});

test('plays card and button motion only when the visitor has not asked to reduce it', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  const card = page.locator('article').filter({ has: page.getByRole('link', { name: 'View Acer Iconia Talk S' }) });
  const motion = () => card.evaluate((element) => {
    const style = getComputedStyle(element);
    return { duration: style.transitionDuration.split(',').map((value) => parseFloat(value)), transform: style.transform };
  });

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  expect((await motion()).duration.every((seconds) => seconds > 0 && seconds <= 0.5)).toBe(true);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await card.hover();
  expect(await motion()).toEqual({ duration: [0], transform: 'none' });
});

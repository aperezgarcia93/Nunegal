import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { productApi } from '../features/catalog/api/productApi';
import type { ProductDetail } from '../features/catalog/model/product';
import { productDetail, productList } from '../../tests/fixtures/products';
import { renderApp } from '../../tests/renderApp';

describe('application shell', () => {
  it('shows a home link, catalog breadcrumb, stored count, and document title on the catalog', async () => {
    localStorage.setItem('nunegal:cart-count:v1', JSON.stringify({ version: 1, count: 4 }));
    vi.spyOn(productApi, 'getList').mockResolvedValue(productList);
    renderApp('/');
    expect(await screen.findByRole('heading', { name: 'Find your next device.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Device Shop home' })).toHaveAttribute('href', '/');
    const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(crumbs).getByText('Catalog')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('group', { name: 'Cart items: 4' })).toBeInTheDocument();
    expect(document.title).toBe('Device Shop · Mobile devices');
  });

  it('names the product in the breadcrumb and title only once its own detail is loaded', async () => {
    let resolve!: (value: ProductDetail) => void;
    vi.spyOn(productApi, 'getDetail').mockReturnValue(new Promise((done) => { resolve = done; }));
    renderApp(`/products/${productDetail.id}`);
    const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(crumbs).getByText('Product details')).toHaveAttribute('aria-current', 'page');
    expect(within(crumbs).getByRole('link', { name: 'Catalog' })).toHaveAttribute('href', '/');
    resolve(productDetail);
    expect(await within(crumbs).findByText('Acer Iconia Talk S')).toHaveAttribute('aria-current', 'page');
    expect(document.title).toBe('Acer Iconia Talk S · Device Shop');
    expect(screen.getByRole('heading', { level: 1, name: 'Iconia Talk S' })).toHaveFocus();
  });

  it('keeps navigation on an unknown route and returns to the catalog', async () => {
    vi.spyOn(productApi, 'getList').mockResolvedValue(productList);
    const { user } = renderApp('/checkout');
    expect(screen.getByRole('heading', { name: 'Let’s get you back.' })).toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getByText('Page not found')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Go to catalog' }));
    expect(await screen.findByRole('heading', { name: 'Find your next device.' })).toBeInTheDocument();
  });

  it('recovers from an unexpected render failure by navigating back to the catalog', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const silenceExpectedError = (event: ErrorEvent) => event.preventDefault();
    window.addEventListener('error', silenceExpectedError);
    vi.spyOn(productApi, 'getList').mockResolvedValue(productList);
    // A detail that passed an incorrect cache/validation boundary and crashes the view.
    vi.spyOn(productApi, 'getDetail').mockResolvedValue({ ...productDetail, attributes: undefined } as unknown as ProductDetail);
    const { user } = renderApp(`/products/${productDetail.id}`);
    expect(await screen.findByRole('heading', { name: 'Something went wrong.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Device Shop home' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Go to catalog' }));
    expect(await screen.findByRole('heading', { name: 'Find your next device.' })).toBeInTheDocument();
    window.removeEventListener('error', silenceExpectedError);
  });
});

import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { HttpError } from '../../../shared/api/http';
import { productApi } from '../api/productApi';
import type { ProductDetail } from '../model/product';
import { productDetail, productList } from '../../../../tests/fixtures/products';
import { renderApp } from '../../../../tests/renderApp';
import { server } from '../../../../tests/mocks/server';

const cartUrl = 'https://itx-frontend-test.onrender.com/api/cart';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

describe('product detail page', () => {
  it('shows image beside details, description before purchase actions, and a catalog return link', async () => {
    vi.spyOn(productApi, 'getDetail').mockResolvedValue(productDetail);
    renderApp(`/products/${productDetail.id}`);
    const heading = await screen.findByRole('heading', { level: 1, name: 'Iconia Talk S' });
    expect(screen.getByRole('img', { name: 'Acer Iconia Talk S' })).toHaveAttribute('loading', 'eager');
    expect(screen.getByText('170')).toBeInTheDocument();
    const description = screen.getByText('Screen resolution');
    const actions = screen.getByRole('heading', { name: 'Choose your options' });
    expect(description.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(heading).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Back to catalog' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('group', { name: 'Color' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Black' })).toBeChecked();
    for (const radio of within(screen.getByRole('group', { name: 'Storage' })).getAllByRole('radio')) expect(radio).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Add to cart' })).toHaveAccessibleDescription('Choose a storage option to continue.');
  });

  it('shows a verified not-found product without purchase controls', async () => {
    vi.spyOn(productApi, 'getDetail').mockRejectedValue(new HttpError('http', 'The service returned an error.', 404));
    renderApp('/products/missing');
    expect(await screen.findByRole('heading', { name: 'Product unavailable' })).toBeInTheDocument();
    expect(screen.getByText('This product is no longer available.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add to cart' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Back to catalog' })).toBeInTheDocument();
  });

  it('recovers from a failed detail request with a manual retry', async () => {
    const getDetail = vi.spyOn(productApi, 'getDetail')
      .mockRejectedValueOnce(new HttpError('timeout', 'The service took too long to respond.'))
      .mockResolvedValueOnce(productDetail);
    const { user } = renderApp(`/products/${productDetail.id}`);
    expect(await screen.findByRole('alert')).toHaveTextContent('The service took too long to respond.');
    expect(screen.queryByRole('button', { name: 'Add to cart' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Iconia Talk S' })).toBeInTheDocument();
    expect(getDetail).toHaveBeenCalledTimes(2);
  });

  it('keeps a blank-price product purchasable but blocks malformed options with an associated explanation', async () => {
    const cartHandler = vi.fn(() => HttpResponse.json({ count: 1 }));
    server.use(http.post(cartUrl, cartHandler));
    vi.spyOn(productApi, 'getDetail').mockImplementation(async (id) => id === 'blank-price'
      ? { ...productDetail, id, priceText: null, storages: [productDetail.storages[0]!] }
      : { ...productDetail, id, colors: [], purchaseUnavailableReason: 'Purchasing options are unavailable for this product.' });

    const { user, unmount } = renderApp('/products/blank-price');
    expect(await screen.findByText('Price unavailable')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add to cart' }));
    expect(await screen.findByText('Acer Iconia Talk S added to your cart.')).toBeInTheDocument();
    expect(cartHandler).toHaveBeenCalledTimes(1);
    unmount();

    renderApp('/products/broken-options');
    const add = await screen.findByRole('button', { name: 'Add to cart' });
    expect(add).toBeDisabled();
    expect(add).toHaveAccessibleDescription('Purchasing options are unavailable for this product.');
    expect(screen.getByRole('group', { name: 'Color' })).toBeDisabled();
  });

  it('never shows a late earlier product after navigating to another one', async () => {
    vi.spyOn(productApi, 'getList').mockResolvedValue(productList);
    const pending = new Map([['ZmGrkLRPXOTpxsU4jjAcv', deferred<ProductDetail>()], ['fixture-2', deferred<ProductDetail>()]]);
    vi.spyOn(productApi, 'getDetail').mockImplementation((id) => pending.get(id)!.promise);
    const { user } = renderApp('/products/ZmGrkLRPXOTpxsU4jjAcv');
    await user.click(screen.getByRole('link', { name: '← Back to catalog' }));
    await user.click(await screen.findByRole('link', { name: 'View Acer Phone Model 2' }));
    pending.get('fixture-2')!.resolve({ ...productDetail, id: 'fixture-2', model: 'Phone Model 2', priceText: null });
    expect(await screen.findByRole('heading', { level: 1, name: 'Phone Model 2' })).toBeInTheDocument();
    pending.get('ZmGrkLRPXOTpxsU4jjAcv')!.resolve(productDetail);
    await Promise.resolve();
    expect(screen.getByRole('heading', { level: 1, name: 'Phone Model 2' })).toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getByText('Acer Phone Model 2')).toBeInTheDocument();
    expect(screen.queryByText('Iconia Talk S')).not.toBeInTheDocument();
  });
});

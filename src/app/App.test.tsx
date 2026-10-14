import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { http, HttpResponse } from 'msw';
import { server } from '../../tests/mocks/server';
import { productList } from '../../tests/fixtures/products';

describe('shopping navigation', () => {
  it('shows the catalog, filters locally, opens a product, and returns home', async () => {
    localStorage.clear();
    server.use(http.get('https://itx-frontend-test.onrender.com/api/product', () => HttpResponse.json(productList)));
    localStorage.setItem('nunegal:cart-count:v1', JSON.stringify({ version: 1, count: 7 }));
    let postedBody: unknown;
    const cartHandler = vi.fn(async ({ request }: { request: Request }) => {
      postedBody = await request.json();
      return HttpResponse.json({ count: 3 });
    });
    server.use(http.post('https://itx-frontend-test.onrender.com/api/cart', cartHandler));
    expect(productList).toHaveLength(37);
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: 'Find your next device.' })).toBeInTheDocument();
    expect(await screen.findAllByRole('link', { name: /View / })).toHaveLength(37);
    await user.type(screen.getByRole('searchbox', { name: 'Search by brand or model' }), 'Talk S');
    expect(screen.getAllByRole('link', { name: /View / })).toHaveLength(1);
    await user.click(screen.getByRole('link', { name: 'View Acer Iconia Talk S' }));
    expect(await screen.findByRole('heading', { name: 'Iconia Talk S' })).toBeInTheDocument();
    expect(screen.getByText('Screen resolution')).toBeInTheDocument();
    expect(screen.getByLabelText('Cart items: 7')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Storage'), '1');
    await user.click(screen.getByRole('button', { name: 'Add to cart' }));
    expect(await screen.findByText('Acer Iconia Talk S added to your cart.')).toBeInTheDocument();
    expect(postedBody).toEqual({ id: 'ZmGrkLRPXOTpxsU4jjAcv', colorCode: 1000, storageCode: 2001 });
    expect(screen.getByLabelText('Cart items: 3')).toBeInTheDocument();
    expect(cartHandler).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('link', { name: '← Back to catalog' }));
    expect(await screen.findByRole('heading', { name: 'Find your next device.' })).toBeInTheDocument();
    expect(screen.getByLabelText('Cart items: 3')).toBeInTheDocument();
  });
});

import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HttpError } from '../../../shared/api/http';
import { productApi } from '../api/productApi';
import { productList } from '../../../../tests/fixtures/products';
import { renderApp } from '../../../../tests/renderApp';

describe('product list page', () => {
  it('renders every product in service order and filters without new requests', async () => {
    const getList = vi.spyOn(productApi, 'getList').mockResolvedValue(productList);
    const { user } = renderApp('/');
    const links = await screen.findAllByRole('link', { name: /^View / });
    expect(links).toHaveLength(37);
    expect(links[0]).toHaveAccessibleName('View Acer Iconia Talk S');
    expect(links[36]).toHaveAccessibleName('View Alcatel Phone Model 37');
    expect(screen.getByText('37 devices')).toBeInTheDocument();

    const search = screen.getByRole('searchbox', { name: 'Search by brand or model' });
    await user.type(search, 'alcatel');
    expect(screen.getAllByRole('link', { name: /^View / })).toHaveLength(18);
    await user.clear(search);
    await user.type(search, 'no such phone');
    expect(screen.getByText('No devices match your search.')).toBeInTheDocument();
    await user.clear(search);
    expect(screen.getAllByRole('link', { name: /^View / })).toHaveLength(37);
    expect(getList).toHaveBeenCalledTimes(1);
  });

  it('distinguishes an empty catalog from a failed one and recovers on retry', async () => {
    const getList = vi.spyOn(productApi, 'getList')
      .mockRejectedValueOnce(new HttpError('network', 'The service could not be reached.'))
      .mockResolvedValueOnce([]);
    const { user } = renderApp('/');
    expect(await screen.findByRole('alert')).toHaveTextContent('The service could not be reached.');
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('No devices are available right now.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(getList).toHaveBeenCalledTimes(2);
  });

  it('announces loading while the list is pending', () => {
    vi.spyOn(productApi, 'getList').mockReturnValue(new Promise(() => undefined));
    renderApp('/');
    expect(screen.getByText('Loading devices…')).toHaveAttribute('role', 'status');
  });
});

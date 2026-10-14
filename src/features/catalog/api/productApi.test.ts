import { describe, expect, it, vi } from 'vitest';
import { ProductApi } from './productApi';
import { HttpClient } from '../../../shared/api/http';
import { ProductCache } from '../../../shared/cache/productCache';
import { SafeStorage } from '../../../shared/storage/safeStorage';

describe('product API', () => {
  it('coalesces list reads, normalizes the result, and does not share it with detail', async () => {
    const fetcher = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      const body = url.endsWith('/api/product')
        ? [{ id: 'a/b', brand: 'Acer', model: 'One', price: '', imgUrl: 'https://itx-frontend-test.onrender.com/a.jpg' }]
        : { id: 'a/b', options: { colors: [{ code: 2, name: 'Black' }], storages: [{ code: 4, name: '8 GB' }] } };
      return new Response(JSON.stringify(body), { status: 200 });
    });
    const base = 'https://itx-frontend-test.onrender.com';
    const storage = new SafeStorage(() => { throw new Error('storage disabled'); });
    const api = new ProductApi(new HttpClient(base, fetcher), new ProductCache(base, storage));
    const [first, second] = await Promise.all([api.getList(), api.getList()]);
    expect(first).toEqual(second);
    expect(fetcher).toHaveBeenCalledTimes(1);
    await api.getDetail('a/b');
    expect(String(fetcher.mock.calls[1]?.[0])).toContain('/api/product/a%2Fb');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

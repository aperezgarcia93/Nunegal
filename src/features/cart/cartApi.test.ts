import { describe, expect, it, vi } from 'vitest';
import { CartApi } from './cartApi';

describe('cart API', () => {
  it('sends the exact selected codes and accepts an authoritative zero count', async () => {
    const post = vi.fn().mockResolvedValue({ count: 0 });
    const api = new CartApi({ post } as never);
    await expect(api.add({ id: 'opaque', colorCode: 0, storageCode: 2001 })).resolves.toBe(0);
    expect(post).toHaveBeenCalledWith('/api/cart', { id: 'opaque', colorCode: 0, storageCode: 2001 });
  });

  it('rejects an invalid count as an unconfirmed response', async () => {
    const api = new CartApi({ post: vi.fn().mockResolvedValue({ count: -1 }) } as never);
    await expect(api.add({ id: 'opaque', colorCode: 1, storageCode: 2 })).rejects.toMatchObject({ kind: 'invalid-response' });
  });
});

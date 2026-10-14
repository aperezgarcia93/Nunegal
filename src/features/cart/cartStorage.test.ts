import { describe, expect, it } from 'vitest';
import { CartStorage } from './cartStorage';
import { SafeStorage } from '../../shared/storage/safeStorage';

describe('cart count persistence', () => {
  it('restores valid zero and leaves corrupt storage safely at zero', () => {
    const values = new Map<string, string>();
    const storage = new SafeStorage(() => ({
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => { values.set(key, value); },
      removeItem: (key) => { values.delete(key); },
    }));
    const cart = new CartStorage(storage);
    expect(cart.restore()).toBe(0);
    cart.persist(0);
    expect(cart.restore()).toBe(0);
    values.set('nunegal:cart-count:v1', '{');
    expect(cart.restore()).toBe(0);
  });
});

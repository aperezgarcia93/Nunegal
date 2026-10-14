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

  it('survives denied storage, rejects invalid counts, and has no expiry', () => {
    const denied = new CartStorage(new SafeStorage(() => { throw new Error('denied'); }));
    expect(denied.restore()).toBe(0);
    expect(denied.persist(4)).toBe(false);
    const values = new Map<string, string>();
    const cart = new CartStorage(new SafeStorage(() => ({
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => { values.set(key, value); },
      removeItem: (key) => { values.delete(key); },
    })));
    expect(cart.persist(-1)).toBe(false);
    expect(cart.persist(1.5)).toBe(false);
    cart.persist(9);
    expect(JSON.parse(values.get('nunegal:cart-count:v1')!)).toEqual({ version: 1, count: 9 });
    values.set('nunegal:cart-count:v1', JSON.stringify({ version: 2, count: 9 }));
    expect(cart.restore()).toBe(0);
  });
});

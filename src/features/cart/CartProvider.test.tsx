import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HttpError } from '../../shared/api/http';
import { SafeStorage } from '../../shared/storage/safeStorage';
import { CartApi } from './cartApi';
import { useCart } from './cartContext';
import { CartProvider } from './CartProvider';
import { CartStorage } from './cartStorage';

const selection = { id: 'opaque', colorCode: 1000, storageCode: 2001 };

function Probe() {
  const { count, pending, message, add } = useCart();
  return <div>
    <output aria-label="count">{count}</output>
    <output aria-label="pending">{String(pending)}</output>
    <output aria-label="message">{message}</output>
    <button type="button" onClick={() => void add(selection, 'Acer Iconia')}>add</button>
  </div>;
}

function memoryStorage(initial?: number) {
  const values = new Map<string, string>();
  if (initial !== undefined) values.set('nunegal:cart-count:v1', JSON.stringify({ version: 1, count: initial }));
  const storage = new SafeStorage(() => ({
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  }));
  return { values, cart: new CartStorage(storage) };
}

function setup(post: (path: string, body: unknown) => Promise<unknown>, storage = memoryStorage(5).cart) {
  const api = new CartApi({ post: vi.fn(post) });
  render(<CartProvider api={api} storage={storage}><Probe /></CartProvider>);
  return api;
}

const text = (name: string) => screen.getByLabelText(name).textContent;

describe('cart provider', () => {
  it('replaces the count with a lower returned count and persists it', async () => {
    const { values, cart } = memoryStorage(5);
    setup(async () => ({ count: 0 }), cart);
    expect(text('count')).toBe('5');
    await act(async () => { screen.getByRole('button', { name: 'add' }).click(); });
    expect(text('count')).toBe('0');
    expect(text('message')).toBe('Acer Iconia added to your cart.');
    expect(JSON.parse(values.get('nunegal:cart-count:v1')!)).toEqual({ version: 1, count: 0 });
  });

  it('allows only one pending addition application-wide and keeps the confirmed count until success', async () => {
    let resolve!: (value: unknown) => void;
    const post = vi.fn(() => new Promise<unknown>((done) => { resolve = done; }));
    setup(post);
    await act(async () => { screen.getByRole('button', { name: 'add' }).click(); });
    await act(async () => { screen.getByRole('button', { name: 'add' }).click(); });
    expect(post).toHaveBeenCalledTimes(1);
    expect(text('pending')).toBe('true');
    expect(text('count')).toBe('5');
    await act(async () => { resolve({ count: 6 }); });
    expect(text('pending')).toBe('false');
    expect(text('count')).toBe('6');
    await act(async () => { screen.getByRole('button', { name: 'add' }).click(); });
    expect(post).toHaveBeenCalledTimes(2);
  });

  it('keeps the count and warns about an uncertain outcome without retrying', async () => {
    const post = vi.fn(async () => ({ count: 'many' }));
    setup(post);
    await act(async () => { screen.getByRole('button', { name: 'add' }).click(); });
    expect(text('count')).toBe('5');
    expect(text('message')).toMatch(/could not confirm.*may add another item/);
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('distinguishes an explicit client rejection from a server failure', async () => {
    let failure: HttpError = new HttpError('http', 'Rejected', 400);
    setup(async () => { throw failure; });
    await act(async () => { screen.getByRole('button', { name: 'add' }).click(); });
    expect(text('message')).toBe('The service did not accept the addition. Your cart count was not changed.');
    failure = new HttpError('http', 'Unavailable', 503);
    await act(async () => { screen.getByRole('button', { name: 'add' }).click(); });
    expect(text('message')).toMatch(/could not confirm/);
    expect(text('count')).toBe('5');
  });

  it('updates the count in-session when storage is denied', async () => {
    const denied = new CartStorage(new SafeStorage(() => { throw new Error('denied'); }));
    setup(async () => ({ count: 2 }), denied);
    expect(text('count')).toBe('0');
    await act(async () => { screen.getByRole('button', { name: 'add' }).click(); });
    expect(text('count')).toBe('2');
  });
});

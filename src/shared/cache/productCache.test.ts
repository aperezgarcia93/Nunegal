import { describe, expect, it, vi } from 'vitest';
import { ProductCache, PRODUCT_CACHE_TTL_MS } from './productCache';
import { SafeStorage } from '../storage/safeStorage';

function storageHarness() {
  const values = new Map<string, string>();
  const storage = new SafeStorage(() => ({
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  }));
  return { storage, values };
}

describe('product cache', () => {
  it('reuses fresh entries, then revalidates at the exact one-hour boundary', async () => {
    let now = 100;
    const { storage } = storageHarness();
    const cache = new ProductCache('https://api.test', storage, () => now);
    const fetchData = vi.fn(async () => ['catalog']);
    const valid = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string');
    await cache.load('list', valid, fetchData);
    now += PRODUCT_CACHE_TTL_MS - 1;
    await cache.load('list', valid, fetchData);
    expect(fetchData).toHaveBeenCalledTimes(1);
    now += 1;
    await cache.load('list', valid, fetchData);
    expect(fetchData).toHaveBeenCalledTimes(2);
  });

  it('deduplicates concurrent reads and does not cache a failed request', async () => {
    const { storage } = storageHarness();
    const cache = new ProductCache('https://api.test', storage);
    let resolve!: (value: string[]) => void;
    const fetchData = vi.fn(() => new Promise<string[]>((done) => { resolve = done; }));
    const valid = (value: unknown): value is string[] => Array.isArray(value);
    const one = cache.load('detail:a', valid, fetchData);
    const two = cache.load('detail:a', valid, fetchData);
    expect(fetchData).toHaveBeenCalledTimes(1);
    resolve(['a']);
    await expect(Promise.all([one, two])).resolves.toEqual([['a'], ['a']]);
  });

  it('reuses persisted fresh data after reload and rejects a future timestamp', async () => {
    let now = 1_000;
    const { storage, values } = storageHarness();
    const valid = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string');
    const first = new ProductCache('https://api.test', storage, () => now);
    await first.load('list', valid, async () => ['from network']);
    const afterReload = new ProductCache('https://api.test', storage, () => now + 50);
    const reloadFetch = vi.fn(async () => ['unexpected']);
    await expect(afterReload.load('list', valid, reloadFetch)).resolves.toEqual(['from network']);
    expect(reloadFetch).not.toHaveBeenCalled();
    values.set('nunegal:products:v1:https%3A%2F%2Fapi.test:list', JSON.stringify({ version: 1, fetchedAt: 5_000, data: ['future'] }));
    now = 1_000;
    const futureCache = new ProductCache('https://api.test', storage, () => now);
    await expect(futureCache.load('list', valid, async () => ['revalidated'])).resolves.toEqual(['revalidated']);
  });

  it('discards incompatible or malformed entries without touching cart or unrelated keys', async () => {
    const { storage, values } = storageHarness();
    const key = 'nunegal:products:v1:https%3A%2F%2Fapi.test:list';
    values.set('nunegal:cart-count:v1', '{"version":1,"count":3}');
    values.set('other-app', 'keep');
    const valid = (value: unknown): value is string[] => Array.isArray(value);
    values.set(key, JSON.stringify({ version: 0, fetchedAt: 1, data: ['old'] }));
    await expect(new ProductCache('https://api.test', storage, () => 2).load('list', valid, async () => ['new'])).resolves.toEqual(['new']);
    values.set(key, '{');
    await expect(new ProductCache('https://api.test', storage, () => 2).load('list', valid, async () => ['again'])).resolves.toEqual(['again']);
    expect(values.get('nunegal:cart-count:v1')).toBe('{"version":1,"count":3}');
    expect(values.get('other-app')).toBe('keep');
  });

  it('never caches a failure nor serves expired data when revalidation fails', async () => {
    let now = 0;
    const { storage } = storageHarness();
    const cache = new ProductCache('https://api.test', storage, () => now);
    const valid = (value: unknown): value is string[] => Array.isArray(value);
    await cache.load('list', valid, async () => ['stale']);
    now = PRODUCT_CACHE_TTL_MS;
    await expect(cache.load('list', valid, async () => { throw new Error('offline'); })).rejects.toThrow('offline');
    await expect(cache.load('list', valid, async () => ['fresh'])).resolves.toEqual(['fresh']);
  });

  it('keeps working in memory when storage writes fail', async () => {
    const storage = new SafeStorage(() => ({
      getItem: () => null,
      setItem: () => { throw new DOMException('full', 'QuotaExceededError'); },
      removeItem: () => undefined,
    }));
    const cache = new ProductCache('https://api.test', storage, () => 0);
    const fetchData = vi.fn(async () => ['memory']);
    const valid = (value: unknown): value is string[] => Array.isArray(value);
    await cache.load('list', valid, fetchData);
    await expect(cache.load('list', valid, fetchData)).resolves.toEqual(['memory']);
    expect(fetchData).toHaveBeenCalledTimes(1);
  });
});

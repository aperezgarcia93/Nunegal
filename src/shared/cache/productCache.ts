import type { SafeStorage } from '../storage/safeStorage';

export const PRODUCT_CACHE_TTL_MS = 3_600_000;
const CACHE_VERSION = 1;
const CACHE_NAMESPACE = 'nunegal:products:v1';

interface CacheEntry<T> {
  version: number;
  fetchedAt: number;
  data: T;
}

export class ProductCache {
  private readonly memory = new Map<string, CacheEntry<unknown>>();
  private readonly inFlight = new Map<string, Promise<unknown>>();
  private readonly namespace: string;

  constructor(apiBaseUrl: string, private readonly storage: SafeStorage, private readonly now: () => number = Date.now) {
    this.namespace = `${CACHE_NAMESPACE}:${encodeURIComponent(new URL(apiBaseUrl).href.replace(/\/$/, ''))}`;
  }

  load<T>(resource: string, validate: (value: unknown) => value is T, fetchData: () => Promise<T>): Promise<T> {
    const key = `${this.namespace}:${resource}`;
    const cached = this.readFresh(key, validate);
    if (cached.fresh) return Promise.resolve(cached.data);

    const pending = this.inFlight.get(key);
    if (pending) return pending as Promise<T>;

    const request = fetchData().then((data) => {
      if (!validate(data)) throw new Error('Fetched product data failed validation.');
      const entry: CacheEntry<T> = { version: CACHE_VERSION, fetchedAt: this.now(), data };
      this.memory.set(key, entry);
      this.storage.write(key, JSON.stringify(entry));
      return data;
    }).finally(() => {
      this.inFlight.delete(key);
    });
    this.inFlight.set(key, request);
    return request;
  }

  private readFresh<T>(key: string, validate: (value: unknown) => value is T): { fresh: true; data: T } | { fresh: false } {
    let entry = this.memory.get(key);
    if (!entry) {
      const raw = this.storage.read(key);
      if (raw) {
        try {
          const parsed: unknown = JSON.parse(raw);
          if (this.isEntry<T>(parsed, validate)) {
            entry = parsed;
            this.memory.set(key, entry);
          } else {
            this.storage.remove(key);
          }
        } catch {
          this.storage.remove(key);
        }
      }
    }
    if (!entry || !this.isEntry<T>(entry, validate)) return { fresh: false };
    const age = this.now() - entry.fetchedAt;
    if (age < 0 || age >= PRODUCT_CACHE_TTL_MS) return { fresh: false };
    return { fresh: true, data: entry.data };
  }

  private isEntry<T>(value: unknown, validate: (value: unknown) => value is T): value is CacheEntry<T> {
    if (typeof value !== 'object' || value === null) return false;
    const entry = value as Partial<CacheEntry<unknown>>;
    return entry.version === CACHE_VERSION
      && typeof entry.fetchedAt === 'number'
      && Number.isFinite(entry.fetchedAt)
      && entry.fetchedAt >= 0
      && validate(entry.data);
  }
}

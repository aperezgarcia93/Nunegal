import type { SafeStorage } from '../../shared/storage/safeStorage';

const CART_COUNT_KEY = 'nunegal:cart-count:v1';
const VERSION = 1;

function isValidCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export class CartStorage {
  constructor(private readonly storage: SafeStorage) {}

  restore(): number {
    const raw = this.storage.read(CART_COUNT_KEY);
    if (!raw) return 0;
    try {
      const value: unknown = JSON.parse(raw);
      if (typeof value === 'object' && value !== null && 'version' in value && 'count' in value
        && value.version === VERSION && isValidCount(value.count)) return value.count;
    } catch { /* Invalid application-owned entry starts at zero. */ }
    this.storage.remove(CART_COUNT_KEY);
    return 0;
  }

  persist(count: number): boolean {
    if (!isValidCount(count)) return false;
    return this.storage.write(CART_COUNT_KEY, JSON.stringify({ version: VERSION, count }));
  }
}

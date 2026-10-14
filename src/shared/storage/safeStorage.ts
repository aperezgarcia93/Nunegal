export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class SafeStorage {
  constructor(private readonly resolveStorage: () => StorageLike = () => window.localStorage) {}

  read(key: string): string | null {
    try { return this.resolveStorage().getItem(key); } catch { return null; }
  }

  write(key: string, value: string): boolean {
    try { this.resolveStorage().setItem(key, value); return true; } catch { return false; }
  }

  remove(key: string): boolean {
    try { this.resolveStorage().removeItem(key); return true; } catch { return false; }
  }
}

export const safeStorage = new SafeStorage();

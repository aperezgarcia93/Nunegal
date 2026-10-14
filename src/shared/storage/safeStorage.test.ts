import { describe, expect, it } from 'vitest';
import { SafeStorage } from './safeStorage';

describe('safe storage', () => {
  it('treats denied access and quota failures as recoverable', () => {
    const denied = new SafeStorage(() => { throw new Error('denied'); });
    expect(denied.read('x')).toBeNull();
    expect(denied.write('x', 'y')).toBe(false);
    expect(denied.remove('x')).toBe(false);
  });
});

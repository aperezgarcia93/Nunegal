import { describe, expect, it } from 'vitest';
import { formatPrice, formatWeight } from './format';

describe('display formatting', () => {
  it('shows numeric prices in euros and keeps other prices as supplied', () => {
    expect(formatPrice('170')).toBe('€170');
    expect(formatPrice('189.9')).toBe('€189.90');
    expect(formatPrice('0')).toBe('€0');
    expect(formatPrice('From 99 USD')).toBe('From 99 USD');
    expect(formatPrice(null)).toBe('Price unavailable');
  });

  it('shows numeric weights in grams and keeps other weights as supplied', () => {
    expect(formatWeight('260')).toBe('260 g');
    expect(formatWeight('353.8')).toBe('353.8 g');
    expect(formatWeight('1.2 kg')).toBe('1.2 kg');
    expect(formatWeight(null)).toBe('Not available');
    expect(formatWeight('  ')).toBe('Not available');
  });
});

import { describe, expect, it } from 'vitest';
import { filterProducts } from './filterProducts';
import type { ProductSummary } from './product';

const products: ProductSummary[] = [
  { id: '1', brand: 'Acer', model: 'Liquid Jade', priceText: '10', imageUrl: null },
  { id: '2', brand: 'Alcatel', model: 'Iconia', priceText: null, imageUrl: null },
];

describe('catalog filtering', () => {
  it('matches trimmed case-insensitive brand or model independently and preserves order', () => {
    expect(filterProducts(products, '  aCeR  ').map((item) => item.id)).toEqual(['1']);
    expect(filterProducts(products, 'ICONIA').map((item) => item.id)).toEqual(['2']);
    expect(filterProducts(products, 'acer iconia')).toEqual([]);
    expect(filterProducts(products, ' ')).toEqual(products);
  });
});

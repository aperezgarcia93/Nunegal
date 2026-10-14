import type { ProductSummary } from './product';

export function filterProducts(products: ProductSummary[], query: string): ProductSummary[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return products;
  return products.filter(({ brand, model }) =>
    (brand ?? '').toLocaleLowerCase().includes(needle)
    || (model ?? '').toLocaleLowerCase().includes(needle));
}

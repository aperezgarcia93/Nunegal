// The service sends bare numbers. The brief comes from a Spanish retailer, so plain numeric
// prices are shown in euros and plain numeric weights in grams (a live sample ranged from 105 to 700).
// Anything that is not a plain number is shown exactly as supplied.
const plainNumber = /^\d+(\.\d+)?$/;

export function formatPrice(priceText: string | null): string {
  const value = priceText?.trim();
  if (!value) return 'Price unavailable';
  if (!plainNumber.test(value)) return value;
  const amount = Number(value);
  const fractionDigits = Number.isInteger(amount) ? 0 : 2;
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(amount);
}

export function formatWeight(weight: string | null): string {
  const value = weight?.trim();
  if (!value) return 'Not available';
  return plainNumber.test(value) ? `${value} g` : value;
}

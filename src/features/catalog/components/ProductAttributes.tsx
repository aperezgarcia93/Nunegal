import { formatWeight } from '../model/format';
import type { ProductDetail } from '../model/product';
import styles from './ProductAttributes.module.css';

function display(value: string | null): string { return value?.trim() || 'Not available'; }

export function ProductAttributes({ product }: { product: ProductDetail }) {
  const rows: Array<[string, string]> = [
    ['CPU', display(product.attributes.cpu)],
    ['RAM', display(product.attributes.ram)],
    ['Operating system', display(product.attributes.operatingSystem)],
    ['Screen resolution', display(product.attributes.screenResolution)],
    ['Battery', display(product.attributes.battery)],
    ['Cameras', product.attributes.cameras.length ? product.attributes.cameras.join(' · ') : 'Not available'],
    ['Dimensions', display(product.attributes.dimensions)],
    ['Weight', formatWeight(product.attributes.weight)],
  ];
  return <dl className={styles.attributes}>
    {rows.map(([label, value]) => <div key={label} className={styles.row}>
      <dt>{label}</dt><dd>{value}</dd>
    </div>)}
  </dl>;
}

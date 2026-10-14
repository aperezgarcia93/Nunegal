import { Link } from 'react-router-dom';
import type { ProductSummary } from '../model/product';
import { ProductImage } from '../../../shared/ui/ProductImage';
import styles from './ProductCard.module.css';

export function ProductCard({ product }: { product: ProductSummary }) {
  const name = [product.brand, product.model].filter(Boolean).join(' ') || 'Mobile device';
  return <article className={styles.card}>
    <Link className={styles.link} to={`/products/${encodeURIComponent(product.id)}`} aria-label={`View ${name}`}>
      <div className={styles.imageFrame}><ProductImage src={product.imageUrl} alt={name} className={styles.image} /></div>
      <div className={styles.copy}>
        <span className={styles.brand}>{product.brand || 'Brand unavailable'}</span>
        <h2>{product.model || 'Model unavailable'}</h2>
        <p className={styles.price}>{product.priceText ?? 'Price unavailable'}</p>
      </div>
      <span className={styles.arrow} aria-hidden="true">↗</span>
    </Link>
  </article>;
}

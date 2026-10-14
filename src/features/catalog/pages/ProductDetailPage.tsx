import { useCallback, useEffect } from 'react';
import { Link, useLocation, useOutletContext, useParams } from 'react-router-dom';
import { useCart } from '../../cart/cartContext';
import { ProductAttributes } from '../components/ProductAttributes';
import { VariantForm } from '../components/VariantForm';
import { productApi } from '../api/productApi';
import { formatPrice } from '../model/format';
import { useProductResource } from '../hooks/useProductResource';
import { EmptyState, ErrorState, LoadingState } from '../../../shared/ui/AsyncState';
import { ProductImage } from '../../../shared/ui/ProductImage';
import type { ShellOutletContext } from '../../../app/shellContext';
import styles from './ProductDetailPage.module.css';

export function ProductDetailPage() {
  const { productId = '' } = useParams();
  const location = useLocation();
  const { setProductTitle } = useOutletContext<ShellOutletContext>();
  const { count, pending, add } = useCart();
  const load = useCallback(() => productApi.getDetail(productId), [productId]);
  const { state, retry } = useProductResource(`detail:${productId}`, load);

  useEffect(() => {
    setProductTitle(location.pathname, state.status === 'ready'
      ? [state.data.brand, state.data.model].filter(Boolean).join(' ') || 'Product details'
      : null);
  }, [location.pathname, setProductTitle, state]);

  // The loading heading is replaced once the product settles; keep focus on the route heading.
  useEffect(() => {
    if (state.status !== 'loading' && document.activeElement === document.body) {
      document.querySelector<HTMLElement>('main h1')?.focus();
    }
  }, [state.status]);

  if (state.status === 'loading') return <main className="page-shell page-main">
    <Link className={styles.back} to="/">← Back to catalog</Link>
    <h1 tabIndex={-1}>Product details</h1>
    <LoadingState label="Loading product details…" />
  </main>;

  if (state.status === 'error' || state.status === 'unavailable') return <main className="page-shell page-main">
    <Link className={styles.back} to="/">← Back to catalog</Link>
    <h1 tabIndex={-1}>{state.status === 'unavailable' ? 'Product unavailable' : 'Product details'}</h1>
    {state.status === 'unavailable'
      ? <EmptyState>{state.message}</EmptyState>
      : <ErrorState message={state.message} onRetry={retry} />}
  </main>;

  const product = state.data;
  const label = [product.brand, product.model].filter(Boolean).join(' ') || 'Mobile device';
  return <main className={`page-shell page-main ${styles.detailPage}`}>
    <Link className={styles.back} to="/">← Back to catalog</Link>
    <div className={styles.detailLayout}>
      <div className={styles.imagePanel}><ProductImage src={product.imageUrl} alt={label} className={styles.productImage} eager /></div>
      <section className={styles.information} aria-labelledby="product-title">
        <p className="eyebrow">{product.brand || 'DEVICE'}</p>
        <h1 id="product-title" tabIndex={-1}>{product.model || 'Model unavailable'}</h1>
        <p className={styles.price}>{formatPrice(product.priceText)}</p>
        <p className={styles.description}>A closer look at the details that make this device yours.</p>
        <ProductAttributes product={product} />
        <div className={styles.purchase}>
          <h2><span className={styles.icon} aria-hidden="true">🛒</span>Choose your options</h2>
          <VariantForm
            key={product.id}
            productId={product.id}
            label={label}
            colors={product.colors}
            storages={product.storages}
            purchaseUnavailableReason={product.purchaseUnavailableReason}
            pending={pending}
            onAdd={add}
          />
          <p className={styles.cartNote}>Your cart currently has {count} {count === 1 ? 'item' : 'items'}.</p>
        </div>
      </section>
    </div>
  </main>;
}

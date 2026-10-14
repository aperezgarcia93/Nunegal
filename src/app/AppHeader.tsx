import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../features/cart/cartContext';
import styles from './AppHeader.module.css';

export function AppHeader({ productTitle }: { productTitle: string | null }) {
  const location = useLocation();
  const { count, message } = useCart();
  const isProduct = location.pathname.startsWith('/products/');
  const pageLabel = isProduct ? productTitle || 'Product details' : location.pathname === '/' ? 'Catalog' : 'Page not found';

  useEffect(() => {
    document.title = isProduct && productTitle ? `${productTitle} · Device Shop` : 'Device Shop · Mobile devices';
  }, [isProduct, productTitle]);

  return <header className={styles.header}>
    <div className={`page-shell ${styles.inner}`}>
      <Link to="/" className={styles.brand} aria-label="Device Shop home">
        <span className={styles.mark} aria-hidden="true">N</span>
        <span>device<span className={styles.brandLight}>shop</span></span>
      </Link>
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <ol>
          {isProduct && <li><Link to="/">Catalog</Link><span aria-hidden="true">/</span></li>}
          <li aria-current="page">{pageLabel}</li>
        </ol>
      </nav>
      <div className={styles.cart} role="group" aria-label={`Cart items: ${count}`}>
        <span aria-hidden="true">◌</span><span>Cart</span><strong>{count}</strong>
      </div>
    </div>
    <div className={styles.announcement} role="status" aria-live="polite">{message}</div>
  </header>;
}

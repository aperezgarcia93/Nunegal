import { useCallback, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { filterProducts } from '../model/filterProducts';
import { productApi } from '../api/productApi';
import { useProductResource } from '../hooks/useProductResource';
import { EmptyState, ErrorState, LoadingState } from '../../../shared/ui/AsyncState';
import styles from './ProductListPage.module.css';

export function ProductListPage() {
  const [query, setQuery] = useState('');
  const load = useCallback(() => productApi.getList(), []);
  const { state, retry } = useProductResource('catalog', load);

  return <main className="page-shell page-main">
    <div className={styles.intro}>
      <div>
        <p className="eyebrow">CURATED DEVICES · 2026</p>
        <h1 tabIndex={-1}>Find your next device.</h1>
        <p className={styles.lede}>Straightforward specs. A better fit for the way you use your phone.</p>
      </div>
      {state.status === 'ready' && <label className={styles.search}>
        <span>Search by brand or model</span>
        <span className={styles.searchControl}><span aria-hidden="true">⌕</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “Acer”" />
        </span>
      </label>}
    </div>

    {state.status === 'loading' && <LoadingState label="Loading devices…" />}
    {state.status === 'error' && <ErrorState message={state.message} onRetry={retry} />}
    {state.status === 'ready' && (() => {
      const filtered = filterProducts(state.data, query);
      return filtered.length
        ? <>
          <p className={styles.resultCount} aria-live="polite">{filtered.length} {filtered.length === 1 ? 'device' : 'devices'}</p>
          <section className={styles.grid} aria-label="Available devices">
            {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
          </section>
        </>
        : <EmptyState>{query.trim() ? 'No devices match your search.' : 'No devices are available right now.'}</EmptyState>;
    })()}
  </main>;
}

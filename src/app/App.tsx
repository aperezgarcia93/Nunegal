import { useCallback, useEffect, useState } from 'react';
import { Link, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { CartProvider } from '../features/cart/CartProvider';
import { ProductDetailPage } from '../features/catalog/pages/ProductDetailPage';
import { ProductListPage } from '../features/catalog/pages/ProductListPage';
import { AppErrorBoundary } from './AppErrorBoundary';
import { AppHeader } from './AppHeader';
import type { ShellOutletContext } from './shellContext';

function AppShell() {
  const location = useLocation();
  const [title, setTitle] = useState<{ path: string; label: string | null }>({ path: '', label: null });
  const setProductTitle = useCallback((path: string, label: string | null) => setTitle({ path, label }), []);

  useEffect(() => {
    const timer = window.setTimeout(() => document.querySelector<HTMLElement>('main h1')?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return <>
    <AppHeader productTitle={title.path === location.pathname ? title.label : null} />
    {/* Keyed by route so a recovered navigation clears a previous render failure. */}
    <AppErrorBoundary key={location.pathname}>
      <Outlet context={{ setProductTitle } satisfies ShellOutletContext} />
    </AppErrorBoundary>
  </>;
}

function NotFoundPage() {
  return <main className="page-shell page-main">
    <p className="eyebrow">404 · PAGE NOT FOUND</p>
    <h1 tabIndex={-1}>Let’s get you back.</h1>
    <p className="lede">That page isn’t part of the device catalog.</p>
    <Link className="button button--primary" to="/">Go to catalog</Link>
  </main>;
}

export function App() {
  return <CartProvider>
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<ProductListPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </CartProvider>;
}

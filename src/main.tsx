import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element is missing.');

createRoot(rootElement).render(<StrictMode>
  <main className="page-shell page-main">
    <h1>Device Shop</h1>
    <p className="lede">The device catalog is on its way.</p>
  </main>
</StrictMode>);

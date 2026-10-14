import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ProductListPage } from './features/catalog/pages/ProductListPage';
import './styles/global.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element is missing.');

createRoot(rootElement).render(<StrictMode><BrowserRouter><ProductListPage /></BrowserRouter></StrictMode>);

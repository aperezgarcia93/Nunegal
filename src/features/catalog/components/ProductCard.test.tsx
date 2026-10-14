import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ProductCard } from './ProductCard';
import type { ProductSummary } from '../model/product';

function renderCard(product: ProductSummary) {
  return render(<MemoryRouter><ProductCard product={product} /></MemoryRouter>);
}

describe('product card', () => {
  it('shows image, brand, model and price behind one link to the encoded product identity', () => {
    renderCard({ id: 'a/b?c', brand: 'Acer', model: 'Iconia', priceText: '170', imageUrl: 'https://itx-frontend-test.onrender.com/a.jpg' });
    const link = screen.getByRole('link', { name: 'View Acer Iconia' });
    expect(link).toHaveAttribute('href', '/products/a%2Fb%3Fc');
    expect(screen.getByRole('img', { name: 'Acer Iconia' })).toHaveAttribute('loading', 'lazy');
    expect(screen.getByText('Acer')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Iconia' })).toBeInTheDocument();
    expect(screen.getByText('€170')).toBeInTheDocument();
  });

  it('uses explicit fallbacks for missing values and a failed image', () => {
    renderCard({ id: 'x', brand: null, model: null, priceText: null, imageUrl: 'https://itx-frontend-test.onrender.com/broken.jpg' });
    expect(screen.getByRole('link', { name: 'View Mobile device' })).toBeInTheDocument();
    expect(screen.getByText('Brand unavailable')).toBeInTheDocument();
    expect(screen.getByText('Model unavailable')).toBeInTheDocument();
    expect(screen.getByText('Price unavailable')).toBeInTheDocument();
    fireEvent.error(screen.getByRole('img', { name: 'Mobile device' }));
    expect(screen.getByRole('img', { name: 'Mobile device image unavailable' })).toBeInTheDocument();
  });

  it('renders remote markup-like content as inert text', () => {
    const { container } = renderCard({ id: 'x', brand: '<img src=x onerror=alert(1)>', model: '<b>Bold</b>', priceText: '1', imageUrl: null });
    expect(screen.getByText('<b>Bold</b>')).toBeInTheDocument();
    expect(container.querySelector('b')).toBeNull();
    expect(container.querySelectorAll('img')).toHaveLength(0);
  });
});

import { createContext, useContext } from 'react';
import type { AddToCartInput } from './types';

export interface CartContextValue {
  count: number;
  pending: boolean;
  message: string;
  add: (input: AddToCartInput, productLabel: string) => Promise<boolean>;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used within CartProvider.');
  return value;
}

import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { HttpError } from '../../shared/api/http';
import { safeStorage } from '../../shared/storage/safeStorage';
import { cartApi, type CartApi } from './cartApi';
import { CartStorage } from './cartStorage';
import { CartContext } from './cartContext';
import type { AddToCartInput } from './types';
const defaultStorage = new CartStorage(safeStorage);

export function CartProvider({ children, api = cartApi, storage = defaultStorage }: {
  children: ReactNode;
  api?: CartApi;
  storage?: CartStorage;
}) {
  const [count, setCount] = useState(() => storage.restore());
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const pendingRef = useRef(false);

  const add = useCallback(async (input: AddToCartInput, productLabel: string) => {
    if (pendingRef.current) return false;
    pendingRef.current = true;
    setPending(true);
    setMessage('Adding item…');
    try {
      const nextCount = await api.add(input);
      setCount(nextCount);
      storage.persist(nextCount);
      setMessage(`${productLabel || 'Item'} added to your cart.`);
      return true;
    } catch (error) {
      const explicitRejection = error instanceof HttpError && error.kind === 'http' && (error.status ?? 500) < 500;
      setMessage(explicitRejection
        ? 'The service did not accept the addition. Your cart count was not changed.'
        : 'We could not confirm the addition. It may have reached the service; trying again may add another item.');
      return false;
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }, [api, storage]);

  const value = useMemo(() => ({ count, pending, message, add }), [count, pending, message, add]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

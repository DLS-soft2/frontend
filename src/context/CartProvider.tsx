import { useCallback, useState, type ReactNode } from 'react';
import { CartContext } from './CartContext';
import type { OrderDraft } from '../types/order';

const CART_STORAGE_KEY = 'aaab-cart-draft';

function readStoredDraft(): OrderDraft | null {
  const stored = sessionStorage.getItem(CART_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as OrderDraft;
  } catch {
    sessionStorage.removeItem(CART_STORAGE_KEY);
    return null;
  }
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [draft, setDraftState] = useState<OrderDraft | null>(readStoredDraft);

  const setDraft = useCallback((next: OrderDraft) => {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
    setDraftState(next);
  }, []);

  const clearCart = useCallback(() => {
    sessionStorage.removeItem(CART_STORAGE_KEY);
    setDraftState(null);
  }, []);

  return (
    <CartContext.Provider value={{ draft, setDraft, clearCart }}>{children}</CartContext.Provider>
  );
}

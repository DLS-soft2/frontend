import { createContext } from 'react';
import type { OrderDraft } from '../types/order';

export interface CartContextValue {
  draft: OrderDraft | null;
  setDraft: (draft: OrderDraft) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import type { CartItem, MattressConfig, PriceBreakdown, Product } from '@/lib/types';
import { calculatePrice } from '@/lib/priceCalculator';
import { v4 as uuidv4 } from 'uuid';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_STANDARD'; product: Product; priceBreakdown: PriceBreakdown }
  | { type: 'ADD_CUSTOM'; config: MattressConfig; priceBreakdown: PriceBreakdown; note?: string }
  | { type: 'REMOVE'; id: string }
  | { type: 'CLEAR' }
  | { type: 'TOGGLE' }
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'LOAD'; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_STANDARD':
      return {
        ...state,
        isOpen: true,
        items: [...state.items, {
          id: uuidv4(),
          type: 'standard',
          product: action.product,
          priceBreakdown: action.priceBreakdown,
          quantity: 1,
        }],
      };
    case 'ADD_CUSTOM':
      return {
        ...state,
        isOpen: true,
        items: [...state.items, {
          id: uuidv4(),
          type: 'custom',
          mattressConfig: action.config,
          priceBreakdown: action.priceBreakdown,
          quantity: 1,
          customNote: action.note,
        }],
      };
    case 'REMOVE':
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    case 'CLEAR':
      return { ...state, items: [] };
    case 'TOGGLE':
      return { ...state, isOpen: !state.isOpen };
    case 'OPEN':
      return { ...state, isOpen: true };
    case 'CLOSE':
      return { ...state, isOpen: false };
    case 'LOAD':
      return { ...state, items: action.items };
    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addStandard: (product: Product, priceBreakdown: PriceBreakdown) => void;
  addCustom: (config: MattressConfig, note?: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });

  // Persist cart to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('goodrelax_cart');
    if (saved) {
      try {
        const items = JSON.parse(saved) as CartItem[];
        dispatch({ type: 'LOAD', items });
      } catch (_) { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('goodrelax_cart', JSON.stringify(state.items));
  }, [state.items]);

  const addStandard = (product: Product, priceBreakdown: PriceBreakdown) =>
    dispatch({ type: 'ADD_STANDARD', product, priceBreakdown });

  const addCustom = (config: MattressConfig, note?: string) => {
    const priceBreakdown = calculatePrice(config);
    dispatch({ type: 'ADD_CUSTOM', config, priceBreakdown, note });
  };

  const removeItem = (id: string) => dispatch({ type: 'REMOVE', id });
  const clearCart = () => dispatch({ type: 'CLEAR' });
  const toggleCart = () => dispatch({ type: 'TOGGLE' });
  const openCart = () => dispatch({ type: 'OPEN' });
  const closeCart = () => dispatch({ type: 'CLOSE' });

  const totalItems = state.items.length;
  const totalPrice = state.items.reduce((sum, item) => sum + item.priceBreakdown.totalPrice, 0);

  return (
    <CartContext.Provider value={{ state, addStandard, addCustom, removeItem, clearCart, toggleCart, openCart, closeCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (product: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product, qty = 1) =>
        set(state => {
          const existing = state.items.find(i => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i,
              ),
            };
          }
          return { items: [...state.items, { product, quantity: qty }] };
        }),
      remove: id => set(state => ({ items: state.items.filter(i => i.product.id !== id) })),
      setQty: (id, qty) =>
        set(state => ({
          items: state.items
            .map(i => (i.product.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
            .filter(i => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      subtotal: () => get().items.reduce((s, i) => s + i.quantity * i.product.price, 0),
    }),
    { name: "pawsome-cart" },
  ),
);

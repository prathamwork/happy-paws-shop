import { create } from "zustand";
import type { CartItem, Product } from "@/types/api";
import {
  addToCart as apiAdd,
  clearCart as apiClear,
  getCart as apiList,
  removeCartItem as apiRemove,
  updateCart as apiUpdate,
} from "@/services/api";
import { toNumber } from "@/lib/format";

interface CartState {
  items: CartItem[];
  loading: boolean;
  fetch: () => Promise<void>;
  add: (product: Product, qty?: number) => Promise<void>;
  setQty: (productId: number, qty: number) => Promise<void>;
  remove: (productId: number) => Promise<void>;
  clear: () => Promise<void>;
  totalItems: () => number;
  subtotal: () => number;
}

const productPrice = (i: CartItem): number => toNumber(i.price_at_time);

export const useCart = create<CartState>((set, get) => ({
  items: [],
  loading: false,

fetch: async () => {
  set({ loading: true });
  try {
    const raw = await apiList() as unknown as {
      cart?: { items: CartItem[] };
      items?: CartItem[];
    };
    // Handle both { cart: { items } } and { items } shapes
    const items: CartItem[] = raw?.cart?.items ?? (raw as any)?.items ?? [];
    set({ items });
  } catch {
    set({ items: [] });
  } finally {
    set({ loading: false });
  }
},

  add: async (product, qty = 1) => {
    await apiAdd({ product_id: product.id, quantity: qty });
    await get().fetch();
  },

  setQty: async (pid, qty) => {
    if (qty <= 0) return get().remove(pid);
    await apiUpdate({ product_id: pid, quantity: qty });
    await get().fetch();
  },

  remove: async (pid) => {
    await apiRemove(pid);
    set({ items: get().items.filter((i) => i.product !== pid) });
  },

  clear: async () => {
    await apiClear();
    set({ items: [] });
  },

  totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
  subtotal: () =>
    get().items.reduce((s, i) => s + i.quantity * productPrice(i), 0),
}));
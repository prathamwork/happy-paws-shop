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

const productId = (i: CartItem): number =>
  typeof i.product === "object" ? i.product.id : (i.product as number);

const productPrice = (i: CartItem): number =>
  typeof i.product === "object" ? toNumber(i.product.price) : 0;

export const useCart = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  fetch: async () => {
    set({ loading: true });
    try {
      const items = await apiList();
      set({ items: Array.isArray(items) ? items : [] });
    } catch {
      set({ items: [] });
    } finally {
      set({ loading: false });
    }
  },
  add: async (product, qty = 1) => {
    await apiAdd({ product: product.id, quantity: qty });
    await get().fetch();
  },
  setQty: async (pid, qty) => {
    if (qty <= 0) return get().remove(pid);
    await apiUpdate({ product: pid, quantity: qty });
    await get().fetch();
  },
  remove: async (pid) => {
    await apiRemove(pid);
    set({ items: get().items.filter((i) => productId(i) !== pid) });
  },
  clear: async () => {
    await apiClear();
    set({ items: [] });
  },
  totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
  subtotal: () => get().items.reduce((s, i) => s + i.quantity * productPrice(i), 0),
}));

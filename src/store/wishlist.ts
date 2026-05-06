import { create } from "zustand";
import type { WishlistItem } from "@/types/api";
import {
  addToWishlist as apiAdd,
  getWishlist as apiList,
  removeFromWishlist as apiRemove,
} from "@/services/api";

const pid = (i: WishlistItem): number =>
  typeof i.product === "object" ? i.product.id : (i.product as number);

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  fetch: () => Promise<void>;
  toggle: (productId: number) => Promise<void>;
  has: (productId: number) => boolean;
}

export const useWishlist = create<WishlistState>((set, get) => ({
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
  toggle: async (productId) => {
    if (get().has(productId)) {
      await apiRemove(productId);
      set({ items: get().items.filter((i) => pid(i) !== productId) });
    } else {
      await apiAdd(productId);
      await get().fetch();
    }
  },
  has: (productId) => get().items.some((i) => pid(i) === productId),
}));

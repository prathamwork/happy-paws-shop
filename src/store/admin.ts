import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  adminOrders,
  adminUsers,
  adminReviews,
  adminCoupons,
  type AdminOrder,
  type AdminUser,
  type AdminReview,
  type AdminCoupon,
  type OrderStatus,
} from "@/data/admin";
import { products as seedProducts, type Product, type Category } from "@/data/products";

interface AdminState {
  authed: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  removeProduct: (id: string) => void;

  categories: { id: Category | string; name: string }[];
  addCategory: (name: string) => void;
  renameCategory: (id: string, name: string) => void;
  removeCategory: (id: string) => void;

  orders: AdminOrder[];
  setOrderStatus: (id: string, status: OrderStatus) => void;

  users: AdminUser[];
  toggleBlock: (id: string) => void;

  reviews: AdminReview[];
  setReviewStatus: (id: string, status: "approved" | "rejected" | "pending") => void;

  coupons: AdminCoupon[];
  addCoupon: (c: AdminCoupon) => void;
  toggleCoupon: (id: string) => void;
  removeCoupon: (id: string) => void;

  store: { name: string; currency: string; logoText: string };
  updateStore: (patch: Partial<AdminState["store"]>) => void;
}

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      authed: false,
      login: (email, password) => {
        const ok = email.trim().length > 0 && password.length >= 4;
        if (ok) set({ authed: true });
        return ok;
      },
      logout: () => set({ authed: false }),

      products: seedProducts,
      addProduct: (p) => set((s) => ({ products: [p, ...s.products] })),
      updateProduct: (id, patch) =>
        set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      removeProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      categories: [
        { id: "dogs", name: "Dogs" },
        { id: "cats", name: "Cats" },
        { id: "birds", name: "Birds" },
        { id: "fish", name: "Fish" },
        { id: "accessories", name: "Accessories" },
      ],
      addCategory: (name) =>
        set((s) => ({
          categories: [...s.categories, { id: name.toLowerCase().replace(/\s+/g, "-"), name }],
        })),
      renameCategory: (id, name) =>
        set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, name } : c)) })),
      removeCategory: (id) => set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      orders: adminOrders,
      setOrderStatus: (id, status) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) })),

      users: adminUsers,
      toggleBlock: (id) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, blocked: !u.blocked } : u)) })),

      reviews: adminReviews,
      setReviewStatus: (id, status) =>
        set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, status } : r)) })),

      coupons: adminCoupons,
      addCoupon: (c) => set((s) => ({ coupons: [c, ...s.coupons] })),
      toggleCoupon: (id) =>
        set((s) => ({ coupons: s.coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c)) })),
      removeCoupon: (id) => set((s) => ({ coupons: s.coupons.filter((c) => c.id !== id) })),

      store: { name: "Pawsome", currency: "USD", logoText: "🐾 Pawsome" },
      updateStore: (patch) => set((s) => ({ store: { ...s.store, ...patch } })),
    }),
    {
      name: "pawsome-admin",
      partialize: (s) => ({ authed: s.authed, store: s.store }),
    }
  )
);

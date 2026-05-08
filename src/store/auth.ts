import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/api";
import { getProfile, loginUser, signupUser, tokenStore } from "@/services/api";

interface AuthState {
  user: User | null;
  loading: boolean;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  fetchProfile: () => Promise<User | null>;
  logout: () => void;
  isAdmin: () => boolean;
  isStaff: () => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      hydrated: false,

      login: async (email, password) => {
        set({ loading: true });
        try {
          const res = await loginUser({ email, password });
          // Save BOTH tokens — refresh token persisted for silent renewal
          tokenStore.set({ access: res.access, refresh: res.refresh });
          set({ user: res.user });
          return res.user;
        } finally {
          set({ loading: false });
        }
      },

      signup: async (name, email, password) => {
        set({ loading: true });
        try {
          const res = await signupUser({ name, email, password });
          tokenStore.set({ access: res.access, refresh: res.refresh });
          set({ user: res.user });
          return res.user;
        } finally {
          set({ loading: false });
        }
      },

      fetchProfile: async () => {
        if (!tokenStore.getAccess() && !tokenStore.getRefresh()) {
          // No tokens at all — nothing to attempt
          set({ user: null, hydrated: true });
          return null;
        }
        try {
          // api.ts interceptor will silently refresh if access token is stale
          const user = await getProfile();
          set({ user, hydrated: true });
          return user;
        } catch {
          tokenStore.clear();
          set({ user: null, hydrated: true });
          return null;
        }
      },

      logout: () => {
        tokenStore.clear();
        set({ user: null, hydrated: true });
      },

      isAdmin: () => get().user?.role === "admin",
      isStaff: () => {
        const r = get().user?.role;
        return r === "admin" || r === "manager";
      },
    }),
    {
      name: "pawsome-auth",
      partialize: (s) => ({ user: s.user }),
      // Mark as hydrated once zustand rehydrates from localStorage
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
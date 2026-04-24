import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  dark: boolean;
  toggle: () => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    set => ({
      dark: false,
      toggle: () =>
        set(state => {
          const next = !state.dark;
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", next);
          }
          return { dark: next };
        }),
    }),
    {
      name: "pawsome-theme",
      onRehydrateStorage: () => state => {
        if (state && typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", state.dark);
        }
      },
    },
  ),
);

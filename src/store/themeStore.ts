import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePreference = "system" | "light" | "dark";

interface ThemeState {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  cycleTheme: () => void;
}

function applyThemeToDocument(theme: ThemePreference) {
  if (theme === "system") {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = theme;
  }
}

const order: ThemePreference[] = ["system", "light", "dark"];

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      setTheme: (theme) => {
        applyThemeToDocument(theme);
        set({ theme });
      },
      cycleTheme: () => {
        const next = order[(order.indexOf(get().theme) + 1) % order.length];
        applyThemeToDocument(next);
        set({ theme: next });
      },
    }),
    {
      name: "stoka-theme",
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeToDocument(state.theme);
      },
    },
  ),
);

function subscribeToSystemScheme(callback: () => void) {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
function getSystemScheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Tema efectivo ('light' | 'dark') resuelto contra la preferencia del
 * sistema cuando el usuario no forzó uno manualmente — útil para pasarle
 * el tema correcto a librerías externas como Sonner que no leen `data-theme`. */
export function useResolvedTheme(): "light" | "dark" {
  const preference = useThemeStore((s) => s.theme);
  const systemScheme = useSyncExternalStore(subscribeToSystemScheme, getSystemScheme, (): "light" => "light");
  return preference === "system" ? systemScheme : preference;
}

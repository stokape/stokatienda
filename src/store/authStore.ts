import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StaffUser } from "../types";

interface AuthState {
  currentUser: StaffUser | null;
  login: (user: StaffUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      login: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
    }),
    { name: "stoka-auth" },
  ),
);

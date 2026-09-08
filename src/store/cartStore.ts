import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  productId: string;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  lastAddedId: string | null;
  open: () => void;
  close: () => void;
  addItem: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      lastAddedId: null,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      addItem: (productId, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === productId);
          const lines = existing
            ? state.lines.map((l) =>
                l.productId === productId ? { ...l, quantity: l.quantity + quantity } : l,
              )
            : [...state.lines, { productId, quantity }];
          return { lines, lastAddedId: productId };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.productId !== productId)
              : state.lines.map((l) => (l.productId === productId ? { ...l, quantity } : l)),
        })),
      removeItem: (productId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "stoka-cart", partialize: (state) => ({ lines: state.lines }) },
  ),
);

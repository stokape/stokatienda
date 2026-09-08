import type { Category } from "../types";

/** Categorías visibles en la tienda pública, en el orden configurado en el panel. */
export function visibleCategories(categories: Category[]): Category[] {
  return categories.filter((c) => c.active).sort((a, b) => a.order - b.order);
}

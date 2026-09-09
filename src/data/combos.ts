import type { Combo } from "../types";

// Combos de ejemplo, armados con productos que ya existen en el catálogo
// semilla (src/data/products.ts) — el precio combinado se resta del precio
// normal de cada producto al momento de calcular el carrito, así que si el
// admin cambia el precio de un producto el ahorro se recalcula solo.
export const combos: Combo[] = [
  {
    id: "combo-desayuno",
    name: "Combo Desayuno",
    productIds: ["p-pan-frances-x10", "p-leche-evaporada-400g", "p-cafe-molido-200g"],
    comboPrice: 18.9,
    active: true,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "combo-antojo",
    name: "Combo Antojo",
    productIds: ["p-chocolate-leche-90g", "p-gaseosa-cola-1-5l", "p-papitas-clasicas-150g"],
    comboPrice: 13.9,
    active: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

import type { Combo, Product } from "../types";

export interface AppliedCombo {
  combo: Combo;
  times: number; // cuántas veces se cumple el combo completo con lo que hay en el carrito
  discountPerApplication: number; // ahorro cada vez que se cumple
}

/**
 * Detecta qué combos activos están completos en el carrito actual y cuánto
 * se descuenta por eso. Cada combo se evalúa de forma independiente contra
 * las cantidades totales del carrito — si dos combos comparten un producto
 * y el carrito solo tiene unidades para uno de los dos, esta versión simple
 * los cuenta a ambos igual (no reserva unidades entre combos). Para una
 * bodega con pocos combos activos a la vez es una simplificación razonable.
 */
export function computeComboDiscount(
  cartLines: { productId: string; quantity: number }[],
  products: Product[],
  combos: Combo[],
): { applied: AppliedCombo[]; totalDiscount: number } {
  const qtyByProduct = new Map(cartLines.map((l) => [l.productId, l.quantity]));
  const applied: AppliedCombo[] = [];

  for (const combo of combos) {
    if (!combo.active || combo.productIds.length < 2) continue;
    const times = Math.min(...combo.productIds.map((id) => qtyByProduct.get(id) ?? 0));
    if (times <= 0) continue;

    const normalPriceOnce = combo.productIds.reduce((sum, id) => {
      const product = products.find((p) => p.id === id);
      return sum + (product?.price ?? 0);
    }, 0);
    const discountPerApplication = Math.max(0, normalPriceOnce - combo.comboPrice);
    if (discountPerApplication <= 0) continue;

    applied.push({ combo, times, discountPerApplication });
  }

  const totalDiscount = applied.reduce((acc, a) => acc + a.discountPerApplication * a.times, 0);
  return { applied, totalDiscount };
}

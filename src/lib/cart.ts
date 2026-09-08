import { useMemo } from "react";
import { useCartStore } from "../store/cartStore";
import { useDataStore } from "../store/dataStore";
import type { Product } from "../types";

export interface CartDetailLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}

export interface CartSummary {
  lines: CartDetailLine[];
  itemCount: number;
  subtotal: number;
  savings: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  amountToFreeDelivery: number;
  total: number;
}

export function useCartSummary(fulfillment: "delivery" | "recojo" = "delivery"): CartSummary {
  const cartLines = useCartStore((s) => s.lines);
  const products = useDataStore((s) => s.products);
  const config = useDataStore((s) => s.config);

  return useMemo(() => {
    const lines: CartDetailLine[] = cartLines
      .map((line) => {
        const product = products.find((p) => p.id === line.productId);
        if (!product) return null;
        return { product, quantity: line.quantity, lineTotal: product.price * line.quantity };
      })
      .filter((l): l is CartDetailLine => l !== null);

    const itemCount = lines.reduce((acc, l) => acc + l.quantity, 0);
    const subtotal = lines.reduce((acc, l) => acc + l.lineTotal, 0);
    const savings = lines.reduce((acc, l) => {
      const compareAt = l.product.compareAtPrice;
      return compareAt ? acc + (compareAt - l.product.price) * l.quantity : acc;
    }, 0);

    const freeDeliveryThreshold = config.freeDeliveryThreshold;
    const deliveryFee =
      fulfillment === "recojo" || subtotal >= freeDeliveryThreshold || subtotal === 0
        ? 0
        : config.defaultDeliveryFee;
    const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

    return {
      lines,
      itemCount,
      subtotal,
      savings,
      deliveryFee,
      freeDeliveryThreshold,
      amountToFreeDelivery,
      total: subtotal + deliveryFee,
    };
  }, [cartLines, products, config, fulfillment]);
}

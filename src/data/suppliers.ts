import type { Purchase, Supplier } from "../types";

export const suppliers: Supplier[] = [
  { id: "sup-molino", name: "Distribuidora Molino Dorado SAC", ruc: "20100111222", phone: "014567890", category: "Abarrotes" },
  { id: "sup-valle", name: "Valle Fresco Distribución EIRL", ruc: "20100333444", phone: "014567891", category: "Bebidas" },
  { id: "sup-andina", name: "Bebidas Andina del Perú SAC", ruc: "20100555666", phone: "014567892", category: "Bebidas" },
  { id: "sup-cremosa", name: "Cremosa Lácteos SAC", ruc: "20100777888", phone: "014567893", category: "Lácteos y frescos" },
  { id: "sup-higiene", name: "Higiene Total Perú SAC", ruc: "20100999000", phone: "014567894", category: "Limpieza y cuidado personal" },
];

export const purchases: Purchase[] = [
  {
    id: "pur-001",
    supplierId: "sup-molino",
    items: [
      { productId: "p-arroz-extra-5kg", quantity: 20, unitCost: 17.4 },
      { productId: "p-aceite-vegetal-1l", quantity: 24, unitCost: 7.8 },
    ],
    total: 20 * 17.4 + 24 * 7.8,
    status: "recibida",
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: "pur-002",
    supplierId: "sup-higiene",
    items: [
      { productId: "p-detergente-polvo-1kg", quantity: 15, unitCost: 7.9 },
      { productId: "p-papel-higienico-x4", quantity: 20, unitCost: 6.2 },
    ],
    total: 15 * 7.9 + 20 * 6.2,
    status: "recibida",
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "pur-003",
    supplierId: "sup-cremosa",
    items: [{ productId: "p-queso-fresco-500g", quantity: 10, unitCost: 10.2 }],
    total: 10 * 10.2,
    status: "pendiente",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

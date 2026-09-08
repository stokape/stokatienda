import type { InventoryMovement } from "../types";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const inventoryMovements: InventoryMovement[] = [
  { id: "mv-001", productId: "p-arroz-extra-5kg", type: "entrada", quantity: 20, note: "Compra a Molino Dorado", batch: "L-A2301", createdAt: daysAgo(12), createdBy: "Milagros Torres" },
  { id: "mv-002", productId: "p-aceite-vegetal-1l", type: "entrada", quantity: 24, note: "Compra a Molino Dorado", batch: "L-A2302", createdAt: daysAgo(12), createdBy: "Milagros Torres" },
  { id: "mv-003", productId: "p-gaseosa-cola-1-5l", type: "venta", quantity: -6, note: "Pedido STK-10231", createdAt: daysAgo(3), createdBy: "Luis Fernández" },
  { id: "mv-004", productId: "p-pan-frances-x10", type: "entrada", quantity: 30, note: "Horneado del día", batch: "PAN-HOY", expiryDate: daysFromNow(1), createdAt: daysAgo(0), createdBy: "Milagros Torres" },
  { id: "mv-005", productId: "p-queso-fresco-500g", type: "entrada", quantity: 10, note: "Compra a Cremosa Lácteos", batch: "QF-0110", expiryDate: daysFromNow(9), createdAt: daysAgo(5), createdBy: "Milagros Torres" },
  { id: "mv-006", productId: "p-leche-evaporada-400g", type: "entrada", quantity: 40, note: "Reposición de stock", batch: "LE-2245", expiryDate: daysFromNow(150), createdAt: daysAgo(15), createdBy: "Milagros Torres" },
  { id: "mv-007", productId: "p-huevos-pardos-x30", type: "merma", quantity: -2, note: "Huevos rotos en almacén", createdAt: daysAgo(2), createdBy: "Milagros Torres" },
  { id: "mv-008", productId: "p-mani-salado-200g", type: "ajuste", quantity: -3, note: "Diferencia en conteo físico", createdAt: daysAgo(7), createdBy: "Rosa Quispe" },
  { id: "mv-009", productId: "p-fideos-spaghetti-500g", type: "venta", quantity: -10, note: "Pedido STK-10233", createdAt: daysAgo(4), createdBy: "Luis Fernández" },
  { id: "mv-010", productId: "p-pasta-dental-90g", type: "venta", quantity: -8, note: "Ventas de mostrador", createdAt: daysAgo(6), createdBy: "Luis Fernández" },
  { id: "mv-011", productId: "p-palta-fuerte-kg", type: "merma", quantity: -1, note: "Fruta pasada", createdAt: daysAgo(1), createdBy: "Milagros Torres" },
  { id: "mv-012", productId: "p-detergente-polvo-1kg", type: "entrada", quantity: 15, note: "Compra a Higiene Total", batch: "DP-9091", createdAt: daysAgo(6), createdBy: "Milagros Torres" },
  { id: "mv-013", productId: "p-arena-gatos-4kg", type: "devolucion", quantity: 2, note: "Cliente devolvió producto sellado", createdAt: daysAgo(2), createdBy: "Rosa Quispe" },
  { id: "mv-014", productId: "p-bebida-rehidratante-500ml", type: "venta", quantity: -10, note: "Se agotó el stock disponible", createdAt: daysAgo(1), createdBy: "Luis Fernández" },
  { id: "mv-015", productId: "p-queso-fresco-500g", type: "venta", quantity: -5, note: "Ventas de mostrador", createdAt: daysAgo(1), createdBy: "Luis Fernández" },
];

import type { CashSession } from "../types";

function agoISO(hours: number): string {
  return new Date(Date.now() - hours * 3600000).toISOString();
}

export const cashSessions: CashSession[] = [
  {
    id: "cash-2025-01",
    openedAt: agoISO(30),
    closedAt: agoISO(18),
    openingAmount: 100,
    closingAmount: 268.4,
    status: "cerrada",
    openedBy: "Luis Fernández",
    movements: [
      { id: "cm-1", type: "ingreso", concept: "Venta de mostrador", amount: 85.4, createdAt: agoISO(28) },
      { id: "cm-2", type: "ingreso", concept: "Pedido STK-10231 (efectivo)", amount: 54.3, createdAt: agoISO(24) },
      { id: "cm-3", type: "gasto", concept: "Compra de bolsas y empaques", amount: 18.0, createdAt: agoISO(22) },
      { id: "cm-4", type: "ingreso", concept: "Venta de mostrador", amount: 62.0, createdAt: agoISO(20) },
      { id: "cm-5", type: "retiro", concept: "Retiro para depósito bancario", amount: 15.3, createdAt: agoISO(19) },
    ],
  },
];

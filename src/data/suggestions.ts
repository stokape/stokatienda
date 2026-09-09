import type { Suggestion } from "../types";

// Sugerencias de ejemplo, para que el panel no se vea vacío en la demo —
// las que manden los clientes reales se agregan encima vía addSuggestion.
export const suggestions: Suggestion[] = [
  {
    id: "sg-001",
    message: "¿Podrían traer pan de yema? En el barrio no hay dónde comprarlo fresco.",
    name: "Fiorella Castillo",
    phone: "978334455",
    status: "nueva",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "sg-002",
    message: "Sería genial que vendan recargas de celular y pago de servicios (luz, agua) igual que en otras bodegas.",
    status: "nueva",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "sg-003",
    message: "Extrañamos el detergente Ariel en bolsa de 1kg, solo tienen la de 400g.",
    name: "Jorge Luis Ramírez",
    status: "revisada",
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

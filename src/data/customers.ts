import type { Customer } from "../types";

export const customers: Customer[] = [
  { id: "c-001", name: "María Elena Suárez", phone: "987112233", district: "Los Olivos", ordersCount: 5, totalSpent: 312.4, createdAt: new Date(Date.now() - 90 * 86400000).toISOString() },
  { id: "c-002", name: "Carlos Alberto Vega", phone: "956223344", district: "San Juan de Lurigancho", ordersCount: 2, totalSpent: 98.5, createdAt: new Date(Date.now() - 40 * 86400000).toISOString() },
  { id: "c-003", name: "Fiorella Castillo", phone: "978334455", district: "Comas", ordersCount: 8, totalSpent: 540.9, createdAt: new Date(Date.now() - 150 * 86400000).toISOString() },
  { id: "c-004", name: "Jorge Luis Ramírez", phone: "944445566", district: "San Martín de Porres", ordersCount: 1, totalSpent: 45.0, createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: "c-005", name: "Ana Lucía Paredes", phone: "999556677", district: "Independencia", ordersCount: 3, totalSpent: 156.7, createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },
];

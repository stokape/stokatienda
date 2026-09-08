import type { Category, CategoryAccentColor } from "../types";

// Semilla inicial: a partir de acá las categorías se administran desde
// /admin/catalogo (se editan en tiempo de ejecución vía dataStore, esto
// solo puebla el estado la primera vez que se abre la app).
export const categories: Category[] = [
  { slug: "abarrotes", name: "Abarrotes", icon: "ShoppingBasket", color: "silver", order: 1, active: true },
  { slug: "bebidas", name: "Bebidas", icon: "CupSoda", color: "blue", order: 2, active: true },
  { slug: "snacks", name: "Snacks", icon: "Popcorn", color: "red", order: 3, active: true },
  { slug: "desayuno", name: "Desayuno", icon: "Coffee", color: "amber", order: 4, active: true },
  { slug: "frescos", name: "Frescos", icon: "Carrot", color: "silver", order: 5, active: true },
  { slug: "limpieza", name: "Limpieza", icon: "SprayCan", color: "blue", order: 6, active: true },
  { slug: "cuidado-personal", name: "Cuidado Personal", icon: "Sparkles", color: "red", order: 7, active: true },
  { slug: "mascotas", name: "Mascotas", icon: "PawPrint", color: "amber", order: 8, active: true },
];

export const categoryAccentOptions: { value: CategoryAccentColor; label: string }[] = [
  { value: "red", label: "Rojo" },
  { value: "silver", label: "Plata" },
  { value: "blue", label: "Azul" },
  { value: "amber", label: "Ámbar" },
];

export const categoryAccent: Record<CategoryAccentColor, { bg: string; text: string; ring: string }> = {
  silver: { bg: "bg-stoka-silver-100", text: "text-stoka-ink", ring: "ring-stoka-border-strong" },
  blue: { bg: "bg-stoka-info-100", text: "text-stoka-info", ring: "ring-stoka-info-100" },
  red: { bg: "bg-stoka-red-100", text: "text-stoka-red", ring: "ring-stoka-red-100" },
  amber: { bg: "bg-stoka-warning-100", text: "text-stoka-warning", ring: "ring-stoka-warning-100" },
};

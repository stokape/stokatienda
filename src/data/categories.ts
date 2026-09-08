import type { Category } from "../types";

export const categories: Category[] = [
  { slug: "abarrotes", name: "Abarrotes", icon: "ShoppingBasket", color: "silver" },
  { slug: "bebidas", name: "Bebidas", icon: "CupSoda", color: "blue" },
  { slug: "snacks", name: "Snacks", icon: "Popcorn", color: "red" },
  { slug: "desayuno", name: "Desayuno", icon: "Coffee", color: "amber" },
  { slug: "frescos", name: "Frescos", icon: "Carrot", color: "silver" },
  { slug: "limpieza", name: "Limpieza", icon: "SprayCan", color: "blue" },
  { slug: "cuidado-personal", name: "Cuidado Personal", icon: "Sparkles", color: "red" },
  { slug: "mascotas", name: "Mascotas", icon: "PawPrint", color: "amber" },
];

export const categoryAccent: Record<string, { bg: string; text: string; ring: string }> = {
  silver: { bg: "bg-stoka-silver-100", text: "text-stoka-ink", ring: "ring-stoka-border-strong" },
  blue: { bg: "bg-stoka-info-100", text: "text-stoka-info", ring: "ring-stoka-info-100" },
  red: { bg: "bg-stoka-red-100", text: "text-stoka-red", ring: "ring-stoka-red-100" },
  amber: { bg: "bg-stoka-warning-100", text: "text-stoka-warning", ring: "ring-stoka-warning-100" },
};

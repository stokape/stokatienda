import {
  Bone,
  Candy,
  Carrot,
  Coffee,
  Cookie,
  Croissant,
  CupSoda,
  Droplet,
  Egg,
  IceCreamCone,
  Milk,
  Package,
  PawPrint,
  Popcorn,
  Salad,
  ShoppingBasket,
  Soup,
  Sparkles,
  SprayCan,
  Wheat,
  type LucideIcon,
} from "lucide-react";

export const iconRegistry: Record<string, LucideIcon> = {
  ShoppingBasket,
  CupSoda,
  Popcorn,
  Coffee,
  Carrot,
  SprayCan,
  Sparkles,
  PawPrint,
  Wheat,
  Droplet,
  Candy,
  Soup,
  Cookie,
  Package,
  IceCreamCone,
  Milk,
  Croissant,
  Egg,
  Salad,
  Bone,
};

// Nombre en español de cada ícono, solo para el selector visual del admin
// (aria-label / tooltip) — el nombre en inglés del componente (p. ej.
// "CupSoda") no dice nada por sí solo a quien está eligiendo un ícono.
export const iconLabels: Record<string, string> = {
  ShoppingBasket: "Canasta",
  CupSoda: "Bebidas",
  Popcorn: "Snacks",
  Coffee: "Café",
  Carrot: "Verduras",
  SprayCan: "Limpieza",
  Sparkles: "Cuidado personal",
  PawPrint: "Mascotas",
  Wheat: "Granos y cereales",
  Droplet: "Aceites y líquidos",
  Candy: "Dulces",
  Soup: "Sopas e instantáneos",
  Cookie: "Galletas",
  Package: "General",
  IceCreamCone: "Helados",
  Milk: "Lácteos",
  Croissant: "Panadería",
  Egg: "Huevos",
  Salad: "Frescos",
  Bone: "Mascotas (hueso)",
};

export function getIcon(name: string): LucideIcon {
  return iconRegistry[name] ?? Package;
}

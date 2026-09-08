import type { SiteContent } from "../types";

// Valores por defecto: reflejan que de momento el negocio solo atiende con
// recojo en tienda (sin delivery) — todo esto sigue siendo editable desde
// /admin/contenido sin tocar código.
export const defaultSiteContent: SiteContent = {
  heroBadge: "Pide online, recógelo tú mismo en tienda",
  heroTitleLine: "Tu tienda,",
  heroTitleAccent: "más simple.",
  heroSubtitle:
    "Tu bodega de confianza, ahora también online. Abarrotes, bebidas, frescos y más, listos para recoger cuando quieras.",
  heroPrimaryCta: "Comprar ahora",
  heroSecondaryCta: "Ver ofertas",
  heroBenefit1: "Recojo rápido en tienda",
  heroBenefit2: "Pago seguro y verificado",
};

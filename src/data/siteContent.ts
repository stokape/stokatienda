import type { SiteContent } from "../types";

// Valores por defecto: reflejan que de momento el negocio solo atiende con
// recojo en tienda (sin delivery) — todo esto sigue siendo editable desde
// /admin/contenido sin tocar código.
export const defaultSiteContent: SiteContent = {
  heroBadge: "Tu bodega de siempre, ahora online",
  heroTitleLine: "Tu antojo llegó",
  heroTitleAccent: "antes que tú.",
  heroSubtitle:
    "Snacks, bebidas y todo lo que necesitas para ese momento. Elige online y recógelo listo en Bodeguita Stoka.",
  heroPrimaryCta: "Comprar ahora",
  heroSecondaryCta: "Ver ofertas",
  heroBenefit1: "Recojo rápido en tienda",
  heroBenefit2: "Pago seguro y verificado",
};

import type { SiteContent } from "../types";

// Valores por defecto: reflejan que de momento el negocio atiende de forma
// directa en el local (sin hablar de "recojo" ni "delivery/envío" como
// conceptos aparte) — todo esto sigue siendo editable desde /admin/contenido
// sin tocar código.
export const defaultSiteContent: SiteContent = {
  heroBadge: "Tu bodega de siempre, ahora online",
  heroTitleLine: "Tu antojo llegó",
  heroTitleAccent: "antes que tú.",
  heroSubtitle:
    "Snacks, bebidas y todo lo que necesitas para ese momento. Mira el catálogo online y compra directo en Bodeguita Stoka.",
  heroPrimaryCta: "Comprar ahora",
  heroSecondaryCta: "Ver ofertas",
  heroBenefit1: "Todo directo en tienda",
  heroBenefit2: "Pago seguro y verificado",
};

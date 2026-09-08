import type { SiteContent } from "../types";

// Valores por defecto = exactamente el texto actual del hero, para que
// activar el editor de "Contenido" no cambie nada hasta que alguien edite algo.
export const defaultSiteContent: SiteContent = {
  heroBadge: "Envío gratis desde S/ 60 en tu zona",
  heroTitleLine: "Tu tienda,",
  heroTitleAccent: "más simple.",
  heroSubtitle:
    "Tu bodega de confianza, ahora también online. Abarrotes, bebidas, frescos y más, con delivery rápido a tu puerta.",
  heroPrimaryCta: "Comprar ahora",
  heroSecondaryCta: "Ver ofertas",
  heroBenefit1: "Delivery el mismo día",
  heroBenefit2: "Pago seguro y verificado",
};

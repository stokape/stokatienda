import { ArrowRight, Percent, ShieldCheck, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductImage } from "./ProductImage";
import { buttonVariants } from "../ui/Button";
import type { SiteContent } from "../../types";

// Composición visual (sin video) con productos flotando suavemente: mismo
// impacto que un hero multimedia, sin el costo de descargar/decodificar video
// ni la necesidad de una imagen de respaldo. La animación respeta
// `prefers-reduced-motion` globalmente (ver src/index.css).
const floating = [
  { hue: 8, icon: "CupSoda", name: "Gaseosa", className: "top-0 left-2 size-20 sm:size-24", delay: "0s", slow: false },
  { hue: 42, icon: "Wheat", name: "Arroz", className: "bottom-4 -left-2 size-16 sm:size-20", delay: "1.2s", slow: true },
  { hue: 210, icon: "Salad", name: "Palta", className: "top-14 right-0 size-14 sm:size-16", delay: "0.6s", slow: true },
  { hue: 205, icon: "SprayCan", name: "Limpieza", className: "-bottom-2 right-8 size-16 sm:size-20", delay: "0.3s", slow: false },
  { hue: 0, icon: "Bone", name: "Mascotas", className: "top-1/2 right-1/4 size-12 sm:size-14", delay: "1.6s", slow: true },
];

/**
 * Markup del hero, separado del componente de tienda para poder
 * reutilizarlo tal cual en la vista previa en vivo de /admin/contenido —
 * así lo que el admin ve al editar es exactamente lo que verá el cliente,
 * no una aproximación.
 */
export function HeroContent({ content, interactive = true }: { content: SiteContent; interactive?: boolean }) {
  const ctaClass = "cursor-default";
  return (
    <section className="relative overflow-hidden bg-stoka-bg-alt">
      <div aria-hidden="true" className="texture-mesh absolute inset-0 text-stoka-ink/[0.04]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20">
        <div className="animate-in-up">
          <span className="inline-flex items-center gap-2 rounded-md border border-stoka-border bg-stoka-surface px-3 py-1.5 text-xs font-semibold text-stoka-ink shadow-card">
            <Percent className="size-3.5 text-stoka-red" aria-hidden="true" />
            {content.heroBadge}
          </span>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[0.95] text-stoka-ink sm:text-6xl lg:text-7xl">
            {content.heroTitleLine}
            <br />
            <span className="text-stoka-red">{content.heroTitleAccent}</span>
          </h1>
          <p className="mt-5 max-w-md text-base text-stoka-ink-muted sm:text-lg">{content.heroSubtitle}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {interactive ? (
              <>
                <Link to="/catalogo" className={buttonVariants("primary", "lg")}>
                  {content.heroPrimaryCta} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link to="/catalogo?ofertas=1" className={buttonVariants("outline", "lg")}>
                  {content.heroSecondaryCta}
                </Link>
              </>
            ) : (
              <>
                <span className={buttonVariants("primary", "lg", ctaClass)}>
                  {content.heroPrimaryCta} <ArrowRight className="size-4" aria-hidden="true" />
                </span>
                <span className={buttonVariants("outline", "lg", ctaClass)}>{content.heroSecondaryCta}</span>
              </>
            )}
          </div>
          <div className="mt-8 flex flex-wrap gap-5 text-sm font-semibold text-stoka-ink-muted">
            <span className="flex items-center gap-2">
              <Store className="size-4 text-stoka-red" aria-hidden="true" /> {content.heroBenefit1}
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-stoka-red" aria-hidden="true" /> {content.heroBenefit2}
            </span>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md">
          <div className="facet-corner absolute inset-14 flex items-center justify-center border border-stoka-border bg-stoka-surface shadow-pop">
            <ProductImage
              hue={0}
              icon="ShoppingBasket"
              name="Canasta STOKA"
              bordered={false}
              className="size-36 !bg-transparent sm:size-44"
              iconClassName="size-20 text-stoka-red sm:size-24"
            />
          </div>
          {floating.map((item) => (
            <div
              key={item.name}
              className={`absolute ${item.className} [animation-delay:var(--d)]`}
              style={{ "--d": item.delay } as React.CSSProperties}
            >
              <ProductImage
                hue={item.hue}
                icon={item.icon}
                name={item.name}
                className={`size-full shadow-pop ${item.slow ? "animate-float-slow" : "animate-float"}`}
                iconClassName="size-1/2"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

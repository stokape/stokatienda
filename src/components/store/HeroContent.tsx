import { ArrowRight, ShieldCheck, Store, Tag, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buttonVariants } from "../ui/Button";
import type { SiteContent } from "../../types";

// Fotos reales de la bodega: ambas ya vienen con el lado izquierdo oscurecido
// de fábrica (pasillo perdiéndose en sombra), que es justo donde se apoya el
// texto — por eso funcionan como fondo de pantalla completa sin recorte raro.
const slides = [
  { src: "/hero/stoka-chomp.webp", alt: "Clienta disfrutando un chocolate y cliente eligiendo una bebida en Bodeguita Stoka" },
  { src: "/hero/stoka-casino.webp", alt: "Amigos escogiendo galletas y bebidas en los pasillos de Bodeguita Stoka" },
] as const;

/** El mismo hero se reutiliza en la vista previa del editor de contenido. */
export function HeroContent({ content, interactive = true }: { content: SiteContent; interactive?: boolean }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!interactive || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [interactive]);

  const primaryClass = buttonVariants("primary", "lg", "rounded-full px-7 shadow-[0_12px_34px_rgba(225,6,19,.35)]");
  const secondaryClass = buttonVariants("outline", "lg", "rounded-full border-white/25 text-white hover:bg-white/10");

  return (
    <section className="relative isolate overflow-hidden bg-stoka-black text-white">
      <div className="relative min-h-[560px] sm:min-h-[640px] lg:min-h-[760px]">
        {slides.map((slide, index) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            aria-hidden={index !== active}
            className={`absolute inset-0 size-full object-cover transition-[opacity,transform] duration-[1400ms] ease-out ${
              index === active ? "scale-100 opacity-100" : "pointer-events-none scale-[1.04] opacity-0"
            }`}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
          />
        ))}

        {/* Velo oscuro de izquierda a derecha para que el texto siempre sea legible, sin importar cómo recorte el navegador la foto */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(100deg,rgba(13,13,15,.95)_0%,rgba(13,13,15,.8)_26%,rgba(13,13,15,.35)_58%,rgba(13,13,15,.12)_78%,transparent_92%)]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,transparent_62%,rgba(13,13,15,.65)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-[560px] max-w-[1440px] flex-col justify-center px-4 py-16 sm:min-h-[640px] sm:px-6 lg:min-h-[760px] lg:px-8">
          <div className="max-w-xl animate-in-up">
            <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[.2em] text-white/70 sm:text-xs">
              <span className="h-[2px] w-6 bg-stoka-red" aria-hidden="true" />
              {content.heroBadge}
            </div>

            <h1 className="mt-5 font-display text-[clamp(2.75rem,8.5vw,6.25rem)] font-bold uppercase leading-[.86] tracking-[-.03em] text-white">
              {content.heroTitleLine}{" "}
              <span className="[-webkit-text-stroke:2px_white] text-transparent sm:[-webkit-text-stroke:3px_white]">
                {content.heroTitleAccent}
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">{content.heroSubtitle}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {interactive ? (
                <>
                  <Link to="/catalogo" className={primaryClass}>
                    {content.heroPrimaryCta} <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                  <Link to="/catalogo?ofertas=1" className={secondaryClass}>
                    <Tag className="size-4" aria-hidden="true" /> {content.heroSecondaryCta}
                  </Link>
                </>
              ) : (
                <>
                  <span className={`${primaryClass} cursor-default`}>
                    {content.heroPrimaryCta} <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                  <span className={`${secondaryClass} cursor-default`}>
                    <Tag className="size-4" aria-hidden="true" /> {content.heroSecondaryCta}
                  </span>
                </>
              )}
            </div>

            <div className={`mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-white/55 sm:text-sm ${interactive ? "lg:hidden" : ""}`}>
              <span className="flex items-center gap-2">
                <Store className="size-4 text-stoka-red" aria-hidden="true" /> {content.heroBenefit1}
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-stoka-red" aria-hidden="true" /> {content.heroBenefit2}
              </span>
            </div>
          </div>
        </div>

        {/* Tarjeta flotante sobre la foto — solo en pantallas grandes reales (no en la vista previa
            angosta del editor de contenido, cuyo ancho de caja no coincide con el viewport real que
            usan estos breakpoints, y el texto de abajo ya cubre lo mismo en ese caso) */}
        {interactive && (
        <div className="pointer-events-none absolute inset-y-0 right-6 z-10 hidden items-center lg:right-10 lg:flex xl:right-16">
          <div className="flex max-w-[230px] items-start gap-3 rounded-2xl border border-white/15 bg-black/50 p-4 shadow-pop backdrop-blur-md">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-stoka-red">
              <Zap className="size-4 text-white" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">{content.heroBenefit1}</p>
              <p className="mt-0.5 text-xs text-white/60">{content.heroBenefit2}</p>
            </div>
          </div>
        </div>
        )}

        {/* Selector de escena */}
        <div className="absolute bottom-5 right-4 z-10 flex items-center gap-3 sm:bottom-8 sm:right-8">
          <span className="font-display text-sm font-bold tracking-wider text-white/70">
            0{active + 1} <span className="text-white/35">/ 0{slides.length}</span>
          </span>
          <div className="flex gap-1.5" aria-label="Seleccionar escena">
            {slides.map((slide, index) => (
              <button
                key={`${slide.src}-dot`}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Ver escena ${index + 1}`}
                aria-current={index === active ? "true" : undefined}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-500 ${
                  index === active ? "w-8 bg-stoka-red" : "w-3 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

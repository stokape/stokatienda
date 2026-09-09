import { ArrowRight, MousePointer2, ShieldCheck, Store } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Link } from "react-router-dom";
import { buttonVariants } from "../ui/Button";
import type { SiteContent } from "../../types";

const slides = [
  {
    src: "/hero/stoka-chomp.webp",
    alt: "Clienta disfrutando un chocolate y cliente eligiendo una bebida en Bodeguita Stoka",
    eyebrow: "Un gusto en el camino",
    product: "Chocolate con leche",
    price: "S/ 4.90",
    href: "/producto/chocolate-leche-90g",
    hotspot: "left-[58%] top-[59%]",
  },
  {
    src: "/hero/stoka-casino.webp",
    alt: "Amigos escogiendo galletas y bebidas en los pasillos de Bodeguita Stoka",
    eyebrow: "Ese antojo que aparece",
    product: "Galletas de vainilla",
    price: "S/ 3.00",
    href: "/producto/galletas-vainilla-x6",
    hotspot: "left-[55%] top-[50%]",
  },
  {
    src: "/hero/stoka-checkout.webp",
    alt: "Grupo de amigos comprando snacks y una gaseosa en la caja de Bodeguita Stoka",
    eyebrow: "Todo listo para compartir",
    product: "Gaseosa cola 1.5 L",
    price: "S/ 6.90",
    href: "/producto/gaseosa-cola-1-5l",
    hotspot: "left-[66%] top-[61%]",
  },
] as const;

/** El mismo hero se reutiliza en la vista previa del editor de contenido. */
export function HeroContent({ content, interactive = true }: { content: SiteContent; interactive?: boolean }) {
  const [active, setActive] = useState(0);
  const mediaRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!interactive || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [interactive]);

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (!interactive || !mediaRef.current || event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (mediaRef.current) {
        mediaRef.current.style.transform = `perspective(1200px) rotateX(${y * -2.5}deg) rotateY(${x * 3.5}deg) translate3d(${x * 5}px, ${y * 4}px, 0)`;
      }
    });
  }

  function resetPointer() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (mediaRef.current) mediaRef.current.style.transform = "perspective(1200px) rotateX(0) rotateY(0) translate3d(0, 0, 0)";
  }

  const primaryClass = buttonVariants("primary", "lg", "rounded-full px-7 shadow-[0_12px_34px_rgba(225,6,19,.3)]");
  const secondaryClass = buttonVariants("outline", "lg", "rounded-full border-white/30 text-white hover:bg-white/10");

  return (
    <section className="relative isolate overflow-hidden bg-[#0d0d0f] text-white" onPointerMove={handlePointerMove} onPointerLeave={resetPointer}>
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(225,6,19,.22),transparent_32%),linear-gradient(115deg,#0d0d0f_0%,#151519_58%,#0d0d0f_100%)]" />
      <div aria-hidden="true" className="texture-mesh absolute inset-0 text-white/[0.025]" />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:min-h-[650px] lg:grid-cols-[.82fr_1.18fr] lg:gap-12 lg:px-8 lg:py-14">
        <div className="relative z-20 max-w-xl animate-in-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[.16em] text-white/85 backdrop-blur-md">
            <span className="size-2 rounded-full bg-stoka-red shadow-[0_0_16px_rgba(225,6,19,.9)]" />
            {content.heroBadge}
          </span>
          <h1 className="mt-6 font-display text-[clamp(3.25rem,7vw,6.9rem)] font-bold uppercase leading-[.78] tracking-[-.045em] text-white">
            {content.heroTitleLine}
            <span className="mt-2 block text-stoka-red">{content.heroTitleAccent}</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg">{content.heroSubtitle}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            {interactive ? (
              <>
                <Link to="/catalogo" className={primaryClass}>{content.heroPrimaryCta} <ArrowRight className="size-4" aria-hidden="true" /></Link>
                <Link to="/catalogo?ofertas=1" className={secondaryClass}>{content.heroSecondaryCta}</Link>
              </>
            ) : (
              <>
                <span className={`${primaryClass} cursor-default`}>{content.heroPrimaryCta} <ArrowRight className="size-4" aria-hidden="true" /></span>
                <span className={`${secondaryClass} cursor-default`}>{content.heroSecondaryCta}</span>
              </>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-white/55 sm:text-sm">
            <span className="flex items-center gap-2"><Store className="size-4 text-stoka-red" aria-hidden="true" /> {content.heroBenefit1}</span>
            <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-stoka-red" aria-hidden="true" /> {content.heroBenefit2}</span>
          </div>
        </div>

        <div className="relative min-w-0">
          <div ref={mediaRef} className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/15 bg-stoka-carbon shadow-[0_32px_90px_rgba(0,0,0,.55)] transition-transform duration-500 ease-out will-change-transform lg:aspect-[1.12/1]">
            {slides.map((slide, index) => (
              <img key={slide.src} src={slide.src} alt={slide.alt} aria-hidden={index !== active} className={`absolute inset-0 size-full object-cover transition-[opacity,transform] duration-1000 ease-out ${index === active ? "scale-100 opacity-100" : "pointer-events-none scale-[1.04] opacity-0"}`} loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"} />
            ))}
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,13,15,.22),transparent_45%),linear-gradient(0deg,rgba(13,13,15,.5),transparent_48%)]" />

            <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-white/80 backdrop-blur-md sm:left-7 sm:top-7 sm:text-xs">{slides[active].eyebrow}</div>

            {interactive && slides.map((slide, index) => (
              <Link key={`${slide.src}-hotspot`} to={slide.href} aria-label={`${slide.product}, ${slide.price}`} className={`group absolute ${slide.hotspot} z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${index === active ? "visible scale-100 opacity-100" : "invisible scale-75 opacity-0"}`}>
                <span className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25 animate-ping" aria-hidden="true" />
                <span className="relative flex size-6 items-center justify-center rounded-full border-2 border-white bg-stoka-red shadow-[0_0_0_5px_rgba(225,6,19,.28)] transition-transform group-hover:scale-110" aria-hidden="true"><span className="size-1.5 rounded-full bg-white" /></span>
                <span className="pointer-events-none absolute left-4 top-4 min-w-44 origin-top-left translate-y-2 rounded-xl border border-white/15 bg-black/75 p-3 opacity-0 shadow-pop backdrop-blur-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                  <span className="block text-xs text-white/55">Disponible en tienda</span>
                  <span className="mt-0.5 block text-sm font-bold text-white">{slide.product}</span>
                  <span className="mt-1 block font-display text-xl font-bold text-stoka-red-light">{slide.price}</span>
                </span>
              </Link>
            ))}

            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-7 sm:left-7 sm:right-7">
              <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-2 text-xs text-white/65 backdrop-blur-md sm:flex"><MousePointer2 className="size-3.5 text-stoka-red-light" aria-hidden="true" /> Explora los productos</div>
              <div className="ml-auto flex gap-2" aria-label="Seleccionar escena">
                {slides.map((slide, index) => (
                  <button key={`${slide.src}-dot`} type="button" onClick={() => setActive(index)} aria-label={`Ver escena ${index + 1}`} aria-current={index === active ? "true" : undefined} className={`h-1.5 rounded-full transition-[width,background-color] duration-500 ${index === active ? "w-10 bg-stoka-red" : "w-4 bg-white/45 hover:bg-white/80"}`} />
                ))}
              </div>
            </div>
          </div>

          <div aria-hidden="true" className="absolute -bottom-5 -right-5 -z-10 size-32 border-b-2 border-r-2 border-stoka-red/45" />
          <div aria-hidden="true" className="absolute -left-6 -top-6 -z-10 size-28 border-l border-t border-white/15" />
        </div>
      </div>
    </section>
  );
}

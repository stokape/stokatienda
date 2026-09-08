import { Phone, Wrench } from "lucide-react";
import { BrandMark } from "../ui/BrandMark";

function formatReturnTime(endAt: string): string | null {
  if (!endAt) return null;
  const date = new Date(endAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("es-PE", { day: "2-digit", month: "long", hour: "numeric", minute: "2-digit" });
}

/**
 * Markup de la pantalla de mantenimiento, separado para reutilizarlo tal
 * cual en la vista previa en vivo de /admin/mantenimiento (mismo patrón que
 * HeroContent para el editor de portada).
 */
export function MaintenanceContent({ message, endAt }: { message: string; endAt?: string }) {
  const returnTime = endAt ? formatReturnTime(endAt) : null;
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-stoka-bg px-4 py-16 text-center">
      <BrandMark size={72} />
      <div className="flex items-center gap-2 rounded-md border border-stoka-border bg-stoka-surface px-3 py-1.5 text-xs font-semibold text-stoka-ink shadow-card">
        <Wrench className="size-3.5 text-stoka-red" aria-hidden="true" />
        En mantenimiento
      </div>
      <h1 className="max-w-lg font-display text-4xl font-bold text-stoka-ink sm:text-5xl">
        Ya volvemos.
      </h1>
      <p className="max-w-md text-base text-stoka-ink-muted sm:text-lg">{message}</p>
      {returnTime && (
        <p className="text-sm font-semibold text-stoka-ink">
          Volvemos aprox. el <span className="text-stoka-red">{returnTime}</span>
        </p>
      )}
      <a href="tel:+51987654321" className="flex items-center gap-2 text-sm font-semibold text-stoka-ink-muted hover:text-stoka-red">
        <Phone className="size-4" aria-hidden="true" /> ¿Urgente? Llámanos al 987 654 321
      </a>
    </div>
  );
}

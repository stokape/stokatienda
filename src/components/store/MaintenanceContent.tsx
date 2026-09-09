import { Phone, Wrench } from "lucide-react";
import { BrandMark } from "../ui/BrandMark";

function formatReturnTime(endAt: string): string | null {
  if (!endAt) return null;
  const date = new Date(endAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("es-PE", { day: "2-digit", month: "long", hour: "numeric", minute: "2-digit" });
}

interface MaintenanceContentProps {
  message: string;
  endAt?: string;
  backgroundImage?: string;
  showLogo?: boolean;
  showContactPhone?: boolean;
  contactPhone?: string;
  showReturnTime?: boolean;
}

/**
 * Markup de la pantalla de mantenimiento, separado para reutilizarlo tal
 * cual en la vista previa en vivo de /admin/mantenimiento (mismo patrón que
 * HeroContent para el editor de portada). Todo lo que no sea el mensaje en
 * sí (imagen de fondo, logo, teléfono, hora de regreso) es opcional y se
 * configura desde /admin/mantenimiento.
 */
export function MaintenanceContent({
  message,
  endAt,
  backgroundImage,
  showLogo = true,
  showContactPhone = true,
  contactPhone = "987 654 321",
  showReturnTime = true,
}: MaintenanceContentProps) {
  const returnTime = showReturnTime && endAt ? formatReturnTime(endAt) : null;
  const hasBackground = Boolean(backgroundImage);

  return (
    <div
      className="relative flex min-h-[70vh] flex-col items-center justify-center gap-6 overflow-hidden bg-stoka-bg px-4 py-16 text-center"
      style={
        hasBackground
          ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
    >
      {hasBackground && <div className="absolute inset-0 bg-stoka-black/65" aria-hidden="true" />}
      <div className="relative flex flex-col items-center gap-6">
        {showLogo && <BrandMark size={72} />}
        <div
          className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold shadow-card ${
            hasBackground
              ? "border-white/30 bg-white/10 text-white backdrop-blur"
              : "border-stoka-border bg-stoka-surface text-stoka-ink"
          }`}
        >
          <Wrench className={`size-3.5 ${hasBackground ? "text-white" : "text-stoka-red"}`} aria-hidden="true" />
          En mantenimiento
        </div>
        <h1 className={`max-w-lg font-display text-4xl font-bold sm:text-5xl ${hasBackground ? "text-white" : "text-stoka-ink"}`}>
          Ya volvemos.
        </h1>
        <p className={`max-w-md text-base sm:text-lg ${hasBackground ? "text-white/90" : "text-stoka-ink-muted"}`}>{message}</p>
        {returnTime && (
          <p className={`text-sm font-semibold ${hasBackground ? "text-white" : "text-stoka-ink"}`}>
            Volvemos aprox. el <span className={hasBackground ? "text-white" : "text-stoka-red"}>{returnTime}</span>
          </p>
        )}
        {showContactPhone && (
          <a
            href={`tel:+51${contactPhone.replace(/\s/g, "")}`}
            className={`flex items-center gap-2 text-sm font-semibold ${
              hasBackground ? "text-white/80 hover:text-white" : "text-stoka-ink-muted hover:text-stoka-red"
            }`}
          >
            <Phone className="size-4" aria-hidden="true" /> ¿Urgente? Llámanos al {contactPhone}
          </a>
        )}
      </div>
    </div>
  );
}

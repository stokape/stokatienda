import { CalendarClock, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useUpcomingMaintenanceNotice } from "../../lib/maintenance";
import { useDataStore } from "../../store/dataStore";

export function formatScheduled(startAt: string): string {
  const date = new Date(startAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-PE", { day: "2-digit", month: "long", hour: "numeric", minute: "2-digit" });
}

/**
 * Franja informativa (no bloquea la tienda) que avisa de un mantenimiento
 * ya programado antes de que llegue la hora — para que el cliente no se
 * encuentre la tienda apagada de sorpresa. Se puede cerrar; el cierre se
 * recuerda por esa ventana programada específica (si se reprograma, vuelve
 * a aparecer).
 */
export function MaintenanceNoticeBanner() {
  const visible = useUpcomingMaintenanceNotice();
  const maintenance = useDataStore((s) => s.maintenance);
  const dismissKey = `stoka-maintenance-notice-dismissed:${maintenance.startAt}`;
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(dismissKey) === "1");
    } catch {
      setDismissed(false);
    }
  }, [dismissKey]);

  if (!visible || dismissed) return null;

  return (
    <div className="flex items-center gap-3 border-b border-stoka-warning/30 bg-stoka-warning-100 px-4 py-2 text-sm text-stoka-warning">
      <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
      <p className="flex-1">
        {maintenance.noticeMessage}
        {maintenance.startAt && <span className="font-semibold"> Programado para el {formatScheduled(maintenance.startAt)}.</span>}
      </p>
      <button
        onClick={() => {
          setDismissed(true);
          try {
            sessionStorage.setItem(dismissKey, "1");
          } catch {
            // localStorage/sessionStorage puede fallar en modo privado; no es crítico, solo no se recordará el cierre.
          }
        }}
        aria-label="Cerrar aviso"
        className="cursor-pointer rounded-md p-1 hover:bg-stoka-warning/10"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

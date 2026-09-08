import { useEffect, useState } from "react";
import { useDataStore } from "../store/dataStore";
import type { MaintenanceConfig } from "../types";

/** Evalúa si el modo mantenimiento debe estar activo en un instante dado. */
export function isMaintenanceActive(config: MaintenanceConfig, now: Date = new Date()): boolean {
  if (config.enabled) return true;
  if (config.scheduled && config.startAt && config.endAt) {
    const t = now.getTime();
    const start = new Date(config.startAt).getTime();
    const end = new Date(config.endAt).getTime();
    return t >= start && t <= end;
  }
  return false;
}

/** Igual que isMaintenanceActive, pero reactivo: se re-evalúa cada 30s para
 * que una ventana programada se active/desactive sola sin recargar la página. */
export function useMaintenanceActive(): boolean {
  const config = useDataStore((s) => s.maintenance);
  const [, forceTick] = useState(0);

  useEffect(() => {
    if (!config.scheduled) return;
    const id = setInterval(() => forceTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, [config.scheduled]);

  return isMaintenanceActive(config);
}

import type { MaintenanceConfig } from "../types";

export const defaultMaintenanceConfig: MaintenanceConfig = {
  enabled: false,
  scheduled: false,
  startAt: "",
  endAt: "",
  message: "Estamos actualizando la tienda para atenderte mejor. Volvemos en breve — gracias por tu paciencia.",
  noticeEnabled: true,
  noticeMessage: "Tendremos mantenimiento programado — la tienda no estará disponible durante ese lapso.",
};

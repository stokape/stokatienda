import type { StoreConfig } from "../types";

// Configuración simulada: en producción estos datos vendrían de un backend
// y las credenciales de pago se guardarían fuera del cliente.
export const defaultStoreConfig: StoreConfig = {
  freeDeliveryThreshold: 60,
  defaultDeliveryFee: 6,
  openingHours: "Lun. a Dom. de 7:00 a. m. a 10:00 p. m.",
  deliveryZones: [
    { id: "z-sjl", district: "San Juan de Lurigancho", fee: 6, etaMinutes: 40 },
    { id: "z-olivos", district: "Los Olivos", fee: 5, etaMinutes: 30 },
    { id: "z-comas", district: "Comas", fee: 6, etaMinutes: 35 },
    { id: "z-smp", district: "San Martín de Porres", fee: 5, etaMinutes: 30 },
    { id: "z-ate", district: "Ate", fee: 7, etaMinutes: 45 },
    { id: "z-surco", district: "Santiago de Surco", fee: 8, etaMinutes: 50 },
    { id: "z-miraflores", district: "Miraflores", fee: 8, etaMinutes: 45 },
    { id: "z-independencia", district: "Independencia", fee: 5, etaMinutes: 25 },
  ],
  paymentAccounts: {
    yape: { phone: "987 654 321", holder: "Stoka Bodega E.I.R.L." },
    plin: { phone: "987 654 321", holder: "Stoka Bodega E.I.R.L." },
    transferencia: {
      bank: "BCP",
      accountNumber: "191-2345678-0-12",
      cci: "002-191-002345678012-34",
      holder: "Stoka Bodega E.I.R.L. - RUC 20601234567",
    },
  },
};

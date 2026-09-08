export function isValidPeruPhone(value: string): boolean {
  return /^9\d{8}$/.test(value.trim());
}

export function isValidEmail(value: string): boolean {
  if (!value) return true; // el correo es opcional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isRequired(value: string | undefined | null): boolean {
  return Boolean(value && value.trim().length > 0);
}

export interface CheckoutFormValues {
  name: string;
  phone: string;
  email: string;
  fulfillment: "delivery" | "recojo";
  addressLine: string;
  addressReference: string;
  district: string;
  scheduledDate: string;
  scheduledSlot: string;
  paymentMethod: string;
  operationNumber: string;
  hasProofFile: boolean;
}

export type CheckoutErrors = Partial<Record<keyof CheckoutFormValues, string>>;

export function validateCheckout(values: CheckoutFormValues): CheckoutErrors {
  const errors: CheckoutErrors = {};

  if (!isRequired(values.name)) errors.name = "Ingresa tu nombre completo.";
  if (!isValidPeruPhone(values.phone)) {
    errors.phone = "Ingresa un celular válido (9 dígitos, empieza con 9).";
  }
  if (!isValidEmail(values.email)) errors.email = "El correo no es válido.";

  if (values.fulfillment === "delivery") {
    if (!isRequired(values.addressLine)) errors.addressLine = "Ingresa tu dirección.";
    if (!isRequired(values.district)) errors.district = "Selecciona tu distrito.";
  }

  if (!isRequired(values.scheduledDate)) errors.scheduledDate = "Elige una fecha de entrega.";
  if (!isRequired(values.scheduledSlot)) errors.scheduledSlot = "Elige un horario.";
  if (!isRequired(values.paymentMethod)) errors.paymentMethod = "Selecciona un método de pago.";

  const requiresProof = ["yape", "plin", "transferencia", "transferencia-interbancaria"].includes(
    values.paymentMethod,
  );
  if (requiresProof && !isRequired(values.operationNumber) && !values.hasProofFile) {
    errors.operationNumber = "Ingresa el N° de operación o adjunta tu comprobante.";
  }

  return errors;
}

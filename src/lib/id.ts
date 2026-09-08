export function generateId(prefix = "id"): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}_${random}`;
}

/** Calcula el siguiente código correlativo STK-XXXXX a partir de los pedidos existentes. */
export function nextOrderCode(existingCodes: string[]): string {
  const max = existingCodes.reduce((acc, code) => {
    const n = Number(code.replace("STK-", ""));
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 10230);
  return `STK-${max + 1}`;
}

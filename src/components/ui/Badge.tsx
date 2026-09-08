import type { ReactNode } from "react";

export type BadgeVariant = "green" | "coral" | "yellow" | "blue" | "gray" | "red" | "outline";

// Nombres de variante heredados del primer concepto de marca; el mapeo de
// color ya apunta a los roles semánticos correctos (éxito, advertencia,
// info, peligro) sobre la paleta roja/plata/negro nueva.
const variants: Record<BadgeVariant, string> = {
  green: "bg-stoka-success-100 text-stoka-success border-stoka-success",
  coral: "bg-stoka-red-100 text-stoka-red border-stoka-red",
  yellow: "bg-stoka-warning-100 text-stoka-warning border-stoka-warning",
  blue: "bg-stoka-info-100 text-stoka-info border-stoka-info",
  gray: "bg-stoka-surface-2 text-stoka-ink-muted border-stoka-border-strong",
  red: "bg-stoka-red-100 text-stoka-red-dark border-stoka-red-dark",
  outline: "border-stoka-border-strong text-stoka-ink bg-transparent",
};

export function Badge({
  children,
  variant = "gray",
  className = "",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-bold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

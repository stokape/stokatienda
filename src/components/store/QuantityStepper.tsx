import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  quantity,
  onChange,
  max,
  size = "md",
}: {
  quantity: number;
  onChange: (next: number) => void;
  max?: number;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "size-8" : "size-10";
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-stoka-border bg-stoka-surface p-1 shadow-card">
      <button
        type="button"
        aria-label="Disminuir cantidad"
        onClick={() => onChange(quantity - 1)}
        className={`flex ${dim} cursor-pointer items-center justify-center rounded-md text-stoka-green-700 hover:bg-stoka-green-50 disabled:opacity-40`}
        disabled={quantity <= 1}
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <span className="w-6 text-center text-sm font-bold tabular-nums" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Aumentar cantidad"
        onClick={() => onChange(quantity + 1)}
        className={`flex ${dim} cursor-pointer items-center justify-center rounded-md text-stoka-green-700 hover:bg-stoka-green-50 disabled:opacity-40`}
        disabled={max !== undefined && quantity >= max}
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

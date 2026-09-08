import {
  Bike,
  CheckCircle2,
  ClipboardCheck,
  CookingPot,
  PackageCheck,
  ReceiptText,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import type { Order, OrderStatus } from "../../types";
import { formatDateTime } from "../../lib/format";

const pipeline: { key: OrderStatus; label: string; icon: typeof ReceiptText }[] = [
  { key: "recibido", label: "Pedido recibido", icon: ReceiptText },
  { key: "pendiente_pago", label: "Pendiente de pago", icon: ShieldAlert },
  { key: "pago_en_revision", label: "Pago en revisión", icon: ClipboardCheck },
  { key: "confirmado", label: "Confirmado", icon: CheckCircle2 },
  { key: "preparando", label: "Preparando", icon: CookingPot },
  { key: "en_reparto", label: "En reparto", icon: Bike },
  { key: "entregado", label: "Entregado", icon: PackageCheck },
];

export function Timeline({ order }: { order: Order }) {
  const currentIndex = pipeline.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "cancelado";
  const effectiveIndex = isCancelled ? pipeline.length : currentIndex;

  const historyFor = (status: OrderStatus) => order.history.find((h) => h.status === status);
  const lastEvent = order.history[order.history.length - 1];

  return (
    <div>
      {isCancelled && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-stoka-red-dark/40 bg-stoka-red-100 p-4">
          <XCircle className="mt-0.5 size-5 shrink-0 text-stoka-red-dark" aria-hidden="true" />
          <div>
            <p className="font-semibold text-stoka-red-dark">Pedido cancelado</p>
            {lastEvent?.note && <p className="text-sm text-stoka-red-dark">{lastEvent.note}</p>}
            <p className="text-xs text-stoka-ink-muted">{formatDateTime(lastEvent.at)}</p>
          </div>
        </div>
      )}
      <ol className="flex flex-col gap-0">
        {pipeline.map((step, index) => {
          const done = index < effectiveIndex || (!isCancelled && index === currentIndex);
          const isCurrent = !isCancelled && index === currentIndex;
          const event = historyFor(step.key);
          const Icon = step.icon;
          return (
            <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
              {index < pipeline.length - 1 && (
                <span
                  className={`absolute left-[19px] top-10 h-full w-0.5 ${
                    index < effectiveIndex ? "bg-stoka-green-500" : "bg-stoka-cream-300"
                  }`}
                  aria-hidden="true"
                />
              )}
              <span
                className={`z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 ${
                  done
                    ? "border-stoka-green-500 bg-stoka-green-500 text-white"
                    : "border-stoka-cream-300 bg-stoka-surface text-slate-300"
                } ${isCurrent ? "ring-4 ring-stoka-green-100" : ""}`}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="pt-1.5">
                <p className={`font-semibold ${done ? "text-stoka-green-900" : "text-slate-400"}`}>
                  {step.label}
                  {isCurrent && (
                    <span className="ml-2 rounded-full bg-stoka-info-100 px-2 py-0.5 text-xs font-bold text-stoka-info">
                      En curso
                    </span>
                  )}
                </p>
                {event && <p className="text-xs text-slate-400">{formatDateTime(event.at)}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

import { Banknote, Landmark, MapPin, PackageX, Phone, Smartphone, Store } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ProductImage } from "../components/store/ProductImage";
import { Timeline } from "../components/store/Timeline";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { formatCurrency, formatDateTime } from "../lib/format";
import { useDataStore } from "../store/dataStore";
import type { PaymentMethod, PaymentStatus } from "../types";

const paymentLabels: Record<PaymentMethod, string> = {
  yape: "Yape",
  plin: "Plin",
  transferencia: "Transferencia bancaria",
  "transferencia-interbancaria": "Transferencia interbancaria",
  efectivo: "Efectivo",
};

const paymentIcons: Record<PaymentMethod, typeof Smartphone> = {
  yape: Smartphone,
  plin: Smartphone,
  transferencia: Landmark,
  "transferencia-interbancaria": Landmark,
  efectivo: Banknote,
};

const proofStatusVariant: Record<PaymentStatus, "green" | "yellow" | "red" | "gray"> = {
  validado: "green",
  en_revision: "yellow",
  pendiente: "gray",
  rechazado: "red",
  vencido: "red",
};

const proofStatusLabel: Record<PaymentStatus, string> = {
  validado: "Pago validado",
  en_revision: "Pago en revisión",
  pendiente: "Pendiente de pago",
  rechazado: "Comprobante rechazado",
  vencido: "Pago vencido",
};

export function OrderTracking() {
  const { code } = useParams();
  const orders = useDataStore((s) => s.orders);
  const order = orders.find((o) => o.code.toLowerCase() === code?.toLowerCase());

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={PackageX}
          title="No encontramos ese pedido"
          description="Verifica el código e intenta nuevamente."
          action={
            <Link to="/" className="font-semibold text-stoka-green-700 underline">
              Volver al inicio
            </Link>
          }
        />
      </div>
    );
  }

  const PaymentIcon = paymentIcons[order.paymentMethod];
  // Descuento real (p. ej. por un combo) — se calcula así, y no leyendo
  // order.discount directo, porque ese campo es solo informativo (compara
  // contra el precio tachado, que ya está reflejado en subtotal); esta
  // resta sí cuadra siempre con lo que realmente se cobró.
  const realDiscount = order.subtotal + order.deliveryFee - order.total;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Pedido</p>
          <h1 className="font-display text-2xl font-bold text-stoka-green-900 sm:text-3xl">{order.code}</h1>
        </div>
        <p className="text-sm text-slate-500">{formatDateTime(order.createdAt)}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-stoka-border bg-stoka-surface p-5 sm:p-6">
          <Timeline order={order} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-stoka-border bg-stoka-surface p-5">
            <h2 className="mb-3 font-semibold text-stoka-green-900">Entrega</h2>
            <p className="flex items-center gap-2 text-sm text-stoka-ink">
              {order.fulfillment === "delivery" ? (
                <MapPin className="size-4 shrink-0 text-stoka-green-600" aria-hidden="true" />
              ) : (
                <Store className="size-4 shrink-0 text-stoka-green-600" aria-hidden="true" />
              )}
              {order.fulfillment === "delivery"
                ? `${order.address?.line}, ${order.address?.district}`
                : "Recojo en tienda"}
            </p>
            {order.scheduledDate && (
              <p className="mt-1 text-sm text-slate-500">
                {order.scheduledDate} · {order.scheduledSlot}
              </p>
            )}
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <Phone className="size-4 shrink-0" aria-hidden="true" /> {order.customer.phone}
            </p>
          </div>

          <div className="rounded-xl border border-stoka-border bg-stoka-surface p-5">
            <h2 className="mb-3 font-semibold text-stoka-green-900">Pago</h2>
            <p className="flex items-center gap-2 text-sm text-stoka-ink">
              <PaymentIcon className="size-4 shrink-0 text-stoka-green-600" aria-hidden="true" />
              {paymentLabels[order.paymentMethod]}
            </p>
            {order.paymentProof && (
              <div className="mt-2">
                <Badge variant={proofStatusVariant[order.paymentProof.status]}>
                  {proofStatusLabel[order.paymentProof.status]}
                </Badge>
                {order.paymentProof.reviewNote && (
                  <p className="mt-1 text-xs text-slate-500">{order.paymentProof.reviewNote}</p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-stoka-border bg-stoka-surface p-5">
            <h2 className="mb-3 font-semibold text-stoka-green-900">Productos</h2>
            <ul className="flex flex-col gap-3">
              {order.items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3 text-sm">
                  <ProductImage hue={140} icon="Package" name={item.name} className="size-10 shrink-0" iconClassName="size-4" />
                  <span className="flex-1 truncate">
                    {item.name} <span className="text-slate-400">×{item.quantity}</span>
                  </span>
                  <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 border-t border-stoka-cream-200 pt-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {realDiscount > 0 && (
                <div className="flex justify-between text-stoka-success">
                  <span>Descuento por combo</span>
                  <span>-{formatCurrency(realDiscount)}</span>
                </div>
              )}
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Delivery</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 text-base font-bold text-stoka-green-900">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

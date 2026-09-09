import {
  Banknote,
  Landmark,
  Paperclip,
  QrCode,
  ShoppingBag,
  Smartphone,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { ProductImage } from "../components/store/ProductImage";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Field, Input, Select, Textarea } from "../components/ui/form";
import { computeComboDiscount } from "../lib/combos";
import { formatCurrency } from "../lib/format";
import { generateId } from "../lib/id";
import { useCartStore } from "../store/cartStore";
import { useDataStore } from "../store/dataStore";
import { validateCheckout, type CheckoutErrors } from "../lib/validation";
import type { FulfillmentType, PaymentMethod } from "../types";

const slots = ["09:00 - 11:00", "11:00 - 13:00", "13:00 - 15:00", "15:00 - 17:00", "17:00 - 19:00", "19:00 - 21:00"];

const paymentOptions: { value: PaymentMethod; label: string; icon: typeof Smartphone; hint: string }[] = [
  { value: "yape", label: "Yape", icon: Smartphone, hint: "Escanea el QR o usa el número" },
  { value: "plin", label: "Plin", icon: Smartphone, hint: "Escanea el QR o usa el número" },
  { value: "transferencia", label: "Transferencia bancaria", icon: Landmark, hint: "Cuenta corriente BCP" },
  { value: "transferencia-interbancaria", label: "Transferencia interbancaria", icon: Landmark, hint: "Usa el CCI" },
  { value: "efectivo", label: "Efectivo", icon: Banknote, hint: "Paga cuando recibas tu pedido" },
];

export function Checkout() {
  const navigate = useNavigate();
  const products = useDataStore((s) => s.products);
  const combos = useDataStore((s) => s.combos);
  const config = useDataStore((s) => s.config);
  const createOrder = useDataStore((s) => s.createOrder);
  const cartLines = useCartStore((s) => s.lines);
  const clearCart = useCartStore((s) => s.clear);

  const [fulfillment, setFulfillment] = useState<FulfillmentType>(config.deliveryEnabled ? "delivery" : "recojo");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [addressReference, setAddressReference] = useState("");
  const [district, setDistrict] = useState("");
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().slice(0, 10));
  const [scheduledSlot, setScheduledSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [operationNumber, setOperationNumber] = useState("");
  const [proofFileName, setProofFileName] = useState("");
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const lines = useMemo(
    () =>
      cartLines
        .map((l) => {
          const product = products.find((p) => p.id === l.productId);
          return product ? { product, quantity: l.quantity } : null;
        })
        .filter((l): l is { product: (typeof products)[number]; quantity: number } => l !== null),
    [cartLines, products],
  );

  const subtotal = lines.reduce((acc, l) => acc + l.product.price * l.quantity, 0);
  const savings = lines.reduce(
    (acc, l) => acc + (l.product.compareAtPrice ? (l.product.compareAtPrice - l.product.price) * l.quantity : 0),
    0,
  );
  const { applied: appliedCombos, totalDiscount: comboDiscount } = useMemo(
    () => computeComboDiscount(cartLines, products, combos),
    [cartLines, products, combos],
  );
  const zone = config.deliveryZones.find((z) => z.district === district);
  const deliveryFee =
    fulfillment === "recojo" ? 0 : subtotal >= config.freeDeliveryThreshold ? 0 : zone?.fee ?? config.defaultDeliveryFee;
  const total = subtotal + deliveryFee - comboDiscount;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Tu carrito está vacío"
          description="Agrega productos antes de continuar con el pago."
          action={
            <Link to="/catalogo" className="font-semibold text-stoka-green-700 underline">
              Ir al catálogo
            </Link>
          }
        />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const values = {
      name,
      phone,
      email,
      fulfillment,
      addressLine,
      addressReference,
      district,
      scheduledDate,
      scheduledSlot,
      paymentMethod,
      operationNumber,
      hasProofFile: Boolean(proofFileName),
    };
    const validationErrors = validateCheckout(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Revisa los datos marcados en el formulario.");
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));

    const requiresProof = ["yape", "plin", "transferencia", "transferencia-interbancaria"].includes(paymentMethod);
    const order = createOrder({
      customer: { name, phone, email: email || undefined },
      fulfillment,
      address:
        fulfillment === "delivery" ? { line: addressLine, reference: addressReference || undefined, district } : undefined,
      scheduledDate,
      scheduledSlot,
      notes: notes || undefined,
      items: lines.map((l) => ({
        productId: l.product.id,
        name: l.product.name,
        presentation: l.product.presentation,
        price: l.product.price,
        quantity: l.quantity,
      })),
      subtotal,
      discount: savings,
      deliveryFee,
      total,
      paymentMethod: paymentMethod as PaymentMethod,
      paymentProof: requiresProof
        ? {
            id: generateId("pay"),
            method: paymentMethod as PaymentMethod,
            operationNumber: operationNumber || undefined,
            fileName: proofFileName || undefined,
            amount: total,
            status: "en_revision",
            submittedAt: new Date().toISOString(),
          }
        : undefined,
      status: requiresProof ? "pago_en_revision" : "recibido",
    });

    clearCart();
    setSubmitting(false);
    toast.success(`Pedido ${order.code} recibido`);
    navigate(`/pedido/${order.code}`);
  }

  const requiresProof = ["yape", "plin", "transferencia", "transferencia-interbancaria"].includes(paymentMethod);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 font-display text-2xl font-bold text-stoka-green-900 sm:text-3xl">Finalizar compra</h1>
      <form onSubmit={handleSubmit} noValidate className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-8">
          <section className="rounded-xl border border-stoka-border bg-stoka-surface p-5 sm:p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-stoka-green-900">1. Tus datos</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre completo" htmlFor="name" error={errors.name} required>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </Field>
              <Field label="Celular" htmlFor="phone" error={errors.phone} required hint="9 dígitos, ej. 987654321">
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" maxLength={9} autoComplete="tel" />
              </Field>
              <Field label="Correo (opcional)" htmlFor="email" error={errors.email}>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </Field>
            </div>
          </section>

          <section className="rounded-xl border border-stoka-border bg-stoka-surface p-5 sm:p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-stoka-green-900">
              {config.deliveryEnabled ? "2. Entrega" : "2. Recojo en tienda"}
            </h2>
            {config.deliveryEnabled ? (
              <div className="mb-4 flex gap-2">
                {(["delivery", "recojo"] as FulfillmentType[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFulfillment(opt)}
                    className={`flex-1 cursor-pointer rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                      fulfillment === opt
                        ? "border-stoka-green-600 bg-stoka-green-50 text-stoka-green-700"
                        : "border-stoka-border text-slate-500"
                    }`}
                  >
                    {opt === "delivery" ? "Delivery a domicilio" : "Recojo en tienda"}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mb-4 text-sm text-stoka-ink-muted">
                Por ahora solo atendemos con recojo en tienda — elige la fecha y horario que te acomode abajo.
              </p>
            )}

            {config.deliveryEnabled && fulfillment === "delivery" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Distrito" htmlFor="district" error={errors.district} required>
                  <Select id="district" value={district} onChange={(e) => setDistrict(e.target.value)}>
                    <option value="">Selecciona tu distrito</option>
                    {config.deliveryZones.map((z) => (
                      <option key={z.id} value={z.district}>
                        {z.district} — {formatCurrency(z.fee)} · {z.etaMinutes} min
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Dirección" htmlFor="addressLine" error={errors.addressLine} required>
                  <Input id="addressLine" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Referencia (opcional)" htmlFor="addressReference">
                    <Input id="addressReference" value={addressReference} onChange={(e) => setAddressReference(e.target.value)} placeholder="Ej. frente al parque, casa de rejas negras" />
                  </Field>
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Fecha de entrega" htmlFor="scheduledDate" error={errors.scheduledDate} required>
                <Input
                  id="scheduledDate"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </Field>
              <Field label="Horario" htmlFor="scheduledSlot" error={errors.scheduledSlot} required>
                <Select id="scheduledSlot" value={scheduledSlot} onChange={(e) => setScheduledSlot(e.target.value)}>
                  <option value="">Selecciona un horario</option>
                  {slots.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Notas para el pedido (opcional)" htmlFor="notes">
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej. tocar timbre, dejar con el vecino, etc." />
              </Field>
            </div>
          </section>

          <section className="rounded-xl border border-stoka-border bg-stoka-surface p-5 sm:p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-stoka-green-900">3. Método de pago</h2>
            {errors.paymentMethod && <p className="mb-3 text-sm font-medium text-stoka-red-dark">{errors.paymentMethod}</p>}
            <div className="grid gap-2 sm:grid-cols-2">
              {paymentOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPaymentMethod(opt.value)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                    paymentMethod === opt.value
                      ? "border-stoka-green-600 bg-stoka-green-50"
                      : "border-stoka-border hover:border-stoka-green-400"
                  }`}
                >
                  <opt.icon className="size-5 shrink-0 text-stoka-green-700" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-semibold text-stoka-green-900">{opt.label}</span>
                    <span className="block text-xs text-slate-500">{opt.hint}</span>
                  </span>
                </button>
              ))}
            </div>

            {requiresProof && (
              <div className="mt-5 rounded-xl bg-stoka-cream-100 p-4">
                {(paymentMethod === "yape" || paymentMethod === "plin") && (
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-16 items-center justify-center rounded-xl bg-stoka-surface shadow-card">
                      <QrCode className="size-9 text-stoka-green-700" aria-hidden="true" />
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-stoka-green-900">
                        {paymentMethod === "yape" ? config.paymentAccounts.yape.phone : config.paymentAccounts.plin.phone}
                      </p>
                      <p className="text-slate-500">{config.paymentAccounts.yape.holder}</p>
                    </div>
                  </div>
                )}
                {paymentMethod === "transferencia" && (
                  <div className="mb-4 text-sm">
                    <p><span className="font-semibold">Banco:</span> {config.paymentAccounts.transferencia.bank}</p>
                    <p><span className="font-semibold">Cuenta:</span> {config.paymentAccounts.transferencia.accountNumber}</p>
                    <p><span className="font-semibold">Titular:</span> {config.paymentAccounts.transferencia.holder}</p>
                  </div>
                )}
                {paymentMethod === "transferencia-interbancaria" && (
                  <div className="mb-4 text-sm">
                    <p><span className="font-semibold">CCI:</span> {config.paymentAccounts.transferencia.cci}</p>
                    <p><span className="font-semibold">Titular:</span> {config.paymentAccounts.transferencia.holder}</p>
                  </div>
                )}

                <p className="mb-3 text-xs text-slate-500">
                  Tu pago quedará <strong>pendiente de validación</strong> hasta que nuestro equipo lo confirme.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="N° de operación" htmlFor="operationNumber" error={errors.operationNumber} hint="Cópialo del comprobante">
                    <Input id="operationNumber" value={operationNumber} onChange={(e) => setOperationNumber(e.target.value)} />
                  </Field>
                  <Field label="Adjuntar comprobante" htmlFor="proofFile" hint="Imagen o PDF de tu pago">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-stoka-border bg-stoka-surface px-4 py-2.5 text-sm text-slate-500 hover:border-stoka-green-400">
                      <Paperclip className="size-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{proofFileName || "Seleccionar archivo…"}</span>
                      <input
                        id="proofFile"
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => setProofFileName(e.target.files?.[0]?.name ?? "")}
                      />
                    </label>
                  </Field>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-stoka-border bg-stoka-surface p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 font-display text-lg font-semibold text-stoka-green-900">Resumen del pedido</h2>
          <ul className="mb-4 flex flex-col gap-3 max-h-64 overflow-y-auto">
            {lines.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center gap-3 text-sm">
                <ProductImage hue={product.imageHue} icon={product.imageIcon} name={product.name} className="size-12 shrink-0" iconClassName="size-5" />
                <span className="flex-1 truncate">
                  {product.name} <span className="text-slate-400">×{quantity}</span>
                </span>
                <span className="font-semibold text-stoka-green-800">{formatCurrency(product.price * quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1.5 border-t border-stoka-cream-200 pt-4 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-stoka-coral-dark">
                <span>Ahorro</span>
                <span>-{formatCurrency(savings)}</span>
              </div>
            )}
            {appliedCombos.map(({ combo, times, discountPerApplication }) => (
              <div key={combo.id} className="flex justify-between text-stoka-success">
                <span>🎁 {combo.name}{times > 1 ? ` ×${times}` : ""}</span>
                <span>-{formatCurrency(discountPerApplication * times)}</span>
              </div>
            ))}
            {config.deliveryEnabled && (
              <div className="flex justify-between text-slate-500">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? "Gratis" : formatCurrency(deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1.5 text-base font-bold text-stoka-green-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <Button type="submit" size="lg" className="mt-5 w-full" loading={submitting}>
            {submitting ? "Procesando…" : "Confirmar pedido"}
          </Button>
        </aside>
      </form>
    </div>
  );
}

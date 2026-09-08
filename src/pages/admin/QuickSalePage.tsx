import { Minus, Plus, ScanBarcode, ShoppingBasket, Trash2, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BarcodeScannerModal } from "../../components/admin/BarcodeScannerModal";
import { Button } from "../../components/ui/Button";
import { Field, Input, Select } from "../../components/ui/form";
import { formatCurrency } from "../../lib/format";
import { useDataStore } from "../../store/dataStore";
import type { PaymentMethod, Product } from "../../types";

const paymentLabels: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  yape: "Yape",
  plin: "Plin",
  transferencia: "Transferencia bancaria",
  "transferencia-interbancaria": "Transferencia interbancaria",
};

interface CartLine {
  product: Product;
  quantity: number;
}

/**
 * Venta rápida de mostrador: para una compra que se paga físicamente en la
 * tienda (no por el checkout online). A diferencia del movimiento "Venta"
 * de Inventario —que solo descuenta stock—, esto crea un pedido interno ya
 * marcado como entregado, así que sí se refleja en el Dashboard, Reportes
 * y (si el pago es en efectivo y la caja está abierta) en el arqueo de Caja.
 */
export function QuickSalePage() {
  const products = useDataStore((s) => s.products);
  const createOrder = useDataStore((s) => s.createOrder);
  const cashSessions = useDataStore((s) => s.cashSessions);
  const addCashMovement = useDataStore((s) => s.addCashMovement);

  const [search, setSearch] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [submitting, setSubmitting] = useState(false);

  const isCajaOpen = cashSessions[0]?.status === "abierta";

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => p.stock > 0 && (p.name.toLowerCase().includes(q) || p.barcode?.toLowerCase() === q))
      .slice(0, 8);
  }, [products, search]);

  const lines: CartLine[] = useMemo(
    () =>
      Object.entries(cart)
        .map(([productId, quantity]) => {
          const product = products.find((p) => p.id === productId);
          return product ? { product, quantity } : null;
        })
        .filter((l): l is CartLine => l !== null),
    [cart, products],
  );

  const total = lines.reduce((acc, l) => acc + l.product.price * l.quantity, 0);

  function addToCart(product: Product) {
    if (product.stock <= 0) {
      toast.error("Sin stock disponible");
      return;
    }
    setCart((c) => {
      const current = c[product.id] ?? 0;
      if (current >= product.stock) {
        toast.error(`Solo hay ${product.stock} unidades de ${product.name}`);
        return c;
      }
      return { ...c, [product.id]: current + 1 };
    });
    setSearch("");
  }

  function setQuantity(product: Product, quantity: number) {
    setCart((c) => {
      if (quantity <= 0) {
        const next = { ...c };
        delete next[product.id];
        return next;
      }
      return { ...c, [product.id]: Math.min(quantity, product.stock) };
    });
  }

  function removeLine(productId: string) {
    setCart((c) => {
      const next = { ...c };
      delete next[productId];
      return next;
    });
  }

  function handleScan(code: string) {
    setScannerOpen(false);
    const product = products.find((p) => p.barcode === code);
    if (product) {
      addToCart(product);
      toast.success(`${product.name} agregado`);
    } else {
      toast.error("Código no encontrado en el catálogo", { description: code });
    }
  }

  function resetSale() {
    setCart({});
    setCustomerName("");
    setPaymentMethod("efectivo");
  }

  function handleCharge(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }
    setSubmitting(true);
    try {
      const order = createOrder({
        customer: { name: customerName.trim() || "Cliente de mostrador", phone: "-" },
        fulfillment: "recojo",
        notes: "Venta rápida de mostrador",
        items: lines.map((l) => ({
          productId: l.product.id,
          name: l.product.name,
          presentation: l.product.presentation,
          price: l.product.price,
          quantity: l.quantity,
        })),
        subtotal: total,
        discount: 0,
        deliveryFee: 0,
        total,
        paymentMethod,
        status: "entregado",
      });

      if (paymentMethod === "efectivo" && isCajaOpen) {
        addCashMovement({ type: "ingreso", concept: `Venta rápida ${order.code}`, amount: total });
        toast.success(`Venta ${order.code} registrada — sumada a la caja`);
      } else if (paymentMethod === "efectivo" && !isCajaOpen) {
        toast.warning(`Venta ${order.code} registrada`, {
          description: "La caja está cerrada: ábrela para que este efectivo también quede en el arqueo del día.",
        });
      } else {
        toast.success(`Venta ${order.code} registrada`);
      }
      resetSale();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleCharge} className="flex flex-col gap-6">
      <div>
        <h1 className="mb-1 font-display text-2xl font-bold text-stoka-green-900">Venta rápida</h1>
        <p className="text-sm text-slate-500">
          Para una compra que el cliente paga físicamente en el mostrador — descuenta el stock y queda registrada
          como venta en Dashboard, Reportes y Caja, sin pasar por el checkout online.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-stoka-border bg-stoka-surface p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Busca por nombre o código de barras…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setScannerOpen(true)}
                icon={<ScanBarcode className="size-4" aria-hidden="true" />}
              >
                Escanear
              </Button>
            </div>
            {results.length > 0 && (
              <ul className="mt-3 flex flex-col divide-y divide-stoka-border overflow-hidden rounded-lg border border-stoka-border">
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => addToCart(p)}
                      className="flex w-full cursor-pointer items-center justify-between gap-3 bg-stoka-surface px-3 py-2.5 text-left text-sm hover:bg-stoka-surface-2"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-stoka-ink">{p.name}</span>
                        <span className="text-xs text-slate-500">{p.presentation} · Stock {p.stock}</span>
                      </span>
                      <span className="shrink-0 font-semibold text-stoka-green-900">{formatCurrency(p.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {search.trim() && results.length === 0 && (
              <p className="mt-3 text-sm text-slate-400">Sin resultados con stock disponible.</p>
            )}
          </div>

          <div className="rounded-xl border border-stoka-border bg-stoka-surface p-4">
            <h2 className="mb-3 font-semibold text-stoka-green-900">Carrito</h2>
            {lines.length === 0 ? (
              <p className="rounded-lg border-2 border-dashed border-stoka-border py-8 text-center text-sm text-slate-400">
                <ShoppingBasket className="mx-auto mb-2 size-6 text-slate-300" aria-hidden="true" />
                Busca o escanea un producto para empezar.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {lines.map((l) => (
                  <li key={l.product.id} className="flex items-center gap-3 rounded-lg border border-stoka-border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stoka-ink">{l.product.name}</p>
                      <p className="text-xs text-slate-500">{formatCurrency(l.product.price)} c/u</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Restar"
                        onClick={() => setQuantity(l.product, l.quantity - 1)}
                        className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-stoka-border-strong hover:bg-stoka-surface-2"
                      >
                        <Minus className="size-3.5" aria-hidden="true" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{l.quantity}</span>
                      <button
                        type="button"
                        aria-label="Sumar"
                        disabled={l.quantity >= l.product.stock}
                        onClick={() => setQuantity(l.product, l.quantity + 1)}
                        className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-stoka-border-strong hover:bg-stoka-surface-2 disabled:opacity-40"
                      >
                        <Plus className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="w-20 shrink-0 text-right font-semibold text-stoka-green-900">
                      {formatCurrency(l.product.price * l.quantity)}
                    </p>
                    <button
                      type="button"
                      aria-label="Quitar"
                      onClick={() => removeLine(l.product.id)}
                      className="shrink-0 cursor-pointer rounded-md p-1.5 text-stoka-red-dark hover:bg-stoka-red-100"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-stoka-border bg-stoka-surface p-4">
            <Field label="Cliente (opcional)" htmlFor="qs-customer" hint="Si no lo indicas, queda como “Cliente de mostrador”.">
              <Input id="qs-customer" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Cliente de mostrador" />
            </Field>
            <div className="mt-4">
              <Field label="Método de pago" htmlFor="qs-payment">
                <Select id="qs-payment" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                  {(Object.keys(paymentLabels) as PaymentMethod[]).map((m) => (
                    <option key={m} value={m}>{paymentLabels[m]}</option>
                  ))}
                </Select>
              </Field>
              {paymentMethod === "efectivo" && !isCajaOpen && (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-stoka-warning">
                  <Wallet className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  La caja está cerrada — la venta igual se registra, pero este efectivo no quedará en el arqueo del día.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-stoka-border bg-stoka-surface p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-stoka-ink">Total a cobrar</span>
              <span className="font-display text-2xl font-bold text-stoka-green-900">{formatCurrency(total)}</span>
            </div>
            <Button type="submit" size="lg" className="mt-4 w-full" loading={submitting} disabled={lines.length === 0}>
              Cobrar venta
            </Button>
          </div>
        </div>
      </div>

      <BarcodeScannerModal open={scannerOpen} onClose={() => setScannerOpen(false)} onDetected={handleScan} />
    </form>
  );
}

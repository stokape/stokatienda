import { AlertTriangle, CalendarClock, Plus, ScanBarcode } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { BarcodeScannerModal } from "../../components/admin/BarcodeScannerModal";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "../../components/ui/form";
import { Modal } from "../../components/ui/Modal";
import { Tabs } from "../../components/ui/Tabs";
import { formatDate, formatDateTime } from "../../lib/format";
import { useDataStore } from "../../store/dataStore";
import type { InventoryMovement, MovementType, Product } from "../../types";

const movementLabels: Record<MovementType, string> = {
  entrada: "Entrada",
  venta: "Venta",
  ajuste: "Ajuste",
  merma: "Merma",
  devolucion: "Devolución",
};

const movementVariant: Record<MovementType, "green" | "blue" | "yellow" | "red" | "gray"> = {
  entrada: "green",
  venta: "blue",
  ajuste: "gray",
  merma: "red",
  devolucion: "yellow",
};

function impliedMargin(product: Product | undefined, fallback: number): number {
  if (!product || product.costPrice <= 0) return fallback;
  return Math.round(((product.price - product.costPrice) / product.costPrice) * 100);
}

export function InventoryPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"stock" | "movimientos" | "lotes">("stock");
  const products = useDataStore((s) => s.products);
  const movements = useDataStore((s) => s.inventoryMovements);
  const config = useDataStore((s) => s.config);
  const addInventoryMovement = useDataStore((s) => s.addInventoryMovement);
  const updateProduct = useDataStore((s) => s.updateProduct);

  const [modalOpen, setModalOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<MovementType>("entrada");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [batch, setBatch] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [unitCost, setUnitCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [marginPercent, setMarginPercent] = useState(config.defaultMargin);
  const [applyPrice, setApplyPrice] = useState(true);

  const selectedProduct = products.find((p) => p.id === productId);
  const suggestedPrice = Math.round(unitCost * (1 + marginPercent / 100) * 100) / 100;

  function openMovementModal(product?: Product) {
    const selected = product ?? products[0];
    setProductId(selected?.id ?? "");
    setType("entrada");
    setQuantity(1);
    setNote("");
    setBatch("");
    setExpiryDate("");
    setUnitCost(0);
    setTotalCost(0);
    setMarginPercent(impliedMargin(selected, config.defaultMargin));
    setApplyPrice(true);
    setModalOpen(true);
  }

  function handleQuantityChange(nextQty: number) {
    setQuantity(nextQty);
    setTotalCost(Math.round(unitCost * nextQty * 100) / 100);
  }
  function handleUnitCostChange(value: number) {
    setUnitCost(value);
    setTotalCost(Math.round(value * quantity * 100) / 100);
  }
  function handleTotalCostChange(value: number) {
    setTotalCost(value);
    setUnitCost(quantity > 0 ? Math.round((value / quantity) * 100) / 100 : 0);
  }

  function handleScan(code: string) {
    setScannerOpen(false);
    const product = products.find((p) => p.barcode === code);
    if (product) {
      openMovementModal(product);
      toast.success(`${product.name} encontrado`, { description: `Stock actual: ${product.stock}` });
    } else {
      toast.error("Código no encontrado en el catálogo", {
        description: code,
        action: {
          label: "Crear producto",
          onClick: () => navigate("/admin/productos", { state: { prefillBarcode: code } }),
        },
      });
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || quantity === 0) {
      toast.error("Selecciona un producto e ingresa una cantidad distinta de cero.");
      return;
    }
    const signedQty = ["venta", "merma"].includes(type) ? -Math.abs(quantity) : Math.abs(quantity);
    addInventoryMovement({
      productId,
      type,
      quantity: signedQty,
      note: note || undefined,
      batch: batch || undefined,
      expiryDate: expiryDate || undefined,
      createdBy: "Panel administrativo",
    });

    if (type === "entrada" && unitCost > 0) {
      updateProduct(productId, {
        costPrice: unitCost,
        ...(applyPrice ? { price: suggestedPrice } : {}),
      });
      toast.success(
        applyPrice
          ? `Movimiento registrado — costo y precio de venta actualizados (S/ ${suggestedPrice.toFixed(2)})`
          : "Movimiento registrado — costo del producto actualizado",
      );
    } else {
      toast.success("Movimiento registrado y stock actualizado");
    }
    setModalOpen(false);
  }

  const lotMovements = useMemo(
    () =>
      movements
        .filter((m) => m.expiryDate)
        .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime()),
    [movements],
  );

  const stockColumns: Column<Product>[] = [
    { header: "Producto", render: (p) => <span className="font-medium text-stoka-green-900">{p.name}</span> },
    { header: "SKU", render: (p) => p.sku },
    { header: "Stock", render: (p) => p.stock },
    { header: "Mínimo", render: (p) => p.minStock },
    {
      header: "Estado",
      render: (p) =>
        p.stock <= 0 ? (
          <Badge variant="red">Agotado</Badge>
        ) : p.stock <= p.minStock ? (
          <Badge variant="yellow">Reponer</Badge>
        ) : (
          <Badge variant="green">Óptimo</Badge>
        ),
    },
    {
      header: "",
      render: (p) => (
        <Button size="sm" variant="outline" onClick={() => openMovementModal(p)}>
          Registrar movimiento
        </Button>
      ),
    },
  ];

  const movementColumns: Column<InventoryMovement>[] = [
    { header: "Fecha", render: (m) => formatDateTime(m.createdAt) },
    { header: "Producto", render: (m) => products.find((p) => p.id === m.productId)?.name ?? m.productId },
    { header: "Tipo", render: (m) => <Badge variant={movementVariant[m.type]}>{movementLabels[m.type]}</Badge> },
    { header: "Cantidad", render: (m) => <span className={m.quantity < 0 ? "text-stoka-red-dark" : "text-stoka-green-700"}>{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</span> },
    { header: "Nota", render: (m) => m.note ?? "—" },
    { header: "Responsable", render: (m) => m.createdBy },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-stoka-green-900">Inventario</h1>
          <p className="text-sm text-slate-500">Stock, movimientos, lotes y vencimientos.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setScannerOpen(true)} icon={<ScanBarcode className="size-4" aria-hidden="true" />}>
            Escanear código
          </Button>
          <Button onClick={() => openMovementModal()} icon={<Plus className="size-4" aria-hidden="true" />}>
            Registrar movimiento
          </Button>
        </div>
      </div>

      <Tabs
        tabs={[
          { value: "stock", label: "Stock actual" },
          { value: "movimientos", label: "Movimientos" },
          { value: "lotes", label: "Lotes y vencimientos" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="mt-5">
        {tab === "stock" && <DataTable columns={stockColumns} rows={products} keyExtractor={(p) => p.id} />}
        {tab === "movimientos" && (
          <DataTable columns={movementColumns} rows={movements} keyExtractor={(m) => m.id} emptyMessage="Sin movimientos registrados." />
        )}
        {tab === "lotes" &&
          (lotMovements.length === 0 ? (
            <p className="text-sm text-slate-400">No hay lotes con fecha de vencimiento registrada.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {lotMovements.map((m) => {
                const product = products.find((p) => p.id === m.productId);
                const daysLeft = Math.ceil((new Date(m.expiryDate!).getTime() - Date.now()) / 86400000);
                const urgent = daysLeft <= 3;
                const soon = daysLeft <= 14;
                return (
                  <li key={m.id} className="flex items-center justify-between gap-3 rounded-xl border border-stoka-border bg-stoka-surface p-4">
                    <div className="flex items-center gap-3">
                      {urgent ? (
                        <AlertTriangle className="size-5 shrink-0 text-stoka-red" aria-hidden="true" />
                      ) : (
                        <CalendarClock className="size-5 shrink-0 text-stoka-green-500" aria-hidden="true" />
                      )}
                      <div>
                        <p className="font-medium text-stoka-green-900">{product?.name}</p>
                        <p className="text-xs text-slate-400">Lote {m.batch ?? "—"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={urgent ? "red" : soon ? "yellow" : "green"}>
                        {daysLeft < 0 ? "Vencido" : `Vence en ${daysLeft} días`}
                      </Badge>
                      <p className="mt-1 text-xs text-slate-400">{formatDate(m.expiryDate!)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar movimiento de inventario" size="lg">
        <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
          <Field label="Producto" htmlFor="mv-product" required>
            <Select
              id="mv-product"
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                setMarginPercent(impliedMargin(products.find((p) => p.id === e.target.value), config.defaultMargin));
              }}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Tipo de movimiento" htmlFor="mv-type" required>
            <Select id="mv-type" value={type} onChange={(e) => setType(e.target.value as MovementType)}>
              {Object.entries(movementLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Cantidad" htmlFor="mv-qty" required hint="Se aplicará como salida en ventas y mermas">
            <Input id="mv-qty" type="number" min={1} value={quantity} onChange={(e) => handleQuantityChange(Number(e.target.value))} />
          </Field>
          <Field label="Lote (opcional)" htmlFor="mv-batch">
            <Input id="mv-batch" value={batch} onChange={(e) => setBatch(e.target.value)} />
          </Field>

          {type === "entrada" && (
            <div className="rounded-xl border border-stoka-border bg-stoka-surface-2 p-4 sm:col-span-2">
              <p className="mb-3 text-sm font-semibold text-stoka-ink">
                Costo de esta compra
                {selectedProduct && (
                  <span className="ml-2 font-normal text-stoka-ink-muted">
                    (costo actual: S/ {selectedProduct.costPrice.toFixed(2)} · precio actual: S/ {selectedProduct.price.toFixed(2)})
                  </span>
                )}
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Costo unitario (S/)" htmlFor="mv-unit-cost" hint="Lo que pagaste por cada unidad">
                  <Input id="mv-unit-cost" type="number" min={0} step={0.01} value={unitCost} onChange={(e) => handleUnitCostChange(Number(e.target.value))} />
                </Field>
                <Field label="Costo total de la compra (S/)" htmlFor="mv-total-cost" hint={`Para ${quantity} unidad(es)`}>
                  <Input id="mv-total-cost" type="number" min={0} step={0.01} value={totalCost} onChange={(e) => handleTotalCostChange(Number(e.target.value))} />
                </Field>
                <Field label="Margen deseado (%)" htmlFor="mv-margin">
                  <Input id="mv-margin" type="number" step={1} value={marginPercent} onChange={(e) => setMarginPercent(Number(e.target.value))} />
                </Field>
              </div>
              {unitCost > 0 && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-stoka-surface p-3">
                  <p className="text-sm text-stoka-ink">
                    Precio de venta sugerido: <span className="font-display text-lg font-bold text-stoka-red">S/ {suggestedPrice.toFixed(2)}</span>
                  </p>
                  <Checkbox
                    label="Actualizar el precio de venta del producto"
                    checked={applyPrice}
                    onChange={(e) => setApplyPrice(e.target.checked)}
                  />
                </div>
              )}
            </div>
          )}

          <Field label="Fecha de vencimiento (opcional)" htmlFor="mv-expiry">
            <Input id="mv-expiry" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Nota (opcional)" htmlFor="mv-note">
              <Textarea id="mv-note" value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Guardar movimiento</Button>
          </div>
        </form>
      </Modal>

      <BarcodeScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={handleScan}
        title="Escanear producto para stockear"
      />
    </div>
  );
}

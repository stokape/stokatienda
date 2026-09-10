import { Camera, Check, Pencil, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Field, Input, Select } from "../../components/ui/form";
import { Modal } from "../../components/ui/Modal";
import { Tabs } from "../../components/ui/Tabs";
import { formatCurrency, formatDate } from "../../lib/format";
import { useDataStore } from "../../store/dataStore";
import type { Purchase, Supplier } from "../../types";

const emptySupplier = { name: "", ruc: "", phone: "", category: "" };
const MAX_RECEIPT_BYTES = 1.5 * 1024 * 1024; // se guarda como data URL, sin backend real
const today = () => new Date().toISOString().slice(0, 10);

export function SuppliersPage() {
  const [tab, setTab] = useState<"proveedores" | "compras">("proveedores");
  const suppliers = useDataStore((s) => s.suppliers);
  const purchases = useDataStore((s) => s.purchases);
  const products = useDataStore((s) => s.products);
  const addSupplier = useDataStore((s) => s.addSupplier);
  const updateSupplier = useDataStore((s) => s.updateSupplier);
  const deleteSupplier = useDataStore((s) => s.deleteSupplier);
  const addPurchase = useDataStore((s) => s.addPurchase);
  const receivePurchase = useDataStore((s) => s.receivePurchase);

  const [supplierModal, setSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState(emptySupplier);

  const [purchaseModal, setPurchaseModal] = useState(false);
  const [purchaseSupplierId, setPurchaseSupplierId] = useState("");
  const [purchasePlace, setPurchasePlace] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(today());
  const [receiptNumber, setReceiptNumber] = useState("");
  const [receiptImage, setReceiptImage] = useState("");
  const [purchaseTotal, setPurchaseTotal] = useState("");
  const [purchaseItems, setPurchaseItems] = useState<{ productId: string; quantity: number; unitCost: number }[]>([]);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  function openSupplierCreate() {
    setEditingSupplier(null);
    setSupplierForm(emptySupplier);
    setSupplierModal(true);
  }
  function openSupplierEdit(s: Supplier) {
    setEditingSupplier(s);
    setSupplierForm({ name: s.name, ruc: s.ruc, phone: s.phone, category: s.category });
    setSupplierModal(true);
  }
  function saveSupplier(e: React.FormEvent) {
    e.preventDefault();
    if (!supplierForm.name.trim() || !supplierForm.ruc.trim()) {
      toast.error("Ingresa nombre y RUC del proveedor.");
      return;
    }
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, supplierForm);
      toast.success("Proveedor actualizado");
    } else {
      addSupplier(supplierForm);
      toast.success("Proveedor creado");
    }
    setSupplierModal(false);
  }

  function openPurchaseModal() {
    setPurchaseSupplierId("");
    setPurchasePlace("");
    setPurchaseDate(today());
    setReceiptNumber("");
    setReceiptImage("");
    setPurchaseTotal("");
    setPurchaseItems([]);
    setPurchaseModal(true);
  }

  function handleReceiptSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Elige un archivo de imagen (foto o escaneo de la boleta).");
      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      toast.error("La imagen es muy pesada.", { description: "Usa una de menos de 1.5 MB para que cargue rápido." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setReceiptImage(reader.result as string);
    reader.onerror = () => toast.error("No se pudo leer la imagen.");
    reader.readAsDataURL(file);
  }

  const purchaseItemsSum = purchaseItems.reduce((acc, i) => acc + i.quantity * i.unitCost, 0);

  function savePurchase(e: React.FormEvent) {
    e.preventDefault();
    const validItems = purchaseItems.filter((i) => i.productId && i.quantity > 0);
    const total = Number(purchaseTotal);
    if (!purchaseSupplierId && !purchasePlace.trim()) {
      toast.error("Indica un proveedor o el lugar donde compraste.");
      return;
    }
    if (!total || total <= 0) {
      toast.error("Ingresa el total pagado.", {
        description: purchaseItemsSum > 0 ? `Suma de los ítems: ${formatCurrency(purchaseItemsSum)}` : undefined,
      });
      return;
    }
    addPurchase({
      supplierId: purchaseSupplierId || undefined,
      place: purchasePlace.trim() || undefined,
      purchaseDate,
      receiptNumber: receiptNumber.trim() || undefined,
      receiptImage: receiptImage || undefined,
      items: validItems,
      total,
    });
    toast.success("Compra registrada");
    setPurchaseModal(false);
  }

  const supplierColumns: Column<Supplier>[] = [
    { header: "Proveedor", render: (s) => <span className="font-medium text-stoka-green-900">{s.name}</span> },
    { header: "RUC", render: (s) => s.ruc },
    { header: "Categoría", render: (s) => s.category },
    { header: "Teléfono", render: (s) => s.phone },
    {
      header: "Acciones",
      render: (s) => (
        <div className="flex gap-2">
          <button onClick={() => openSupplierEdit(s)} aria-label={`Editar ${s.name}`} className="cursor-pointer rounded-lg p-1.5 text-stoka-green-700 hover:bg-stoka-green-50">
            <Pencil className="size-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => {
              deleteSupplier(s.id);
              toast.success("Proveedor eliminado");
            }}
            aria-label={`Eliminar ${s.name}`}
            className="cursor-pointer rounded-lg p-1.5 text-stoka-red-dark hover:bg-stoka-red-100"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  const purchaseColumns: Column<Purchase>[] = [
    {
      header: "Lugar",
      render: (p) => {
        const supplierName = suppliers.find((s) => s.id === p.supplierId)?.name;
        return (
          <div>
            <p className="font-medium text-stoka-ink">{supplierName ?? p.place ?? "—"}</p>
            {supplierName && p.place && <p className="text-xs text-stoka-ink-muted">{p.place}</p>}
          </div>
        );
      },
    },
    { header: "Productos", render: (p) => (p.items.length > 0 ? `${p.items.length} ítem(s)` : "Sin itemizar") },
    { header: "Total pagado", render: (p) => formatCurrency(p.total) },
    { header: "Fecha de compra", render: (p) => formatDate(p.purchaseDate ?? p.createdAt) },
    {
      header: "Boleta",
      render: (p) =>
        p.receiptImage ? (
          <button
            onClick={() => setPreviewImage(p.receiptImage!)}
            aria-label="Ver comprobante"
            className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-stoka-border hover:border-stoka-border-strong"
          >
            <img src={p.receiptImage} alt="" className="size-full object-cover" />
          </button>
        ) : (
          <span className="text-stoka-ink-muted">—</span>
        ),
    },
    { header: "Estado", render: (p) => <Badge variant={p.status === "recibida" ? "green" : "yellow"}>{p.status === "recibida" ? "Recibida" : "Pendiente"}</Badge> },
    {
      header: "",
      render: (p) =>
        p.status === "pendiente" ? (
          <Button
            size="sm"
            variant="outline"
            icon={<Check className="size-3.5" aria-hidden="true" />}
            onClick={() => {
              receivePurchase(p.id);
              toast.success("Compra recibida, stock actualizado");
            }}
          >
            Marcar recibida
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-stoka-green-900">Proveedores y compras</h1>
          <p className="text-sm text-slate-500">
            Gestiona tus proveedores y lleva registro de tus compras — con foto de la boleta, dónde y cuánto pagaste —
            para ir comparando y decidir dónde te conviene comprar.
          </p>
        </div>
        {tab === "proveedores" ? (
          <Button onClick={openSupplierCreate} icon={<Plus className="size-4" aria-hidden="true" />}>Nuevo proveedor</Button>
        ) : (
          <Button onClick={openPurchaseModal} icon={<Plus className="size-4" aria-hidden="true" />}>Nueva compra</Button>
        )}
      </div>

      <Tabs tabs={[{ value: "proveedores", label: "Proveedores" }, { value: "compras", label: "Compras" }]} active={tab} onChange={setTab} />

      <div className="mt-5">
        {tab === "proveedores" ? (
          <DataTable columns={supplierColumns} rows={suppliers} keyExtractor={(s) => s.id} />
        ) : (
          <DataTable columns={purchaseColumns} rows={purchases} keyExtractor={(p) => p.id} />
        )}
      </div>

      <Modal open={supplierModal} onClose={() => setSupplierModal(false)} title={editingSupplier ? "Editar proveedor" : "Nuevo proveedor"} size="sm">
        <form onSubmit={saveSupplier} className="flex flex-col gap-4">
          <Field label="Nombre" htmlFor="s-name" required>
            <Input id="s-name" value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} />
          </Field>
          <Field label="RUC" htmlFor="s-ruc" required>
            <Input id="s-ruc" value={supplierForm.ruc} onChange={(e) => setSupplierForm({ ...supplierForm, ruc: e.target.value })} />
          </Field>
          <Field label="Teléfono" htmlFor="s-phone">
            <Input id="s-phone" value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} />
          </Field>
          <Field label="Categoría" htmlFor="s-category">
            <Input id="s-category" value={supplierForm.category} onChange={(e) => setSupplierForm({ ...supplierForm, category: e.target.value })} />
          </Field>
          <Button type="submit">{editingSupplier ? "Guardar" : "Crear proveedor"}</Button>
        </form>
      </Modal>

      <Modal open={purchaseModal} onClose={() => setPurchaseModal(false)} title="Nueva compra" size="lg">
        <form onSubmit={savePurchase} className="flex flex-col gap-4">
          <p className="-mt-1 text-sm text-stoka-ink-muted">
            Registra el gasto aunque no tengas todo el detalle a mano — con la foto de la boleta y el total ya queda
            guardado para que puedas comparar dónde te conviene comprar.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Proveedor (opcional)" htmlFor="pu-supplier" hint="Si ya lo tienes registrado">
              <Select id="pu-supplier" value={purchaseSupplierId} onChange={(e) => setPurchaseSupplierId(e.target.value)}>
                <option value="">— Sin proveedor registrado —</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Lugar de compra (opcional)" htmlFor="pu-place" hint="Ej. Mercado Mayorista, Makro">
              <Input id="pu-place" value={purchasePlace} onChange={(e) => setPurchasePlace(e.target.value)} placeholder="¿Dónde compraste?" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fecha de la compra" htmlFor="pu-date" required>
              <Input id="pu-date" type="date" max={today()} value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
            </Field>
            <Field label="N° de boleta/factura (opcional)" htmlFor="pu-receipt-number">
              <Input id="pu-receipt-number" value={receiptNumber} onChange={(e) => setReceiptNumber(e.target.value)} placeholder="Ej. B001-4521" />
            </Field>
          </div>

          <Field label="Foto de la boleta (opcional)" htmlFor="pu-receipt-file" hint="JPG/PNG/WEBP, máx. 1.5 MB.">
            <input ref={receiptInputRef} id="pu-receipt-file" type="file" accept="image/*" className="hidden" onChange={handleReceiptSelect} />
            {receiptImage ? (
              <div className="flex items-center gap-3">
                <img src={receiptImage} alt="Boleta seleccionada" className="size-16 shrink-0 rounded-lg border border-stoka-border object-cover" />
                <div className="flex flex-1 gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => receiptInputRef.current?.click()}>Cambiar</Button>
                  <Button type="button" variant="ghost" size="sm" icon={<Trash2 className="size-4" aria-hidden="true" />} onClick={() => setReceiptImage("")}>
                    Quitar
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => receiptInputRef.current?.click()}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-stoka-border bg-stoka-surface px-4 py-2.5 text-sm text-stoka-ink-muted hover:border-stoka-red-400"
              >
                <Camera className="size-4 shrink-0" aria-hidden="true" />
                Tomar foto o subir imagen de la boleta…
              </button>
            )}
          </Field>

          <div className="flex flex-col gap-3 rounded-lg border border-stoka-border bg-stoka-surface-2 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-stoka-ink">Productos (opcional)</p>
              <p className="text-xs text-stoka-ink-muted">Si no vas a itemizar ahora, déjalo vacío.</p>
            </div>
            {purchaseItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_90px_110px_auto] items-end gap-2">
                <Field label="Producto" htmlFor={`pu-prod-${idx}`}>
                  <Select
                    id={`pu-prod-${idx}`}
                    value={item.productId}
                    onChange={(e) => setPurchaseItems((prev) => prev.map((it, i) => (i === idx ? { ...it, productId: e.target.value } : it)))}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Cant." htmlFor={`pu-qty-${idx}`}>
                  <Input
                    id={`pu-qty-${idx}`}
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => setPurchaseItems((prev) => prev.map((it, i) => (i === idx ? { ...it, quantity: Number(e.target.value) } : it)))}
                  />
                </Field>
                <Field label="Costo (S/)" htmlFor={`pu-cost-${idx}`}>
                  <Input
                    id={`pu-cost-${idx}`}
                    type="number"
                    min={0}
                    step={0.1}
                    value={item.unitCost}
                    onChange={(e) => setPurchaseItems((prev) => prev.map((it, i) => (i === idx ? { ...it, unitCost: Number(e.target.value) } : it)))}
                  />
                </Field>
                <button
                  type="button"
                  aria-label="Quitar producto"
                  className="mb-1 cursor-pointer rounded-lg p-2 text-stoka-red-dark hover:bg-stoka-red-100"
                  onClick={() => setPurchaseItems((prev) => prev.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start"
              onClick={() => setPurchaseItems((prev) => [...prev, { productId: products[0]?.id ?? "", quantity: 1, unitCost: 0 }])}
            >
              + Agregar producto
            </Button>
            {purchaseItems.length > 0 && (
              <p className="text-right text-xs text-stoka-ink-muted">Suma de los ítems: {formatCurrency(purchaseItemsSum)}</p>
            )}
          </div>

          <Field label="Total pagado (S/)" htmlFor="pu-total" required hint="El monto real de la boleta — puede no coincidir con la suma de ítems.">
            <div className="flex gap-2">
              <Input id="pu-total" type="number" min={0} step={0.1} value={purchaseTotal} onChange={(e) => setPurchaseTotal(e.target.value)} placeholder="0.00" />
              {purchaseItemsSum > 0 && (
                <Button type="button" variant="outline" size="sm" onClick={() => setPurchaseTotal(String(purchaseItemsSum))}>
                  Usar suma
                </Button>
              )}
            </div>
          </Field>

          <Button type="submit">Registrar compra</Button>
        </form>
      </Modal>

      <Modal open={Boolean(previewImage)} onClose={() => setPreviewImage(null)} title="Comprobante" size="md">
        {previewImage && <img src={previewImage} alt="Boleta de compra" className="w-full rounded-lg" />}
      </Modal>
    </div>
  );
}

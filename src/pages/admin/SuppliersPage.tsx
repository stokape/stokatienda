import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
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
  const [purchaseItems, setPurchaseItems] = useState<{ productId: string; quantity: number; unitCost: number }[]>([]);

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
    setPurchaseSupplierId(suppliers[0]?.id ?? "");
    setPurchaseItems([{ productId: products[0]?.id ?? "", quantity: 1, unitCost: 0 }]);
    setPurchaseModal(true);
  }
  function savePurchase(e: React.FormEvent) {
    e.preventDefault();
    const validItems = purchaseItems.filter((i) => i.productId && i.quantity > 0);
    if (!purchaseSupplierId || validItems.length === 0) {
      toast.error("Selecciona proveedor y al menos un producto.");
      return;
    }
    const total = validItems.reduce((acc, i) => acc + i.quantity * i.unitCost, 0);
    addPurchase({ supplierId: purchaseSupplierId, items: validItems, total });
    toast.success("Orden de compra registrada");
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
    { header: "Proveedor", render: (p) => suppliers.find((s) => s.id === p.supplierId)?.name ?? "—" },
    { header: "Productos", render: (p) => `${p.items.length} ítem(s)` },
    { header: "Total", render: (p) => formatCurrency(p.total) },
    { header: "Fecha", render: (p) => formatDate(p.createdAt) },
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
          <p className="text-sm text-slate-500">Gestiona tus proveedores y órdenes de compra.</p>
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

      <Modal open={purchaseModal} onClose={() => setPurchaseModal(false)} title="Nueva orden de compra" size="lg">
        <form onSubmit={savePurchase} className="flex flex-col gap-4">
          <Field label="Proveedor" htmlFor="pu-supplier" required>
            <Select id="pu-supplier" value={purchaseSupplierId} onChange={(e) => setPurchaseSupplierId(e.target.value)}>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </Field>

          <div className="flex flex-col gap-3">
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
          </div>

          <p className="text-right text-sm font-semibold text-stoka-green-900">
            Total: {formatCurrency(purchaseItems.reduce((acc, i) => acc + i.quantity * i.unitCost, 0))}
          </p>

          <Button type="submit">Registrar compra</Button>
        </form>
      </Modal>
    </div>
  );
}

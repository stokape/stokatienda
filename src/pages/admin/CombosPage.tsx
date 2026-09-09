import { Gift, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Checkbox, Field, Input } from "../../components/ui/form";
import { EmptyState } from "../../components/ui/EmptyState";
import { Modal } from "../../components/ui/Modal";
import { formatCurrency } from "../../lib/format";
import { useDataStore } from "../../store/dataStore";
import type { Combo } from "../../types";

type ComboForm = { name: string; productIds: string[]; comboPrice: string; active: boolean };
const emptyForm: ComboForm = { name: "", productIds: [], comboPrice: "", active: true };

export function CombosPage() {
  const combos = useDataStore((s) => s.combos);
  const products = useDataStore((s) => s.products);
  const addCombo = useDataStore((s) => s.addCombo);
  const updateCombo = useDataStore((s) => s.updateCombo);
  const deleteCombo = useDataStore((s) => s.deleteCombo);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Combo | null>(null);
  const [form, setForm] = useState<ComboForm>(emptyForm);
  const [productSearch, setProductSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Combo | null>(null);

  function normalPriceOf(productIds: string[]) {
    return productIds.reduce((sum, id) => sum + (products.find((p) => p.id === id)?.price ?? 0), 0);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setProductSearch("");
    setModalOpen(true);
  }
  function openEdit(combo: Combo) {
    setEditing(combo);
    setForm({ name: combo.name, productIds: combo.productIds, comboPrice: String(combo.comboPrice), active: combo.active });
    setProductSearch("");
    setModalOpen(true);
  }

  function toggleProduct(id: string) {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(id) ? f.productIds.filter((pid) => pid !== id) : [...f.productIds, id],
    }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const comboPrice = Number(form.comboPrice);
    if (!form.name.trim()) {
      toast.error("Ingresa un nombre para el combo.");
      return;
    }
    if (form.productIds.length < 2) {
      toast.error("Elige al menos 2 productos distintos.");
      return;
    }
    if (!comboPrice || comboPrice <= 0) {
      toast.error("Ingresa un precio de combo válido.");
      return;
    }
    const normal = normalPriceOf(form.productIds);
    if (comboPrice >= normal) {
      toast.error("El precio del combo debe ser menor a la suma de los productos.", {
        description: `Suma actual: ${formatCurrency(normal)}`,
      });
      return;
    }
    const payload = { name: form.name.trim(), productIds: form.productIds, comboPrice, active: form.active };
    if (editing) {
      updateCombo(editing.id, payload);
      toast.success("Combo actualizado");
    } else {
      addCombo(payload);
      toast.success("Combo creado");
    }
    setModalOpen(false);
  }

  const filteredProducts = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase())),
    [products, productSearch],
  );
  const selectedNormalPrice = normalPriceOf(form.productIds);
  const previewSavings = selectedNormalPrice - Number(form.comboPrice || 0);

  const columns: Column<Combo>[] = [
    { header: "Combo", render: (c) => <span className="font-medium text-stoka-ink">{c.name}</span> },
    {
      header: "Productos",
      render: (c) => (
        <div className="flex flex-wrap gap-1">
          {c.productIds.map((id) => {
            const p = products.find((pr) => pr.id === id);
            return <Badge key={id} variant="outline">{p?.name ?? "(eliminado)"}</Badge>;
          })}
        </div>
      ),
    },
    {
      header: "Precio normal",
      render: (c) => <span className="text-stoka-ink-muted line-through">{formatCurrency(normalPriceOf(c.productIds))}</span>,
    },
    { header: "Precio combo", render: (c) => <span className="font-semibold text-stoka-ink">{formatCurrency(c.comboPrice)}</span> },
    {
      header: "Ahorro",
      render: (c) => {
        const normal = normalPriceOf(c.productIds);
        const savings = normal - c.comboPrice;
        return <Badge variant="green">-{formatCurrency(savings)} ({normal > 0 ? Math.round((savings / normal) * 100) : 0}%)</Badge>;
      },
    },
    {
      header: "Estado",
      render: (c) => (
        <button onClick={() => updateCombo(c.id, { active: !c.active })} className="cursor-pointer">
          <Badge variant={c.active ? "green" : "gray"}>{c.active ? "Activo" : "Pausado"}</Badge>
        </button>
      ),
    },
    {
      header: "Acciones",
      render: (c) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(c)} aria-label={`Editar ${c.name}`} className="cursor-pointer rounded-lg p-1.5 text-stoka-green-700 hover:bg-stoka-green-50">
            <Pencil className="size-4" aria-hidden="true" />
          </button>
          <button onClick={() => setConfirmDelete(c)} aria-label={`Eliminar ${c.name}`} className="cursor-pointer rounded-lg p-1.5 text-stoka-red-dark hover:bg-stoka-red-100">
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-stoka-ink">Combos</h1>
          <p className="text-sm text-stoka-ink-muted">
            Promociones que combinan 2 o más productos distintos a un precio especial — se aplican solas cuando el
            cliente tiene esos productos en el carrito.
          </p>
        </div>
        <Button onClick={openCreate} icon={<Plus className="size-4" aria-hidden="true" />}>Nuevo combo</Button>
      </div>

      {combos.length === 0 ? (
        <EmptyState icon={Gift} title="Todavía no hay combos" description="Crea el primero para empezar a promocionar productos juntos." />
      ) : (
        <DataTable columns={columns} rows={combos} keyExtractor={(c) => c.id} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar combo" : "Nuevo combo"} size="lg">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Field label="Nombre del combo" htmlFor="combo-name" required>
            <Input id="combo-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Combo Desayuno" />
          </Field>

          <Field label="Productos incluidos" htmlFor="combo-products" required hint="Elige 2 o más — cada uno cuenta una vez.">
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input placeholder="Buscar producto…" className="pl-9" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
            </div>
            <div id="combo-products" className="max-h-56 overflow-y-auto rounded-lg border border-stoka-border">
              {filteredProducts.map((p) => (
                <label key={p.id} className="flex cursor-pointer items-center justify-between gap-3 border-b border-stoka-border px-3 py-2 text-sm last:border-0 hover:bg-stoka-surface-2">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.productIds.includes(p.id)}
                      onChange={() => toggleProduct(p.id)}
                      className="size-4 rounded border-stoka-border-strong text-stoka-red focus:ring-stoka-red-100"
                    />
                    {p.name}
                  </span>
                  <span className="text-stoka-ink-muted">{formatCurrency(p.price)}</span>
                </label>
              ))}
              {filteredProducts.length === 0 && <p className="p-3 text-sm text-stoka-ink-muted">Sin resultados.</p>}
            </div>
          </Field>

          <Field label="Precio del combo" htmlFor="combo-price" required>
            <Input id="combo-price" type="number" min={0} step={0.1} value={form.comboPrice} onChange={(e) => setForm({ ...form, comboPrice: e.target.value })} />
          </Field>

          {form.productIds.length > 0 && (
            <div className="rounded-lg bg-stoka-surface-2 p-3 text-sm">
              <div className="flex justify-between text-stoka-ink-muted">
                <span>Suma de {form.productIds.length} productos</span>
                <span className="line-through">{formatCurrency(selectedNormalPrice)}</span>
              </div>
              <div className={`mt-1 flex justify-between font-semibold ${previewSavings > 0 ? "text-stoka-success" : "text-stoka-red-dark"}`}>
                <span>{previewSavings > 0 ? "El cliente ahorra" : "Sin ahorro (revisa el precio)"}</span>
                <span>{formatCurrency(Math.abs(previewSavings))}</span>
              </div>
            </div>
          )}

          <Checkbox label="Combo activo" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editing ? "Guardar" : "Crear combo"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} title="Eliminar combo" size="sm">
        <p className="text-sm text-stoka-ink-muted">
          ¿Seguro que deseas eliminar <strong>{confirmDelete?.name}</strong>? Los productos no se ven afectados, solo
          deja de aplicarse el precio combinado.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirmDelete) {
                deleteCombo(confirmDelete.id);
                toast.success("Combo eliminado");
              }
              setConfirmDelete(null);
            }}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

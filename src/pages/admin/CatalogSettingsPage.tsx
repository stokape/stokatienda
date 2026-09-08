import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { categories, categoryAccent } from "../../data/categories";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/form";
import { Modal } from "../../components/ui/Modal";
import { Tabs } from "../../components/ui/Tabs";
import { getIcon } from "../../lib/icon-registry";
import { useDataStore } from "../../store/dataStore";
import type { Brand } from "../../types";

export function CatalogSettingsPage() {
  const [tab, setTab] = useState<"categorias" | "marcas">("categorias");
  const brands = useDataStore((s) => s.brands);
  const products = useDataStore((s) => s.products);
  const addBrand = useDataStore((s) => s.addBrand);
  const updateBrand = useDataStore((s) => s.updateBrand);
  const deleteBrand = useDataStore((s) => s.deleteBrand);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [name, setName] = useState("");

  function openCreate() {
    setEditing(null);
    setName("");
    setModalOpen(true);
  }

  function openEdit(brand: Brand) {
    setEditing(brand);
    setName(brand.name);
    setModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Ingresa un nombre de marca.");
      return;
    }
    if (editing) {
      updateBrand(editing.id, name.trim());
      toast.success("Marca actualizada");
    } else {
      addBrand(name.trim());
      toast.success("Marca creada");
    }
    setModalOpen(false);
  }

  const brandColumns: Column<Brand>[] = [
    { header: "Marca", render: (b) => b.name },
    { header: "Productos", render: (b) => products.filter((p) => p.brandId === b.id).length },
    {
      header: "Acciones",
      render: (b) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(b)} aria-label={`Editar ${b.name}`} className="cursor-pointer rounded-lg p-1.5 text-stoka-green-700 hover:bg-stoka-green-50">
            <Pencil className="size-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => {
              if (products.some((p) => p.brandId === b.id)) {
                toast.error("No puedes eliminar una marca con productos asociados.");
                return;
              }
              deleteBrand(b.id);
              toast.success("Marca eliminada");
            }}
            aria-label={`Eliminar ${b.name}`}
            className="cursor-pointer rounded-lg p-1.5 text-stoka-red-dark hover:bg-stoka-red-100"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-bold text-stoka-green-900">Categorías y marcas</h1>
      <p className="mb-6 text-sm text-slate-500">
        Las categorías son fijas para mantener la navegación de la tienda; las marcas se pueden gestionar libremente.
      </p>

      <Tabs
        tabs={[{ value: "categorias", label: "Categorías" }, { value: "marcas", label: "Marcas" }]}
        active={tab}
        onChange={setTab}
      />

      {tab === "categorias" ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((c) => {
            const Icon = getIcon(c.icon);
            const accent = categoryAccent[c.color];
            const count = products.filter((p) => p.category === c.slug).length;
            return (
              <div key={c.slug} className="rounded-xl border border-stoka-border bg-stoka-surface p-4">
                <span className={`mb-2 inline-flex rounded-lg p-2 ${accent.bg} ${accent.text}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <p className="font-semibold text-stoka-green-900">{c.name}</p>
                <p className="text-xs text-slate-400">{count} productos</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-5">
          <div className="mb-4 flex justify-end">
            <Button onClick={openCreate} icon={<Plus className="size-4" aria-hidden="true" />}>Nueva marca</Button>
          </div>
          <DataTable columns={brandColumns} rows={brands} keyExtractor={(b) => b.id} emptyMessage="Aún no hay marcas registradas." />
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar marca" : "Nueva marca"} size="sm">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Field label="Nombre de la marca" htmlFor="brand-name" required>
            <Input id="brand-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editing ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { categoryAccentOptions } from "../../data/categories";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { ProductImage } from "../../components/store/ProductImage";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Checkbox, Field, Input, Select } from "../../components/ui/form";
import { Modal } from "../../components/ui/Modal";
import { Tabs } from "../../components/ui/Tabs";
import { getIcon, iconRegistry } from "../../lib/icon-registry";
import { useDataStore } from "../../store/dataStore";
import type { Brand, Category, CategoryAccentColor } from "../../types";

type CategoryForm = { name: string; icon: string; color: CategoryAccentColor; active: boolean };
const emptyCategoryForm: CategoryForm = { name: "", icon: "Package", color: "silver", active: true };

export function CatalogSettingsPage() {
  const [tab, setTab] = useState<"categorias" | "marcas">("categorias");
  const brands = useDataStore((s) => s.brands);
  const products = useDataStore((s) => s.products);
  const categories = useDataStore((s) => s.categories);
  const addBrand = useDataStore((s) => s.addBrand);
  const updateBrand = useDataStore((s) => s.updateBrand);
  const deleteBrand = useDataStore((s) => s.deleteBrand);
  const addCategory = useDataStore((s) => s.addCategory);
  const updateCategory = useDataStore((s) => s.updateCategory);
  const deleteCategory = useDataStore((s) => s.deleteCategory);
  const reorderCategories = useDataStore((s) => s.reorderCategories);

  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState("");

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState<CategoryForm>(emptyCategoryForm);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<Category | null>(null);

  function openBrandCreate() {
    setEditingBrand(null);
    setBrandName("");
    setBrandModalOpen(true);
  }
  function openBrandEdit(brand: Brand) {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setBrandModalOpen(true);
  }
  function handleBrandSave(e: React.FormEvent) {
    e.preventDefault();
    if (!brandName.trim()) {
      toast.error("Ingresa un nombre de marca.");
      return;
    }
    if (editingBrand) {
      updateBrand(editingBrand.id, brandName.trim());
      toast.success("Marca actualizada");
    } else {
      addBrand(brandName.trim());
      toast.success("Marca creada");
    }
    setBrandModalOpen(false);
  }

  function openCategoryCreate() {
    setEditingCategory(null);
    setCatForm(emptyCategoryForm);
    setCatModalOpen(true);
  }
  function openCategoryEdit(category: Category) {
    setEditingCategory(category);
    setCatForm({ name: category.name, icon: category.icon, color: category.color, active: category.active });
    setCatModalOpen(true);
  }
  function handleCategorySave(e: React.FormEvent) {
    e.preventDefault();
    if (!catForm.name.trim()) {
      toast.error("Ingresa un nombre de categoría.");
      return;
    }
    if (editingCategory) {
      updateCategory(editingCategory.slug, catForm);
      toast.success("Categoría actualizada");
    } else {
      addCategory(catForm);
      toast.success("Categoría creada");
    }
    setCatModalOpen(false);
  }

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  function moveCategory(slug: string, direction: -1 | 1) {
    const idx = sortedCategories.findIndex((c) => c.slug === slug);
    const swapWith = idx + direction;
    if (swapWith < 0 || swapWith >= sortedCategories.length) return;
    const next = [...sortedCategories];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    reorderCategories(next.map((c) => c.slug));
  }

  const brandColumns: Column<Brand>[] = [
    { header: "Marca", render: (b) => b.name },
    { header: "Productos", render: (b) => products.filter((p) => p.brandId === b.id).length },
    {
      header: "Acciones",
      render: (b) => (
        <div className="flex gap-2">
          <button onClick={() => openBrandEdit(b)} aria-label={`Editar ${b.name}`} className="cursor-pointer rounded-lg p-1.5 text-stoka-green-700 hover:bg-stoka-green-50">
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

  const categoryColumns: Column<Category>[] = [
    {
      header: "Categoría",
      render: (c) => (
        <div className="flex items-center gap-3">
          <ProductImage hue={0} icon={c.icon} name={c.name} className="size-9 shrink-0" iconClassName="size-4" />
          <span className="font-medium text-stoka-ink">{c.name}</span>
        </div>
      ),
    },
    { header: "Productos", render: (c) => products.filter((p) => p.category === c.slug).length },
    {
      header: "Visible en tienda",
      render: (c) => <Badge variant={c.active ? "green" : "gray"}>{c.active ? "Visible" : "Oculta"}</Badge>,
    },
    {
      header: "Orden",
      render: (c) => (
        <div className="flex gap-1">
          <button
            onClick={() => moveCategory(c.slug, -1)}
            aria-label={`Subir ${c.name}`}
            className="cursor-pointer rounded-lg p-1.5 text-stoka-ink-muted hover:bg-stoka-surface-2 disabled:opacity-30"
            disabled={sortedCategories[0]?.slug === c.slug}
          >
            <ArrowUp className="size-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => moveCategory(c.slug, 1)}
            aria-label={`Bajar ${c.name}`}
            className="cursor-pointer rounded-lg p-1.5 text-stoka-ink-muted hover:bg-stoka-surface-2 disabled:opacity-30"
            disabled={sortedCategories[sortedCategories.length - 1]?.slug === c.slug}
          >
            <ArrowDown className="size-4" aria-hidden="true" />
          </button>
        </div>
      ),
    },
    {
      header: "Acciones",
      render: (c) => (
        <div className="flex gap-2">
          <button
            onClick={() => updateCategory(c.slug, { active: !c.active })}
            aria-label={c.active ? `Ocultar ${c.name}` : `Mostrar ${c.name}`}
            className="cursor-pointer rounded-lg p-1.5 text-stoka-ink-muted hover:bg-stoka-surface-2"
          >
            {c.active ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
          <button onClick={() => openCategoryEdit(c)} aria-label={`Editar ${c.name}`} className="cursor-pointer rounded-lg p-1.5 text-stoka-green-700 hover:bg-stoka-green-50">
            <Pencil className="size-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => setConfirmDeleteCat(c)}
            aria-label={`Eliminar ${c.name}`}
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
      <h1 className="mb-1 font-display text-2xl font-bold text-stoka-ink">Categorías y marcas</h1>
      <p className="mb-6 text-sm text-stoka-ink-muted">
        Crea, edita, reordena u oculta categorías sin tocar código — los productos que ya tengan una categoría eliminada quedan sin categoría hasta que los reasignes.
      </p>

      <Tabs
        tabs={[{ value: "categorias", label: "Categorías" }, { value: "marcas", label: "Marcas" }]}
        active={tab}
        onChange={setTab}
      />

      {tab === "categorias" ? (
        <div className="mt-5">
          <div className="mb-4 flex justify-end">
            <Button onClick={openCategoryCreate} icon={<Plus className="size-4" aria-hidden="true" />}>Nueva categoría</Button>
          </div>
          <DataTable columns={categoryColumns} rows={sortedCategories} keyExtractor={(c) => c.slug} emptyMessage="Aún no hay categorías." />
        </div>
      ) : (
        <div className="mt-5">
          <div className="mb-4 flex justify-end">
            <Button onClick={openBrandCreate} icon={<Plus className="size-4" aria-hidden="true" />}>Nueva marca</Button>
          </div>
          <DataTable columns={brandColumns} rows={brands} keyExtractor={(b) => b.id} emptyMessage="Aún no hay marcas registradas." />
        </div>
      )}

      <Modal open={brandModalOpen} onClose={() => setBrandModalOpen(false)} title={editingBrand ? "Editar marca" : "Nueva marca"} size="sm">
        <form onSubmit={handleBrandSave} className="flex flex-col gap-4">
          <Field label="Nombre de la marca" htmlFor="brand-name" required>
            <Input id="brand-name" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setBrandModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingBrand ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={catModalOpen} onClose={() => setCatModalOpen(false)} title={editingCategory ? "Editar categoría" : "Nueva categoría"} size="sm">
        <form onSubmit={handleCategorySave} className="flex flex-col gap-4">
          <Field label="Nombre" htmlFor="cat-name" required>
            <Input id="cat-name" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />
          </Field>
          <Field label="Ícono" htmlFor="cat-icon">
            <Select id="cat-icon" value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}>
              {Object.keys(iconRegistry).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Color de acento" htmlFor="cat-color">
            <Select id="cat-color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value as CategoryAccentColor })}>
              {categoryAccentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </Field>
          <div className="flex items-center gap-3 rounded-lg border border-stoka-border bg-stoka-surface-2 p-3">
            {(() => {
              const Icon = getIcon(catForm.icon);
              return <Icon className="size-6 text-stoka-ink" aria-hidden="true" />;
            })()}
            <span className="text-sm text-stoka-ink-muted">Vista previa del ícono</span>
          </div>
          <Checkbox
            label="Visible en la tienda"
            checked={catForm.active}
            onChange={(e) => setCatForm({ ...catForm, active: e.target.checked })}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setCatModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingCategory ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(confirmDeleteCat)} onClose={() => setConfirmDeleteCat(null)} title="Eliminar categoría" size="sm">
        <p className="text-sm text-stoka-ink-muted">
          ¿Seguro que deseas eliminar <strong>{confirmDeleteCat?.name}</strong>?
          {confirmDeleteCat && products.some((p) => p.category === confirmDeleteCat.slug) && (
            <> Hay {products.filter((p) => p.category === confirmDeleteCat.slug).length} producto(s) usando esta categoría — quedarán sin categoría asignada.</>
          )}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDeleteCat(null)}>Cancelar</Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirmDeleteCat) {
                deleteCategory(confirmDeleteCat.slug);
                toast.success("Categoría eliminada");
              }
              setConfirmDeleteCat(null);
            }}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

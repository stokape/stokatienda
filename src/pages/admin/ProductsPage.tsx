import { Pencil, Plus, ScanBarcode, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { categories } from "../../data/categories";
import { BarcodeScannerModal } from "../../components/admin/BarcodeScannerModal";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { ProductImage } from "../../components/store/ProductImage";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Field, Input, Select, Textarea, Checkbox } from "../../components/ui/form";
import { Modal } from "../../components/ui/Modal";
import { iconRegistry } from "../../lib/icon-registry";
import { formatCurrency } from "../../lib/format";
import { useDataStore } from "../../store/dataStore";
import type { CategorySlug, Product } from "../../types";

type FormState = Omit<Product, "id" | "createdAt">;

const emptyForm: FormState = {
  slug: "",
  name: "",
  presentation: "",
  category: "abarrotes",
  brandId: "",
  sku: "",
  barcode: "",
  price: 0,
  compareAtPrice: undefined,
  costPrice: 0,
  stock: 0,
  minStock: 5,
  unit: "unidad",
  featured: false,
  description: "",
  imageHue: 140,
  imageIcon: "Package",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductsPage() {
  const products = useDataStore((s) => s.products);
  const brands = useDataStore((s) => s.brands);
  const addProduct = useDataStore((s) => s.addProduct);
  const updateProduct = useDataStore((s) => s.updateProduct);
  const deleteProduct = useDataStore((s) => s.deleteProduct);
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategorySlug | "">("");
  const [modalOpen, setModalOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, categoryFilter, search]);

  function openCreate(prefillBarcode?: string) {
    setEditingId(null);
    setForm(prefillBarcode ? { ...emptyForm, barcode: prefillBarcode } : emptyForm);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditingId(product.id);
    const { id: _id, createdAt: _createdAt, ...rest } = product;
    setForm(rest);
    setModalOpen(true);
  }

  // Si venimos de "Escanear código" en Inventario con un código que no
  // existía en el catálogo, abrimos el alta con ese código ya cargado.
  useEffect(() => {
    const state = location.state as { prefillBarcode?: string } | null;
    if (state?.prefillBarcode) {
      openCreate(state.prefillBarcode);
      navigate(location.pathname, { replace: true, state: null });
    }
    // Se ejecuta solo al montar: consume el estado de navegación una vez.
  }, []);

  function handleScan(code: string) {
    setScannerOpen(false);
    const existing = products.find((p) => p.barcode === code);
    if (existing) {
      openEdit(existing);
      toast.success(`${existing.name} encontrado`, { description: "Editando producto existente" });
    } else {
      openCreate(code);
      toast.success("Código no registrado", { description: "Completa los datos para crear el producto" });
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.sku.trim() || form.price <= 0) {
      toast.error("Completa nombre, SKU y un precio válido.");
      return;
    }
    const slug = form.slug.trim() || slugify(form.name);
    if (editingId) {
      updateProduct(editingId, { ...form, slug });
      toast.success("Producto actualizado");
    } else {
      addProduct({ ...form, slug });
      toast.success("Producto creado");
    }
    setModalOpen(false);
  }

  const columns: Column<Product>[] = [
    {
      header: "Producto",
      render: (p) => (
        <div className="flex items-center gap-3">
          <ProductImage hue={p.imageHue} icon={p.imageIcon} name={p.name} className="size-10 shrink-0" iconClassName="size-4" />
          <div className="min-w-0">
            <p className="truncate font-medium text-stoka-green-900">{p.name}</p>
            <p className="text-xs text-slate-400">{p.presentation} · SKU {p.sku}</p>
          </div>
        </div>
      ),
    },
    { header: "Categoría", render: (p) => categories.find((c) => c.slug === p.category)?.name },
    {
      header: "Precio",
      render: (p) => (
        <div>
          <p className="font-semibold">{formatCurrency(p.price)}</p>
          {p.compareAtPrice && <p className="text-xs text-slate-400 line-through">{formatCurrency(p.compareAtPrice)}</p>}
        </div>
      ),
    },
    {
      header: "Stock",
      render: (p) =>
        p.stock <= 0 ? (
          <Badge variant="red">Agotado</Badge>
        ) : p.stock <= p.minStock ? (
          <Badge variant="yellow">{p.stock} — bajo</Badge>
        ) : (
          <span>{p.stock}</span>
        ),
    },
    {
      header: "Acciones",
      render: (p) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(p)} aria-label={`Editar ${p.name}`} className="cursor-pointer rounded-lg p-1.5 text-stoka-green-700 hover:bg-stoka-green-50">
            <Pencil className="size-4" aria-hidden="true" />
          </button>
          <button onClick={() => setConfirmDelete(p)} aria-label={`Eliminar ${p.name}`} className="cursor-pointer rounded-lg p-1.5 text-stoka-red-dark hover:bg-stoka-red-100">
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
          <h1 className="font-display text-2xl font-bold text-stoka-green-900">Productos</h1>
          <p className="text-sm text-slate-500">{products.length} productos en catálogo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setScannerOpen(true)} icon={<ScanBarcode className="size-4" aria-hidden="true" />}>
            Escanear código
          </Button>
          <Button onClick={() => openCreate()} icon={<Plus className="size-4" aria-hidden="true" />}>
            Nuevo producto
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input placeholder="Buscar producto…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select className="w-auto" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as CategorySlug | "")}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </Select>
      </div>

      <DataTable columns={columns} rows={filtered} keyExtractor={(p) => p.id} emptyMessage="No hay productos que coincidan con la búsqueda." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Editar producto" : "Nuevo producto"} size="lg">
        <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" htmlFor="p-name" required>
            <Input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Presentación" htmlFor="p-pres" required>
            <Input id="p-pres" value={form.presentation} onChange={(e) => setForm({ ...form, presentation: e.target.value })} placeholder="Ej. 1 kg, 500 ml" />
          </Field>
          <Field label="Categoría" htmlFor="p-cat" required>
            <Select id="p-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as CategorySlug })}>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Marca" htmlFor="p-brand">
            <Select id="p-brand" value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
              <option value="">Sin marca</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="SKU" htmlFor="p-sku" required>
            <Input id="p-sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </Field>
          <Field label="Código de barras" htmlFor="p-barcode">
            <Input id="p-barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
          </Field>
          <Field label="Precio de venta (S/)" htmlFor="p-price" required>
            <Input id="p-price" type="number" min={0} step={0.1} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </Field>
          <Field label="Precio tachado (oferta, opcional)" htmlFor="p-compare">
            <Input id="p-compare" type="number" min={0} step={0.1} value={form.compareAtPrice ?? ""} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value ? Number(e.target.value) : undefined })} />
          </Field>
          <Field label="Costo (S/)" htmlFor="p-cost" required>
            <Input id="p-cost" type="number" min={0} step={0.1} value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })} />
          </Field>
          <Field label="Unidad" htmlFor="p-unit">
            <Select id="p-unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value as Product["unit"] })}>
              <option value="unidad">Unidad</option>
              <option value="kg">Kilogramo</option>
              <option value="litro">Litro</option>
              <option value="paquete">Paquete</option>
            </Select>
          </Field>
          <Field label="Stock actual" htmlFor="p-stock" required>
            <Input id="p-stock" type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          </Field>
          <Field label="Stock mínimo" htmlFor="p-minstock" required>
            <Input id="p-minstock" type="number" min={0} value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} />
          </Field>
          <Field label="Ícono de ilustración" htmlFor="p-icon">
            <Select id="p-icon" value={form.imageIcon} onChange={(e) => setForm({ ...form, imageIcon: e.target.value })}>
              {Object.keys(iconRegistry).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Descripción" htmlFor="p-desc">
              <Textarea id="p-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
          </div>
          <Checkbox label="Producto destacado en el inicio" checked={Boolean(form.featured)} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingId ? "Guardar cambios" : "Crear producto"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} title="Eliminar producto" size="sm">
        <p className="text-sm text-slate-600">
          ¿Seguro que deseas eliminar <strong>{confirmDelete?.name}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirmDelete) {
                deleteProduct(confirmDelete.id);
                toast.success("Producto eliminado");
              }
              setConfirmDelete(null);
            }}
          >
            Eliminar
          </Button>
        </div>
      </Modal>

      <BarcodeScannerModal open={scannerOpen} onClose={() => setScannerOpen(false)} onDetected={handleScan} />
    </div>
  );
}

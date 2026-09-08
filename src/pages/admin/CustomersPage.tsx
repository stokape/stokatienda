import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/form";
import { Modal } from "../../components/ui/Modal";
import { formatCurrency, formatDate } from "../../lib/format";
import { isValidPeruPhone } from "../../lib/validation";
import { useDataStore } from "../../store/dataStore";
import type { Customer } from "../../types";

const emptyForm = { name: "", phone: "", email: "", district: "" };

export function CustomersPage() {
  const customers = useDataStore((s) => s.customers);
  const addCustomer = useDataStore((s) => s.addCustomer);
  const updateCustomer = useDataStore((s) => s.updateCustomer);
  const deleteCustomer = useDataStore((s) => s.deleteCustomer);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(
    () => customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)),
    [customers, search],
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }
  function openEdit(c: Customer) {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone, email: c.email ?? "", district: c.district ?? "" });
    setModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !isValidPeruPhone(form.phone)) {
      toast.error("Ingresa un nombre y un celular válido.");
      return;
    }
    if (editing) {
      updateCustomer(editing.id, form);
      toast.success("Cliente actualizado");
    } else {
      addCustomer(form);
      toast.success("Cliente agregado");
    }
    setModalOpen(false);
  }

  const columns: Column<Customer>[] = [
    { header: "Cliente", render: (c) => <span className="font-medium text-stoka-green-900">{c.name}</span> },
    { header: "Celular", render: (c) => c.phone },
    { header: "Distrito", render: (c) => c.district ?? "—" },
    { header: "Pedidos", render: (c) => c.ordersCount },
    { header: "Total gastado", render: (c) => formatCurrency(c.totalSpent) },
    { header: "Cliente desde", render: (c) => formatDate(c.createdAt) },
    {
      header: "Acciones",
      render: (c) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(c)} aria-label={`Editar ${c.name}`} className="cursor-pointer rounded-lg p-1.5 text-stoka-green-700 hover:bg-stoka-green-50">
            <Pencil className="size-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => {
              deleteCustomer(c.id);
              toast.success("Cliente eliminado");
            }}
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-stoka-green-900">Clientes</h1>
          <p className="text-sm text-slate-500">{customers.length} clientes registrados</p>
        </div>
        <Button onClick={openCreate} icon={<Plus className="size-4" aria-hidden="true" />}>Nuevo cliente</Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <Input placeholder="Buscar por nombre o celular…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <DataTable columns={columns} rows={filtered} keyExtractor={(c) => c.id} emptyMessage="No hay clientes que coincidan." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar cliente" : "Nuevo cliente"} size="sm">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Field label="Nombre" htmlFor="c-name" required>
            <Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Celular" htmlFor="c-phone" required>
            <Input id="c-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={9} />
          </Field>
          <Field label="Correo (opcional)" htmlFor="c-email">
            <Input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Distrito (opcional)" htmlFor="c-district">
            <Input id="c-district" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
          </Field>
          <Button type="submit">{editing ? "Guardar" : "Crear cliente"}</Button>
        </form>
      </Modal>
    </div>
  );
}

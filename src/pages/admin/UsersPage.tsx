import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { roleLabels } from "../../data/users";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Checkbox, Field, Input, Select } from "../../components/ui/form";
import { Modal } from "../../components/ui/Modal";
import { useAuthStore } from "../../store/authStore";
import { useDataStore } from "../../store/dataStore";
import type { StaffUser, UserRole } from "../../types";

const emptyForm = { name: "", username: "", password: "", role: "cajero" as UserRole, active: true };

export function UsersPage() {
  const staffUsers = useDataStore((s) => s.staffUsers);
  const addUser = useDataStore((s) => s.addUser);
  const updateUser = useDataStore((s) => s.updateUser);
  const deleteUser = useDataStore((s) => s.deleteUser);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) {
      toast.error("Completa nombre, usuario y contraseña.");
      return;
    }
    if (staffUsers.some((u) => u.username === form.username.trim().toLowerCase())) {
      toast.error("Ese nombre de usuario ya existe.");
      return;
    }
    addUser({ ...form, username: form.username.trim().toLowerCase() });
    toast.success("Usuario creado");
    setModalOpen(false);
    setForm(emptyForm);
  }

  const columns: Column<StaffUser>[] = [
    { header: "Nombre", render: (u) => u.name },
    { header: "Usuario", render: (u) => u.username },
    { header: "Rol", render: (u) => <Badge variant="blue">{roleLabels[u.role]}</Badge> },
    { header: "Estado", render: (u) => <Badge variant={u.active ? "green" : "gray"}>{u.active ? "Activo" : "Inactivo"}</Badge> },
    {
      header: "Acciones",
      render: (u) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateUser(u.id, { active: !u.active })}
            className="cursor-pointer rounded-full border border-stoka-cream-300 px-2.5 py-1 text-xs font-semibold text-stoka-green-700 hover:bg-stoka-green-50"
          >
            {u.active ? "Desactivar" : "Activar"}
          </button>
          {u.id !== currentUser?.id && (
            <button
              onClick={() => {
                deleteUser(u.id);
                toast.success("Usuario eliminado");
              }}
              aria-label={`Eliminar ${u.name}`}
              className="cursor-pointer rounded-lg p-1.5 text-stoka-red-dark hover:bg-stoka-red-100"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-stoka-green-900">Usuarios y roles</h1>
          <p className="text-sm text-slate-500">Administrador, cajero, almacén y repartidor.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} icon={<Plus className="size-4" aria-hidden="true" />}>Nuevo usuario</Button>
      </div>

      <DataTable columns={columns} rows={staffUsers} keyExtractor={(u) => u.id} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo usuario" size="sm">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Field label="Nombre completo" htmlFor="u-name" required>
            <Input id="u-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Usuario" htmlFor="u-username" required>
            <Input id="u-username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </Field>
          <Field label="Contraseña" htmlFor="u-password" required hint="Solo para fines de demostración">
            <Input id="u-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <Field label="Rol" htmlFor="u-role" required>
            <Select id="u-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
              {Object.entries(roleLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
          </Field>
          <Checkbox label="Usuario activo" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          <Button type="submit">Crear usuario</Button>
        </form>
      </Modal>
    </div>
  );
}

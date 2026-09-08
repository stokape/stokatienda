import { KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { roleLabels } from "../../data/users";
import { Button } from "../../components/ui/Button";
import { BrandMark } from "../../components/ui/BrandMark";
import { Field, Input } from "../../components/ui/form";
import { useAuthStore } from "../../store/authStore";
import { useDataStore } from "../../store/dataStore";

export function AdminLogin() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const login = useAuthStore((s) => s.login);
  const staffUsers = useDataStore((s) => s.staffUsers);
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (currentUser) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? "/admin";
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const user = staffUsers.find(
      (u) => u.username === username.trim().toLowerCase() && u.password === password && u.active,
    );
    setLoading(false);
    if (!user) {
      setError("Usuario o contraseña incorrectos.");
      toast.error("No pudimos iniciar sesión.");
      return;
    }
    setError("");
    login(user);
    toast.success(`Bienvenido, ${user.name}`);
    navigate("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stoka-black px-4 py-10">
      <div className="w-full max-w-sm rounded-xl border border-stoka-border bg-stoka-surface p-8 shadow-pop">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandMark size={56} />
          <h1 className="mt-3 font-display text-xl font-bold text-stoka-ink">Panel STOKA BODEGA</h1>
          <p className="text-sm text-stoka-ink-muted">Acceso exclusivo para el personal</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Field label="Usuario" htmlFor="username" error={error ? " " : undefined} required>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </Field>
          <Field label="Contraseña" htmlFor="password" error={error} required>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </Field>
          <Button type="submit" size="lg" loading={loading} icon={<KeyRound className="size-4" aria-hidden="true" />}>
            Ingresar
          </Button>
        </form>

        <div className="mt-6 rounded-lg bg-stoka-surface-2 p-3 text-xs text-stoka-ink-muted">
          <p className="mb-1 font-semibold text-stoka-ink">Credenciales de demostración</p>
          {["admin", "cajero", "almacen", "repartidor"].map((u) => {
            const user = staffUsers.find((s) => s.username === u);
            if (!user) return null;
            return (
              <p key={u}>
                {roleLabels[user.role]}: <code>{user.username}</code> / <code>{user.password}</code>
              </p>
            );
          })}
        </div>

        <Link to="/" className="mt-4 block text-center text-sm text-stoka-red hover:underline">
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}

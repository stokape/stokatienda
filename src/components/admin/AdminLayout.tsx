import {
  BadgeCheck,
  Boxes,
  Building2,
  ClipboardList,
  FileSpreadsheet,
  LayoutDashboard,
  LayoutTemplate,
  Lightbulb,
  LogOut,
  Menu,
  ReceiptText,
  Settings,
  ShoppingBasket,
  Tags,
  UserCog,
  Users,
  Wallet,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { roleAccess, roleLabels } from "../../data/users";
import { useAuthStore } from "../../store/authStore";
import { BrandMark } from "../ui/BrandMark";
import { ThemeToggle } from "../ui/ThemeToggle";

const navItems = [
  { key: "dashboard", label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { key: "venta-rapida", label: "Venta rápida", to: "/admin/venta-rapida", icon: ShoppingBasket },
  { key: "productos", label: "Productos", to: "/admin/productos", icon: Boxes },
  { key: "catalogo", label: "Categorías y marcas", to: "/admin/catalogo", icon: Tags },
  { key: "inventario", label: "Inventario", to: "/admin/inventario", icon: ClipboardList },
  { key: "pedidos", label: "Pedidos", to: "/admin/pedidos", icon: ReceiptText },
  { key: "pagos", label: "Validar pagos", to: "/admin/pagos", icon: BadgeCheck },
  { key: "caja", label: "Caja", to: "/admin/caja", icon: Wallet },
  { key: "clientes", label: "Clientes", to: "/admin/clientes", icon: Users },
  { key: "proveedores", label: "Proveedores y compras", to: "/admin/proveedores", icon: Building2 },
  { key: "usuarios", label: "Usuarios y roles", to: "/admin/usuarios", icon: UserCog },
  { key: "reportes", label: "Reportes", to: "/admin/reportes", icon: FileSpreadsheet },
  { key: "sugerencias", label: "Sugerencias", to: "/admin/sugerencias", icon: Lightbulb },
  { key: "contenido", label: "Contenido", to: "/admin/contenido", icon: LayoutTemplate },
  { key: "mantenimiento", label: "Mantenimiento", to: "/admin/mantenimiento", icon: Wrench },
  { key: "configuracion", label: "Configuración", to: "/admin/configuracion", icon: Settings },
];

export function AdminLayout() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  const allowed = new Set(roleAccess[currentUser.role] ?? []);
  const visibleItems = navItems.filter((item) => allowed.has(item.key));
  const currentItem = navItems.find((item) => item.to === location.pathname);
  const isRestricted = Boolean(currentItem) && !allowed.has(currentItem!.key);

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-4" aria-label="Navegación del panel">
      <div className="mb-4 flex items-center justify-between px-2">
        <Link to="/" className="flex items-center gap-2">
          <BrandMark size={32} />
          <span className="font-display text-lg font-bold text-stoka-ink">Bodeguita Stoka</span>
        </Link>
        <ThemeToggle className="!size-9" />
      </div>
      {visibleItems.map((item) => {
        const active = location.pathname === item.to;
        return (
          <Link
            key={item.key}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-bold transition-colors ${
              active
                ? "border-stoka-red bg-stoka-red text-white shadow-card"
                : "border-transparent text-stoka-ink hover:border-stoka-border hover:bg-stoka-surface-2"
            }`}
          >
            <item.icon className="size-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
      <div className="mt-auto border-t-2 border-stoka-border pt-4">
        <p className="px-3 text-sm font-semibold text-stoka-green-900">{currentUser.name}</p>
        <p className="px-3 text-xs text-slate-500">{roleLabels[currentUser.role]}</p>
        <button
          onClick={() => {
            logout();
            navigate("/admin/login");
          }}
          className="mt-2 flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-stoka-red-dark hover:bg-stoka-red-100"
        >
          <LogOut className="size-4" aria-hidden="true" /> Cerrar sesión
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-stoka-bg-alt lg:flex">
      <div className="hidden w-64 shrink-0 border-r border-stoka-border bg-stoka-surface lg:block">{sidebar}</div>

      <div className="flex items-center justify-between border-b border-stoka-border bg-stoka-surface px-4 py-3 lg:hidden">
        <button onClick={() => setMobileOpen(true)} aria-label="Abrir menú" className="cursor-pointer rounded-lg p-1.5 hover:bg-stoka-surface-2">
          <Menu className="size-6 text-stoka-ink" aria-hidden="true" />
        </button>
        <span className="font-display font-bold text-stoka-ink">Bodeguita Stoka</span>
        <ThemeToggle className="!size-9" />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Cerrar menú" className="absolute inset-0 bg-stoka-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-stoka-surface shadow-pop">
            <div className="flex justify-end p-3">
              <button onClick={() => setMobileOpen(false)} aria-label="Cerrar" className="cursor-pointer p-1">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            {sidebar}
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        {isRestricted ? (
          <div className="rounded-xl border-2 border-dashed border-stoka-border bg-stoka-surface p-10 text-center">
            <p className="font-display text-lg font-semibold text-stoka-green-900">Acceso restringido</p>
            <p className="mt-1 text-sm text-slate-500">
              Tu rol ({roleLabels[currentUser.role]}) no tiene permiso para ver esta sección.
            </p>
            <Link to="/admin" className="mt-4 inline-block font-semibold text-stoka-green-700 underline">
              Volver al dashboard
            </Link>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { StoreLayout } from "./components/layout/StoreLayout";
import { Spinner } from "./components/ui/Spinner";
import { useResolvedTheme } from "./store/themeStore";
import { Catalog } from "./pages/Catalog";
import { Checkout } from "./pages/Checkout";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { OrderTracking } from "./pages/OrderTracking";
import { ProductDetail } from "./pages/ProductDetail";

// El panel administrativo (con Recharts y las páginas de gestión) se separa
// en un chunk aparte: los clientes de la tienda nunca necesitan descargarlo.
const AdminLayout = lazy(() => import("./components/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const AdminLogin = lazy(() => import("./pages/admin/Login").then((m) => ({ default: m.AdminLogin })));
const Dashboard = lazy(() => import("./pages/admin/Dashboard").then((m) => ({ default: m.Dashboard })));
const ProductsPage = lazy(() => import("./pages/admin/ProductsPage").then((m) => ({ default: m.ProductsPage })));
const CatalogSettingsPage = lazy(() => import("./pages/admin/CatalogSettingsPage").then((m) => ({ default: m.CatalogSettingsPage })));
const InventoryPage = lazy(() => import("./pages/admin/InventoryPage").then((m) => ({ default: m.InventoryPage })));
const QuickSalePage = lazy(() => import("./pages/admin/QuickSalePage").then((m) => ({ default: m.QuickSalePage })));
const OrdersPage = lazy(() => import("./pages/admin/OrdersPage").then((m) => ({ default: m.OrdersPage })));
const PaymentsPage = lazy(() => import("./pages/admin/PaymentsPage").then((m) => ({ default: m.PaymentsPage })));
const CashPage = lazy(() => import("./pages/admin/CashPage").then((m) => ({ default: m.CashPage })));
const CustomersPage = lazy(() => import("./pages/admin/CustomersPage").then((m) => ({ default: m.CustomersPage })));
const SuppliersPage = lazy(() => import("./pages/admin/SuppliersPage").then((m) => ({ default: m.SuppliersPage })));
const UsersPage = lazy(() => import("./pages/admin/UsersPage").then((m) => ({ default: m.UsersPage })));
const ReportsPage = lazy(() => import("./pages/admin/ReportsPage").then((m) => ({ default: m.ReportsPage })));
const SuggestionsPage = lazy(() => import("./pages/admin/SuggestionsPage").then((m) => ({ default: m.SuggestionsPage })));
const SettingsPage = lazy(() => import("./pages/admin/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const ContentPage = lazy(() => import("./pages/admin/ContentPage").then((m) => ({ default: m.ContentPage })));
const MaintenanceSettingsPage = lazy(() => import("./pages/admin/MaintenanceSettingsPage").then((m) => ({ default: m.MaintenanceSettingsPage })));

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stoka-bg-alt">
      <Spinner label="Cargando panel administrativo…" />
    </div>
  );
}

export default function App() {
  const resolvedTheme = useResolvedTheme();
  return (
    <>
      <Toaster position="top-center" richColors closeButton theme={resolvedTheme} />
      <Routes>
        <Route path="/" element={<StoreLayout />}>
          <Route index element={<Home />} />
          <Route path="catalogo" element={<Catalog />} />
          <Route path="producto/:slug" element={<ProductDetail />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="pedido/:code" element={<OrderTracking />} />
        </Route>

        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminLogin />
            </Suspense>
          }
        />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminLayout />
            </Suspense>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="venta-rapida" element={<QuickSalePage />} />
          <Route path="productos" element={<ProductsPage />} />
          <Route path="catalogo" element={<CatalogSettingsPage />} />
          <Route path="inventario" element={<InventoryPage />} />
          <Route path="pedidos" element={<OrdersPage />} />
          <Route path="pagos" element={<PaymentsPage />} />
          <Route path="caja" element={<CashPage />} />
          <Route path="clientes" element={<CustomersPage />} />
          <Route path="proveedores" element={<SuppliersPage />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="reportes" element={<ReportsPage />} />
          <Route path="sugerencias" element={<SuggestionsPage />} />
          <Route path="contenido" element={<ContentPage />} />
          <Route path="mantenimiento" element={<MaintenanceSettingsPage />} />
          <Route path="configuracion" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

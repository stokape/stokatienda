import { Outlet } from "react-router-dom";
import { useMaintenanceActive } from "../../lib/maintenance";
import { Maintenance } from "../../pages/Maintenance";
import { SuggestionWidget } from "../store/SuggestionWidget";
import { CartDrawer } from "./CartDrawer";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MaintenanceNoticeBanner } from "./MaintenanceNoticeBanner";

// El modo mantenimiento solo reemplaza la tienda pública; /admin/* es una
// rama de rutas completamente aparte (ver App.tsx) y sigue accesible
// siempre, para que el staff pueda desactivarlo.
export function StoreLayout() {
  const maintenanceActive = useMaintenanceActive();

  if (maintenanceActive) {
    return <Maintenance />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-stoka-cream">
      <MaintenanceNoticeBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <SuggestionWidget />
    </div>
  );
}

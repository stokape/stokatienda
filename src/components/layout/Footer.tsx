import { Camera, Globe, MapPin, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { visibleCategories } from "../../lib/categories";
import { useDataStore } from "../../store/dataStore";
import { BrandMark } from "../ui/BrandMark";

// El pie de página se mantiene siempre oscuro (fijo, no sigue el tema
// claro/oscuro del sitio) a propósito: es un cierre de marca consistente,
// como en la mayoría de tiendas con selector de tema.
export function Footer() {
  const categories = visibleCategories(useDataStore((s) => s.categories));
  return (
    <footer className="mt-16 border-t border-white/10 bg-stoka-black text-stoka-silver-light">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <BrandMark size={32} />
            <p className="font-display text-xl font-bold text-white">Bodeguita Stoka</p>
          </div>
          <p className="mt-2 text-sm text-stoka-silver">Tu tienda, más simple.</p>
          <div className="mt-4 flex gap-3">
            <a href="#" aria-label="Sitio web" className="rounded-full bg-white/10 p-2 hover:bg-white/20">
              <Globe className="size-4" aria-hidden="true" />
            </a>
            <a href="#" aria-label="Instagram" className="rounded-full bg-white/10 p-2 hover:bg-white/20">
              <Camera className="size-4" aria-hidden="true" />
            </a>
            <a href="#" aria-label="WhatsApp" className="rounded-full bg-white/10 p-2 hover:bg-white/20">
              <MessageCircle className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">Categorías</p>
          <ul className="space-y-2 text-sm text-stoka-silver">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link to={`/catalogo?categoria=${c.slug}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">Ayuda</p>
          <ul className="space-y-2 text-sm text-stoka-silver">
            <li>
              <Link to="/mis-pedidos" className="hover:text-white">Rastrear mi pedido</Link>
            </li>
            <li>
              <Link to="/catalogo" className="hover:text-white">Ver catálogo</Link>
            </li>
            <li>
              <Link to="/admin/login" className="hover:text-white">Panel interno (staff)</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">Visítanos</p>
          <ul className="space-y-2 text-sm text-stoka-silver">
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" aria-hidden="true" /> Av. Los Álamos 456, Lima
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" aria-hidden="true" /> 987 654 321
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-stoka-silver">
        © {new Date().getFullYear()} Bodeguita Stoka — Demo funcional sin fines comerciales reales.
      </div>
    </footer>
  );
}

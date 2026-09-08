import { ArrowRight, Banknote, Landmark, ShieldCheck, Smartphone, Store, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { visibleCategories } from "../lib/categories";
import { Hero } from "../components/store/Hero";
import { CategoryPill } from "../components/store/CategoryPill";
import { ProductCard } from "../components/store/ProductCard";
import { useDataStore } from "../store/dataStore";

export function Home() {
  const products = useDataStore((s) => s.products);
  const categories = visibleCategories(useDataStore((s) => s.categories));
  const deliveryEnabled = useDataStore((s) => s.config.deliveryEnabled);
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const offers = products.filter((p) => p.compareAtPrice).slice(0, 4);

  return (
    <div>
      <Hero />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h2 className="mb-4 font-display text-xl font-semibold text-stoka-green-900 sm:text-2xl">
          Compra por categoría
        </h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {categories.map((c) => (
            <Link key={c.slug} to={`/catalogo?categoria=${c.slug}`}>
              <CategoryPill category={c} />
            </Link>
          ))}
        </div>
      </section>

      {offers.length > 0 && (
        <section className="bg-stoka-coral-100/40 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-stoka-green-900 sm:text-2xl">
                Ofertas de la semana
              </h2>
              <Link to="/catalogo?ofertas=1" className="flex items-center gap-1 text-sm font-semibold text-stoka-coral-dark">
                Ver todas <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {offers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-stoka-green-900 sm:text-2xl">
            Los favoritos de la bodega
          </h2>
          <Link to="/catalogo" className="flex items-center gap-1 text-sm font-semibold text-stoka-green-700">
            Ver catálogo <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="border-t border-stoka-cream-300 bg-stoka-surface py-10">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            {deliveryEnabled ? (
              <>
                <Truck className="size-6 shrink-0 text-stoka-green-600" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-stoka-green-900">Delivery rápido</p>
                  <p className="text-sm text-slate-500">Recibe tu pedido el mismo día en tu zona.</p>
                </div>
              </>
            ) : (
              <>
                <Store className="size-6 shrink-0 text-stoka-green-600" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-stoka-green-900">Recojo en tienda</p>
                  <p className="text-sm text-slate-500">Pide online y recógelo cuando te acomode.</p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-start gap-3">
            <Smartphone className="size-6 shrink-0 text-stoka-green-600" aria-hidden="true" />
            <div>
              <p className="font-semibold text-stoka-green-900">Yape y Plin</p>
              <p className="text-sm text-slate-500">Paga como prefieras, de forma segura.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Landmark className="size-6 shrink-0 text-stoka-green-600" aria-hidden="true" />
            <div>
              <p className="font-semibold text-stoka-green-900">Transferencias</p>
              <p className="text-sm text-slate-500">Bancarias e interbancarias, sin comisión extra.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Banknote className="size-6 shrink-0 text-stoka-green-600" aria-hidden="true" />
            <div>
              <p className="font-semibold text-stoka-green-900">Efectivo</p>
              <p className="text-sm text-slate-500">
                {deliveryEnabled ? "Paga contra entrega si lo prefieres así." : "Paga en efectivo al recoger tu pedido."}
              </p>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-6 flex max-w-7xl items-center gap-2 px-4 text-sm text-slate-400 sm:px-6">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Todos los pagos digitales se validan manualmente antes de confirmar tu pedido.
        </div>
      </section>
    </div>
  );
}

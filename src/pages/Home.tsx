import { ArrowRight, Banknote, Gift, Landmark, ShieldCheck, Smartphone, Store, Truck } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { visibleCategories } from "../lib/categories";
import { formatCurrency } from "../lib/format";
import { Hero } from "../components/store/Hero";
import { CategoryPill } from "../components/store/CategoryPill";
import { ProductCard } from "../components/store/ProductCard";
import { ProductImage } from "../components/store/ProductImage";
import { Button } from "../components/ui/Button";
import { useCartStore } from "../store/cartStore";
import { useDataStore } from "../store/dataStore";

export function Home() {
  const products = useDataStore((s) => s.products);
  const categories = visibleCategories(useDataStore((s) => s.categories));
  const combos = useDataStore((s) => s.combos).filter((c) => c.active);
  const deliveryEnabled = useDataStore((s) => s.config.deliveryEnabled);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.open);
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const offers = products.filter((p) => p.compareAtPrice).slice(0, 4);

  function addComboToCart(comboName: string, productIds: string[]) {
    productIds.forEach((id) => addItem(id, 1));
    toast.success(`${comboName} agregado`, { description: "Se sumaron sus productos al carrito." });
    openCart();
  }

  return (
    <div>
      <Hero />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h2 className="mb-4 font-display text-xl font-semibold text-stoka-green-900 sm:text-2xl">
          Compra por categoría
        </h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <Link key={c.slug} to={`/catalogo?categoria=${c.slug}`}>
              <CategoryPill category={c} />
            </Link>
          ))}
        </div>
      </section>

      {combos.length > 0 && (
        <section className="bg-stoka-success-100/40 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-4 flex items-center gap-2">
              <Gift className="size-6 text-stoka-success" aria-hidden="true" />
              <h2 className="font-display text-xl font-semibold text-stoka-green-900 sm:text-2xl">Combos especiales</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {combos.map((combo) => {
                const items = combo.productIds
                  .map((id) => products.find((p) => p.id === id))
                  .filter((p): p is NonNullable<typeof p> => Boolean(p));
                const normalPrice = items.reduce((sum, p) => sum + p.price, 0);
                if (items.length < 2 || combo.comboPrice >= normalPrice) return null;
                return (
                  <div key={combo.id} className="flex flex-col gap-3 rounded-xl border border-stoka-border bg-stoka-surface p-4 shadow-card">
                    <p className="font-display text-lg font-bold text-stoka-green-900">{combo.name}</p>
                    <div className="flex items-center gap-2">
                      {items.map((p) => (
                        <ProductImage key={p.id} hue={p.imageHue} icon={p.imageIcon} name={p.name} className="size-12 shrink-0" iconClassName="size-5" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-500">{items.map((p) => p.name).join(" + ")}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div>
                        <span className="text-sm text-slate-400 line-through">{formatCurrency(normalPrice)}</span>{" "}
                        <span className="font-display text-xl font-bold text-stoka-success">{formatCurrency(combo.comboPrice)}</span>
                      </div>
                      <Button size="sm" onClick={() => addComboToCart(combo.name, combo.productIds)}>Agregar combo</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

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

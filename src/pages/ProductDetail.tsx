import { ChevronRight, PackageX, ShieldCheck, ShoppingCart, Store, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useParams } from "react-router-dom";
import { ProductCard } from "../components/store/ProductCard";
import { ProductImage } from "../components/store/ProductImage";
import { PriceTag } from "../components/store/PriceTag";
import { QuantityStepper } from "../components/store/QuantityStepper";
import { StockBadge } from "../components/store/StockBadge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { useCartStore } from "../store/cartStore";
import { useDataStore } from "../store/dataStore";

export function ProductDetail() {
  const { slug } = useParams();
  const products = useDataStore((s) => s.products);
  const brands = useDataStore((s) => s.brands);
  const categories = useDataStore((s) => s.categories);
  const deliveryEnabled = useDataStore((s) => s.config.deliveryEnabled);
  const product = products.find((p) => p.slug === slug);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.open);

  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={PackageX}
          title="Producto no encontrado"
          description="Es posible que ya no esté disponible. Revisa nuestro catálogo."
          action={
            <Link to="/catalogo" className="font-semibold text-stoka-green-700 underline">
              Ir al catálogo
            </Link>
          }
        />
      </div>
    );
  }

  const brand = brands.find((b) => b.id === product.brandId);
  const category = categories.find((c) => c.slug === product.category);
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  const isOut = product.stock <= 0;

  function handleAddToCart() {
    if (isOut) return;
    addItem(product!.id, quantity);
    toast.success(`${quantity} × ${product!.name} agregado(s) al carrito`);
    openCart();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav aria-label="Miga de pan" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
        <Link to="/" className="hover:text-stoka-green-700">Inicio</Link>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <Link to={`/catalogo?categoria=${product.category}`} className="hover:text-stoka-green-700">
          {category?.name}
        </Link>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <span className="text-stoka-green-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductImage
          hue={product.imageHue}
          icon={product.imageIcon}
          name={product.name}
          className="aspect-square w-full"
          iconClassName="size-28 sm:size-36"
        />

        <div>
          {brand && <p className="text-sm font-medium uppercase tracking-wide text-stoka-green-600">{brand.name}</p>}
          <h1 className="mt-1 font-display text-2xl font-bold text-stoka-green-900 sm:text-3xl">{product.name}</h1>
          <p className="text-sm text-slate-500">{product.presentation}</p>

          <div className="mt-4">
            <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
          </div>

          <div className="mt-3">
            <StockBadge stock={product.stock} minStock={product.minStock} />
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-stoka-ink/80">{product.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <QuantityStepper quantity={quantity} onChange={(n) => setQuantity(Math.max(1, n))} max={product.stock} />
            <Button
              size="lg"
              className="flex-1 sm:flex-none"
              disabled={isOut}
              onClick={handleAddToCart}
              icon={<ShoppingCart className="size-4" aria-hidden="true" />}
            >
              {isOut ? "Agotado" : "Agregar al carrito"}
            </Button>
          </div>

          <div className="mt-6 flex flex-col gap-2 rounded-xl border-2 border-stoka-green-600/20 bg-stoka-green-50 p-4 text-sm text-stoka-green-800">
            <span className="flex items-center gap-2">
              {deliveryEnabled ? (
                <>
                  <Truck className="size-4 shrink-0" aria-hidden="true" /> Delivery el mismo día en tu distrito
                </>
              ) : (
                <>
                  <Store className="size-4 shrink-0" aria-hidden="true" /> Recojo rápido en tienda
                </>
              )}
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 shrink-0" aria-hidden="true" /> Yape, Plin, transferencia o efectivo
            </span>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 font-display text-xl font-semibold text-stoka-green-900">Productos relacionados</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

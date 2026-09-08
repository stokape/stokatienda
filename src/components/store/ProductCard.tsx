import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import type { Product } from "../../types";
import { PriceTag } from "./PriceTag";
import { ProductImage } from "./ProductImage";
import { StockBadge } from "./StockBadge";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const isOut = product.stock <= 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isOut) return;
    addItem(product.id, 1);
    toast.success(`${product.name} agregado al carrito`, {
      description: product.presentation,
    });
  }

  return (
    <Link
      to={`/producto/${product.slug}`}
      className="facet-corner group flex flex-col overflow-hidden rounded-xl border border-stoka-border bg-stoka-surface shadow-card transition-shadow duration-150 ease-out hover:shadow-pop focus-visible:shadow-pop"
    >
      <div className="relative p-3 pb-0">
        <ProductImage
          hue={product.imageHue}
          icon={product.imageIcon}
          name={product.name}
          className="aspect-square w-full transition-transform duration-300 group-hover:scale-[1.03]"
          iconClassName="size-14 sm:size-16"
        />
        {product.compareAtPrice && (
          <span className="absolute left-4 top-4 rounded-md bg-stoka-red px-2.5 py-1 text-xs font-extrabold text-white shadow-card">
            Oferta
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
        <div className="min-h-[2.5rem]">
          <h3 className="line-clamp-2 font-bold leading-snug text-stoka-ink">{product.name}</h3>
          <p className="text-xs text-stoka-ink-muted">{product.presentation}</p>
        </div>
        <div className="min-h-[1.5rem]">
          <StockBadge stock={product.stock} minStock={product.minStock} />
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
          <button
            type="button"
            onClick={handleAdd}
            disabled={isOut}
            aria-label={`Agregar ${product.name} al carrito`}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-stoka-ink text-stoka-bg shadow-card transition-transform hover:bg-stoka-red active:scale-90 disabled:cursor-not-allowed disabled:bg-stoka-border-strong disabled:text-stoka-ink-muted disabled:shadow-none"
          >
            <Plus className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Link>
  );
}

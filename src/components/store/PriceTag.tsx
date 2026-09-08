import { formatCurrency } from "../../lib/format";

export function PriceTag({
  price,
  compareAtPrice,
  size = "md",
}: {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg";
}) {
  const discountPct = compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;
  const priceCls = size === "sm" ? "text-lg" : size === "md" ? "text-2xl" : "text-4xl";

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <span className={`font-display font-bold leading-none text-stoka-ink ${priceCls}`}>
        {formatCurrency(price)}
      </span>
      {compareAtPrice && (
        <>
          <span className="text-xs font-medium text-stoka-ink-muted line-through">
            {formatCurrency(compareAtPrice)}
          </span>
          <span className="facet-corner bg-stoka-red px-2 py-1 text-[11px] font-extrabold text-white">
            -{discountPct}%
          </span>
        </>
      )}
    </div>
  );
}

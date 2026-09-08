import { categoryAccent } from "../../data/categories";
import { getIcon } from "../../lib/icon-registry";
import type { Category } from "../../types";

export function CategoryPill({
  category,
  active,
  onClick,
}: {
  category: Category;
  active?: boolean;
  onClick?: () => void;
}) {
  const Icon = getIcon(category.icon);
  const accent = categoryAccent[category.color];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex shrink-0 cursor-pointer flex-col items-center gap-1.5 rounded-lg border px-4 py-3 text-center transition-colors duration-150 ${
        active
          ? "border-stoka-red bg-stoka-red text-white shadow-card"
          : `border-stoka-border ${accent.bg} ${accent.text} hover:border-stoka-border-strong`
      }`}
    >
      <Icon className="size-5" aria-hidden="true" />
      <span className="text-xs font-bold leading-tight">{category.name}</span>
    </button>
  );
}

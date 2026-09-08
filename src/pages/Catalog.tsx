import { PackageSearch, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { categories } from "../data/categories";
import { CategoryPill } from "../components/store/CategoryPill";
import { ProductCard } from "../components/store/ProductCard";
import { Checkbox, Select } from "../components/ui/form";
import { EmptyState } from "../components/ui/EmptyState";
import { useDataStore } from "../store/dataStore";
import type { CategorySlug } from "../types";

type SortKey = "relevancia" | "precio-asc" | "precio-desc" | "descuento";

export function Catalog() {
  const [params, setParams] = useSearchParams();
  const products = useDataStore((s) => s.products);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categoria = params.get("categoria") as CategorySlug | null;
  const buscar = params.get("buscar") ?? "";
  const soloOfertas = params.get("ofertas") === "1";
  const soloDisponibles = params.get("disponibles") === "1";
  const sort = (params.get("orden") as SortKey) ?? "relevancia";

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(params);
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }

  const filtered = useMemo(() => {
    let list = [...products];
    if (categoria) list = list.filter((p) => p.category === categoria);
    if (buscar.trim()) {
      const q = buscar.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (soloOfertas) list = list.filter((p) => Boolean(p.compareAtPrice));
    if (soloDisponibles) list = list.filter((p) => p.stock > 0);

    switch (sort) {
      case "precio-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "precio-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "descuento":
        list.sort((a, b) => {
          const da = a.compareAtPrice ? a.compareAtPrice - a.price : 0;
          const db = b.compareAtPrice ? b.compareAtPrice - b.price : 0;
          return db - da;
        });
        break;
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return list;
  }, [products, categoria, buscar, soloOfertas, soloDisponibles, sort]);

  const activeCategory = categories.find((c) => c.slug === categoria);

  const filterControls = (
    <div className="flex flex-col gap-5">
      <Checkbox
        label="Solo ofertas"
        checked={soloOfertas}
        onChange={(e) => updateParam("ofertas", e.target.checked ? "1" : null)}
      />
      <Checkbox
        label="Solo disponibles"
        checked={soloDisponibles}
        onChange={(e) => updateParam("disponibles", e.target.checked ? "1" : null)}
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-stoka-green-900 sm:text-3xl">
        {activeCategory ? activeCategory.name : buscar ? `Resultados para "${buscar}"` : "Catálogo"}
      </h1>

      <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-none pb-2">
        <CategoryPill
          category={{ slug: "abarrotes", name: "Todos", icon: "ShoppingBasket", color: "green" }}
          active={!categoria}
          onClick={() => updateParam("categoria", null)}
        />
        {categories.map((c) => (
          <CategoryPill
            key={c.slug}
            category={c}
            active={categoria === c.slug}
            onClick={() => updateParam("categoria", categoria === c.slug ? null : c.slug)}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-stoka-border bg-stoka-surface p-5">
            <h2 className="mb-4 font-semibold text-stoka-green-900">Filtros</h2>
            {filterControls}
          </div>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">{filtered.length} productos encontrados</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFiltersOpen(true)}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-stoka-border bg-stoka-surface px-3.5 py-2 text-sm font-bold text-stoka-green-800 shadow-card lg:hidden"
              >
                <SlidersHorizontal className="size-4" aria-hidden="true" /> Filtros
              </button>
              <Select
                aria-label="Ordenar por"
                value={sort}
                onChange={(e) => updateParam("orden", e.target.value)}
                className="w-auto py-2"
              >
                <option value="relevancia">Relevancia</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="descuento">Mayor descuento</option>
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No encontramos productos"
              description="Prueba con otra categoría o ajusta los filtros de búsqueda."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Cerrar filtros" className="absolute inset-0 bg-stoka-black/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-stoka-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-stoka-green-900">
                <Search className="size-4" aria-hidden="true" /> Filtros
              </div>
              <button onClick={() => setFiltersOpen(false)} aria-label="Cerrar" className="cursor-pointer p-1">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            {filterControls}
          </div>
        </div>
      )}
    </div>
  );
}

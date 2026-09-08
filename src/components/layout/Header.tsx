import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { visibleCategories } from "../../lib/categories";
import { formatCurrency } from "../../lib/format";
import { useCartStore } from "../../store/cartStore";
import { useDataStore } from "../../store/dataStore";
import { ProductImage } from "../store/ProductImage";
import { BrandMark } from "../ui/BrandMark";
import { ThemeToggle } from "../ui/ThemeToggle";

export function Header() {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const products = useDataStore((s) => s.products);
  const categories = visibleCategories(useDataStore((s) => s.categories));
  const cartCount = useCartStore((s) => s.lines.reduce((acc, l) => acc + l.quantity, 0));
  const openCart = useCartStore((s) => s.open);
  const blurTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const suggestions = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.trim().toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query, products]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) navigate(`/catalogo?buscar=${encodeURIComponent(query.trim())}`);
    setShowSuggestions(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-stoka-border bg-stoka-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <button
          className="cursor-pointer rounded-lg p-2 text-stoka-ink hover:bg-stoka-surface-2 lg:hidden"
          aria-label="Abrir menú"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="size-6" aria-hidden="true" />
        </button>

        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Bodeguita Stoka, ir al inicio">
          <BrandMark size={38} />
          <span className="font-display text-xl font-bold tracking-tight whitespace-nowrap text-stoka-ink sm:text-2xl">
            Bodeguita Stoka
          </span>
        </Link>

        <form onSubmit={submitSearch} className="relative ml-2 hidden flex-1 max-w-xl sm:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stoka-ink-muted" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              blurTimeout.current = setTimeout(() => setShowSuggestions(false), 120);
            }}
            placeholder="Busca abarrotes, bebidas, snacks…"
            aria-label="Buscar productos"
            className="w-full rounded-lg border border-stoka-border bg-stoka-surface py-2.5 pl-11 pr-4 text-sm text-stoka-ink outline-none focus:border-stoka-red focus:ring-2 focus:ring-stoka-red-100"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-lg border border-stoka-border bg-stoka-surface shadow-pop">
              {suggestions.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/producto/${p.slug}`}
                    onMouseDown={() => clearTimeout(blurTimeout.current)}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-stoka-surface-2"
                  >
                    <ProductImage hue={p.imageHue} icon={p.imageIcon} name={p.name} className="size-9 shrink-0" iconClassName="size-4" />
                    <span className="flex-1 truncate text-sm text-stoka-ink">{p.name}</span>
                    <span className="text-sm font-semibold text-stoka-red">{formatCurrency(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </form>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Categorías">
          {categories.slice(0, 5).map((c) => (
            <Link
              key={c.slug}
              to={`/catalogo?categoria=${c.slug}`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-stoka-ink hover:bg-stoka-surface-2"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <Link
          to="/mis-pedidos"
          className="ml-1 hidden rounded-lg px-3 py-2 text-sm font-medium text-stoka-ink hover:bg-stoka-surface-2 sm:block"
        >
          Mis pedidos
        </Link>

        <ThemeToggle className="ml-1 hidden sm:flex" />

        <button
          onClick={openCart}
          aria-label={`Abrir carrito, ${cartCount} productos`}
          className="relative ml-1 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-stoka-border bg-stoka-red text-white shadow-card transition-colors hover:bg-stoka-red-dark"
        >
          <ShoppingCart className="size-5" aria-hidden="true" />
          {cartCount > 0 && (
            <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full border border-stoka-bg bg-stoka-ink text-[11px] font-bold text-stoka-bg">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </button>
      </div>

      <form onSubmit={submitSearch} className="relative px-4 pb-3 sm:hidden">
        <Search className="pointer-events-none absolute left-7 top-1/2 size-4 -translate-y-1/2 text-stoka-ink-muted" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca abarrotes, bebidas, snacks…"
          aria-label="Buscar productos"
          className="w-full rounded-lg border border-stoka-border bg-stoka-surface py-2.5 pl-11 pr-4 text-sm text-stoka-ink outline-none focus:border-stoka-red focus:ring-2 focus:ring-stoka-red-100"
        />
      </form>

      <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 pb-3 lg:hidden">
        {categories.map((c) => (
          <Link
            key={c.slug}
            to={`/catalogo?categoria=${c.slug}`}
            className="shrink-0 rounded-lg border border-stoka-border bg-stoka-surface px-3 py-1.5 text-xs font-bold text-stoka-ink shadow-card"
          >
            {c.name}
          </Link>
        ))}
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-stoka-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col gap-1 bg-stoka-surface p-5 shadow-pop">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-bold text-stoka-ink">Menú</span>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar" className="cursor-pointer rounded-lg p-2 hover:bg-stoka-surface-2">
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
            </div>
            <Link onClick={() => setMobileMenuOpen(false)} to="/" className="rounded-lg px-3 py-2.5 font-medium text-stoka-ink hover:bg-stoka-surface-2">
              Inicio
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} to="/catalogo" className="rounded-lg px-3 py-2.5 font-medium text-stoka-ink hover:bg-stoka-surface-2">
              Catálogo
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} to="/mis-pedidos" className="rounded-lg px-3 py-2.5 font-medium text-stoka-ink hover:bg-stoka-surface-2">
              Mis pedidos
            </Link>
            <hr className="my-2 border-stoka-border" />
            <Link onClick={() => setMobileMenuOpen(false)} to="/admin/login" className="rounded-lg px-3 py-2.5 text-sm text-stoka-ink-muted hover:bg-stoka-surface-2">
              Acceso interno (Admin)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

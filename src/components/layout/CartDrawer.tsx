import { ShoppingBag, Sparkles, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartSummary } from "../../lib/cart";
import { formatCurrency } from "../../lib/format";
import { useCartStore } from "../../store/cartStore";
import { useDataStore } from "../../store/dataStore";
import { ProductImage } from "../store/ProductImage";
import { QuantityStepper } from "../store/QuantityStepper";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const navigate = useNavigate();
  const deliveryEnabled = useDataStore((s) => s.config.deliveryEnabled);
  const summary = useCartSummary(deliveryEnabled ? "delivery" : "recojo");

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  return (
    <div className={isOpen ? "" : "pointer-events-none"} aria-hidden={!isOpen}>
      <button
        aria-label="Cerrar carrito"
        onClick={close}
        className={`fixed inset-0 z-40 bg-stoka-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        tabIndex={isOpen ? 0 : -1}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col rounded-t-xl border-t border-stoka-border bg-stoka-bg shadow-pop transition-transform duration-300 ease-out sm:inset-y-0 sm:right-0 sm:left-auto sm:bottom-auto sm:h-full sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:border-l sm:border-t-0 ${
          isOpen ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-x-full sm:translate-y-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-stoka-border px-5 py-4">
          <h2 className="font-display text-xl font-semibold text-stoka-ink">
            Tu carrito {summary.itemCount > 0 && `(${summary.itemCount})`}
          </h2>
          <button
            onClick={close}
            aria-label="Cerrar carrito"
            className="cursor-pointer rounded-full p-2 text-stoka-ink-muted hover:bg-stoka-surface-2"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {summary.lines.length === 0 ? (
          <div className="flex-1 overflow-y-auto p-5">
            <EmptyState
              icon={ShoppingBag}
              title="Tu carrito está vacío"
              description="Agrega productos del catálogo para empezar tu pedido."
              action={
                <Button
                  onClick={() => {
                    close();
                    navigate("/catalogo");
                  }}
                  variant="primary"
                >
                  Ver catálogo
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {deliveryEnabled && summary.amountToFreeDelivery > 0 && (
                <p className="mb-4 flex items-center gap-2 rounded-lg border border-stoka-warning/30 bg-stoka-warning-100 px-3 py-2 text-sm font-bold text-stoka-warning shadow-card">
                  <Sparkles className="size-4 shrink-0" aria-hidden="true" />
                  Te faltan {formatCurrency(summary.amountToFreeDelivery)} para delivery gratis
                </p>
              )}
              <ul className="flex flex-col gap-4">
                {summary.lines.map(({ product, quantity, lineTotal }) => (
                  <li key={product.id} className="flex gap-3">
                    <ProductImage
                      hue={product.imageHue}
                      icon={product.imageIcon}
                      name={product.name}
                      className="size-16 shrink-0"
                      iconClassName="size-7"
                    />
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-stoka-green-900">{product.name}</p>
                        <button
                          onClick={() => removeItem(product.id)}
                          aria-label={`Quitar ${product.name} del carrito`}
                          className="cursor-pointer text-slate-400 hover:text-stoka-red"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500">{product.presentation}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <QuantityStepper
                          size="sm"
                          quantity={quantity}
                          max={product.stock}
                          onChange={(next) => setQuantity(product.id, next)}
                        />
                        <span className="font-semibold text-stoka-green-800">{formatCurrency(lineTotal)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-stoka-border bg-stoka-surface px-5 py-4">
              <div className="mb-3 space-y-1 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(summary.subtotal)}</span>
                </div>
                {summary.savings > 0 && (
                  <div className="flex justify-between text-stoka-coral-dark">
                    <span>Ahorro</span>
                    <span>-{formatCurrency(summary.savings)}</span>
                  </div>
                )}
                {summary.appliedCombos.map(({ combo, times, discountPerApplication }) => (
                  <div key={combo.id} className="flex justify-between text-stoka-success">
                    <span>🎁 {combo.name}{times > 1 ? ` ×${times}` : ""}</span>
                    <span>-{formatCurrency(discountPerApplication * times)}</span>
                  </div>
                ))}
                {deliveryEnabled && (
                  <div className="flex justify-between text-slate-500">
                    <span>Delivery estimado</span>
                    <span>{summary.deliveryFee === 0 ? "Gratis" : formatCurrency(summary.deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 text-base font-bold text-stoka-green-900">
                  <span>Total</span>
                  <span>{formatCurrency(summary.total)}</span>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  close();
                  navigate("/checkout");
                }}
              >
                Ir a pagar
              </Button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

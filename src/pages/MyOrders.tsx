import { PackageSearch, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Field, Input } from "../components/ui/form";
import { formatCurrency, formatDateTime } from "../lib/format";
import { isValidPeruPhone } from "../lib/validation";
import { useDataStore } from "../store/dataStore";
import type { OrderStatus } from "../types";

const statusLabels: Record<OrderStatus, string> = {
  recibido: "Recibido",
  pendiente_pago: "Pendiente de pago",
  pago_en_revision: "Pago en revisión",
  confirmado: "Confirmado",
  preparando: "Preparando",
  en_reparto: "En reparto",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const statusVariant: Record<OrderStatus, "green" | "yellow" | "blue" | "gray" | "red"> = {
  recibido: "gray",
  pendiente_pago: "yellow",
  pago_en_revision: "yellow",
  confirmado: "blue",
  preparando: "blue",
  en_reparto: "blue",
  entregado: "green",
  cancelado: "red",
};

export function MyOrders() {
  const orders = useDataStore((s) => s.orders);
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const results = orders.filter((o) => o.customer.phone === phone);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPeruPhone(phone)) {
      setError("Ingresa un celular válido (9 dígitos, empieza con 9).");
      return;
    }
    setError("");
    setSearched(true);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 font-display text-2xl font-bold text-stoka-green-900 sm:text-3xl">Mis pedidos</h1>
      <p className="mb-6 text-sm text-slate-500">
        Ingresa el celular con el que hiciste tu pedido para ver su estado.
      </p>

      <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Field label="Celular" htmlFor="lookup-phone" error={error}>
            <Input
              id="lookup-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="numeric"
              maxLength={9}
              placeholder="987654321"
            />
          </Field>
        </div>
        <Button type="submit" size="lg" icon={<Search className="size-4" aria-hidden="true" />}>
          Buscar
        </Button>
      </form>

      {searched &&
        (results.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No encontramos pedidos"
            description="Revisa que el celular sea el mismo que usaste al comprar."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {results.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/pedido/${order.code}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-stoka-border bg-stoka-surface p-4 transition-colors hover:border-stoka-green-300"
                >
                  <div>
                    <p className="font-semibold text-stoka-green-900">{order.code}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-stoka-green-800">{formatCurrency(order.total)}</p>
                    <Badge variant={statusVariant[order.status]}>{statusLabels[order.status]}</Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}

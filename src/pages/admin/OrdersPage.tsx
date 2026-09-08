import { Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { Timeline } from "../../components/store/Timeline";
import { Badge, type BadgeVariant } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Field, Select, Textarea } from "../../components/ui/form";
import { Modal } from "../../components/ui/Modal";
import { formatCurrency, formatDateTime } from "../../lib/format";
import { useDataStore } from "../../store/dataStore";
import type { Order, OrderStatus } from "../../types";

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

const statusVariant: Record<OrderStatus, BadgeVariant> = {
  recibido: "gray",
  pendiente_pago: "yellow",
  pago_en_revision: "yellow",
  confirmado: "blue",
  preparando: "blue",
  en_reparto: "blue",
  entregado: "green",
  cancelado: "red",
};

const forwardOrder: OrderStatus[] = ["recibido", "pendiente_pago", "pago_en_revision", "confirmado", "preparando", "en_reparto", "entregado"];

export function OrdersPage() {
  const orders = useDataStore((s) => s.orders);
  const updateOrderStatus = useDataStore((s) => s.updateOrderStatus);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [nextStatus, setNextStatus] = useState<OrderStatus | "">("");
  const [note, setNote] = useState("");

  const filtered = useMemo(
    () => orders.filter((o) => !statusFilter || o.status === statusFilter),
    [orders, statusFilter],
  );

  function openDetail(order: Order) {
    setSelected(order);
    const idx = forwardOrder.indexOf(order.status);
    setNextStatus(idx >= 0 && idx < forwardOrder.length - 1 ? forwardOrder[idx + 1] : "");
    setNote("");
  }

  function applyStatus() {
    if (!selected || !nextStatus) return;
    updateOrderStatus(selected.id, nextStatus, note || undefined);
    toast.success(`Pedido ${selected.code} actualizado a "${statusLabels[nextStatus]}"`);
    setSelected({ ...selected, status: nextStatus, history: [...selected.history, { status: nextStatus, at: new Date().toISOString(), note }] });
  }

  function cancelOrder() {
    if (!selected) return;
    updateOrderStatus(selected.id, "cancelado", note || "Cancelado desde el panel administrativo");
    toast.success(`Pedido ${selected.code} cancelado`);
    setSelected({ ...selected, status: "cancelado" });
  }

  const columns: Column<Order>[] = [
    { header: "Código", render: (o) => <span className="font-semibold">{o.code}</span> },
    { header: "Cliente", render: (o) => o.customer.name },
    { header: "Fecha", render: (o) => formatDateTime(o.createdAt) },
    { header: "Total", render: (o) => formatCurrency(o.total) },
    { header: "Estado", render: (o) => <Badge variant={statusVariant[o.status]}>{statusLabels[o.status]}</Badge> },
    {
      header: "",
      render: (o) => (
        <button onClick={() => openDetail(o)} aria-label={`Ver pedido ${o.code}`} className="cursor-pointer rounded-lg p-1.5 text-stoka-green-700 hover:bg-stoka-green-50">
          <Eye className="size-4" aria-hidden="true" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-stoka-green-900">Pedidos</h1>
          <p className="text-sm text-slate-500">{orders.length} pedidos totales</p>
        </div>
        <Select className="w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}>
          <option value="">Todos los estados</option>
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
      </div>

      <DataTable columns={columns} rows={filtered} keyExtractor={(o) => o.id} emptyMessage="No hay pedidos con ese estado." />

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `Pedido ${selected.code}` : ""} size="lg">
        {selected && (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-semibold text-stoka-green-900">Seguimiento</h3>
              <Timeline order={selected} />
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-stoka-green-900">Cliente</h3>
              <p className="text-sm">{selected.customer.name} · {selected.customer.phone}</p>
              <p className="text-sm text-slate-500">
                {selected.fulfillment === "delivery" ? `${selected.address?.line}, ${selected.address?.district}` : "Recojo en tienda"}
              </p>

              <h3 className="mb-2 mt-4 font-semibold text-stoka-green-900">Productos</h3>
              <ul className="mb-3 space-y-1 text-sm">
                {selected.items.map((item) => (
                  <li key={item.productId} className="flex justify-between">
                    <span>{item.name} ×{item.quantity}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <p className="flex justify-between border-t border-stoka-cream-200 pt-2 font-bold text-stoka-green-900">
                <span>Total</span>
                <span>{formatCurrency(selected.total)}</span>
              </p>

              {selected.status !== "cancelado" && selected.status !== "entregado" && (
                <div className="mt-5 rounded-xl bg-stoka-cream-100 p-4">
                  <Field label="Actualizar a" htmlFor="next-status">
                    <Select id="next-status" value={nextStatus} onChange={(e) => setNextStatus(e.target.value as OrderStatus)}>
                      <option value="">Selecciona un estado</option>
                      {forwardOrder.map((s) => (
                        <option key={s} value={s}>{statusLabels[s]}</option>
                      ))}
                    </Select>
                  </Field>
                  <div className="mt-3">
                    <Field label="Nota (opcional)" htmlFor="status-note">
                      <Textarea id="status-note" value={note} onChange={(e) => setNote(e.target.value)} />
                    </Field>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button variant="danger" size="sm" onClick={cancelOrder}>Cancelar pedido</Button>
                    <Button size="sm" onClick={applyStatus} disabled={!nextStatus}>Actualizar estado</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

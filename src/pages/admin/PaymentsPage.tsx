import { AlertCircle, Check, FileText, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { Badge, type BadgeVariant } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Field, Textarea } from "../../components/ui/form";
import { Modal } from "../../components/ui/Modal";
import { Tabs } from "../../components/ui/Tabs";
import { formatCurrency, formatDateTime } from "../../lib/format";
import { useAuthStore } from "../../store/authStore";
import { useDataStore } from "../../store/dataStore";
import type { Order, PaymentStatus } from "../../types";

const statusLabels: Record<PaymentStatus, string> = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  validado: "Validado",
  rechazado: "Rechazado",
  vencido: "Vencido",
};

const statusVariant: Record<PaymentStatus, BadgeVariant> = {
  pendiente: "gray",
  en_revision: "yellow",
  validado: "green",
  rechazado: "red",
  vencido: "red",
};

export function PaymentsPage() {
  const orders = useDataStore((s) => s.orders);
  const reviewPaymentProof = useDataStore((s) => s.reviewPaymentProof);
  const currentUser = useAuthStore((s) => s.currentUser);
  const [tab, setTab] = useState<PaymentStatus | "todos">("en_revision");
  const [rejecting, setRejecting] = useState<Order | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const withProof = useMemo(() => orders.filter((o) => o.paymentProof), [orders]);
  const filtered = useMemo(
    () => (tab === "todos" ? withProof : withProof.filter((o) => o.paymentProof?.status === tab)),
    [withProof, tab],
  );

  function approve(order: Order) {
    reviewPaymentProof(order.id, "validado", "Comprobante verificado y conforme.", currentUser?.name ?? "Staff");
    toast.success(`Pago de ${order.code} validado — pedido confirmado`);
  }

  function reject() {
    if (!rejecting) return;
    reviewPaymentProof(rejecting.id, "rechazado", rejectNote || "Comprobante no válido.", currentUser?.name ?? "Staff");
    toast.success(`Pago de ${rejecting.code} rechazado`);
    setRejecting(null);
    setRejectNote("");
  }

  const columns: Column<Order>[] = [
    { header: "Pedido", render: (o) => <span className="font-semibold">{o.code}</span> },
    { header: "Cliente", render: (o) => o.customer.name },
    { header: "Método", render: (o) => o.paymentMethod },
    {
      header: "Monto",
      render: (o) => {
        const mismatch = o.paymentProof && Math.abs(o.paymentProof.amount - o.total) > 0.01;
        return (
          <span className={mismatch ? "font-semibold text-stoka-red-dark" : ""}>
            {formatCurrency(o.paymentProof?.amount ?? o.total)}
            {mismatch && <AlertCircle className="ml-1 inline size-3.5" aria-label="El monto no coincide con el total" />}
          </span>
        );
      },
    },
    { header: "N° operación", render: (o) => o.paymentProof?.operationNumber ?? "—" },
    {
      header: "Comprobante",
      render: (o) =>
        o.paymentProof?.fileName ? (
          <span className="flex items-center gap-1 text-slate-500">
            <FileText className="size-3.5" aria-hidden="true" /> {o.paymentProof.fileName}
          </span>
        ) : (
          "—"
        ),
    },
    { header: "Enviado", render: (o) => (o.paymentProof ? formatDateTime(o.paymentProof.submittedAt) : "—") },
    { header: "Estado", render: (o) => <Badge variant={statusVariant[o.paymentProof!.status]}>{statusLabels[o.paymentProof!.status]}</Badge> },
    {
      header: "Acciones",
      render: (o) =>
        o.paymentProof?.status === "en_revision" ? (
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={() => approve(o)} icon={<Check className="size-3.5" aria-hidden="true" />}>
              Validar
            </Button>
            <Button size="sm" variant="danger" onClick={() => setRejecting(o)} icon={<X className="size-3.5" aria-hidden="true" />}>
              Rechazar
            </Button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">{o.paymentProof?.reviewedBy}</span>
        ),
    },
  ];

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-bold text-stoka-green-900">Validación de pagos</h1>
      <p className="mb-6 text-sm text-slate-500">
        Yape, Plin y transferencias quedan pendientes hasta que confirmes el comprobante manualmente.
      </p>

      <Tabs
        tabs={[
          { value: "en_revision", label: "Por validar" },
          { value: "validado", label: "Validados" },
          { value: "rechazado", label: "Rechazados" },
          { value: "vencido", label: "Vencidos" },
          { value: "todos", label: "Todos" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="mt-5">
        <DataTable columns={columns} rows={filtered} keyExtractor={(o) => o.id} emptyMessage="No hay pagos en este estado." />
      </div>

      <Modal open={Boolean(rejecting)} onClose={() => setRejecting(null)} title="Rechazar comprobante" size="sm">
        <Field label="Motivo del rechazo" htmlFor="reject-note" required>
          <Textarea id="reject-note" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Ej. el monto no coincide con el total del pedido" />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setRejecting(null)}>Cancelar</Button>
          <Button variant="danger" onClick={reject} disabled={!rejectNote.trim()}>Confirmar rechazo</Button>
        </div>
      </Modal>
    </div>
  );
}

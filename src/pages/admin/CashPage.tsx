import { ArrowDownCircle, ArrowUpCircle, Lock, MinusCircle, Unlock } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { Field, Input, Select } from "../../components/ui/form";
import { Modal } from "../../components/ui/Modal";
import { formatCurrency, formatDateTime } from "../../lib/format";
import { useAuthStore } from "../../store/authStore";
import { useDataStore } from "../../store/dataStore";
import type { CashMovement } from "../../types";

export function CashPage() {
  const cashSessions = useDataStore((s) => s.cashSessions);
  const openCashSession = useDataStore((s) => s.openCashSession);
  const addCashMovement = useDataStore((s) => s.addCashMovement);
  const closeCashSession = useDataStore((s) => s.closeCashSession);
  const currentUser = useAuthStore((s) => s.currentUser);

  const current = cashSessions[0];
  const history = cashSessions.slice(1);
  const isOpen = current?.status === "abierta";

  const [openModal, setOpenModal] = useState(false);
  const [openingAmount, setOpeningAmount] = useState(100);
  const [moveModal, setMoveModal] = useState(false);
  const [moveType, setMoveType] = useState<CashMovement["type"]>("ingreso");
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState(0);
  const [closeModal, setCloseModal] = useState(false);
  const [closingAmount, setClosingAmount] = useState(0);

  const balance = useMemo(() => {
    if (!current) return 0;
    return current.movements.reduce((acc, m) => {
      if (m.type === "ingreso") return acc + m.amount;
      return acc - m.amount;
    }, current.openingAmount);
  }, [current]);

  function handleOpen(e: React.FormEvent) {
    e.preventDefault();
    openCashSession(openingAmount, currentUser?.name ?? "Staff");
    toast.success("Caja abierta");
    setOpenModal(false);
  }

  function handleMove(e: React.FormEvent) {
    e.preventDefault();
    if (!concept.trim() || amount <= 0) {
      toast.error("Completa el concepto y un monto válido.");
      return;
    }
    addCashMovement({ type: moveType, concept, amount });
    toast.success("Movimiento registrado");
    setMoveModal(false);
    setConcept("");
    setAmount(0);
  }

  function handleClose(e: React.FormEvent) {
    e.preventDefault();
    closeCashSession(closingAmount);
    toast.success("Caja cerrada");
    setCloseModal(false);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-stoka-green-900">Caja</h1>
          <p className="text-sm text-slate-500">Control de apertura, ingresos, gastos, retiros y cierre.</p>
        </div>
        {isOpen ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setMoveModal(true)}>Registrar movimiento</Button>
            <Button
              variant="danger"
              icon={<Lock className="size-4" aria-hidden="true" />}
              onClick={() => {
                setClosingAmount(Math.round(balance * 100) / 100);
                setCloseModal(true);
              }}
            >
              Cerrar caja
            </Button>
          </div>
        ) : (
          <Button icon={<Unlock className="size-4" aria-hidden="true" />} onClick={() => setOpenModal(true)}>
            Abrir caja
          </Button>
        )}
      </div>

      {isOpen && current ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={Unlock} label="Apertura" value={formatCurrency(current.openingAmount)} tone="green" hint={formatDateTime(current.openedAt)} />
            <StatCard icon={ArrowUpCircle} label="Ingresos" value={formatCurrency(current.movements.filter((m) => m.type === "ingreso").reduce((a, m) => a + m.amount, 0))} tone="blue" />
            <StatCard icon={ArrowDownCircle} label="Gastos" value={formatCurrency(current.movements.filter((m) => m.type === "gasto").reduce((a, m) => a + m.amount, 0))} tone="coral" />
            <StatCard icon={MinusCircle} label="Saldo actual" value={formatCurrency(balance)} tone="yellow" />
          </div>

          <h2 className="mb-3 mt-6 font-semibold text-stoka-green-900">Movimientos de la sesión</h2>
          {current.movements.length === 0 ? (
            <p className="text-sm text-slate-400">Aún no hay movimientos en esta sesión.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {current.movements.map((m) => (
                <li key={m.id} className="flex items-center justify-between rounded-xl border border-stoka-cream-200 bg-stoka-surface p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={m.type === "ingreso" ? "green" : m.type === "gasto" ? "coral" : "yellow"}>
                      {m.type === "ingreso" ? "Ingreso" : m.type === "gasto" ? "Gasto" : "Retiro"}
                    </Badge>
                    <span className="text-sm">{m.concept}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(m.amount)}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(m.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="rounded-xl border-2 border-dashed border-stoka-border bg-stoka-surface p-8 text-center text-sm text-slate-400">
          La caja está cerrada. Ábrela para registrar ventas en efectivo, gastos y retiros del día.
        </p>
      )}

      {history.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 font-semibold text-stoka-green-900">Historial de cierres</h2>
          <ul className="flex flex-col gap-2">
            {history.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-xl border border-stoka-cream-200 bg-stoka-surface p-3 text-sm">
                <span>{formatDateTime(s.openedAt)} → {s.closedAt && formatDateTime(s.closedAt)}</span>
                <span>Apertura {formatCurrency(s.openingAmount)} · Cierre {formatCurrency(s.closingAmount ?? 0)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Abrir caja" size="sm">
        <form onSubmit={handleOpen} className="flex flex-col gap-4">
          <Field label="Monto de apertura (S/)" htmlFor="opening" required>
            <Input id="opening" type="number" min={0} step={0.1} value={openingAmount} onChange={(e) => setOpeningAmount(Number(e.target.value))} />
          </Field>
          <Button type="submit">Abrir caja</Button>
        </form>
      </Modal>

      <Modal open={moveModal} onClose={() => setMoveModal(false)} title="Registrar movimiento de caja" size="sm">
        <form onSubmit={handleMove} className="flex flex-col gap-4">
          <Field label="Tipo" htmlFor="move-type" required>
            <Select id="move-type" value={moveType} onChange={(e) => setMoveType(e.target.value as CashMovement["type"])}>
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
              <option value="retiro">Retiro</option>
            </Select>
          </Field>
          <Field label="Concepto" htmlFor="move-concept" required>
            <Input id="move-concept" value={concept} onChange={(e) => setConcept(e.target.value)} />
          </Field>
          <Field label="Monto (S/)" htmlFor="move-amount" required>
            <Input id="move-amount" type="number" min={0} step={0.1} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </Field>
          <Button type="submit">Guardar</Button>
        </form>
      </Modal>

      <Modal open={closeModal} onClose={() => setCloseModal(false)} title="Cerrar caja" size="sm">
        <form onSubmit={handleClose} className="flex flex-col gap-4">
          <p className="text-sm text-slate-500">Saldo calculado: <strong>{formatCurrency(balance)}</strong></p>
          <Field label="Monto real contado (S/)" htmlFor="closing" required>
            <Input id="closing" type="number" min={0} step={0.1} value={closingAmount} onChange={(e) => setClosingAmount(Number(e.target.value))} />
          </Field>
          <Button type="submit" variant="danger">Confirmar cierre</Button>
        </form>
      </Modal>
    </div>
  );
}

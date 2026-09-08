import { Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/form";
import { useDataStore } from "../../store/dataStore";
import type { DeliveryZone, StoreConfig } from "../../types";

export function SettingsPage() {
  const config = useDataStore((s) => s.config);
  const updateConfig = useDataStore((s) => s.updateConfig);
  const [form, setForm] = useState<StoreConfig>(config);

  function updateZone(id: string, patch: Partial<DeliveryZone>) {
    setForm((f) => ({ ...f, deliveryZones: f.deliveryZones.map((z) => (z.id === id ? { ...z, ...patch } : z)) }));
  }
  function removeZone(id: string) {
    setForm((f) => ({ ...f, deliveryZones: f.deliveryZones.filter((z) => z.id !== id) }));
  }
  function addZone() {
    setForm((f) => ({
      ...f,
      deliveryZones: [...f.deliveryZones, { id: `z-${Date.now()}`, district: "", fee: 5, etaMinutes: 30 }],
    }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateConfig(form);
    toast.success("Configuración guardada");
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8">
      <div>
        <h1 className="mb-1 font-display text-2xl font-bold text-stoka-green-900">Configuración</h1>
        <p className="text-sm text-slate-500">Delivery, zonas, horarios y cuentas de pago.</p>
      </div>

      <section className="rounded-xl border border-stoka-border bg-stoka-surface p-5">
        <h2 className="mb-4 font-semibold text-stoka-green-900">Delivery general</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Delivery gratis desde (S/)" htmlFor="threshold">
            <Input id="threshold" type="number" min={0} value={form.freeDeliveryThreshold} onChange={(e) => setForm({ ...form, freeDeliveryThreshold: Number(e.target.value) })} />
          </Field>
          <Field label="Tarifa de delivery por defecto (S/)" htmlFor="default-fee">
            <Input id="default-fee" type="number" min={0} value={form.defaultDeliveryFee} onChange={(e) => setForm({ ...form, defaultDeliveryFee: Number(e.target.value) })} />
          </Field>
          <Field label="Horario de atención" htmlFor="hours">
            <Input id="hours" value={form.openingHours} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-stoka-border bg-stoka-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-stoka-green-900">Zonas de delivery</h2>
          <Button type="button" variant="ghost" size="sm" onClick={addZone} icon={<Plus className="size-4" aria-hidden="true" />}>
            Agregar zona
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {form.deliveryZones.map((zone) => (
            <div key={zone.id} className="grid grid-cols-[1fr_100px_100px_auto] items-end gap-2">
              <Field label="Distrito" htmlFor={`z-district-${zone.id}`}>
                <Input id={`z-district-${zone.id}`} value={zone.district} onChange={(e) => updateZone(zone.id, { district: e.target.value })} />
              </Field>
              <Field label="Tarifa (S/)" htmlFor={`z-fee-${zone.id}`}>
                <Input id={`z-fee-${zone.id}`} type="number" min={0} value={zone.fee} onChange={(e) => updateZone(zone.id, { fee: Number(e.target.value) })} />
              </Field>
              <Field label="ETA (min)" htmlFor={`z-eta-${zone.id}`}>
                <Input id={`z-eta-${zone.id}`} type="number" min={0} value={zone.etaMinutes} onChange={(e) => updateZone(zone.id, { etaMinutes: Number(e.target.value) })} />
              </Field>
              <button type="button" onClick={() => removeZone(zone.id)} aria-label="Eliminar zona" className="mb-1 cursor-pointer rounded-lg p-2 text-stoka-red-dark hover:bg-stoka-red-100">
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-stoka-border bg-stoka-surface p-5">
        <h2 className="mb-4 font-semibold text-stoka-green-900">Cuentas de pago</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="mb-2 text-sm font-semibold text-stoka-green-700">Yape</p>
            <Field label="Número" htmlFor="yape-phone">
              <Input id="yape-phone" value={form.paymentAccounts.yape.phone} onChange={(e) => setForm({ ...form, paymentAccounts: { ...form.paymentAccounts, yape: { ...form.paymentAccounts.yape, phone: e.target.value } } })} />
            </Field>
            <div className="mt-3">
              <Field label="Titular" htmlFor="yape-holder">
                <Input id="yape-holder" value={form.paymentAccounts.yape.holder} onChange={(e) => setForm({ ...form, paymentAccounts: { ...form.paymentAccounts, yape: { ...form.paymentAccounts.yape, holder: e.target.value } } })} />
              </Field>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-stoka-green-700">Plin</p>
            <Field label="Número" htmlFor="plin-phone">
              <Input id="plin-phone" value={form.paymentAccounts.plin.phone} onChange={(e) => setForm({ ...form, paymentAccounts: { ...form.paymentAccounts, plin: { ...form.paymentAccounts.plin, phone: e.target.value } } })} />
            </Field>
            <div className="mt-3">
              <Field label="Titular" htmlFor="plin-holder">
                <Input id="plin-holder" value={form.paymentAccounts.plin.holder} onChange={(e) => setForm({ ...form, paymentAccounts: { ...form.paymentAccounts, plin: { ...form.paymentAccounts.plin, holder: e.target.value } } })} />
              </Field>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-stoka-green-700">Transferencia / CCI</p>
            <Field label="Banco" htmlFor="bank">
              <Input id="bank" value={form.paymentAccounts.transferencia.bank} onChange={(e) => setForm({ ...form, paymentAccounts: { ...form.paymentAccounts, transferencia: { ...form.paymentAccounts.transferencia, bank: e.target.value } } })} />
            </Field>
            <div className="mt-3">
              <Field label="N° de cuenta" htmlFor="account">
                <Input id="account" value={form.paymentAccounts.transferencia.accountNumber} onChange={(e) => setForm({ ...form, paymentAccounts: { ...form.paymentAccounts, transferencia: { ...form.paymentAccounts.transferencia, accountNumber: e.target.value } } })} />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="CCI" htmlFor="cci">
                <Input id="cci" value={form.paymentAccounts.transferencia.cci} onChange={(e) => setForm({ ...form, paymentAccounts: { ...form.paymentAccounts, transferencia: { ...form.paymentAccounts.transferencia, cci: e.target.value } } })} />
              </Field>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" size="lg" icon={<Save className="size-4" aria-hidden="true" />}>
          Guardar configuración
        </Button>
      </div>
    </form>
  );
}

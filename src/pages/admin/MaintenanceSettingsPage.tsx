import { AlertTriangle, CalendarClock, CheckCircle2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatScheduled } from "../../components/layout/MaintenanceNoticeBanner";
import { MaintenanceContent } from "../../components/store/MaintenanceContent";
import { Button } from "../../components/ui/Button";
import { Checkbox, Field, Input, Textarea } from "../../components/ui/form";
import { isMaintenanceActive, isUpcomingNoticeVisible } from "../../lib/maintenance";
import { useDataStore } from "../../store/dataStore";
import type { MaintenanceConfig } from "../../types";

export function MaintenanceSettingsPage() {
  const maintenance = useDataStore((s) => s.maintenance);
  const updateMaintenance = useDataStore((s) => s.updateMaintenance);
  const [draft, setDraft] = useState<MaintenanceConfig>(maintenance);

  const dirty = JSON.stringify(draft) !== JSON.stringify(maintenance);
  const currentlyActive = isMaintenanceActive(maintenance);
  const draftWouldBeActive = isMaintenanceActive(draft);

  function set<K extends keyof MaintenanceConfig>(key: K, value: MaintenanceConfig[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (draft.scheduled && draft.startAt && draft.endAt && new Date(draft.startAt) >= new Date(draft.endAt)) {
      toast.error("La fecha \"Hasta\" debe ser posterior a \"Desde\".");
      return;
    }
    updateMaintenance(draft);
    toast.success(draftWouldBeActive ? "Mantenimiento activado — la tienda ya no es visible para clientes" : "Cambios guardados");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-stoka-ink">Mantenimiento</h1>
        <p className="text-sm text-stoka-ink-muted">
          Pausa la tienda pública para clientes sin afectar el panel administrativo — el staff siempre puede entrar a `/admin` para desactivarlo.
        </p>
      </div>

      <div
        className={`mb-6 flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold ${
          currentlyActive
            ? "border-stoka-red/40 bg-stoka-red-100 text-stoka-red"
            : "border-stoka-success/40 bg-stoka-success-100 text-stoka-success"
        }`}
      >
        {currentlyActive ? (
          <AlertTriangle className="size-5 shrink-0" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
        )}
        {currentlyActive ? "La tienda está EN MANTENIMIENTO ahora mismo." : "La tienda está activa y visible para clientes."}
      </div>

      <form onSubmit={handleSave} className="grid gap-8 lg:grid-cols-[420px_1fr]">
        <div className="flex flex-col gap-5 rounded-xl border border-stoka-border bg-stoka-surface p-5">
          <Checkbox
            label="Activar mantenimiento ahora mismo"
            checked={draft.enabled}
            onChange={(e) => set("enabled", e.target.checked)}
          />
          <p className="-mt-3 text-xs text-stoka-ink-muted">Anula cualquier programación de abajo mientras esté marcado.</p>

          <hr className="border-stoka-border" />

          <Checkbox
            label="Programar automáticamente por fecha y hora"
            checked={draft.scheduled}
            onChange={(e) => set("scheduled", e.target.checked)}
          />
          {draft.scheduled && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Desde" htmlFor="m-start" required>
                  <Input id="m-start" type="datetime-local" value={draft.startAt} onChange={(e) => set("startAt", e.target.value)} />
                </Field>
                <Field label="Hasta" htmlFor="m-end" required>
                  <Input id="m-end" type="datetime-local" value={draft.endAt} onChange={(e) => set("endAt", e.target.value)} />
                </Field>
              </div>

              <div className="rounded-lg border border-stoka-border bg-stoka-surface-2 p-3">
                <Checkbox
                  label="Mostrar un aviso en la tienda mientras el mantenimiento aún no empieza"
                  checked={draft.noticeEnabled}
                  onChange={(e) => set("noticeEnabled", e.target.checked)}
                />
                {draft.noticeEnabled && (
                  <div className="mt-3">
                    <Field label="Mensaje del aviso previo" htmlFor="m-notice">
                      <Textarea id="m-notice" value={draft.noticeMessage} onChange={(e) => set("noticeMessage", e.target.value)} />
                    </Field>
                  </div>
                )}
              </div>
            </>
          )}

          <Field label="Mensaje para los visitantes (pantalla completa, mientras dure)" htmlFor="m-message">
            <Textarea id="m-message" value={draft.message} onChange={(e) => set("message", e.target.value)} />
          </Field>

          <Button type="submit" size="lg" disabled={!dirty} icon={<Save className="size-4" aria-hidden="true" />}>
            {dirty ? "Guardar cambios" : "Sin cambios por guardar"}
          </Button>
        </div>

        <div className="min-w-0">
          {draft.scheduled && draft.noticeEnabled && (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stoka-ink-muted">
                Vista previa del aviso previo {isUpcomingNoticeVisible(draft) ? "" : "(no se mostraría con estas fechas)"}
              </p>
              <div className="mb-4 flex items-center gap-3 overflow-hidden rounded-xl border border-stoka-warning/30 bg-stoka-warning-100 px-4 py-2 text-sm text-stoka-warning">
                <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
                <p>
                  {draft.noticeMessage}
                  {draft.startAt && <span className="font-semibold"> Programado para el {formatScheduled(draft.startAt)}.</span>}
                </p>
              </div>
            </>
          )}
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stoka-ink-muted">
            Vista previa de lo que verían los clientes {draftWouldBeActive ? "" : "(actualmente no se mostraría)"}
          </p>
          <div className="overflow-hidden rounded-xl border border-stoka-border">
            <MaintenanceContent message={draft.message} endAt={draft.scheduled ? draft.endAt : undefined} />
          </div>
        </div>
      </form>
    </div>
  );
}

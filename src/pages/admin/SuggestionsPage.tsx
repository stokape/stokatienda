import { CheckCircle2, Lightbulb, Trash2, Undo2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Modal } from "../../components/ui/Modal";
import { formatDateTime } from "../../lib/format";
import { useDataStore } from "../../store/dataStore";
import type { Suggestion } from "../../types";

export function SuggestionsPage() {
  const suggestions = useDataStore((s) => s.suggestions);
  const updateSuggestionStatus = useDataStore((s) => s.updateSuggestionStatus);
  const deleteSuggestion = useDataStore((s) => s.deleteSuggestion);
  const [confirmDelete, setConfirmDelete] = useState<Suggestion | null>(null);

  const sorted = useMemo(
    () => [...suggestions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [suggestions],
  );
  const newCount = suggestions.filter((s) => s.status === "nueva").length;

  const columns: Column<Suggestion>[] = [
    {
      header: "Sugerencia",
      className: "max-w-md",
      render: (s) => <p className="text-stoka-ink">{s.message}</p>,
    },
    {
      header: "De",
      render: (s) => (
        <div className="text-sm">
          <p className="font-medium text-stoka-ink">{s.name?.trim() || "Anónimo"}</p>
          {s.phone && <p className="text-stoka-ink-muted">{s.phone}</p>}
        </div>
      ),
    },
    { header: "Fecha", render: (s) => formatDateTime(s.createdAt) },
    {
      header: "Estado",
      render: (s) => <Badge variant={s.status === "nueva" ? "coral" : "green"}>{s.status === "nueva" ? "Nueva" : "Revisada"}</Badge>,
    },
    {
      header: "Acciones",
      render: (s) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              updateSuggestionStatus(s.id, s.status === "nueva" ? "revisada" : "nueva");
              toast.success(s.status === "nueva" ? "Marcada como revisada" : "Marcada como nueva");
            }}
            aria-label={s.status === "nueva" ? "Marcar como revisada" : "Marcar como nueva"}
            title={s.status === "nueva" ? "Marcar como revisada" : "Marcar como nueva"}
            className="cursor-pointer rounded-lg p-1.5 text-stoka-green-700 hover:bg-stoka-green-50"
          >
            {s.status === "nueva" ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <Undo2 className="size-4" aria-hidden="true" />}
          </button>
          <button
            onClick={() => setConfirmDelete(s)}
            aria-label="Eliminar sugerencia"
            title="Eliminar"
            className="cursor-pointer rounded-lg p-1.5 text-stoka-red-dark hover:bg-stoka-red-100"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-stoka-ink">Sugerencias</h1>
        <p className="text-sm text-stoka-ink-muted">
          Ideas que los clientes mandan desde el botón flotante de la tienda pública — qué producto les falta, qué
          les gustaría que vendas, etc. {newCount > 0 && <span className="font-semibold text-stoka-red">{newCount} nueva{newCount === 1 ? "" : "s"} sin revisar.</span>}
        </p>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="Todavía no llegan sugerencias"
          description="En cuanto un cliente mande una desde la tienda, aparece aquí."
        />
      ) : (
        <DataTable columns={columns} rows={sorted} keyExtractor={(s) => s.id} />
      )}

      <Modal open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} title="Eliminar sugerencia" size="sm">
        <p className="text-sm text-stoka-ink-muted">
          ¿Seguro que deseas eliminar esta sugerencia? No se puede deshacer.
        </p>
        <p className="mt-3 rounded-lg bg-stoka-surface-2 p-3 text-sm text-stoka-ink">"{confirmDelete?.message}"</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirmDelete) {
                deleteSuggestion(confirmDelete.id);
                toast.success("Sugerencia eliminada");
              }
              setConfirmDelete(null);
            }}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

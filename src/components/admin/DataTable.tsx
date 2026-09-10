import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  keyExtractor,
  emptyMessage = "No hay datos para mostrar.",
}: {
  columns: Column<T>[];
  rows: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-stoka-border bg-stoka-surface py-14 text-center">
        <Inbox className="size-6 text-slate-300" aria-hidden="true" />
        <p className="text-sm text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-stoka-border bg-stoka-surface">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-stoka-cream-200 text-xs uppercase tracking-wide text-slate-400">
            {columns.map((col) => (
              <th key={col.header} className={`px-4 py-3 font-semibold ${col.className ?? ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={keyExtractor(row)} className="border-b border-stoka-cream-100 last:border-0 hover:bg-[rgb(var(--stoka-surface-2)/.5)]">
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-3 align-middle ${col.className ?? ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

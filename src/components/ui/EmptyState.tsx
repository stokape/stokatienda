import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-stoka-border bg-stoka-surface/60 px-6 py-14 text-center">
      <div className="rounded-full border border-stoka-border bg-stoka-yellow-100 p-4">
        <Icon className="size-7 text-stoka-green-700" aria-hidden="true" />
      </div>
      <h3 className="font-display text-lg font-semibold text-stoka-green-900">{title}</h3>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
      {action}
    </div>
  );
}

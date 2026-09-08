import type { LucideIcon } from "lucide-react";

const toneClass: Record<string, string> = {
  green: "bg-stoka-success-100 text-stoka-success",
  coral: "bg-stoka-red-100 text-stoka-red",
  yellow: "bg-stoka-warning-100 text-stoka-warning",
  blue: "bg-stoka-info-100 text-stoka-info",
  red: "bg-stoka-red-100 text-stoka-red-dark",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "green",
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: keyof typeof toneClass;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-stoka-border bg-stoka-surface p-4 shadow-card sm:p-5">
      <div className={`rounded-lg p-2.5 ${toneClass[tone]}`}>
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-stoka-ink-muted">{label}</p>
        <p className="truncate font-display text-xl font-semibold text-stoka-ink sm:text-2xl">
          {value}
        </p>
        {hint && <p className="mt-0.5 text-xs text-stoka-ink-muted">{hint}</p>}
      </div>
    </div>
  );
}

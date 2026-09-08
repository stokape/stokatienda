import { Loader2 } from "lucide-react";

export function Spinner({ label = "Cargando…", className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 py-10 text-slate-500 ${className}`}>
      <Loader2 className="size-6 animate-spin text-stoka-green-500" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

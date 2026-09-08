import { Monitor, Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";

const meta = {
  system: { icon: Monitor, label: "Tema del sistema" },
  light: { icon: Sun, label: "Tema claro" },
  dark: { icon: Moon, label: "Tema oscuro" },
} as const;

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useThemeStore((s) => s.theme);
  const cycleTheme = useThemeStore((s) => s.cycleTheme);
  const Icon = meta[theme].icon;

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`${meta[theme].label}. Tocar para cambiar.`}
      title={meta[theme].label}
      className={`flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-stoka-border bg-stoka-surface text-stoka-ink shadow-card transition-colors hover:bg-stoka-surface-2 ${className}`}
    >
      <Icon className="size-5" aria-hidden="true" />
    </button>
  );
}

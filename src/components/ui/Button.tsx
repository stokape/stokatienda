import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 ease-out disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.97]";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-stoka-red text-white shadow-card hover:bg-stoka-red-dark",
  secondary: "bg-stoka-ink text-stoka-bg shadow-card hover:opacity-90",
  outline: "border border-stoka-border-strong bg-transparent text-stoka-ink hover:bg-stoka-surface-2",
  ghost: "text-stoka-ink hover:bg-stoka-surface-2",
  danger: "bg-stoka-red-dark text-white shadow-card hover:brightness-110",
};

const sizes: Record<ButtonSize, string> = {
  sm: "text-sm px-3.5 py-2 min-h-[36px]",
  md: "text-sm px-5 py-2.5 min-h-[44px]",
  lg: "text-base px-7 py-3.5 min-h-[52px]",
};

export function buttonVariants(variant: ButtonVariant = "primary", size: ButtonSize = "md", className = ""): string {
  return [base, variants[variant], sizes[size], className].filter(Boolean).join(" ");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  icon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={buttonVariants(variant, size, className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : icon}
      {children}
    </button>
  );
}

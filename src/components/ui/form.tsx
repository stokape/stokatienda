import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useId } from "react";

const controlClass =
  "w-full rounded-lg border border-stoka-border bg-stoka-surface px-4 py-2.5 text-[15px] text-stoka-ink placeholder:text-stoka-ink-muted transition-colors focus:border-stoka-red focus:outline-none focus:ring-2 focus:ring-stoka-red-100 disabled:bg-stoka-surface-2 disabled:text-stoka-ink-muted";
const errorClass = "border-stoka-red-dark focus:border-stoka-red-dark focus:ring-stoka-red-100";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-stoka-ink">
        {label} {required && <span className="text-stoka-red">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-stoka-ink-muted">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-stoka-red-dark">
          {error}
        </p>
      )}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ error, className = "", id, ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <input
      id={inputId}
      className={`${controlClass} ${error ? errorClass : ""} ${className}`}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${inputId}-error` : undefined}
      {...rest}
    />
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Textarea({ error, className = "", ...rest }: TextareaProps) {
  return (
    <textarea
      className={`${controlClass} min-h-[88px] resize-y ${error ? errorClass : ""} ${className}`}
      aria-invalid={Boolean(error)}
      {...rest}
    />
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export function Select({ error, className = "", children, ...rest }: SelectProps) {
  return (
    <select
      className={`${controlClass} ${error ? errorClass : ""} ${className}`}
      aria-invalid={Boolean(error)}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Checkbox({
  label,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const autoId = useId();
  const checkId = id ?? autoId;
  return (
    <label htmlFor={checkId} className="flex cursor-pointer items-center gap-2 text-sm text-stoka-ink">
      <input
        id={checkId}
        type="checkbox"
        className="size-5 rounded border-stoka-border-strong text-stoka-red focus:ring-stoka-red-100"
        {...rest}
      />
      {label}
    </label>
  );
}

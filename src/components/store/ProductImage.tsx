import { getIcon } from "../../lib/icon-registry";

/**
 * La demo no incluye fotografías con licencia; en su lugar generamos una
 * ilustración consistente por producto (tono + ícono) sobre una tarjeta
 * clara de acento, lista para reemplazarse por fotos reales el día que
 * existan. El tono pastel es intencional en ambos temas: funciona como
 * una miniatura de color, no como una superficie de página.
 */
export function ProductImage({
  hue,
  icon,
  name,
  className = "",
  iconClassName = "size-10",
  bordered = true,
}: {
  hue: number;
  icon: string;
  name: string;
  className?: string;
  iconClassName?: string;
  bordered?: boolean;
}) {
  const Icon = getIcon(icon);
  return (
    <div
      role="img"
      aria-label={name}
      className={`relative flex items-center justify-center overflow-hidden rounded-lg ${bordered ? "border border-stoka-border" : ""} ${className}`}
      style={{ background: `hsl(${hue} 38% 90%)` }}
    >
      <Icon
        className={`relative ${iconClassName}`}
        style={{ color: `hsl(${hue} 48% 28%)` }}
        aria-hidden="true"
        strokeWidth={1.75}
      />
    </div>
  );
}

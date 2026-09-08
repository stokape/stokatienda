/**
 * Isotipo de Bodeguita Stoka adaptado a trazo plano: el pliegue diagonal
 * plata → rojo del isotipo original, con el carrito de compras al centro.
 * Es una aproximación (no el render 3D/cromado original) pensada para
 * verse bien también a tamaños chicos como favicon o ícono de barra.
 */
export function BrandMark({ size = 40, rounded = true }: { size?: number; rounded?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="2" y="2" width="60" height="60" rx={rounded ? 16 : 0} fill="#0D0D0F" />
      <path d="M46,15 L18,32" stroke="#C5C5C7" strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d="M18,32 L46,49" stroke="#E10613" strokeWidth="13" strokeLinecap="round" fill="none" />
      <g transform="translate(32,33.5)">
        <path
          d="M -9 -7 h2.6 l1.8 11 h10.4 l2.3 -8 h-13"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="-1.6" cy="7.4" r="1.9" fill="#FFFFFF" />
        <circle cx="8.4" cy="7.4" r="1.9" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

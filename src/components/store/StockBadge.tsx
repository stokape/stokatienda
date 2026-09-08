import { Badge } from "../ui/Badge";

export function StockBadge({ stock, minStock }: { stock: number; minStock: number }) {
  if (stock <= 0) return <Badge variant="red">Agotado</Badge>;
  if (stock <= minStock) return <Badge variant="yellow">¡Últimas {stock} unidades!</Badge>;
  return null;
}

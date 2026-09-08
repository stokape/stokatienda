import { Boxes, Download, ReceiptText, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "../../components/ui/StatCard";
import { Button } from "../../components/ui/Button";
import { downloadCsv } from "../../lib/csv";
import { formatCurrency } from "../../lib/format";
import { useDataStore } from "../../store/dataStore";

export function ReportsPage() {
  const products = useDataStore((s) => s.products);
  const orders = useDataStore((s) => s.orders);
  const customers = useDataStore((s) => s.customers);
  const inventoryMovements = useDataStore((s) => s.inventoryMovements);

  const validOrders = orders.filter((o) => o.status !== "cancelado");
  const totalVentas = validOrders.reduce((acc, o) => acc + o.total, 0);
  const ticketPromedio = validOrders.length ? totalVentas / validOrders.length : 0;

  function exportProducts() {
    downloadCsv(
      "productos_stoka.csv",
      products.map((p) => ({
        sku: p.sku,
        nombre: p.name,
        categoria: p.category,
        precio: p.price,
        costo: p.costPrice,
        stock: p.stock,
        stock_minimo: p.minStock,
      })),
    );
    toast.success("Exportado: productos_stoka.csv");
  }

  function exportOrders() {
    downloadCsv(
      "pedidos_stoka.csv",
      orders.map((o) => ({
        codigo: o.code,
        cliente: o.customer.name,
        celular: o.customer.phone,
        total: o.total,
        metodo_pago: o.paymentMethod,
        estado: o.status,
        fecha: o.createdAt,
      })),
    );
    toast.success("Exportado: pedidos_stoka.csv");
  }

  function exportInventory() {
    downloadCsv(
      "inventario_stoka.csv",
      inventoryMovements.map((m) => ({
        producto: products.find((p) => p.id === m.productId)?.name ?? m.productId,
        tipo: m.type,
        cantidad: m.quantity,
        nota: m.note ?? "",
        fecha: m.createdAt,
        responsable: m.createdBy,
      })),
    );
    toast.success("Exportado: inventario_stoka.csv");
  }

  function exportCustomers() {
    downloadCsv(
      "clientes_stoka.csv",
      customers.map((c) => ({
        nombre: c.name,
        celular: c.phone,
        distrito: c.district ?? "",
        pedidos: c.ordersCount,
        total_gastado: c.totalSpent,
      })),
    );
    toast.success("Exportado: clientes_stoka.csv");
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-bold text-stoka-green-900">Reportes</h1>
      <p className="mb-6 text-sm text-slate-500">Resumen general y exportación de datos en CSV.</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Wallet} label="Ventas totales" value={formatCurrency(totalVentas)} tone="green" />
        <StatCard icon={ReceiptText} label="Pedidos válidos" value={String(validOrders.length)} tone="blue" />
        <StatCard icon={Boxes} label="Ticket promedio" value={formatCurrency(ticketPromedio)} tone="yellow" />
        <StatCard icon={Users} label="Clientes" value={String(customers.length)} tone="coral" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          { title: "Productos", desc: "SKU, precio, costo y stock de todo el catálogo.", action: exportProducts },
          { title: "Pedidos", desc: "Historial de pedidos con estado y método de pago.", action: exportOrders },
          { title: "Inventario", desc: "Movimientos de entrada, venta, ajuste y merma.", action: exportInventory },
          { title: "Clientes", desc: "Base de clientes con historial de compra.", action: exportCustomers },
        ].map((r) => (
          <div key={r.title} className="flex items-center justify-between rounded-xl border border-stoka-border bg-stoka-surface p-5">
            <div>
              <p className="font-semibold text-stoka-green-900">{r.title}</p>
              <p className="text-sm text-slate-500">{r.desc}</p>
            </div>
            <Button variant="outline" onClick={r.action} icon={<Download className="size-4" aria-hidden="true" />}>
              CSV
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

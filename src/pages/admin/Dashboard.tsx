import { AlertTriangle, Boxes, CalendarClock, ReceiptText, TrendingUp, Wallet } from "lucide-react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "react-router-dom";
import { StatCard } from "../../components/ui/StatCard";
import { formatCurrency } from "../../lib/format";
import { useDataStore } from "../../store/dataStore";

const ACTIVE_STATUSES = ["recibido", "pendiente_pago", "pago_en_revision", "confirmado", "preparando", "en_reparto"];
const CHART_COLORS = ["#0F4D3A", "#FF6B4A", "#F6B93B", "#2F6FED", "#2F8A63", "#E5522F", "#DE9F1E", "#16694C"];

export function Dashboard() {
  const orders = useDataStore((s) => s.orders);
  const products = useDataStore((s) => s.products);
  const categories = useDataStore((s) => s.categories);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const ventasHoy = orders
      .filter((o) => new Date(o.createdAt).toDateString() === today && o.status !== "cancelado")
      .reduce((acc, o) => acc + o.total, 0);

    const pendientes = orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;

    const utilidad = orders
      .filter((o) => o.status !== "cancelado")
      .reduce((acc, o) => {
        const orderProfit = o.items.reduce((sum, item) => {
          const product = products.find((p) => p.id === item.productId);
          const cost = product?.costPrice ?? item.price * 0.7;
          return sum + (item.price - cost) * item.quantity;
        }, 0);
        return acc + orderProfit;
      }, 0);

    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
    const outOfStock = products.filter((p) => p.stock <= 0).length;
    const reviewCount = orders.filter((o) => o.paymentProof?.status === "en_revision").length;

    return { ventasHoy, pendientes, utilidad, lowStock, outOfStock, reviewCount };
  }, [orders, products]);

  const salesByDay = useMemo(() => {
    const days: { label: string; ventas: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("es-PE", { weekday: "short" });
      const total = orders
        .filter((o) => new Date(o.createdAt).toDateString() === d.toDateString() && o.status !== "cancelado")
        .reduce((acc, o) => acc + o.total, 0);
      days.push({ label, ventas: Math.round(total * 100) / 100 });
    }
    return days;
  }, [orders]);

  const salesByCategory = useMemo(() => {
    const totals: Record<string, number> = {};
    orders
      .filter((o) => o.status !== "cancelado")
      .forEach((o) => {
        o.items.forEach((item) => {
          const product = products.find((p) => p.id === item.productId);
          const cat = product?.category ?? "otros";
          totals[cat] = (totals[cat] ?? 0) + item.price * item.quantity;
        });
      });
    return Object.entries(totals).map(([cat, value]) => ({
      name: categories.find((c) => c.slug === cat)?.name ?? cat,
      value: Math.round(value * 100) / 100,
    }));
  }, [orders, products, categories]);

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-bold text-stoka-green-900">Dashboard</h1>
      <p className="mb-6 text-sm text-slate-500">Resumen del rendimiento de la tienda.</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={TrendingUp} label="Ventas de hoy" value={formatCurrency(stats.ventasHoy)} tone="green" />
        <StatCard icon={ReceiptText} label="Pedidos activos" value={String(stats.pendientes)} tone="blue" />
        <StatCard icon={Wallet} label="Utilidad estimada" value={formatCurrency(stats.utilidad)} tone="yellow" />
        <StatCard icon={Boxes} label="Stock bajo" value={String(stats.lowStock)} tone="coral" hint={`${stats.outOfStock} agotados`} />
        <StatCard icon={CalendarClock} label="Pagos por validar" value={String(stats.reviewCount)} tone="red" />
      </div>

      {(stats.lowStock > 0 || stats.outOfStock > 0 || stats.reviewCount > 0) && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-stoka-warning/40 bg-stoka-warning-100 p-4 text-sm text-stoka-warning">
          <AlertTriangle className="size-5 shrink-0" aria-hidden="true" />
          <span>
            Tienes {stats.lowStock} productos con poco stock, {stats.outOfStock} agotados y {stats.reviewCount} pagos
            esperando validación.
          </span>
          <div className="ml-auto flex gap-2">
            <Link to="/admin/inventario" className="font-semibold underline">Ver inventario</Link>
            <Link to="/admin/pagos" className="font-semibold underline">Ver pagos</Link>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-stoka-border bg-stoka-surface p-5">
          <h2 className="mb-4 font-semibold text-stoka-green-900">Ventas últimos 7 días</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5E9D3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="ventas" fill="#0F4D3A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-stoka-border bg-stoka-surface p-5">
          <h2 className="mb-4 font-semibold text-stoka-green-900">Ventas por categoría</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={salesByCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {salesByCategory.map((entry, i) => (
                    <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

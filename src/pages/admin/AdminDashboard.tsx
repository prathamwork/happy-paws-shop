import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Package, ShoppingBag, Users, AlertCircle } from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { StatCard } from "@/components/admin/StatCard";
import { StatusPill } from "@/components/admin/StatusPill";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/format";
import { api } from "@/services/api";

// ── Exact backend shape ───────────────────────────────────────────────────────

interface DashboardCards {
  total_sales: number;
  total_orders: number;
  total_users: number;
  total_products: number;
}

interface RecentOrder {
  order_id: string;
  customer: string;
  email: string;
  date: string;
  status: string;
  payment: string;
  amount: number;
}

interface TopProduct {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  reviews: number;
  rating: number;
}

interface DashboardData {
  cards: DashboardCards;
  recent_orders: RecentOrder[];
  top_products: TopProduct[];
}

// Build revenue chart from recent_orders (fills last 12 months)
function buildRevenueChart(orders: RecentOrder[]) {
  const map: Record<string, number> = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    map[d.toLocaleString("default", { month: "short", year: "2-digit" })] = 0;
  }
  for (const o of orders) {
    const d = new Date(o.date);
    if (isNaN(d.getTime())) continue;
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    if (key in map) map[key] += o.amount;
  }
  return Object.entries(map).map(([month, revenue]) => ({ month, revenue }));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/admin/dashboard/")
      .then((res) => {
        // Unwrap { success, message, data: { cards, recent_orders, top_products } }
        const body = res.data?.data ?? res.data;
        setData(body as DashboardData);
      })
      .catch((err) => {
        setError(err?.response?.data?.detail ?? err.message ?? "Failed to load dashboard");
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-base">Failed to load dashboard</p>
          <p className="text-sm text-muted-foreground mt-1">{error ?? "No data available."}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80"
        >
          Try again
        </button>
      </div>
    );
  }

  const { cards, recent_orders, top_products } = data;
  const revenueByMonth = buildRevenueChart(recent_orders);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">A snapshot of your store performance.</p>
      </div>

      {/* ── Stat cards ── */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          { label: "Total Sales",   value: formatPrice(cards.total_sales),          delta: 12.4, icon: DollarSign,  tint: "primary" as const },
          { label: "Total Orders",  value: cards.total_orders.toString(),           delta: 8.2,  icon: ShoppingBag, tint: "mint"    as const },
          { label: "Total Users",   value: cards.total_users.toString(),            delta: 4.7,  icon: Users,       tint: "accent"  as const },
          { label: "Products",      value: cards.total_products.toString(),         delta: -1.3, icon: Package,     tint: "warm"    as const },
        ].map((s) => (
          <motion.div
            key={s.label}
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
          >
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      {/* ── Revenue chart + Top products ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5 shadow-card">
          <div>
            <p className="font-display text-lg font-semibold">Revenue</p>
            <p className="text-xs text-muted-foreground">Last 12 months</p>
          </div>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByMonth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                  }}
                  formatter={(v: number) => formatPrice(v)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  fill="url(#rev)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <p className="font-display text-lg font-semibold">Top Products</p>
          <p className="text-xs text-muted-foreground mb-3">By review volume</p>
          <ul className="space-y-3">
            {top_products.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.reviews} reviews
                  </p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(p.price)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* ── Recent orders ── */}
      <Card className="p-5 shadow-card">
        <div className="mb-3">
          <p className="font-display text-lg font-semibold">Recent Orders</p>
          <p className="text-xs text-muted-foreground">Latest customer activity</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent_orders.map((o) => (
                <TableRow key={o.order_id}>
                  <TableCell className="font-medium">{o.order_id}</TableCell>
                  <TableCell>
                    <div>{o.customer}</div>
                    <div className="text-xs text-muted-foreground">{o.email}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(o.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell><StatusPill value={o.status} /></TableCell>
                  <TableCell><StatusPill value={o.payment} /></TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatPrice(o.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
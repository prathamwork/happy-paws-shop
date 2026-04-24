import { motion } from "framer-motion";
import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatCard } from "@/components/admin/StatCard";
import { StatusPill } from "@/components/admin/StatusPill";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdmin } from "@/store/admin";
import { revenueByMonth } from "@/data/admin";
import { formatPrice } from "@/lib/format";

export default function AdminDashboard() {
  const { orders, users, products } = useAdmin();
  const totalSales = orders.filter((o) => o.payment === "paid").reduce((s, o) => s + o.amount, 0);
  const recent = orders.slice(0, 6);
  const topProducts = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">A snapshot of your store performance.</p>
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          { label: "Total Sales", value: formatPrice(totalSales), delta: 12.4, icon: DollarSign, tint: "primary" as const },
          { label: "Total Orders", value: orders.length.toString(), delta: 8.2, icon: ShoppingBag, tint: "mint" as const },
          { label: "Total Users", value: users.length.toString(), delta: 4.7, icon: Users, tint: "accent" as const },
          { label: "Products", value: products.length.toString(), delta: -1.3, icon: Package, tint: "warm" as const },
        ].map((s) => (
          <motion.div
            key={s.label}
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
          >
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-lg font-semibold">Revenue</p>
              <p className="text-xs text-muted-foreground">Last 12 months</p>
            </div>
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
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <p className="font-display text-lg font-semibold">Top Products</p>
          <p className="text-xs text-muted-foreground mb-3">By review volume</p>
          <ul className="space-y-3">
            {topProducts.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand} · {p.reviews} reviews</p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(p.price)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-display text-lg font-semibold">Recent Orders</p>
            <p className="text-xs text-muted-foreground">Latest customer activity</p>
          </div>
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
              {recent.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.id}</TableCell>
                  <TableCell>{o.customer}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(o.date).toLocaleDateString()}</TableCell>
                  <TableCell><StatusPill value={o.status} /></TableCell>
                  <TableCell><StatusPill value={o.payment} /></TableCell>
                  <TableCell className="text-right font-semibold">{formatPrice(o.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

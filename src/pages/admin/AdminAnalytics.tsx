import { useEffect, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary-glow))",
  "hsl(var(--secondary-foreground))",
  "hsl(var(--accent-foreground))",
  "hsl(var(--muted-foreground))",
];

const tooltip = {
  contentStyle: {
    background: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
    fontSize: 12,
  },
};

interface DailyRevenue {
  day: string;
  revenue: number;
}

interface MonthlyOrders {
  month: string;
  orders: number;
}

interface CategoryShare {
  name: string;
  products: number;
}

interface AnalyticsData {
  daily_revenue: DailyRevenue[];
  monthly_orders: MonthlyOrders[];
  category_share: CategoryShare[];
}

// Normalize category_share to use `value` (products count) for the PieChart
function normalizeCategoryShare(data: CategoryShare[]) {
  const total = data.reduce((sum, c) => sum + c.products, 0);
  return data.map((c) => ({
    name: c.name,
    value: total > 0 ? Math.round((c.products / total) * 100) : 0,
    raw: c.products,
  }));
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("pawsome-access-token");
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/admin/analytics/`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const json = await res.json();
        if (!json.success) throw new Error("API returned success: false");
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const categoryShare = data ? normalizeCategoryShare(data.category_share) : [];

  // Map API fields to chart-friendly keys
  const dailyRevenue = data?.daily_revenue ?? [];
  const revenueByMonth = data?.monthly_orders ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Trends and insights for your store</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load analytics: {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[...Array(3)].map((_, i) => (
            <Card
              key={i}
              className={`p-5 shadow-card h-[22rem] animate-pulse bg-muted/40 ${i === 2 ? "lg:col-span-2" : ""}`}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Daily Revenue Line Chart */}
          <Card className="p-5 shadow-card">
            <p className="font-display text-lg font-semibold">Daily Revenue (30d)</p>
            <div className="h-72 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip {...tooltip} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Monthly Orders Bar Chart */}
          <Card className="p-5 shadow-card">
            <p className="font-display text-lg font-semibold">Orders per Month</p>
            <div className="h-72 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByMonth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip {...tooltip} />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Category Share Pie Chart */}
          <Card className="p-5 shadow-card lg:col-span-2">
            <p className="font-display text-lg font-semibold">Category Share</p>
            <div className="h-72 mt-3 grid md:grid-cols-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryShare}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {categoryShare.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltip} formatter={(val) => `${val}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col justify-center gap-3">
                {categoryShare.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      {c.name}
                    </span>
                    <span className="font-semibold">{c.raw} products ({c.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
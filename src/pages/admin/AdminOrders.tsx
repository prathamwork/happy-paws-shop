import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAdmin } from "@/store/admin";
import { StatusPill } from "@/components/admin/StatusPill";
import { formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/data/admin";

export default function AdminOrders() {
  const { orders, setOrderStatus } = useAdmin();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(() => orders.filter((o) => {
    if (status !== "all" && o.status !== status) return false;
    if (q && !(o.id + o.customer + o.email).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [orders, q, status]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">{filtered.length} orders</p>
      </div>

      <Card className="p-4 shadow-card">
        <div className="grid gap-3 md:grid-cols-[1fr_200px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search order, customer, email…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b transition-colors hover:bg-muted/40"
                >
                  <TableCell className="font-medium">{o.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{o.customer}</p>
                      <p className="text-xs text-muted-foreground">{o.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(o.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Select value={o.status} onValueChange={(v) => setOrderStatus(o.id, v as OrderStatus)}>
                      <SelectTrigger className="h-8 w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><StatusPill value={o.payment} /></TableCell>
                  <TableCell className="font-semibold">{formatPrice(o.amount)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon">
                      <Link to={`/admin/orders/${o.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">No orders</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

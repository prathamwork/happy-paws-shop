import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAdmin } from "@/store/admin";
import { StatusPill } from "@/components/admin/StatusPill";
import { formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/data/admin";
import { toast } from "sonner";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, setOrderStatus } = useAdmin();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <p className="text-muted-foreground">Order not found.</p>
      </div>
    );
  }

  const subtotal = order.items.reduce((s, it) => s + it.price * it.qty, 0);
  const tax = +(subtotal * 0.08).toFixed(2);
  const shipping = subtotal > 75 ? 0 : 8;
  const total = +(subtotal + tax + shipping).toFixed(2);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2 mb-1">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="font-display text-2xl font-bold">Order {order.id}</h1>
          <p className="text-sm text-muted-foreground">Placed {new Date(order.date).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill value={order.payment} />
          <Select
            value={order.status}
            onValueChange={(v) => {
              setOrderStatus(order.id, v as OrderStatus);
              toast.success(`Status updated to ${v}`);
            }}
          >
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="p-5 shadow-card">
          <p className="font-display text-lg font-semibold mb-3">Items</p>
          <ul className="divide-y">
            {order.items.map((it) => (
              <li key={it.productId} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{it.name}</p>
                  <p className="text-xs text-muted-foreground">Qty {it.qty} · {formatPrice(it.price)} ea</p>
                </div>
                <span className="font-semibold">{formatPrice(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Tax (8%)</dt><dd>{formatPrice(tax)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd></div>
            <div className="flex justify-between font-display text-base font-bold pt-2"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
          </dl>
        </Card>

        <div className="space-y-5">
          <Card className="p-5 shadow-card">
            <p className="font-display text-lg font-semibold mb-2">Customer</p>
            <p className="font-medium">{order.customer}</p>
            <p className="text-sm text-muted-foreground">{order.email}</p>
          </Card>
          <Card className="p-5 shadow-card">
            <p className="font-display text-lg font-semibold mb-2">Shipping</p>
            <p className="text-sm">{order.shipping.address}</p>
            <p className="text-sm">{order.shipping.city}, {order.shipping.zip}</p>
            <p className="text-sm">{order.shipping.country}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

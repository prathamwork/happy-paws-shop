import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { StatusPill } from "@/components/admin/StatusPill";
import { formatPrice } from "@/lib/format";
import { api } from "@/services/api";
import { toast } from "sonner";

interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  full_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

interface AdminOrderDetail {
  id: number;
  order_id: string;
  customer: string;
  email: string;
  date: string;
  status: string;
  payment: string;
  amount: number;
  items: OrderItem[];
  shipping_address?: ShippingAddress;
}

// Raw shape returned by the API
interface RawOrder {
  id: number;
  customer_name: string;
  customer_email: string;
  total_amount: string;
  status: string;
  payment_status?: string;
  created_at: string;
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  subtotal?: string;
  tax?: string;
  shipping_charge?: string;
  items: {
    id: number;
    product: number;
    product_name: string;
    product_image?: string;
    quantity: number;
    price: string;
  }[];
}

function normalizeOrder(raw: RawOrder): AdminOrderDetail {
  return {
    id: raw.id,
    order_id: `ORD-${String(raw.id).padStart(4, "0")}`,
    customer: raw.customer_name,
    email: raw.customer_email,
    date: raw.created_at,
    status: raw.status,
    payment: raw.payment_status ?? "paid",
    amount: parseFloat(raw.total_amount),
    items: raw.items.map((it) => ({
      id: it.id,
      product_id: it.product,
      name: it.product_name,
      image: it.product_image,
      price: parseFloat(it.price),
      quantity: it.quantity,
    })),
    shipping_address: {
      full_name: raw.full_name,
      address: raw.address,
      city: raw.city,
      state: raw.state,
      zip_code: raw.zip_code,
      country: raw.country,
    },
  };
}

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/orders/${id}/`)
      .then((res) => {
        const raw: RawOrder = res.data?.order ?? res.data?.data ?? res.data; // 👈 this line
        setOrder(normalizeOrder(raw));
      })
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true);
        else toast.error("Failed to load order");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    const prev = order.status;
    setOrder({ ...order, status: newStatus });
    try {
      await api.patch(`/orders/${order.id}/`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      setOrder({ ...order, status: prev });
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm animate-pulse">
          Loading order…
        </p>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <p className="text-muted-foreground">Order not found.</p>
      </div>
    );
  }

  const subtotal =
    order.items?.reduce((s, it) => s + it.price * it.quantity, 0) ??
    order.amount;
  const tax = +(subtotal * 0.08).toFixed(2);
  const shipping = subtotal > 75 ? 0 : 8;
  const total = order.amount;
  const addr = order.shipping_address;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="-ml-2 mb-1"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="font-display text-2xl font-bold">
            Order {order.order_id}
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed {new Date(order.date).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill value={order.payment} />
          <Select value={order.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
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
          {order.items?.length ? (
            <ul className="divide-y">
              {order.items.map((it) => (
                <li
                  key={it.id}
                  className="flex items-center justify-between py-3 text-sm gap-3"
                >
                  {it.image && (
                    <img
                      src={it.image}
                      alt={it.name}
                      className="h-12 w-12 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{it.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty {it.quantity} · {formatPrice(it.price)} ea
                    </p>
                  </div>
                  <span className="font-semibold shrink-0">
                    {formatPrice(it.price * it.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No item details available.
            </p>
          )}
          <Separator className="my-4" />
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax (8%)</dt>
              <dd>{formatPrice(tax)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between font-display text-base font-bold pt-2">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
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
            {addr ? (
              <>
                {addr.full_name && (
                  <p className="text-sm font-medium">{addr.full_name}</p>
                )}
                <p className="text-sm">{addr.address}</p>
                <p className="text-sm">
                  {addr.city}
                  {addr.state ? `, ${addr.state}` : ""} {addr.zip_code}
                </p>
                <p className="text-sm">{addr.country}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No shipping address on record.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

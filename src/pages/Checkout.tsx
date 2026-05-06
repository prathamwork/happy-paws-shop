import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { formatPrice, toNumber } from "@/lib/format";
import { productImg } from "@/lib/img";
import { toast } from "sonner";
import { Banknote, CreditCard, Loader2, Smartphone } from "lucide-react";
import { createOrder } from "@/services/api";
import type { CartItem, PaymentMethod, Product } from "@/types/api";

const isProduct = (p: number | Product): p is Product => typeof p === "object";

const Checkout = () => {
  const { items, subtotal, fetch, clear } = useCart();
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [pay, setPay] = useState<PaymentMethod>("cod");
  const [placing, setPlacing] = useState(false);

  useEffect(() => { if (user) fetch(); }, [user, fetch]);

  const sub = subtotal();
  const tax = sub * 0.08;
  const shipping = sub > 49 ? 0 : 6.99;
  const total = sub + tax + shipping;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    setPlacing(true);
    try {
      const order = await createOrder({ payment_method: pay });
      toast.success("Order placed! 🎉");
      await clear().catch(() => {});
      navigate(`/order-success?id=${order.id}`);
    } catch {
      toast.error("Could not place order");
    } finally { setPlacing(false); }
  };

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Sign in to checkout</h1>
        <Button className="rounded-full" onClick={() => navigate("/login")}>Sign in</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Nothing to checkout</h1>
        <Button className="rounded-full mt-6" onClick={() => navigate("/shop")}>Go shopping</Button>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-14">
      <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">Checkout</h1>
      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_380px] gap-10">
        <div className="space-y-6">
          <section className="bg-card border border-border rounded-3xl p-6">
            <h3 className="font-display text-xl font-bold mb-4">Shipping details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full name" defaultValue={user.name} />
              <Field label="Email" type="email" defaultValue={user.email} />
              <Field label="Address" className="md:col-span-2" />
              <Field label="City" />
              <Field label="ZIP" />
              <Field label="Country" />
              <Field label="Phone" type="tel" />
            </div>
          </section>

          <section className="bg-card border border-border rounded-3xl p-6">
            <h3 className="font-display text-xl font-bold mb-4">Payment method</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { id: "cod" as const, label: "Cash on delivery", icon: Banknote },
                { id: "card" as const, label: "Card", icon: CreditCard },
                { id: "upi" as const, label: "UPI", icon: Smartphone },
              ].map((o) => (
                <button
                  type="button"
                  key={o.id}
                  onClick={() => setPay(o.id)}
                  className={`p-4 rounded-2xl border-2 transition text-left ${
                    pay === o.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <o.icon className="size-5 mb-2 text-primary" />
                  <p className="font-medium text-sm">{o.label}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 self-start bg-card border border-border rounded-3xl p-6 space-y-4">
          <h3 className="font-display text-xl font-bold">Summary</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {items.map((i: CartItem) => {
              if (!isProduct(i.product)) return null;
              return (
                <div key={i.product.id} className="flex gap-3 items-center text-sm">
                  <img src={productImg(i.product.image)} alt="" className="size-12 rounded-lg object-cover" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1 font-medium">{i.product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {i.quantity}</p>
                  </div>
                  <span className="font-medium">{formatPrice(toNumber(i.product.price) * i.quantity)}</span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-border pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(sub)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatPrice(tax)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
          </div>
          <div className="border-t border-border pt-4 flex justify-between items-baseline">
            <span className="font-semibold">Total</span>
            <span className="font-display text-2xl font-bold text-primary">{formatPrice(total)}</span>
          </div>
          <Button type="submit" size="lg" disabled={placing} className="w-full rounded-full shadow-warm">
            {placing ? <><Loader2 className="size-4 mr-2 animate-spin" /> Placing…</> : "Place order"}
          </Button>
        </aside>
      </form>
    </div>
  );
};

const Field = ({ label, type = "text", placeholder, className = "", defaultValue }: { label: string; type?: string; placeholder?: string; className?: string; defaultValue?: string }) => (
  <div className={className}>
    <label className="text-sm font-medium mb-1.5 block">{label}</label>
    <input
      required
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full h-11 px-4 rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary"
    />
  </div>
);

export default Checkout;

import { useNavigate } from "react-router-dom";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { CreditCard, Wallet, Building2 } from "lucide-react";
import { useState } from "react";

const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [pay, setPay] = useState("card");
  const sub = subtotal();
  const tax = sub * 0.08;
  const shipping = sub > 49 ? 0 : 6.99;
  const total = sub + tax + shipping;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = "PW-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    toast.success("Order placed! 🎉");
    clear();
    navigate(`/order-success?id=${orderId}`);
  };

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
              <Field label="Full name" />
              <Field label="Email" type="email" />
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
                { id: "card", label: "Credit card", icon: CreditCard },
                { id: "wallet", label: "Digital wallet", icon: Wallet },
                { id: "bank", label: "Bank transfer", icon: Building2 },
              ].map(o => (
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
            {pay === "card" && (
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <Field label="Card number" className="md:col-span-2" />
                <Field label="Expiry" placeholder="MM/YY" />
                <Field label="CVV" />
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 self-start bg-card border border-border rounded-3xl p-6 space-y-4">
          <h3 className="font-display text-xl font-bold">Summary</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {items.map(i => (
              <div key={i.product.id} className="flex gap-3 items-center text-sm">
                <img src={i.product.image} alt="" className="size-12 rounded-lg object-cover" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-1 font-medium">{i.product.name}</p>
                  <p className="text-xs text-muted-foreground">Qty {i.quantity}</p>
                </div>
                <span className="font-medium">{formatPrice(i.product.price * i.quantity)}</span>
              </div>
            ))}
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
          <Button type="submit" size="lg" className="w-full rounded-full shadow-warm">Place order</Button>
        </aside>
      </form>
    </div>
  );
};

const Field = ({ label, type = "text", placeholder, className = "" }: { label: string; type?: string; placeholder?: string; className?: string }) => (
  <div className={className}>
    <label className="text-sm font-medium mb-1.5 block">{label}</label>
    <input
      required
      type={type}
      placeholder={placeholder}
      className="w-full h-11 px-4 rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary"
    />
  </div>
);

export default Checkout;

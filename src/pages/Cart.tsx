import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

const Cart = () => {
  const { items, setQty, remove, subtotal } = useCart();
  const sub = subtotal();
  const tax = sub * 0.08;
  const shipping = sub > 49 || sub === 0 ? 0 : 6.99;
  const total = sub + tax + shipping;

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <div className="size-24 rounded-full bg-muted grid place-items-center mx-auto mb-6">
          <ShoppingBag className="size-10 text-muted-foreground" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Time to spoil your furry friends.</p>
        <Link to="/shop"><Button size="lg" className="rounded-full">Start shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-14">
      <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">Your cart</h1>
      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        <div className="space-y-4">
          {items.map((item, i) => (
            <motion.div
              key={item.product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-3xl p-4 flex gap-4 items-center"
            >
              <Link to={`/product/${item.product.id}`} className="shrink-0">
                <img src={item.product.image} alt={item.product.name} className="size-24 md:size-28 object-cover rounded-2xl bg-muted" loading="lazy" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product.id}`}>
                  <h3 className="font-medium line-clamp-2 hover:text-primary transition">{item.product.name}</h3>
                </Link>
                <p className="text-xs text-muted-foreground mt-1">{item.product.brand}</p>
                <p className="font-display text-lg font-bold text-primary mt-1">{formatPrice(item.product.price)}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center bg-muted rounded-full">
                  <Button size="icon" variant="ghost" className="size-8 rounded-full" onClick={() => setQty(item.product.id, item.quantity - 1)}>
                    <Minus className="size-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <Button size="icon" variant="ghost" className="size-8 rounded-full" onClick={() => setQty(item.product.id, item.quantity + 1)}>
                    <Plus className="size-3" />
                  </Button>
                </div>
                <button
                  onClick={() => remove(item.product.id)}
                  className="text-muted-foreground hover:text-destructive transition text-xs flex items-center gap-1"
                >
                  <Trash2 className="size-3" /> Remove
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <aside className="lg:sticky lg:top-24 self-start bg-card border border-border rounded-3xl p-6 space-y-4">
          <h3 className="font-display text-xl font-bold">Order summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{formatPrice(sub)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax (8%)</span><span className="font-medium">{formatPrice(tax)}</span></div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
          </div>
          <div className="border-t border-border pt-4 flex justify-between items-baseline">
            <span className="font-display text-lg font-semibold">Total</span>
            <span className="font-display text-2xl font-bold text-primary">{formatPrice(total)}</span>
          </div>
          <Link to="/checkout"><Button size="lg" className="w-full rounded-full shadow-warm">Checkout</Button></Link>
          <Link to="/shop" className="block text-center text-sm text-muted-foreground hover:text-foreground transition">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default Cart;

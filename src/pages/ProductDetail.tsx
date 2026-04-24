import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Minus, Plus, ShoppingBag, Star, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { getProduct, getRelated } from "@/data/products";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import NotFound from "./NotFound";

const ProductDetail = () => {
  const { id } = useParams();
  const product = id ? getProduct(id) : undefined;
  const [qty, setQty] = useState(1);
  const add = useCart(s => s.add);
  const toggleWish = useWishlist(s => s.toggle);
  const wished = useWishlist(s => product ? s.ids.includes(product.id) : false);

  if (!product) return <NotFound />;

  const related = getRelated(product.id, product.category);

  return (
    <div className="container py-10 md:py-14">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary">Home</Link> /{" "}
        <Link to="/shop" className="hover:text-primary">Shop</Link> /{" "}
        <Link to={`/shop?cat=${product.category}`} className="hover:text-primary capitalize">{product.category}</Link>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="aspect-square bg-gradient-warm rounded-[2rem] overflow-hidden shadow-card">
            <img src={product.image} alt={product.name} width={800} height={800} className="size-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <button
                key={i}
                className={cn(
                  "aspect-square rounded-2xl bg-muted overflow-hidden border-2 transition",
                  i === 0 ? "border-primary" : "border-transparent hover:border-border",
                )}
              >
                <img src={product.image} alt="" className="size-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="text-sm uppercase tracking-widest text-primary font-medium mb-2">{product.brand}</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight text-balance">{product.name}</h1>

          <div className="flex items-center gap-3 mt-4">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn("size-4", i < Math.round(product.rating) ? "fill-rating text-rating" : "text-muted")}
                />
              ))}
            </div>
            <span className="font-semibold">{product.rating}</span>
            <span className="text-muted-foreground text-sm">({product.reviews} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mt-6">
            <span className="font-display text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xl text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          <p className="mt-6 text-foreground/75 leading-relaxed">{product.description}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {product.tags.map(t => (
              <span key={t} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium capitalize">
                {t.replace("-", " ")}
              </span>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center bg-muted rounded-full">
              <Button size="icon" variant="ghost" className="rounded-full" onClick={() => setQty(q => Math.max(1, q - 1))}>
                <Minus className="size-4" />
              </Button>
              <span className="w-12 text-center font-semibold">{qty}</span>
              <Button size="icon" variant="ghost" className="rounded-full" onClick={() => setQty(q => q + 1)}>
                <Plus className="size-4" />
              </Button>
            </div>
            <Button
              size="lg"
              className="flex-1 h-12 rounded-full shadow-warm"
              onClick={() => {
                add(product, qty);
                toast.success(`Added ${qty} to cart`);
              }}
            >
              <ShoppingBag className="size-4 mr-2" /> Add to cart
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="size-12 rounded-full"
              onClick={() => {
                toggleWish(product.id);
                toast(wished ? "Removed from wishlist" : "Saved 💖");
              }}
            >
              <Heart className={cn("size-5", wished && "fill-primary text-primary")} />
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: "Free shipping", sub: "Over $49" },
              { icon: ShieldCheck, label: "Vet approved", sub: "100% safe" },
              { icon: RefreshCw, label: "30-day returns", sub: "No questions" },
            ].map(item => (
              <div key={item.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                <item.icon className="size-5 text-primary mx-auto mb-2" />
                <p className="text-xs font-semibold">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">You might also love</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;

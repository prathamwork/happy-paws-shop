import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Loader2, Minus, Plus, RefreshCw, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useAuth } from "@/store/auth";
import { formatPrice } from "@/lib/format";
import { productImg } from "@/lib/img";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getProductById,
  getProductRatings,
  getProducts,
  rateProduct,
} from "@/services/api";
import type { Product, Rating } from "@/types/api";
import ProductCard from "@/components/ProductCard";
import NotFound from "./NotFound";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const add = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => (product ? s.has(product.id) : false));
  const user = useAuth((s) => s.user);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    Promise.all([
      getProductById(id).catch(() => null),
      getProductRatings(id).catch(() => []),
    ]).then(([p, r]) => {
      if (!active) return;
      if (!p) { setNotFound(true); setLoading(false); return; }
      setProduct(p);
      setRatings(Array.isArray(r) ? r : []);
      setLoading(false);
      // related from same category
      getProducts({ category: p.category })
        .then((list) => active && setRelated(list.filter((x) => x.id !== p.id).slice(0, 4)))
        .catch(() => {});
    });
    return () => { active = false; };
  }, [id]);

  if (notFound) return <NotFound />;
  if (loading || !product) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="size-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const avg = product.average_rating ?? 0;
  const ratingCount = Array.isArray(product.ratings)
    ? product.ratings.length
    : (typeof product.ratings === "number" ? product.ratings : ratings.length);

  const handleAdd = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      await add(product, qty);
      toast.success(`Added ${qty} to cart`);
    } catch { toast.error("Could not add to cart"); }
  };

  const handleWish = async () => {
    if (!user) { navigate("/login"); return; }
    await toggleWish(product.id);
    toast(wished ? "Removed from wishlist" : "Saved 💖");
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    setSubmitting(true);
    try {
      const created = await rateProduct(product.id, { rating: reviewRating, review: reviewText });
      setRatings((prev) => [created, ...prev]);
      setReviewText("");
      toast.success("Thanks for your review!");
    } catch {
      toast.error("Could not submit review");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="container py-10 md:py-14">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary">Home</Link> /{" "}
        <Link to="/shop" className="hover:text-primary">Shop</Link>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="aspect-square bg-gradient-warm rounded-[2rem] overflow-hidden shadow-card">
            <img src={productImg(product.image)} alt={product.name} className="size-full object-cover" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "text-xs px-3 py-1 rounded-full font-medium",
                product.is_active
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {product.is_active ? "Active" : "Inactive"}
            </span>
            <span className={cn(
              "text-xs px-3 py-1 rounded-full font-medium",
              outOfStock ? "bg-destructive/10 text-destructive" : "bg-secondary text-secondary-foreground",
            )}>
              {outOfStock ? "Out of stock" : `${product.stock} in stock`}
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight text-balance">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mt-4">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-4",
                    i < Math.round(avg) ? "fill-rating text-rating" : "text-muted",
                  )}
                />
              ))}
            </div>
            <span className="font-semibold">{Number(avg).toFixed(1)}</span>
            <span className="text-muted-foreground text-sm">({ratingCount} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mt-6">
            <span className="font-display text-4xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>

          <p className="mt-6 text-foreground/75 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center bg-muted rounded-full">
              <Button size="icon" variant="ghost" className="rounded-full" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus className="size-4" />
              </Button>
              <span className="w-12 text-center font-semibold">{qty}</span>
              <Button size="icon" variant="ghost" className="rounded-full" onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}>
                <Plus className="size-4" />
              </Button>
            </div>
            <Button
              size="lg"
              disabled={outOfStock}
              className="flex-1 h-12 rounded-full shadow-warm"
              onClick={handleAdd}
            >
              <ShoppingBag className="size-4 mr-2" /> {outOfStock ? "Out of stock" : "Add to cart"}
            </Button>
            <Button size="icon" variant="outline" className="size-12 rounded-full" onClick={handleWish}>
              <Heart className={cn("size-5", wished && "fill-primary text-primary")} />
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: "Free shipping", sub: "Over $49" },
              { icon: ShieldCheck, label: "Vet approved", sub: "100% safe" },
              { icon: RefreshCw, label: "30-day returns", sub: "No questions" },
            ].map((item) => (
              <div key={item.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                <item.icon className="size-5 text-primary mx-auto mb-2" />
                <p className="text-xs font-semibold">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">Reviews ({ratings.length})</h2>

        {user ? (
          <form onSubmit={submitReview} className="bg-card border border-border rounded-3xl p-6 mb-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Your rating:</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setReviewRating(n)}>
                  <Star className={cn("size-5", n <= reviewRating ? "fill-rating text-rating" : "text-muted")} />
                </button>
              ))}
            </div>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience…"
              rows={3}
            />
            <Button type="submit" disabled={submitting} className="rounded-full">
              {submitting ? "Submitting…" : "Submit review"}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground mb-6">
            <Link to="/login" className="text-primary font-medium">Sign in</Link> to leave a review.
          </p>
        )}

        {ratings.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet — be the first!</p>
        ) : (
          <div className="space-y-3">
            {ratings.map((r) => (
              <div key={r.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn("size-3.5", i < r.rating ? "fill-rating text-rating" : "text-muted")}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}
                  </span>
                </div>
                {r.review && <p className="text-sm">{r.review}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

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

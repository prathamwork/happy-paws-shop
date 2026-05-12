import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { productImg } from "@/lib/img";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/api";
import { useNavigate } from "react-router-dom";

interface Props {
  product: Product;
  index?: number;
}

const ratingsCount = (p: Product) =>
  Array.isArray(p.ratings) ? p.ratings.length : (p.ratings ?? 0);

const ProductCard = ({ product, index = 0 }: Props) => {
  const add = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.has(product.id));
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();

  const requireAuth = () => {
    if (!user) {
      toast("Please sign in first");
      navigate("/login");
      return false;
    }
    return true;
  };

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth()) return;
    try {
      await add(product, 1);
      toast.success("Added to cart", { description: product.name });
    } catch {
      toast.error("Could not add to cart");
    }
  };

  const handleWish = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth()) return;
    try {
      await toggleWish(product.id);
      toast(wished ? "Removed from wishlist" : "Saved to wishlist 💖");
    } catch {
      toast.error("Could not update wishlist");
    }
  };

  const outOfStock = product.stock <= 0;
  const avg = product.average_rating ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-float transition-all duration-500 border border-border/60">
          <div className="relative w-full aspect-square bg-gradient-warm overflow-hidden">
            <img
              src={productImg(product.image)}
              alt={product.name}
              loading="lazy"
              width={800}
              height={800}
              className="absolute inset-0 h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
            />
            {outOfStock && (
              <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full">
                Out of stock
              </span>
            )}
            {!product.is_active && (
              <span className="absolute top-3 left-3 bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full">
                Inactive
              </span>
            )}
            <button
              onClick={handleWish}
              aria-label="Toggle wishlist"
              className="absolute top-3 right-3 size-9 rounded-full bg-background/90 backdrop-blur grid place-items-center hover:scale-110 transition shadow-card"
            >
              <Heart className={cn("size-4 transition", wished && "fill-primary text-primary")} />
            </button>
            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className="absolute bottom-3 right-3 size-11 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-warm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Add to cart"
            >
              <ShoppingBag className="size-5" />
            </button>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Star className="size-3 fill-rating text-rating" />
              <span className="font-medium text-foreground">{Number(avg).toFixed(1)}</span>
              <span>({ratingsCount(product)})</span>
            </div>
            <h3 className="font-medium leading-snug line-clamp-2 group-hover:text-primary transition">
              {product.name}
            </h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-xl font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {!outOfStock && (
                <span className="text-xs text-muted-foreground ml-auto">{product.stock} in stock</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;

import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Product } from "@/data/products";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: Props) => {
  const add = useCart(s => s.add);
  const toggleWish = useWishlist(s => s.toggle);
  const wished = useWishlist(s => s.ids.includes(product.id));

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(product);
    toast.success(`Added to cart`, { description: product.name });
  };

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWish(product.id);
    toast(wished ? "Removed from wishlist" : "Saved to wishlist 💖");
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-float transition-all duration-500 border border-border/60">
          <div className="relative aspect-square bg-gradient-warm overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              width={800}
              height={800}
              className="size-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-warm">
                -{discount}%
              </span>
            )}
            {product.bestSeller && (
              <span className="absolute top-3 right-12 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                Best seller
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
              className="absolute bottom-3 right-3 size-11 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-warm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
              aria-label="Add to cart"
            >
              <ShoppingBag className="size-5" />
            </button>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Star className="size-3 fill-rating text-rating" />
              <span className="font-medium text-foreground">{product.rating}</span>
              <span>({product.reviews})</span>
              <span className="ml-auto uppercase tracking-wide text-[10px]">{product.brand}</span>
            </div>
            <h3 className="font-medium leading-snug line-clamp-2 group-hover:text-primary transition">
              {product.name}
            </h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-xl font-bold text-foreground">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;

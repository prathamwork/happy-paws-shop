import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/store/wishlist";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const Wishlist = () => {
  const ids = useWishlist(s => s.ids);
  const items = products.filter(p => ids.includes(p.id));

  return (
    <div className="container py-10 md:py-14">
      <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">Your wishlist</h1>
      <p className="text-muted-foreground mb-8">{items.length} saved item{items.length === 1 ? "" : "s"}</p>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-muted/40 rounded-3xl">
          <Heart className="size-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-display text-xl font-semibold mb-1">No favorites yet</p>
          <p className="text-muted-foreground mb-6">Tap the heart on any product to save it here.</p>
          <Link to="/shop"><Button className="rounded-full">Browse products</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  );
};

export default Wishlist;

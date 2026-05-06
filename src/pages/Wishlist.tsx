import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Heart } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/store/wishlist";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { getProductById } from "@/services/api";
import type { Product, WishlistItem } from "@/types/api";

const Wishlist = () => {
  const { items, loading, fetch } = useWishlist();
  const user = useAuth((s) => s.user);
  const [resolved, setResolved] = useState<Product[]>([]);
  const [resolving, setResolving] = useState(false);

  useEffect(() => { if (user) fetch(); }, [user, fetch]);

  useEffect(() => {
    let active = true;
    const resolve = async () => {
      setResolving(true);
      const products = await Promise.all(
        items.map(async (i: WishlistItem) => {
          if (typeof i.product === "object" && i.product) return i.product;
          try { return await getProductById(i.product as number); } catch { return null; }
        }),
      );
      if (active) setResolved(products.filter((p): p is Product => !!p));
      setResolving(false);
    };
    resolve();
    return () => { active = false; };
  }, [items]);

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Sign in to view your wishlist</h1>
        <Link to="/login"><Button size="lg" className="rounded-full">Sign in</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-14">
      <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">Your wishlist</h1>
      <p className="text-muted-foreground mb-8">
        {resolved.length} saved item{resolved.length === 1 ? "" : "s"}
      </p>

      {loading || resolving ? (
        <div className="text-center py-20"><Loader2 className="size-8 animate-spin mx-auto text-muted-foreground" /></div>
      ) : resolved.length === 0 ? (
        <div className="text-center py-20 bg-muted/40 rounded-3xl">
          <Heart className="size-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-display text-xl font-semibold mb-1">No favorites yet</p>
          <p className="text-muted-foreground mb-6">Tap the heart on any product to save it here.</p>
          <Link to="/shop"><Button className="rounded-full">Browse products</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {resolved.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  );
};

export default Wishlist;

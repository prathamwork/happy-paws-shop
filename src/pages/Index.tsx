import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";
import OffersBanner from "@/components/OffersBanner";
import Testimonials from "@/components/Testimonials";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/services/api";
import type { Product } from "@/types/api";
import { Loader2 } from "lucide-react";
import { toNumber } from "@/lib/format";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((list) => setProducts((list || []).filter((p) => p.is_active)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = products.slice(0, 8);
  const topRated = [...products].sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0)).slice(0, 8);
  const bestValue = [...products].sort((a, b) => toNumber(a.price) - toNumber(b.price)).slice(0, 8);

  return (
    <>
      <Hero />
      <CategoryGrid />

      <section className="container py-8 md:py-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">Featured</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-balance">Our pet-parent picks</h2>
          </div>
          <Link to="/shop" className="hidden md:block">
            <Button variant="outline" className="rounded-full">View all</Button>
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-10"><Loader2 className="size-8 animate-spin mx-auto text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </section>

      <OffersBanner />

      <section className="container py-8 md:py-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">Top rated</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-balance">Trending in the pack</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {topRated.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {bestValue.length > 0 && (
        <section className="container py-8 md:py-12">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">Best value</p>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-balance">Easy on the wallet</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {bestValue.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      <Testimonials />
    </>
  );
};

export default Index;

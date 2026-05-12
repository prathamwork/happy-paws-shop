import { useEffect, useMemo, useState } from "react";
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
    let mounted = true;

    const fetchProducts = async () => {
      try {
        const list = await getProducts();

        if (mounted) {
          setProducts((list || []).filter((p) => p.is_active));
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);

        if (mounted) {
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const featured = useMemo(() => {
    return products.slice(0, 8);
  }, [products]);

  const topRated = useMemo(() => {
    return [...products]
      .sort(
        (a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0)
      )
      .slice(0, 8);
  }, [products]);

  const bestValue = useMemo(() => {
    return [...products]
      .sort((a, b) => toNumber(a.price) - toNumber(b.price))
      .slice(0, 8);
  }, [products]);

  return (
    <>
      <Hero />
      <CategoryGrid />

      <section className="container py-8 md:py-12">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
              Featured
            </p>

            <h2 className="font-display text-3xl font-bold text-balance md:text-5xl">
              Our pet-parent picks
            </h2>
          </div>

          <Link to="/shop" className="hidden md:block">
            <Button variant="outline" className="rounded-full">
              View all
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-10 text-center">
            <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      <OffersBanner />

      <section className="container py-8 md:py-12">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
              Top rated
            </p>

            <h2 className="font-display text-3xl font-bold text-balance md:text-5xl">
              Trending in the pack
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {topRated.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {bestValue.length > 0 && (
        <section className="container py-8 md:py-12">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
                Best value
              </p>

              <h2 className="font-display text-3xl font-bold text-balance md:text-5xl">
                Easy on the wallet
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {bestValue.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <Testimonials />
    </>
  );
};

export default Index;
import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";
import OffersBanner from "@/components/OffersBanner";
import Testimonials from "@/components/Testimonials";
import { products } from "@/data/products";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const featured = products.filter(p => p.featured);
  const bestSellers = products.filter(p => p.bestSeller);

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      <OffersBanner />

      <section className="container py-8 md:py-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">Best sellers</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-balance">Trending in the pack</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {bestSellers.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      <Testimonials />
    </>
  );
};

export default Index;

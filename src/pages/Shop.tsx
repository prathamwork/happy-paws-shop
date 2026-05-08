import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, Loader2, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { getCategories, getCategoryProducts, getProducts } from "@/services/api";
import type { Category, Product } from "@/types/api";
import { toNumber } from "@/lib/format";

const Shop = () => {
  const [params, setParams] = useSearchParams();
  const slug = params.get("cat") ?? "all";
  const q = params.get("q") ?? "";
  const [maxPrice, setMaxPrice] = useState(50000);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<"newest" | "price-asc" | "price-desc" | "rating">("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const fetcher = slug === "all" ? getProducts() : getCategoryProducts(slug);
    fetcher
      .then((list) => { if (active) setProducts(Array.isArray(list) ? list : []); })
      .catch(() => { if (active) setError("Could not load products."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.is_active !== false);
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    list = list.filter(
      (p) => toNumber(p.price) <= maxPrice && (p.average_rating ?? 0) >= minRating,
    );
    if (sort === "price-asc") list.sort((a, b) => toNumber(a.price) - toNumber(b.price));
    if (sort === "price-desc") list.sort((a, b) => toNumber(b.price) - toNumber(a.price));
    if (sort === "rating") list.sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0));
    if (sort === "newest")
      list.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    return list;
  }, [products, q, maxPrice, minRating, sort]);

  const setSlug = (s: string) => {
    if (s === "all") params.delete("cat"); else params.set("cat", s);
    setParams(params);
  };

  const Sidebar = (
    <div className="space-y-7">
      <div>
        <h4 className="font-display text-lg font-semibold mb-3">Category</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSlug("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              slug === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-secondary"
            }`}
          >
            All
          </button>
          {categories.filter((c) => c.is_active).map((c) => (
            <button
              key={c.id}
              onClick={() => setSlug(c.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                slug === c.slug ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-secondary"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-display text-lg font-semibold mb-3">Max price</h4>
        <Slider value={[maxPrice]} max={2000} min={5} step={5} onValueChange={(v) => setMaxPrice(v[0])} />
        <p className="text-sm text-muted-foreground mt-2">Up to ${maxPrice}</p>
      </div>

      <div>
        <h4 className="font-display text-lg font-semibold mb-3">Minimum rating</h4>
        <div className="flex gap-2">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                minRating === r ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-secondary"
              }`}
            >
              {r === 0 ? "Any" : `${r}+ ★`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl font-bold">Shop everything</h1>
        <p className="text-muted-foreground mt-2">
          {loading ? "Loading…" : `${filtered.length} products${q ? ` for "${q}"` : ""}`}
        </p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-10">
        <aside className="hidden lg:block sticky top-24 self-start">{Sidebar}</aside>

        <div>
          <div className="flex items-center justify-between mb-6 gap-3">
            <Button variant="outline" className="lg:hidden rounded-full" onClick={() => setFiltersOpen(true)}>
              <Filter className="size-4 mr-2" /> Filters
            </Button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="ml-auto h-11 px-4 rounded-full bg-muted border-0 outline-none text-sm font-medium cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="rating">Top rated</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-20"><Loader2 className="size-8 animate-spin mx-auto text-muted-foreground" /></div>
          ) : error ? (
            <div className="text-center py-20 bg-muted/40 rounded-3xl text-destructive">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-muted/40 rounded-3xl">
              <p className="text-5xl mb-3">🐾</p>
              <p className="font-display text-xl font-semibold">No products found</p>
              <p className="text-muted-foreground mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur lg:hidden"
          onClick={() => setFiltersOpen(false)}
        >
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-card p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold">Filters</h3>
              <Button size="icon" variant="ghost" onClick={() => setFiltersOpen(false)}><X /></Button>
            </div>
            {Sidebar}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Shop;

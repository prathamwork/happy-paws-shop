import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { brands, products, type Category } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

const cats: { id: Category | "all"; name: string }[] = [
  { id: "all", name: "All pets" },
  { id: "dogs", name: "Dogs" },
  { id: "cats", name: "Cats" },
  { id: "birds", name: "Birds" },
  { id: "fish", name: "Fish" },
  { id: "accessories", name: "Accessories" },
];

const Shop = () => {
  const [params, setParams] = useSearchParams();
  const cat = (params.get("cat") as Category | null) ?? "all";
  const q = params.get("q") ?? "";
  const [maxPrice, setMaxPrice] = useState(150);
  const [minRating, setMinRating] = useState(0);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sort, setSort] = useState<"popular" | "price-asc" | "price-desc" | "newest">("popular");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (cat !== "all") list = list.filter(p => p.category === cat);
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
    list = list.filter(p => p.price <= maxPrice && p.rating >= minRating);
    if (selectedBrands.length) list = list.filter(p => selectedBrands.includes(p.brand));
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "popular") list.sort((a, b) => b.reviews - a.reviews);
    if (sort === "newest") list.reverse();
    return list;
  }, [cat, q, maxPrice, minRating, selectedBrands, sort]);

  const setCat = (id: Category | "all") => {
    if (id === "all") {
      params.delete("cat");
    } else {
      params.set("cat", id);
    }
    setParams(params);
  };

  const Sidebar = (
    <div className="space-y-7">
      <div>
        <h4 className="font-display text-lg font-semibold mb-3">Category</h4>
        <div className="flex flex-wrap gap-2">
          {cats.map(c => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                cat === c.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-secondary"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-display text-lg font-semibold mb-3">Max price</h4>
        <Slider value={[maxPrice]} max={150} min={5} step={5} onValueChange={v => setMaxPrice(v[0])} />
        <p className="text-sm text-muted-foreground mt-2">Up to ${maxPrice}</p>
      </div>

      <div>
        <h4 className="font-display text-lg font-semibold mb-3">Minimum rating</h4>
        <div className="flex gap-2">
          {[0, 3, 4, 4.5].map(r => (
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

      <div>
        <h4 className="font-display text-lg font-semibold mb-3">Brand</h4>
        <div className="space-y-2">
          {brands.map(b => (
            <label key={b} className="flex items-center gap-3 text-sm cursor-pointer">
              <Checkbox
                checked={selectedBrands.includes(b)}
                onCheckedChange={ck =>
                  setSelectedBrands(prev => (ck ? [...prev, b] : prev.filter(x => x !== b)))
                }
              />
              {b}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl font-bold">Shop everything</h1>
        <p className="text-muted-foreground mt-2">{filtered.length} products{q && ` for "${q}"`}</p>
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
              onChange={e => setSort(e.target.value as typeof sort)}
              className="ml-auto h-11 px-4 rounded-full bg-muted border-0 outline-none text-sm font-medium cursor-pointer"
            >
              <option value="popular">Most popular</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
            </select>
          </div>

          {filtered.length === 0 ? (
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
            onClick={e => e.stopPropagation()}
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

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getCategories } from "@/services/api";
import type { Category } from "@/types/api";
import { categoryImg } from "@/lib/img";

const CategoryGrid = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories()
      .then((list) => setCategories((list || []).filter((c) => c.is_active)))
      .catch(() => setCategories([]));
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="container py-16 md:py-24">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">Shop by pet</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-balance">Find their favorites</h2>
        </div>
        <Link to="/shop" className="hidden md:block text-sm font-medium hover:text-primary transition">
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link to={`/shop?cat=${cat.slug}`} className="group block">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-warm shadow-card hover:shadow-float transition-all duration-500">
                <img
                  src={categoryImg(cat.image)}
                  alt={cat.name}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
                  <h3 className="font-display text-lg md:text-xl font-bold">{cat.name}</h3>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;

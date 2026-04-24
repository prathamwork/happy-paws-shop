import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { categories } from "@/data/products";

const CategoryGrid = () => (
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
          <Link to={`/shop?cat=${cat.id}`} className="group block">
            <div className={`relative aspect-square rounded-3xl overflow-hidden ${cat.color} shadow-card hover:shadow-float transition-all duration-500`}>
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="absolute inset-0 size-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
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

export default CategoryGrid;

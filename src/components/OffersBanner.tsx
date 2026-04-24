import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const OffersBanner = () => (
  <section className="container py-12 md:py-16">
    <div className="grid md:grid-cols-2 gap-5">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl bg-gradient-mint p-8 md:p-12 min-h-[260px] flex flex-col justify-center"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Limited time</span>
        <h3 className="font-display text-3xl md:text-4xl font-bold mb-3 text-balance">Buy 2, get 1 free on all toys</h3>
        <p className="text-foreground/70 mb-5 max-w-sm">Stock up on chew toys, plushies and interactive puzzles.</p>
        <Link to="/shop?cat=accessories">
          <Button variant="default" className="rounded-full self-start">Shop toys</Button>
        </Link>
        <div className="absolute -right-6 -bottom-6 text-[10rem] opacity-20">🦴</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl bg-gradient-primary p-8 md:p-12 min-h-[260px] flex flex-col justify-center text-primary-foreground"
      >
        <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Save 30%</span>
        <h3 className="font-display text-3xl md:text-4xl font-bold mb-3 text-balance">Premium food, premium prices</h3>
        <p className="opacity-90 mb-5 max-w-sm">Stock up on pantry essentials this week only.</p>
        <Link to="/shop">
          <Button variant="secondary" className="rounded-full self-start">Browse deals</Button>
        </Link>
        <div className="absolute -right-6 -bottom-6 text-[10rem] opacity-20">🐾</div>
      </motion.div>
    </div>
  </section>
);

export default OffersBanner;

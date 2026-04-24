import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    pet: "Mom of Bella 🐕",
    text: "My golden retriever literally runs to the door when Pawsome boxes arrive. The food quality is unmatched.",
    rating: 5,
  },
  {
    name: "James K.",
    pet: "Dad of Mochi 🐈",
    text: "Switched to their salmon cat food and Mochi's coat is shinier than ever. Plus, fast shipping every time.",
    rating: 5,
  },
  {
    name: "Priya R.",
    pet: "Mom of Kiwi 🦜",
    text: "Hard to find quality bird supplies — Pawsome has it all. Prices are honest and customer service is real.",
    rating: 5,
  },
];

const Testimonials = () => (
  <section className="container py-16 md:py-24">
    <div className="text-center max-w-2xl mx-auto mb-14">
      <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">Loved by pet parents</p>
      <h2 className="font-display text-3xl md:text-5xl font-bold text-balance">
        Wagging tails, glowing reviews
      </h2>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
      {testimonials.map((t, i) => (
        <motion.div
          key={t.name}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="bg-card rounded-3xl p-7 shadow-card border border-border/60 relative"
        >
          <div className="flex gap-1 mb-4">
            {Array.from({ length: t.rating }).map((_, j) => (
              <Star key={j} className="size-4 fill-rating text-rating" />
            ))}
          </div>
          <p className="text-foreground/80 leading-relaxed mb-5">"{t.text}"</p>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-bold">
              {t.name[0]}
            </div>
            <div>
              <p className="font-semibold text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.pet}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

export default Testimonials;

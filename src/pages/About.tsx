import { motion } from "framer-motion";
import { Heart, Sparkles, Users } from "lucide-react";

const About = () => (
  <div>
    <section className="bg-gradient-warm py-16 md:py-24">
      <div className="container max-w-3xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl md:text-6xl font-bold text-balance"
        >
          We exist for the <span className="text-primary italic">tail-waggers</span>
        </motion.h1>
        <p className="mt-6 text-lg text-foreground/70 leading-relaxed">
          Pawsome started in 2019 with a simple idea: pets deserve better. Better food, better toys, better stuff — all without the markup.
        </p>
      </div>
    </section>

    <section className="container py-16 md:py-24 grid md:grid-cols-3 gap-6">
      {[
        { icon: Heart, title: "Mission", text: "Bring premium pet care within reach of every pet parent, without compromise." },
        { icon: Sparkles, title: "Vision", text: "A world where pets and their humans live longer, happier, more connected lives." },
        { icon: Users, title: "Community", text: "Built by pet parents, vets, trainers and groomers — a real pack you can trust." },
      ].map((b, i) => (
        <motion.div
          key={b.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="bg-card border border-border rounded-3xl p-7 shadow-card"
        >
          <div className="size-12 rounded-2xl bg-gradient-primary grid place-items-center mb-4">
            <b.icon className="size-5 text-primary-foreground" />
          </div>
          <h3 className="font-display text-2xl font-bold mb-2">{b.title}</h3>
          <p className="text-muted-foreground leading-relaxed">{b.text}</p>
        </motion.div>
      ))}
    </section>
  </div>
);

export default About;

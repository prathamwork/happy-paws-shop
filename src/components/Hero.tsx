import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Truck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-pets.jpg";

const Hero = () => (
  <section className="relative overflow-hidden bg-gradient-warm">
    <div className="container relative grid lg:grid-cols-2 items-center gap-10 py-16 md:py-24 lg:py-32">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10"
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/70 backdrop-blur text-sm font-medium shadow-soft">
          <Sparkles className="size-4 text-primary" />
          New season treats — up to 30% off
        </span>
        <h1 className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.95] text-balance">
          Everything they love,<br />
          <span className="text-primary italic">delivered with love.</span>
        </h1>
        <p className="mt-6 text-lg text-foreground/70 max-w-md leading-relaxed">
          Premium pet food, toys, and accessories — handpicked by pet parents, for pet parents.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/shop">
            <Button size="lg" className="rounded-full text-base h-12 px-7 shadow-warm">
              Shop now <ArrowRight className="ml-1 size-4" />
            </Button>
          </Link>
          <Link to="/shop?cat=dogs">
            <Button size="lg" variant="outline" className="rounded-full text-base h-12 px-7 bg-background/60 backdrop-blur">
              Explore deals
            </Button>
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-full bg-background/80 grid place-items-center">
              <Truck className="size-4 text-primary" />
            </div>
            <span>Free shipping over $49</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-full bg-background/80 grid place-items-center">
              <ShieldCheck className="size-4 text-primary" />
            </div>
            <span>Vet approved</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative"
      >
        <div className="relative rounded-[2.5rem] overflow-hidden shadow-float">
          <img
            src={hero}
            alt="Happy puppy and kitten with premium pet food"
            width={1600}
            height={1024}
            className="w-full h-auto"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute -bottom-4 -left-4 md:bottom-6 md:-left-6 bg-card rounded-2xl px-5 py-4 shadow-float flex items-center gap-3"
        >
          <div className="size-12 rounded-full bg-gradient-mint grid place-items-center text-2xl">🐶</div>
          <div>
            <p className="font-display text-2xl font-bold leading-none">10k+</p>
            <p className="text-xs text-muted-foreground">happy pets</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="hidden md:flex absolute top-6 -right-4 bg-card rounded-2xl px-5 py-4 shadow-float items-center gap-3"
        >
          <div className="size-12 rounded-full bg-accent grid place-items-center text-2xl">⭐</div>
          <div>
            <p className="font-display text-2xl font-bold leading-none">4.9</p>
            <p className="text-xs text-muted-foreground">avg rating</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default Hero;

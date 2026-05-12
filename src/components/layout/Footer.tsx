import { Link } from "react-router-dom";
import { PawPrint, Instagram, Twitter, Facebook, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Footer = () => {
  const subscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    toast.success("You're subscribed! 🐾", { description: "Treats and offers heading to your inbox." });
    form.reset();
  };

  return (
    <footer className="mt-24 bg-gradient-soft border-t border-border/60">
      <div className="container py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="size-10 rounded-2xl bg-gradient-primary grid place-items-center shadow-warm">
                <PawPrint className="size-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-display text-2xl font-bold">Pawsome</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium pet food and supplies, delivered with love. Because every tail deserves a wag.
            </p>
            <div className="flex gap-2 mt-5">
              <Button variant="ghost" size="icon" aria-label="Instagram"><Instagram className="size-5" /></Button>
              <Button variant="ghost" size="icon" aria-label="Twitter"><Twitter className="size-5" /></Button>
              <Button variant="ghost" size="icon" aria-label="Facebook"><Facebook className="size-5" /></Button>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/shop?cat=dogs" className="hover:text-primary transition">Dogs</Link></li>
              <li><Link to="/shop?cat=cats" className="hover:text-primary transition">Cats</Link></li>
              <li><Link to="/shop?cat=birds" className="hover:text-primary transition">Birds</Link></li>
              <li><Link to="/shop?cat=fish" className="hover:text-primary transition">Fish</Link></li>
              {/* <li><Link to="/shop?cat=accessories" className="hover:text-primary transition">Accessories</Link></li> */}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Help</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition">About us</Link></li>
              {/* <li><Link to="/contact" className="hover:text-primary transition">Contact</Link></li>
              <li><a href="#" className="hover:text-primary transition">Shipping</a></li>
              <li><a href="#" className="hover:text-primary transition">Returns</a></li>
              <li><a href="#" className="hover:text-primary transition">FAQ</a></li> */}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Get treats in your inbox</h4>
            <p className="text-sm text-muted-foreground mb-4">Join the pack — exclusive offers and tail-wagging tips.</p>
            <form onSubmit={subscribe} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  required
                  type="email"
                  placeholder="you@email.com"
                  className="w-full h-11 pl-9 pr-3 rounded-full bg-card border border-border outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <Button type="submit" className="rounded-full">Join</Button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Pawsome. Crafted with 🐾 for pets everywhere.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground transition">Privacy</a>
            <a href="#" className="hover:text-foreground transition">Terms</a>
            <a href="#" className="hover:text-foreground transition">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

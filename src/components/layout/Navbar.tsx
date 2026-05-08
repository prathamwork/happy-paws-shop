import { Link, NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import { Heart, Moon, Search, ShoppingBag, Sun, User, Menu, X, PawPrint } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useTheme } from "@/store/theme";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/services/api";
import type { Product } from "@/types/api";
import { useEffect } from "react";
import { productImg } from "@/lib/img";
import { formatPrice } from "@/lib/format";
import { LogOut } from "lucide-react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/shop?cat=dogs", label: "Dogs" },
  { to: "/shop?cat=cat", label: "Cat" },
  { to: "/about", label: "About" },
];

const Navbar = () => {
  const totalItems = useCart((s) => s.totalItems());
  const wishCount = useWishlist((s) => s.items.length);
  const fetchCart = useCart((s) => s.fetch);
  const fetchWish = useWishlist((s) => s.fetch);
  const { user, logout, fetchProfile } = useAuth();
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => { fetchProfile(); }, [fetchProfile]);
  useEffect(() => {
    if (user) { fetchCart(); fetchWish(); }
  }, [user, fetchCart, fetchWish]);

  useEffect(() => {
    if (q.length === 0) { setSuggestions([]); return; }
    const t = setTimeout(() => {
      getProducts({ search: q })
        .then((list) => setSuggestions((list || []).slice(0, 5)))
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/shop?q=${encodeURIComponent(q)}`);
      setSearchOpen(false);
      setQ("");
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/60">
      <div className="container flex h-16 md:h-20 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-10 rounded-2xl bg-gradient-primary grid place-items-center shadow-warm group-hover:rotate-12 transition-transform duration-300">
            <PawPrint className="size-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight">Pawsome</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(l => (
            <RouterNavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-muted text-foreground/80 hover:text-foreground"
                }`
              }
            >
              {l.label}
            </RouterNavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen(v => !v)} aria-label="Search">
            <Search className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
          <Link to="/wishlist" className="relative">
            <Button variant="ghost" size="icon" aria-label="Wishlist">
              <Heart className="size-5" />
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold size-5 rounded-full grid place-items-center">
                  {wishCount}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingBag className="size-5" />
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold size-5 rounded-full grid place-items-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </Button>
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hidden md:block">
                <Button variant="ghost" size="icon" aria-label="Account">
                  <User className="size-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="hidden md:inline-flex" aria-label="Sign out" onClick={() => { logout(); navigate("/"); }}>
                <LogOut className="size-5" />
              </Button>
            </>
          ) : (
            <Link to="/login" className="hidden md:block">
              <Button variant="ghost" size="icon" aria-label="Account">
                <User className="size-5" />
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(v => !v)} aria-label="Menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/60 overflow-hidden bg-background"
          >
            <div className="container py-4">
              <form onSubmit={submitSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <input
                  autoFocus
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Search for food, toys, beds..."
                  className="w-full h-12 pl-12 pr-4 rounded-full bg-muted border-0 outline-none focus:ring-2 focus:ring-primary"
                />
              </form>
              {suggestions.length > 0 && (
                <div className="mt-3 rounded-2xl border bg-card overflow-hidden">
                  {suggestions.map(p => (
                    <Link
                      key={p.id}
                      to={`/product/${p.id}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-muted transition"
                    >
                      <img src={productImg(p.image)} alt={p.name} className="size-12 rounded-lg object-cover" loading="lazy" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">Stock: {p.stock}</p>
                      </div>
                      <span className="text-sm font-semibold text-primary">{formatPrice(p.price)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-border/60 overflow-hidden bg-background"
          >
            <nav className="container py-4 flex flex-col gap-1">
              {navLinks.map(l => (
                <RouterNavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-medium ${
                      isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"
                    }`
                  }
                >
                  {l.label}
                </RouterNavLink>
              ))}
              <Link to="/login" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted">
                Sign in
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

import { Link, NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import { Heart, Moon, Search, ShoppingBag, Sun, User, Menu, X, PawPrint, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useTheme } from "@/store/theme";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/services/api";
import type { Product } from "@/types/api";
import { productImg } from "@/lib/img";
import { formatPrice } from "@/lib/format";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
];

const Navbar = () => {
  const totalItems = useCart((s) => s.totalItems());
  const wishCount = useWishlist((s) => s.items.length);
  const fetchCart = useCart((s) => s.fetch);
  const fetchWish = useWishlist((s) => s.fetch);
  const { user, logout, fetchProfile } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [noResults, setNoResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProfile(); }, []);
  useEffect(() => { if (user) { fetchCart(); fetchWish(); } }, [user]);

  // Focus input whenever search panel opens
  useEffect(() => {
    if (searchOpen) {
      // Small delay so the animation has started before we focus
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else {
      // Reset state when panel closes
      setQ("");
      setSuggestions([]);
      setNoResults(false);
    }
  }, [searchOpen]);

  // Debounced search
  useEffect(() => {
    if (q.trim().length === 0) {
      setSuggestions([]);
      setNoResults(false);
      return;
    }
    setLoading(true);
    setNoResults(false);
    const t = setTimeout(() => {
      getProducts({ search: q })
        .then((list) => {
          const results = (list || []).slice(0, 5);
          setSuggestions(results);
          setNoResults(results.length === 0);
        })
        .catch(() => {
          setSuggestions([]);
          setNoResults(true);
        })
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const toggleSearch = () => {
    setSearchOpen((v) => !v);
    setOpen(false); // close mobile menu if open
  };

  const toggleMenu = () => {
    setOpen((v) => !v);
    setSearchOpen(false); // close search if open
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
    setSearchOpen(false); // triggers cleanup via the useEffect above
  };

  const handleSuggestionClick = () => {
    setSearchOpen(false); // triggers cleanup
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/60">
      <div className="container flex h-16 md:h-20 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-10 rounded-2xl bg-gradient-primary grid place-items-center shadow-warm group-hover:rotate-12 transition-transform duration-300">
            <PawPrint className="size-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight">Pawsome</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((l) => (
            <RouterNavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-muted text-foreground/80 hover:text-foreground"
                }`
              }
            >
              {l.label}
            </RouterNavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSearch}
            aria-label="Search"
            aria-expanded={searchOpen}
          >
            {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
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
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:inline-flex"
                aria-label="Sign out"
                onClick={() => { logout(); navigate("/"); }}
              >
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

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleMenu}
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* ── Search panel ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border/60 overflow-hidden bg-background"
          >
            <div className="container py-4">
              <form onSubmit={submitSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search for food, toys, beds..."
                  className="w-full h-12 pl-12 pr-12 rounded-full bg-muted border-0 outline-none focus:ring-2 focus:ring-primary"
                  autoComplete="off"
                />
                {/* Clear button */}
                {q && (
                  <button
                    type="button"
                    onClick={() => { setQ(""); inputRef.current?.focus(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </form>

              {/* Loading shimmer */}
              {loading && (
                <div className="mt-3 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border bg-card animate-pulse">
                      <div className="size-12 rounded-lg bg-muted shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-2/3 rounded bg-muted" />
                        <div className="h-2.5 w-1/3 rounded bg-muted" />
                      </div>
                      <div className="h-3 w-12 rounded bg-muted" />
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {!loading && suggestions.length > 0 && (
                <div className="mt-3 rounded-2xl border bg-card overflow-hidden">
                  {suggestions.map((p, idx) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.id}`}
                      onClick={handleSuggestionClick}
                      className={`flex items-center gap-3 p-3 hover:bg-muted transition-colors ${
                        idx !== 0 ? "border-t border-border/60" : ""
                      }`}
                    >
                      <img
                        src={productImg(p.image)}
                        alt={p.name}
                        className="size-12 rounded-lg object-cover shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.stock > 0 ? `${p.stock} in stock` : <span className="text-destructive">Out of stock</span>}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-primary shrink-0">{formatPrice(p.price)}</span>
                    </Link>
                  ))}
                  {/* View all results link */}
                  <button
                    type="button"
                    onClick={submitSearch as unknown as React.MouseEventHandler}
                    className="w-full p-3 text-sm text-center text-primary font-medium hover:bg-muted transition-colors border-t border-border/60"
                  >
                    View all results for "{q}"
                  </button>
                </div>
              )}

              {/* No results */}
              {!loading && noResults && q.trim().length > 0 && (
                <div className="mt-3 rounded-2xl border bg-card p-6 text-center">
                  <p className="text-sm font-medium">No results for "{q}"</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different keyword or browse the shop.</p>
                  <Link
                    to="/shop"
                    onClick={handleSuggestionClick}
                    className="mt-3 inline-block text-xs font-medium text-primary underline underline-offset-2"
                  >
                    Browse all products →
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile menu ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border/60 overflow-hidden bg-background"
          >
            <nav className="container py-4 flex flex-col gap-1">
              {navLinks.map((l) => (
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
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted"
                  >
                    My Account
                  </Link>
                  <button
                    onClick={() => { logout(); navigate("/"); setOpen(false); }}
                    className="text-left px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted text-destructive"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted"
                >
                  Sign in
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
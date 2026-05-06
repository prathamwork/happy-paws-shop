import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Loader2, MapPin, Package, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth";
import { useWishlist } from "@/store/wishlist";
import { getOrders } from "@/services/api";
import { formatPrice } from "@/lib/format";
import { profileImg } from "@/lib/img";
import type { Order, Product, WishlistItem } from "@/types/api";
import { getProductById } from "@/services/api";
import ProductCard from "@/components/ProductCard";

const tabs = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
];

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600",
  confirmed: "bg-blue-500/10 text-blue-600",
  shipped: "bg-violet-500/10 text-violet-600",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const Dashboard = () => {
  const [tab, setTab] = useState("profile");
  const user = useAuth((s) => s.user);
  const { items: wish, fetch: fetchWish } = useWishlist();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [wishProducts, setWishProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchWish();
    setLoadingOrders(true);
    getOrders().then(setOrders).catch(() => setOrders([])).finally(() => setLoadingOrders(false));
  }, [user, fetchWish]);

  useEffect(() => {
    let active = true;
    Promise.all(
      wish.map(async (i: WishlistItem) =>
        typeof i.product === "object" ? i.product : await getProductById(i.product as number).catch(() => null),
      ),
    ).then((list) => { if (active) setWishProducts(list.filter((p): p is Product => !!p)); });
    return () => { active = false; };
  }, [wish]);

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Please sign in</h1>
        <Link to="/login" className="text-primary font-medium">Go to login →</Link>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-14">
      <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">My account</h1>
      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        <aside className="space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition",
                tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <t.icon className="size-4" /> {t.label}
            </button>
          ))}
        </aside>

        <div className="bg-card border border-border rounded-3xl p-6 md:p-8">
          {tab === "profile" && (
            <div className="space-y-5 max-w-md">
              <div className="flex items-center gap-4">
                {user.profile_image ? (
                  <img src={profileImg(user.profile_image) || undefined} alt={user.name} className="size-16 rounded-full object-cover" />
                ) : (
                  <div className="size-16 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-display text-xl font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="font-display text-2xl font-bold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Row label="Role" value={<span className="capitalize px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">{user.role}</span>} />
              <Row label="Status" value={
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium",
                  user.is_active ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
                )}>
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              } />
              <Row label="Staff" value={user.is_staff ? "Yes" : "No"} />
              <Row label="Joined" value={user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"} />
            </div>
          )}

          {tab === "orders" && (
            <div>
              <h2 className="font-display text-2xl font-bold mb-4">Order history</h2>
              {loadingOrders ? (
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              ) : orders.length === 0 ? (
                <p className="text-muted-foreground">No orders yet.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div key={o.id} className="p-4 rounded-2xl bg-muted">
                      <div className="flex flex-wrap justify-between items-center gap-3">
                        <div>
                          <p className="font-mono text-sm font-semibold">#{o.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {o.created_at ? new Date(o.created_at).toLocaleDateString() : ""}
                          </p>
                        </div>
                        <span className={cn("text-xs px-3 py-1 rounded-full font-medium capitalize", statusStyles[o.status] ?? "bg-muted")}>
                          {o.status}
                        </span>
                        <span className="font-display text-lg font-bold">{formatPrice(o.total_amount)}</span>
                      </div>
                      {o.items?.length > 0 && (
                        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                          {o.items.map((it) => (
                            <li key={it.id} className="flex justify-between">
                              <span>
                                {typeof it.product === "object" ? it.product.name : `Product #${it.product}`} × {it.quantity}
                              </span>
                              <span>{formatPrice(it.price)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "wishlist" && (
            <div>
              <h2 className="font-display text-2xl font-bold mb-4">Wishlist</h2>
              {wishProducts.length === 0 ? (
                <p className="text-muted-foreground">
                  No saved items yet. <Link to="/shop" className="text-primary">Browse products →</Link>
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {wishProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>
              )}
            </div>
          )}

          {tab === "addresses" && (
            <div>
              <h2 className="font-display text-2xl font-bold mb-4">Saved addresses</h2>
              <p className="text-muted-foreground">Address management coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium">{value}</span>
  </div>
);

export default Dashboard;

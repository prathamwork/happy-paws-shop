import { useState } from "react";
import { User, Package, MapPin, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/store/wishlist";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Link } from "react-router-dom";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "Orders", icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "wishlist", label: "Wishlist", icon: Heart },
];

const mockOrders = [
  { id: "PW-A2K91X", date: "Apr 12, 2026", total: 87.49, status: "Delivered" },
  { id: "PW-B7M30Y", date: "Mar 28, 2026", total: 42.99, status: "Shipped" },
];

const Dashboard = () => {
  const [tab, setTab] = useState("profile");
  const wishIds = useWishlist(s => s.ids);
  const wishItems = products.filter(p => wishIds.includes(p.id));

  return (
    <div className="container py-10 md:py-14">
      <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">My account</h1>
      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        <aside className="space-y-1">
          {tabs.map(t => (
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
            <div className="space-y-4 max-w-md">
              <h2 className="font-display text-2xl font-bold mb-2">Profile</h2>
              <Field label="Name" defaultValue="Alex Carter" />
              <Field label="Email" defaultValue="alex@pawsome.com" />
              <Field label="Phone" defaultValue="+1 555 234 1010" />
            </div>
          )}
          {tab === "orders" && (
            <div>
              <h2 className="font-display text-2xl font-bold mb-4">Order history</h2>
              <div className="space-y-3">
                {mockOrders.map(o => (
                  <div key={o.id} className="flex flex-wrap justify-between items-center gap-3 p-4 rounded-2xl bg-muted">
                    <div>
                      <p className="font-mono text-sm font-semibold">{o.id}</p>
                      <p className="text-xs text-muted-foreground">{o.date}</p>
                    </div>
                    <span className="text-xs bg-success/10 text-success px-3 py-1 rounded-full font-medium">{o.status}</span>
                    <span className="font-display text-lg font-bold">${o.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "addresses" && (
            <div>
              <h2 className="font-display text-2xl font-bold mb-4">Saved addresses</h2>
              <div className="p-5 rounded-2xl bg-muted">
                <p className="font-semibold">Home</p>
                <p className="text-sm text-muted-foreground mt-1">123 Maple Street, Brooklyn, NY 11201, USA</p>
              </div>
            </div>
          )}
          {tab === "wishlist" && (
            <div>
              <h2 className="font-display text-2xl font-bold mb-4">Wishlist</h2>
              {wishItems.length === 0 ? (
                <p className="text-muted-foreground">No saved items yet. <Link to="/shop" className="text-primary">Browse products →</Link></p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {wishItems.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, defaultValue }: { label: string; defaultValue?: string }) => (
  <div>
    <label className="text-sm font-medium mb-1.5 block">{label}</label>
    <input defaultValue={defaultValue} className="w-full h-11 px-4 rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary" />
  </div>
);

export default Dashboard;

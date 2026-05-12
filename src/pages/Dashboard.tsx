/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Loader2,
  MapPin,
  Package,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth";
import { useWishlist } from "@/store/wishlist";
import { deleteAddress, getOrders } from "@/services/api";
import { formatPrice } from "@/lib/format";
import { profileImg } from "@/lib/img";
import type { Order, Product, WishlistItem } from "@/types/api";
import { getProductById } from "@/services/api";
import ProductCard from "@/components/ProductCard";
import { getAddresses, addAddress, type Address } from "@/services/api";
import { Plus, Trash2, Star } from "lucide-react";

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

const EMPTY_ADDR = {
  full_name: "",
  phone: "",
  email: "",
  address: "",
  address_line2: "",
  city: "",
  state: "",
  zip_code: "",
  country: "India",
  is_default: false,
};

const Dashboard = () => {
  const [tab, setTab] = useState("profile");
  const user = useAuth((s) => s.user);
  const { items: wish, fetch: fetchWish } = useWishlist();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [wishProducts, setWishProducts] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [savingAddr, setSavingAddr] = useState(false);
  const [addrError, setAddrError] = useState<string | null>(null);
  const [newAddr, setNewAddr] = useState(EMPTY_ADDR);

  useEffect(() => {
    if (!user) return;
    fetchWish();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) return;
    setLoadingOrders(true);
    getOrders()
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : ((data as any)?.orders ?? (data as any)?.results ?? []);
        setOrders(list);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, [user]);

  useEffect(() => {
    let active = true;
    Promise.all(
      wish.map(async (i: WishlistItem) =>
        typeof i.product === "object"
          ? i.product
          : await getProductById(i.product as number).catch(() => null),
      ),
    ).then((list) => {
      if (active) setWishProducts(list.filter((p): p is Product => !!p));
    });
    return () => {
      active = false;
    };
  }, [wish]);

  useEffect(() => {
    if (!user) return;
    setLoadingAddresses(true);
    getAddresses()
      .then((data: any) => {
        const list = Array.isArray(data)
          ? data
          : (data?.addresses ?? data?.results ?? []);
        setAddresses(list);
      })
      .catch(() => setAddresses([]))
      .finally(() => setLoadingAddresses(false));
  }, [user]);

  const handleAddAddress = async () => {
    setSavingAddr(true);
    setAddrError(null);
    try {
      const created = await addAddress(newAddr);
      if (!created || typeof created !== "object") {
        throw new Error("Invalid response from server");
      }
      setAddresses((prev) => [...prev, created]);
      setShowAddForm(false);
      setNewAddr(EMPTY_ADDR);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ??
        err?.message ??
        "Failed to save address. Please try again.";
      setAddrError(msg);
      console.error("Address add error:", err);
    } finally {
      setSavingAddr(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Please sign in</h1>
        <Link to="/login" className="text-primary font-medium">
          Go to login →
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-14">
      <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">
        My account
      </h1>
      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        <aside className="space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition",
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
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
                  <img
                    src={profileImg(user.profile_image) || undefined}
                    alt={user.name}
                    className="size-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-16 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-display text-xl font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="font-display text-2xl font-bold">
                    {user.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Row
                label="Role"
                value={
                  <span className="capitalize px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                    {user.role}
                  </span>
                }
              />
              <Row
                label="Status"
                value={
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      user.is_active
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive",
                    )}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                }
              />
              <Row label="Staff" value={user.is_staff ? "Yes" : "No"} />
              <Row
                label="Joined"
                value={
                  user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "—"
                }
              />
            </div>
          )}

          {tab === "orders" && (
            <div>
              <h2 className="font-display text-2xl font-bold mb-4">
                Order history
              </h2>
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
                          <p className="font-mono text-sm font-semibold">
                            #{o.id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {o.created_at
                              ? new Date(o.created_at).toLocaleDateString()
                              : ""}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "text-xs px-3 py-1 rounded-full font-medium capitalize",
                            statusStyles[o.status] ?? "bg-muted",
                          )}
                        >
                          {o.status}
                        </span>
                        <span className="font-display text-lg font-bold">
                          {formatPrice(o.total_amount)}
                        </span>
                      </div>
                      {Array.isArray(o.items) && o.items.length > 0 && (
                        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                          {o.items.map((it) => (
                            <li key={it.id} className="flex justify-between">
                              <span>
                                {it.product_name ??
                                  (typeof it.product === "object" &&
                                  it.product !== null
                                    ? (it.product as Product).name
                                    : `Product #${it.product}`)}{" "}
                                × {it.quantity}
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
                  No saved items yet.{" "}
                  <Link to="/shop" className="text-primary">
                    Browse products →
                  </Link>
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {wishProducts.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "addresses" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl font-bold">
                  Saved addresses
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm((v) => !v);
                    setAddrError(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
                >
                  <Plus className="size-4" />
                  Add new
                </button>
              </div>

              {/* Add form */}
              {showAddForm && (
                <div className="mb-6 p-4 rounded-2xl border border-border space-y-3">
                  <h3 className="font-semibold text-sm">New address</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { key: "full_name", placeholder: "Full name" },
                      { key: "phone", placeholder: "Phone number" },
                      { key: "email", placeholder: "Email" },
                      { key: "address", placeholder: "Address" },
                      { key: "address_line2", placeholder: "Address line 2 (optional)" },
                      { key: "city", placeholder: "City" },
                      { key: "state", placeholder: "State" },
                      { key: "zip_code", placeholder: "Zip / Pincode" },
                      { key: "country", placeholder: "Country" },
                    ].map(({ key, placeholder }) => (
                      <input
                        key={key}
                        placeholder={placeholder}
                        value={(newAddr as any)[key]}
                        onChange={(e) =>
                          setNewAddr((p) => ({ ...p, [key]: e.target.value }))
                        }
                        className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    ))}
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAddr.is_default}
                      onChange={(e) =>
                        setNewAddr((p) => ({
                          ...p,
                          is_default: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    Set as default address
                  </label>

                  {/* Error message */}
                  {addrError && (
                    <p className="text-sm text-destructive">{addrError}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddAddress}
                      disabled={savingAddr}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {savingAddr ? "Saving…" : "Save address"}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setAddrError(null);
                      }}
                      className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Address list */}
              {loadingAddresses ? (
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              ) : addresses.length === 0 ? (
                <p className="text-muted-foreground">No saved addresses yet.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-4 rounded-2xl bg-muted relative"
                    >
                      {addr.is_default && (
                        <span className="absolute top-3 right-10 flex items-center gap-1 text-xs text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          <Star className="size-3" /> Default
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition"
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <p className="font-semibold text-sm">{addr.full_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {addr.phone}
                      </p>
                      <p className="text-sm mt-1">
                        {addr.address}
                        {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                      </p>
                      <p className="text-sm">
                        {addr.city}, {addr.state} — {addr.zip_code}
                      </p>
                    </div>
                  ))}
                </div>
              )}
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
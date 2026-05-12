import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { formatPrice, toNumber } from "@/lib/format";
import { productImg } from "@/lib/img";
import { toast } from "sonner";
import {
  Banknote,
  Check,
  CreditCard,
  Loader2,
  MapPin,
  Plus,
  Smartphone,
} from "lucide-react";
import { createOrder, api } from "@/services/api";
import type { CartItem, PaymentMethod, Product } from "@/types/api";

const isProduct = (p: number | Product): p is Product => typeof p === "object";

interface SavedAddress {
  id: number;
  full_name: string;
  email: string;
  address: string;
  city: string;
  zip_code: string;
  country: string;
  phone: string;
  is_default: boolean;
}

const Checkout = () => {
  const { items, subtotal, fetch: fetchCart, clear } = useCart();
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [pay, setPay] = useState<PaymentMethod>("cod");
  const [placing, setPlacing] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  useEffect(() => {
    if (!user) return;
    setLoadingAddresses(true);
    api
      .get("/orders/addresses/")
      .then((res) => {
        console.log("addresses response:", res.data);
        const raw = res.data;
        // Normalize whatever shape the backend returns
        let list: SavedAddress[] = [];
        if (Array.isArray(raw)) {
          list = raw;
        } else if (Array.isArray(raw?.addresses)) {
          // 👈 this is the one
          list = raw.addresses;
        } else if (Array.isArray(raw?.data)) {
          list = raw.data;
        } else if (Array.isArray(raw?.results)) {
          list = raw.results;
        }
        setSavedAddresses(list);
        if (list.length > 0) {
          const def = list.find((a) => a.is_default) ?? list[0];
          setSelectedAddressId(def.id);
          setUseNewAddress(false);
        } else {
          setUseNewAddress(true);
        }
      })
      .catch(() => setUseNewAddress(true))

      .finally(() => setLoadingAddresses(false));
  }, [user]);

  const selectedAddress = savedAddresses.find(
    (a) => a.id === selectedAddressId,
  );

  const sub = subtotal();
  const tax = sub * 0.08;
  const shipping = sub > 49 ? 0 : 6.99;
  const total = sub + tax + shipping;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    setPlacing(true);
    try {
      let payload: Record<string, string>;

      if (!useNewAddress && selectedAddress) {
        payload = {
          full_name: selectedAddress.full_name,
          email: selectedAddress.email ?? "",
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          city: selectedAddress.city,
          zip_code: selectedAddress.zip_code,
          country: selectedAddress.country ?? "",
          payment_method: pay,
        };
      } else {
        const form = e.target as HTMLFormElement;
        const get = (name: string) =>
          (form.elements.namedItem(name) as HTMLInputElement)?.value ?? "";
        payload = {
          full_name: get("full_name"),
          email: get("email"),
          phone: get("phone"),
          address: get("address"),
          city: get("city"),
          zip_code: get("zip_code"),
          country: get("country"),
          payment_method: pay,
        };
      }

      const order = await createOrder(payload);
      toast.success("Order placed! 🎉");
      await clear().catch(() => {});
      navigate(`/order-success?id=${order.id}`);
    } catch {
      toast.error("Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">
          Sign in to checkout
        </h1>
        <Button className="rounded-full" onClick={() => navigate("/login")}>
          Sign in
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Nothing to checkout</h1>
        <Button className="rounded-full mt-6" onClick={() => navigate("/shop")}>
          Go shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-14">
      <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">
        Checkout
      </h1>
      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_380px] gap-10">
        <div className="space-y-6">
          {/* Shipping Section */}
          <section className="bg-card border border-border rounded-3xl p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="size-8 bg-muted rounded-xl flex items-center justify-center">
                <MapPin className="size-4 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold">
                Shipping details
              </h3>
            </div>

            {loadingAddresses ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
                <Loader2 className="size-4 animate-spin" /> Loading saved
                addresses…
              </div>
            ) : (
              <>
                {savedAddresses.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                      Saved addresses
                    </p>
                    <div className="grid gap-2">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            setUseNewAddress(false);
                          }}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition relative ${
                            !useNewAddress && selectedAddressId === addr.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          {!useNewAddress && selectedAddressId === addr.id && (
                            <span className="absolute top-3 right-3 size-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="size-3 text-primary-foreground" />
                            </span>
                          )}
                          <p className="font-semibold text-sm">
                            {addr.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {addr.address}, {addr.city}, {addr.zip_code},{" "}
                            {addr.country}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {addr.phone}
                          </p>
                          {addr.is_default && (
                            <span className="mt-1.5 inline-block text-[10px] font-medium uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          setUseNewAddress(true);
                          setSelectedAddressId(null);
                        }}
                        className={`w-full text-left p-4 rounded-2xl border-2 border-dashed transition flex items-center gap-2 ${
                          useNewAddress
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <Plus className="size-4 text-primary" />
                        <span className="text-sm font-medium">
                          Use a different address
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {(useNewAddress || savedAddresses.length === 0) && (
                  <div className="space-y-3">
                    <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                      {savedAddresses.length > 0 ? "New address" : "Contact"}
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <Field
                        label="Full name"
                        name="full_name"
                        defaultValue={user.name}
                      />
                      <Field
                        label="Email"
                        name="email"
                        type="email"
                        defaultValue={user.email}
                      />
                    </div>
                    <Field label="Phone" name="phone" type="tel" />
                    <hr className="border-border my-1" />
                    <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                      Address
                    </p>
                    <Field label="Country" name="country" />
                    <Field label="Street address" name="address" />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="City" name="city" />
                      <Field label="ZIP / PIN" name="zip_code" />
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Payment */}
          <section className="bg-card border border-border rounded-3xl p-6">
            <h3 className="font-display text-xl font-bold mb-4">
              Payment method
            </h3>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                {
                  id: "cod" as const,
                  label: "Cash on delivery",
                  icon: Banknote,
                },
                { id: "card" as const, label: "Card", icon: CreditCard },
                { id: "upi" as const, label: "UPI", icon: Smartphone },
              ].map((o) => (
                <button
                  type="button"
                  key={o.id}
                  onClick={() => setPay(o.id)}
                  className={`p-4 rounded-2xl border-2 transition text-left ${
                    pay === o.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <o.icon className="size-5 mb-2 text-primary" />
                  <p className="font-medium text-sm">{o.label}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <aside className="lg:sticky lg:top-24 self-start bg-card border border-border rounded-3xl p-6 space-y-4">
          <h3 className="font-display text-xl font-bold">Summary</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {items.map((i: CartItem) => {
              if (!isProduct(i.product)) return null;
              return (
                <div
                  key={i.product.id}
                  className="flex gap-3 items-center text-sm"
                >
                  <img
                    src={productImg(i.product.image)}
                    alt=""
                    className="size-12 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1 font-medium">{i.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty {i.quantity}
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatPrice(toNumber(i.product.price) * i.quantity)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-border pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(sub)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
          </div>
          <div className="border-t border-border pt-4 flex justify-between items-baseline">
            <span className="font-semibold">Total</span>
            <span className="font-display text-2xl font-bold text-primary">
              {formatPrice(total)}
            </span>
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={placing}
            className="w-full rounded-full shadow-warm"
          >
            {placing ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" /> Placing…
              </>
            ) : (
              "Place order"
            )}
          </Button>
        </aside>
      </form>
    </div>
  );
};

const Field = ({
  label,
  name,
  type = "text",
  placeholder,
  className = "",
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
}) => (
  <div className={className}>
    <label className="text-sm font-medium mb-1.5 block">{label}</label>
    <input
      required
      name={name}
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full h-11 px-4 rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary"
    />
  </div>
);

export default Checkout;

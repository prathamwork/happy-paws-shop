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
import type { CartItem, PaymentMethod } from "@/types/api";

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

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

// Load Razorpay script only once
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Script tag already injected, wait for it
    const existing = document.getElementById("razorpay-sdk");
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    // Fresh inject
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const Checkout = () => {
  const { items, subtotal, fetch: fetchCart, clear } = useCart();
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();

  const [pay, setPay] = useState<PaymentMethod>("cod");
  const [placing, setPlacing] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  // Load Razorpay script once on mount
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  useEffect(() => {
    if (!user) return;

    setLoadingAddresses(true);

    api
      .get("/orders/addresses/")
      .then((res) => {
        const raw = res.data;

        let list: SavedAddress[] = [];

        if (Array.isArray(raw)) list = raw;
        else if (Array.isArray(raw?.addresses)) list = raw.addresses;
        else if (Array.isArray(raw?.data)) list = raw.data;
        else if (Array.isArray(raw?.results)) list = raw.results;

        setSavedAddresses(list);

        if (list.length > 0) {
          const defaultAddress = list.find((a) => a.is_default) ?? list[0];
          setSelectedAddressId(defaultAddress.id);
          setUseNewAddress(false);
        } else {
          setUseNewAddress(true);
        }
      })
      .catch(() => {
        setUseNewAddress(true);
      })
      .finally(() => {
        setLoadingAddresses(false);
      });
  }, [user]);

  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId);

  const sub = subtotal();
  // const tax = sub * 0.08;
  const shipping = sub > 49 ? 0 : 6.99;
  const total = sub  + shipping;

  const buildPayload = (
    form: HTMLFormElement | null,
    method: PaymentMethod
  ): Record<string, string> => {
    if (!useNewAddress && selectedAddress) {
      return {
        full_name: selectedAddress.full_name,
        email: selectedAddress.email || "",
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        city: selectedAddress.city,
        zip_code: selectedAddress.zip_code,
        country: selectedAddress.country || "India",
        payment_method: method,
      };
    }

    const get = (name: string) =>
      (form?.elements.namedItem(name) as HTMLInputElement)?.value || "";

    return {
      full_name: get("full_name"),
      email: get("email"),
      phone: get("phone"),
      address: get("address"),
      city: get("city"),
      zip_code: get("zip_code"),
      country: get("country"),
      payment_method: method,
    };
  };

  const handleCOD = async (form: HTMLFormElement) => {
    const payload = buildPayload(form, "cod");
    const order = await createOrder(payload);
    toast.success("Order placed successfully! 🎉");
    await clear().catch(() => {});
    navigate(`/order-success?id=${order.order.id}`);
  };

  const handleRazorpay = async (
    form: HTMLFormElement,
    method: "card" | "upi"
  ) => {
    // ✅ Just check if already loaded — no new network call
    if (!window.Razorpay) {
      toast.error("Razorpay load nahi hua. Page refresh karo.");
      setPlacing(false);
      return;
    }

    const payload = buildPayload(form, method);

    let order: any;

    try {
      // STEP 1: Create order
      order = await createOrder(payload);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Order create nahi hua.");
      setPlacing(false);
      return;
    }

    let rzData: any;

    try {
      // STEP 2: Create Razorpay order using order_id only
      const res = await api.post("/payments/razorpay/create/", {
        order_id: order.order.id,
      });

      rzData = res.data.data;
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Razorpay order create nahi hua."
      );
      setPlacing(false);
      return;
    }

    const options: RazorpayOptions = {
      key: rzData.razorpay_key,
      amount: rzData.amount,
      currency: rzData.currency || "INR",
      name: "Pawsome",
      description: `Order #${order.order.id}`,
      order_id: rzData.razorpay_order_id,
      prefill: {
        name: payload.full_name,
        email: payload.email,
        contact: payload.phone,
      },
      theme: {
        color: "#6366f1",
      },
      handler: async (response: RazorpayResponse) => {
        try {
          // STEP 3: Verify payment
          await api.post("/payments/razorpay/verify/", {
            order_id: order.order.id,
            payment_db_id: rzData.payment_db_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          toast.success("Payment successful! 🎉");
          await clear().catch(() => {});
          navigate(`/order-success?id=${order.order.id}`);
        } catch (error: any) {
          toast.error(
            error?.response?.data?.message ||
              "Payment verify nahi hui. Support se contact karo."
          );
        } finally {
          setPlacing(false);
        }
      },
      modal: {
        ondismiss: () => {
          toast.info("Payment cancelled.");
          setPlacing(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    // Guard against double submit
    if (placing) return;

    setPlacing(true);

    const form = e.target as HTMLFormElement;

    try {
      if (pay === "cod") {
        await handleCOD(form);
        setPlacing(false);
      } else {
        // Note: setPlacing(false) is handled inside handleRazorpay
        // (in handler's finally block or on early returns)
        await handleRazorpay(form, pay as "card" | "upi");
      }
    } catch {
      toast.error("Kuch gadbad ho gayi. Dobara try karo.");
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
          <section className="bg-card border border-border rounded-3xl p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="size-8 bg-muted rounded-xl flex items-center justify-center">
                <MapPin className="size-4 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold">Shipping details</h3>
            </div>

            {loadingAddresses ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
                <Loader2 className="size-4 animate-spin" />
                Loading saved addresses...
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

                          <p className="font-semibold text-sm">{addr.full_name}</p>

                          <p className="text-xs text-muted-foreground mt-0.5">
                            {addr.address}, {addr.city}, {addr.zip_code},{" "}
                            {addr.country}
                          </p>

                          <p className="text-xs text-muted-foreground">{addr.phone}</p>

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

                    <Field label="Country" name="country" defaultValue="India" />
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

          <section className="bg-card border border-border rounded-3xl p-6">
            <h3 className="font-display text-xl font-bold mb-4">Payment method</h3>

            <div className="grid md:grid-cols-3 gap-3">
              {[
                { id: "cod" as const, label: "Cash on delivery", icon: Banknote },
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

                  {(o.id === "card" || o.id === "upi") && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      via Razorpay
                    </p>
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 self-start bg-card border border-border rounded-3xl p-6 space-y-4">
          <h3 className="font-display text-xl font-bold">Summary</h3>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {items.map((i: CartItem) => {
              const p = (i as any).product;

              if (!p || typeof p !== "object") return null;

              return (
                <div key={p.id} className="flex gap-3 items-center text-sm">
                  <img
                    src={productImg(p.image)}
                    alt={p.name}
                    className="size-12 rounded-lg object-cover"
                    loading="lazy"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1 font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {i.quantity}</p>
                  </div>

                  <span className="font-medium">
                    {formatPrice(toNumber(p.price) * i.quantity)}
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

            {/* <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatPrice(tax)}</span>
            </div> */}

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
                <Loader2 className="size-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : pay === "cod" ? (
              "Place order"
            ) : (
              "Pay with Razorpay"
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
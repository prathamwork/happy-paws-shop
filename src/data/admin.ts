import { products } from "./products";

export type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "paid" | "unpaid" | "refunded";

export interface AdminOrder {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: OrderStatus;
  payment: PaymentStatus;
  date: string;
  items: { productId: string; name: string; qty: number; price: number }[];
  shipping: { address: string; city: string; zip: string; country: string };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  joined: string;
  orders: number;
  spent: number;
  blocked: boolean;
  avatar?: string;
}

export interface AdminReview {
  id: string;
  productId: string;
  productName: string;
  user: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  date: string;
}

export interface AdminCoupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  expiry: string;
  active: boolean;
  uses: number;
}

const customers = [
  { name: "Olivia Bennett", email: "olivia@example.com" },
  { name: "Noah Rivera", email: "noah@example.com" },
  { name: "Maya Chen", email: "maya@example.com" },
  { name: "Liam Patel", email: "liam@example.com" },
  { name: "Sofia Garcia", email: "sofia@example.com" },
  { name: "Ethan Walker", email: "ethan@example.com" },
  { name: "Aria Thompson", email: "aria@example.com" },
  { name: "Lucas Müller", email: "lucas@example.com" },
];

const cities = [
  { city: "Brooklyn", zip: "11201", country: "USA" },
  { city: "Austin", zip: "73301", country: "USA" },
  { city: "Seattle", zip: "98101", country: "USA" },
  { city: "Toronto", zip: "M5H", country: "Canada" },
  { city: "Berlin", zip: "10115", country: "Germany" },
];

const statuses: OrderStatus[] = ["pending", "shipped", "delivered", "delivered", "cancelled"];
const payments: PaymentStatus[] = ["paid", "paid", "paid", "unpaid", "refunded"];

export const adminOrders: AdminOrder[] = Array.from({ length: 28 }).map((_, i) => {
  const c = customers[i % customers.length];
  const loc = cities[i % cities.length];
  const itemCount = (i % 3) + 1;
  const items = Array.from({ length: itemCount }).map((__, j) => {
    const p = products[(i + j) % products.length];
    const qty = (j % 2) + 1;
    return { productId: p.id, name: p.name, qty, price: p.price };
  });
  const amount = items.reduce((s, it) => s + it.price * it.qty, 0);
  const date = new Date(Date.now() - i * 1000 * 60 * 60 * 18).toISOString();
  return {
    id: `PWS-${1000 + i}`,
    customer: c.name,
    email: c.email,
    amount: +amount.toFixed(2),
    status: statuses[i % statuses.length],
    payment: payments[i % payments.length],
    date,
    items,
    shipping: { address: `${100 + i} Maple Ave`, ...loc },
  };
});

export const adminUsers: AdminUser[] = customers.map((c, i) => ({
  id: `U-${100 + i}`,
  name: c.name,
  email: c.email,
  role: i === 0 ? "admin" : "customer",
  joined: new Date(Date.now() - (i + 2) * 86400000 * 30).toISOString(),
  orders: 3 + (i % 7),
  spent: +(120 + i * 47.5).toFixed(2),
  blocked: i === 5,
}));

export const adminReviews: AdminReview[] = products.flatMap((p, i) => [
  {
    id: `R-${p.id}-1`,
    productId: p.id,
    productName: p.name,
    user: customers[i % customers.length].name,
    rating: 5,
    comment: "My pet absolutely loves this. Quality exceeded expectations!",
    status: i % 3 === 0 ? "pending" : "approved",
    date: new Date(Date.now() - i * 86400000 * 2).toISOString(),
  },
  {
    id: `R-${p.id}-2`,
    productId: p.id,
    productName: p.name,
    user: customers[(i + 2) % customers.length].name,
    rating: 4,
    comment: "Solid product, fast shipping. Would buy again.",
    status: i % 4 === 0 ? "pending" : "approved",
    date: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  },
]);

export const adminCoupons: AdminCoupon[] = [
  { id: "C1", code: "WELCOME10", type: "percent", value: 10, expiry: "2026-12-31", active: true, uses: 248 },
  { id: "C2", code: "PAWS25", type: "percent", value: 25, expiry: "2026-06-30", active: true, uses: 87 },
  { id: "C3", code: "FREESHIP", type: "fixed", value: 8, expiry: "2026-09-15", active: true, uses: 412 },
  { id: "C4", code: "WINTER20", type: "percent", value: 20, expiry: "2025-12-31", active: false, uses: 1023 },
];

// Analytics mock
export const revenueByMonth = [
  { month: "Jan", revenue: 18420, orders: 142 },
  { month: "Feb", revenue: 22150, orders: 168 },
  { month: "Mar", revenue: 25890, orders: 201 },
  { month: "Apr", revenue: 29320, orders: 228 },
  { month: "May", revenue: 31870, orders: 245 },
  { month: "Jun", revenue: 36240, orders: 272 },
  { month: "Jul", revenue: 41130, orders: 305 },
  { month: "Aug", revenue: 38990, orders: 289 },
  { month: "Sep", revenue: 44210, orders: 321 },
  { month: "Oct", revenue: 48720, orders: 354 },
  { month: "Nov", revenue: 52410, orders: 378 },
  { month: "Dec", revenue: 61290, orders: 432 },
];

export const dailyRevenue = Array.from({ length: 30 }).map((_, i) => ({
  day: `${i + 1}`,
  revenue: Math.round(1200 + Math.sin(i / 3) * 600 + i * 30 + Math.random() * 400),
}));

export const categoryShare = [
  { name: "Dogs", value: 38 },
  { name: "Cats", value: 27 },
  { name: "Accessories", value: 19 },
  { name: "Birds", value: 9 },
  { name: "Fish", value: 7 },
];

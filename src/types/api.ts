// Backend types — must match Django REST responses exactly.
// Backend wraps payloads as { success: boolean, data: T }
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type UserRole = "admin" | "manager" | "customer";

export interface User {
  id: number;
  name: string;
  email: string;
  profile_image: string | null;
  role: UserRole;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Rating {
  id: number;
  product: number;
  user: number;
  rating: number;
  review: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string; // backend sends "300.00"
  stock: number;
  image: string | null;
  is_active: boolean;
  created_at: string;
  category: number;
  average_rating: number;
  ratings: Rating[] | number; // may be array or count
}

export interface CartItem {
  id: number;
  product: Product | number;
  quantity: number;
}

export interface WishlistItem {
  id?: number;
  user?: number;
  product: Product | number;
  created_at?: string;
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  id: number;
  product: Product | number;
  quantity: number;
  price: string;
}

export interface Order {
  id: number;
  user: number;
  total_amount: string;
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
}

export type PaymentMethod = "cod" | "card" | "upi";
export type PaymentStatus = "pending" | "success" | "failed";

export interface Payment {
  id: number;
  order: number;
  user: number;
  amount: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  transaction_id: string;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

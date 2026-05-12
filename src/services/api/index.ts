/**
 * Pawsome API client — Django REST backend
 * Base: http://127.0.0.1:8000/api  (override via VITE_API_BASE_URL)
 *
 * All responses are wrapped: { success: boolean, data: T }
 * Helpers below unwrap response.data.data automatically.
 */
import axios, { AxiosError, AxiosHeaders, type AxiosInstance } from "axios";
import type {
  ApiEnvelope,
  AuthResponse,
  AuthTokens,
  CartItem,
  CartResponse, 
  Category,
  Order,
  OrderStatus,
  Product,
  Rating,
  User,
  WishlistItem,
} from "@/types/api";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const RAW_HOST =
  (import.meta.env.VITE_API_HOST as string | undefined) || "http://127.0.0.1:8000";
export const API_HOST = RAW_HOST.replace(/\/$/, "");
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  `${API_HOST}/api`;

const ACCESS_KEY = "pawsome-access-token";
const REFRESH_KEY = "pawsome-refresh-token";

export const tokenStore = {
  getAccess: () => {
    try { return localStorage.getItem(ACCESS_KEY); } catch { return null; }
  },
  getRefresh: () => {
    try { return localStorage.getItem(REFRESH_KEY); } catch { return null; }
  },
  set: (tokens: Partial<AuthTokens>) => {
    try {
      if (tokens.access) localStorage.setItem(ACCESS_KEY, tokens.access);
      if (tokens.refresh) localStorage.setItem(REFRESH_KEY, tokens.refresh);
    } catch { /* ignore */ }
  },
  clear: () => {
    try {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    } catch { /* ignore */ }
  },
};

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: "application/json" },
  timeout: 20_000,
});

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  const headers = AxiosHeaders.from(config.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  // Let axios set multipart boundaries automatically for FormData
  if (!(config.data instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  config.headers = headers;
  return config;
});

// ── Silent token refresh ─────────────────────────────
let _refreshPromise: Promise<AuthTokens> | null = null;

async function silentRefresh(): Promise<AuthTokens> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const refresh = tokenStore.getRefresh();
    if (!refresh) throw new Error("No refresh token");
    // Use raw axios to avoid interceptor loop
    const res = await axios.post<ApiEnvelope<AuthTokens>>(
      `${API_BASE_URL}/users/refresh/`,
      { refresh },
      { headers: { "Content-Type": "application/json" } },
    );
    const body = res.data;
    const tokens = "data" in body ? body.data : (body as unknown as AuthTokens);
    tokenStore.set(tokens); // saves new access (+ refresh if rotated)
    return tokens;
  })().finally(() => { _refreshPromise = null; });

  return _refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 401 && !original?._retry) {
      original!._retry = true;
      try {
        const tokens = await silentRefresh();
        const headers = AxiosHeaders.from(original!.headers);
        headers.set("Authorization", `Bearer ${tokens.access}`);
        original!.headers = headers;
        return api(original!); // replay with new token
      } catch {
        tokenStore.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// Unwrap { success, data } envelope safely. Falls back to raw payload.
const unwrap = <T>(p: Promise<{ data: ApiEnvelope<T> | T }>): Promise<T> =>
  p.then((res) => {
    const body = res.data as ApiEnvelope<T> | T;
    if (body && typeof body === "object" && "data" in (body as object)) {
      return (body as ApiEnvelope<T>).data;
    }
    return body as T;
  });

// ---------------------------------------------------------------------------
// USERS
// ---------------------------------------------------------------------------
export const signupUser = (data: { name: string; email: string; password: string }) =>
  unwrap<AuthResponse>(api.post("/users/signup/", data));

export const loginUser = (data: { email: string; password: string }) =>
  unwrap<AuthResponse>(api.post("/users/login/", data));

export const refreshToken = (data: { refresh: string }) =>
  unwrap<AuthTokens>(api.post("/users/refresh/", data));

export const getProfile = () => unwrap<User>(api.get("/users/profile/"));

// ---------------------------------------------------------------------------
// WISHLIST
// ---------------------------------------------------------------------------
export const getWishlist = () => unwrap<WishlistItem[]>(api.get("/users/wishlist/"));

export const addToWishlist = (productId: number | string) =>
  unwrap<WishlistItem>(api.post("/users/wishlist/add/", { product_id: productId }));

export const removeFromWishlist = (productId: number | string) =>
  unwrap<{ success: boolean }>(api.delete(`/users/wishlist/remove/${productId}/`));

// ---------------------------------------------------------------------------
// PRODUCTS
// ---------------------------------------------------------------------------
export const getProducts = (params?: Record<string, unknown>) =>
  unwrap<Product[]>(api.get("/products/", { params }));

export const getProductById = (id: number | string) =>
  unwrap<Product>(api.get(`/products/${id}/`));

export const addProduct = (formData: FormData) =>
  unwrap<Product>(api.post("/products/", formData));

export const updateProduct = (id: number | string, formData: FormData) =>
  unwrap<Product>(api.patch(`/products/${id}/`, formData));

export const deleteProduct = (id: number | string) =>
  unwrap<{ success: boolean }>(api.delete(`/products/${id}/`));

export const rateProduct = (
  id: number | string,
  data: { rating: number; review?: string },
) => unwrap<Rating>(api.post(`/products/${id}/rate/`, data));

export const getProductRatings = (id: number | string) =>
  unwrap<Rating[]>(api.get(`/products/${id}/ratings/`));

// ---------------------------------------------------------------------------
// CATEGORIES
// ---------------------------------------------------------------------------
export const getCategories = () => unwrap<Category[]>(api.get("/categories/"));

export const addCategory = (formData: FormData) =>
  unwrap<Category>(api.post("/categories/", formData));

export const updateCategory = (id: number | string, formData: FormData) =>
  unwrap<Category>(api.patch(`/categories/${id}/`, formData));

export const deleteCategory = (id: number | string) =>
  unwrap<{ success: boolean }>(api.delete(`/categories/${id}/`));

export const getCategoryProducts = (slug: string) =>
  unwrap<Product[]>(api.get(`/categories/${slug}/products/`));

// ---------------------------------------------------------------------------
// CART
// ---------------------------------------------------------------------------
export const getCart = () =>
  api.get("/cart/").then((res) => {
    const body = res.data;
    // Backend returns { success, cart: { items, ... }, total_price }
    return (body?.cart ?? body?.data ?? body) as CartResponse;
  });

export const addToCart = (data: { product_id: number | string; quantity: number }) =>
  unwrap<CartItem>(api.post("/cart/add/", data));

export const updateCart = (data: { product_id: number | string; quantity: number }) =>
  unwrap<CartItem>(api.patch("/cart/update/", data));

export const removeCartItem = (product_id: number | string) =>
  unwrap<{ success: boolean }>(api.delete(`/cart/remove/${product_id}/`));

export const clearCart = () =>
  unwrap<{ success: boolean }>(api.delete("/cart/clear/"));

// ---------------------------------------------------------------------------
// ORDERS
// ---------------------------------------------------------------------------
export const createOrder = (data: Record<string, unknown> = {}) =>
  unwrap<Order>(api.post("/orders/create/", data));

export const getOrders = () => unwrap<Order[]>(api.get("/orders/"));

export const getOrderById = (id: number | string) =>
  unwrap<Order>(api.get(`/orders/${id}/`));

export const cancelOrder = (id: number | string) =>
  unwrap<Order>(api.patch(`/orders/${id}/cancel/`, {}));

export const updateOrderStatus = (id: number | string, status: OrderStatus) =>
  unwrap<Order>(api.patch(`/orders/${id}/status/`, { status }));

// Default aggregate (optional convenience)
export default {
  signupUser, loginUser, refreshToken, getProfile,
  getWishlist, addToWishlist, removeFromWishlist,
  getProducts, getProductById, addProduct, updateProduct, deleteProduct,
  rateProduct, getProductRatings,
  getCategories, addCategory, updateCategory, deleteCategory, getCategoryProducts,
  getCart, addToCart, updateCart, removeCartItem, clearCart,
  createOrder, getOrders, getOrderById, cancelOrder, updateOrderStatus,
};


// ---------------------------------------------------------------------------
// ADDRESSES
// ---------------------------------------------------------------------------
export interface Address {
  id: number;
  user: number;
  full_name: string;
  phone: string;
  email?: string;          // backend has this
  address: string;         // was address_line1
  address_line2?: string;  // keep optional if backend supports it
  city: string;
  state: string;
  zip_code: string;        // was pincode
  country?: string;        // backend has this
  is_default: boolean;
  created_at: string;
  address_ref?: string | null;
}

export const getAddresses = () =>
  unwrap<Address[]>(api.get("/orders/addresses/"));

export const addAddress = (data: Omit<Address, "id" | "user" | "created_at">) =>
  unwrap<Address>(api.post("/orders/addresses/", data));

export const updateAddress = (id: number | string, data: Partial<Address>) =>
  unwrap<Address>(api.patch(`/orders/addresses/${id}/`, data));

export const deleteAddress = (id: number | string) =>
  unwrap<{ success: boolean }>(api.delete(`/orders/addresses/${id}/`));


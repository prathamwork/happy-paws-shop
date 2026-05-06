/**
 * Pawsome API client
 * Centralized axios instance + endpoint definitions for the backend.
 *
 * Backend base: http://127.0.0.1:8000/api
 * Override via Vite env: VITE_API_BASE_URL
 */
import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000/api";

const TOKEN_STORAGE_KEY = "pawsome-auth-token";

export const tokenStore = {
  get: (): string | null => {
    try { return localStorage.getItem(TOKEN_STORAGE_KEY); } catch { return null; }
  },
  set: (token: string) => {
    try { localStorage.setItem(TOKEN_STORAGE_KEY, token); } catch { /* ignore */ }
  },
  clear: () => {
    try { localStorage.removeItem(TOKEN_STORAGE_KEY); } catch { /* ignore */ }
  },
};

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  timeout: 20_000,
});

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) tokenStore.clear();
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Endpoint URL builders (single source of truth)
// ---------------------------------------------------------------------------
export const endpoints = {
  users: {
    signup: "/users/signup/",
    login: "/users/login/",
    wishlistAdd: "/users/wishlist/add",
    wishlistRemove: (userId: string | number) => `/users/wishlist/remove/${userId}/`,
    assignRole: (userId: string | number) => `/users/assign-role/${userId}/`,
  },
  products: {
    list: "/products/",
    create: "/products/",
    detail: (id: string | number) => `/products/${id}/`,
    update: (id: string | number) => `/products/${id}/`,
    remove: (id: string | number) => `/products/${id}/`,
    ratings: (id: string | number) => `/products/${id}/ratings/`,
  },
  categories: {
    list: "/categories/",
    create: "/categories/",
    update: (id: string | number) => `/categories/${id}/`,
    remove: (id: string | number) => `/categories/${id}/`,
    products: (slug: string) => `/categories/${slug}/products/`,
  },
  cart: {
    list: "/cart/",
    add: "/cart/add/",
    remove: "/cart/remove/",
    update: "/cart/update/",
    clear: "/cart/clear/",
  },
  orders: {
    create: "/orders/create/",
    list: "/orders/",
    detail: (id: string | number) => `/orders/${id}/`,
    cancel: (id: string | number) => `/orders/${id}/cancle/`, // backend spelling
    status: (id: string | number) => `/orders/${id}status/`,  // backend spelling
  },
} as const;

// ---------------------------------------------------------------------------
// Types (shape loosely; refine to match backend payloads)
// ---------------------------------------------------------------------------
export interface AuthResponse { token: string; user: ApiUser }
export interface ApiUser { id: string | number; name?: string; email: string; role?: string }
export interface ApiProduct {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  stock?: number;
  rating?: number;
}
export interface ApiCategory { id: string | number; name: string; slug: string }
export interface ApiCartItem { id: string | number; product: ApiProduct; quantity: number }
export interface ApiOrder {
  id: string | number;
  items: ApiCartItem[];
  total: number;
  status: string;
  created_at?: string;
}
export interface ApiRating { id: string | number; user: string | number; rating: number; comment?: string }

// ---------------------------------------------------------------------------
// Service modules
// ---------------------------------------------------------------------------
const unwrap = <T>(p: Promise<{ data: T }>) => p.then((r) => r.data);

export const usersApi = {
  signup: (payload: { name: string; email: string; password: string }, config?: AxiosRequestConfig) =>
    unwrap<AuthResponse>(api.post(endpoints.users.signup, payload, config)),
  login: (payload: { email: string; password: string }, config?: AxiosRequestConfig) =>
    unwrap<AuthResponse>(api.post(endpoints.users.login, payload, config)),
  addToWishlist: (payload: { product_id: string | number }, config?: AxiosRequestConfig) =>
    unwrap<{ success: boolean }>(api.post(endpoints.users.wishlistAdd, payload, config)),
  removeFromWishlist: (userId: string | number, config?: AxiosRequestConfig) =>
    unwrap<{ success: boolean }>(api.delete(endpoints.users.wishlistRemove(userId), config)),
  assignRole: (userId: string | number, payload: { role: string }, config?: AxiosRequestConfig) =>
    unwrap<ApiUser>(api.patch(endpoints.users.assignRole(userId), payload, config)),
};

export const productsApi = {
  add: (payload: Partial<ApiProduct> | FormData, config?: AxiosRequestConfig) =>
    unwrap<ApiProduct>(api.post(endpoints.products.create, payload, config)),
  list: (params?: Record<string, unknown>, config?: AxiosRequestConfig) =>
    unwrap<ApiProduct[]>(api.get(endpoints.products.list, { params, ...config })),
  get: (id: string | number, config?: AxiosRequestConfig) =>
    unwrap<ApiProduct>(api.get(endpoints.products.detail(id), config)),
  update: (id: string | number, payload: Partial<ApiProduct> | FormData, config?: AxiosRequestConfig) =>
    unwrap<ApiProduct>(api.put(endpoints.products.update(id), payload, config)),
  remove: (id: string | number, config?: AxiosRequestConfig) =>
    unwrap<{ success: boolean }>(api.delete(endpoints.products.remove(id), config)),
  addRating: (id: string | number, payload: { rating: number; comment?: string }, config?: AxiosRequestConfig) =>
    unwrap<ApiRating>(api.post(endpoints.products.ratings(id), payload, config)),
  listRatings: (id: string | number, config?: AxiosRequestConfig) =>
    unwrap<ApiRating[]>(api.get(endpoints.products.ratings(id), config)),
};

export const categoriesApi = {
  create: (payload: { name: string; slug?: string }, config?: AxiosRequestConfig) =>
    unwrap<ApiCategory>(api.post(endpoints.categories.create, payload, config)),
  list: (config?: AxiosRequestConfig) =>
    unwrap<ApiCategory[]>(api.get(endpoints.categories.list, config)),
  update: (id: string | number, payload: Partial<ApiCategory>, config?: AxiosRequestConfig) =>
    unwrap<ApiCategory>(api.put(endpoints.categories.update(id), payload, config)),
  remove: (id: string | number, config?: AxiosRequestConfig) =>
    unwrap<{ success: boolean }>(api.delete(endpoints.categories.remove(id), config)),
  productsBySlug: (slug: string, config?: AxiosRequestConfig) =>
    unwrap<ApiProduct[]>(api.get(endpoints.categories.products(slug), config)),
};

export const cartApi = {
  list: (config?: AxiosRequestConfig) =>
    unwrap<ApiCartItem[]>(api.get(endpoints.cart.list, config)),
  add: (payload: { product_id: string | number; quantity?: number }, config?: AxiosRequestConfig) =>
    unwrap<ApiCartItem>(api.post(endpoints.cart.add, payload, config)),
  remove: (payload: { product_id: string | number }, config?: AxiosRequestConfig) =>
    unwrap<{ success: boolean }>(api.post(endpoints.cart.remove, payload, config)),
  update: (payload: { product_id: string | number; quantity: number }, config?: AxiosRequestConfig) =>
    unwrap<ApiCartItem>(api.post(endpoints.cart.update, payload, config)),
  clear: (config?: AxiosRequestConfig) =>
    unwrap<{ success: boolean }>(api.post(endpoints.cart.clear, undefined, config)),
};

export const ordersApi = {
  create: (payload: Record<string, unknown>, config?: AxiosRequestConfig) =>
    unwrap<ApiOrder>(api.post(endpoints.orders.create, payload, config)),
  list: (config?: AxiosRequestConfig) =>
    unwrap<ApiOrder[]>(api.get(endpoints.orders.list, config)),
  get: (id: string | number, config?: AxiosRequestConfig) =>
    unwrap<ApiOrder>(api.get(endpoints.orders.detail(id), config)),
  cancel: (id: string | number, config?: AxiosRequestConfig) =>
    unwrap<ApiOrder>(api.post(endpoints.orders.cancel(id), undefined, config)),
  status: (id: string | number, config?: AxiosRequestConfig) =>
    unwrap<{ status: string }>(api.get(endpoints.orders.status(id), config)),
};

// ---------------------------------------------------------------------------
// Aggregate export — import from one place:
//   import { pawsomeApi } from "@/services/api";
//   await pawsomeApi.products.list();
// ---------------------------------------------------------------------------
export const pawsomeApi = {
  users: usersApi,
  products: productsApi,
  categories: categoriesApi,
  cart: cartApi,
  orders: ordersApi,
};

export default pawsomeApi;

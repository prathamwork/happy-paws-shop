# 🐾 Pawsome — Pet Food & Pet Products eCommerce

A modern, production-ready frontend for a Pet Food & Pet Products eCommerce platform, with both a **customer storefront** and an **admin panel**, integrated with a **Django REST** backend.

> Built with React + Vite + TypeScript + Tailwind + shadcn/ui + Zustand + Axios + Framer Motion + Recharts.

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Backend Integration](#backend-integration)
7. [API Reference](#api-reference)
8. [State Management](#state-management)
9. [Routing](#routing)
10. [Design System](#design-system)
11. [Customer Features](#customer-features)
12. [Admin Panel](#admin-panel)
13. [Authentication & Roles](#authentication--roles)
14. [Available Scripts](#available-scripts)
15. [Conventions & Best Practices](#conventions--best-practices)
16. [Troubleshooting](#troubleshooting)

---

## Overview

**Pawsome** is a clean, pet-friendly eCommerce experience inspired by Amazon / Chewy / Flipkart. It includes:

- A **customer storefront** (browse, search, cart, wishlist, checkout, orders, reviews).
- An **admin panel** (dashboard, products, orders, users, categories, reviews, analytics, coupons, settings).
- Full **Django REST API** integration with token-based auth and role-based UI gating (`admin` / `manager` / `customer`).

The app is fully responsive (mobile, tablet, desktop), themed via semantic design tokens, and animated with Framer Motion.

---

## Tech Stack

| Layer | Technology |
|------|-----------|
| Framework | React 18 + Vite 5 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v3 + shadcn/ui (Radix primitives) |
| Routing | React Router DOM v6 |
| State | Zustand |
| Data fetching | Axios + TanStack Query |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | lucide-react |
| Notifications | Sonner / Radix Toast |
| Testing | Vitest + Testing Library |

---

## Project Structure

```
src/
├── App.tsx                  # Top-level routes (storefront + admin)
├── main.tsx                 # React entry
├── index.css                # Tailwind layers + design tokens (HSL)
│
├── assets/                  # Hero / category / product images
│
├── components/
│   ├── AuthForm.tsx         # Shared login / register form
│   ├── CategoryGrid.tsx
│   ├── Hero.tsx
│   ├── OffersBanner.tsx
│   ├── ProductCard.tsx
│   ├── Testimonials.tsx
│   ├── NavLink.tsx
│   ├── layout/              # Public site shell
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── admin/               # Admin shell + primitives
│   │   ├── AdminLayout.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminTopbar.tsx
│   │   ├── Breadcrumbs.tsx
│   │   ├── StatCard.tsx
│   │   └── StatusPill.tsx
│   └── ui/                  # shadcn/ui components
│
├── pages/
│   ├── Index.tsx            # Home
│   ├── Shop.tsx             # Product listing + filters
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── OrderSuccess.tsx
│   ├── Wishlist.tsx
│   ├── Login.tsx / Register.tsx / ForgotPassword.tsx
│   ├── Dashboard.tsx        # Customer account dashboard
│   ├── About.tsx / Contact.tsx / NotFound.tsx
│   └── admin/               # Admin pages
│       ├── AdminLogin.tsx
│       ├── AdminDashboard.tsx
│       ├── AdminProducts.tsx / AdminProductForm.tsx
│       ├── AdminOrders.tsx / AdminOrderDetail.tsx
│       ├── AdminUsers.tsx
│       ├── AdminCategories.tsx
│       ├── AdminReviews.tsx
│       ├── AdminAnalytics.tsx
│       ├── AdminCoupons.tsx
│       └── AdminSettings.tsx
│
├── services/api/index.ts    # Axios client + all backend endpoints
├── types/api.ts             # Backend-aligned TypeScript types
│
├── store/                   # Zustand stores
│   ├── auth.ts              # Tokens, profile, role
│   ├── cart.ts              # Cart synced with backend
│   ├── wishlist.ts          # Wishlist synced with backend
│   ├── theme.ts             # Light/dark theme
│   └── admin.ts             # Admin UI state
│
├── lib/
│   ├── format.ts            # Safe price / number formatting
│   ├── img.ts               # Resolves relative media paths to API_HOST
│   └── utils.ts             # cn() helper
│
├── hooks/                   # Reusable hooks (use-toast, use-mobile)
└── data/                    # Mock data for admin demos / fallbacks
```

---

## Getting Started

### Prerequisites
- Node 18+ (or Bun)
- A running Django REST backend on `http://127.0.0.1:8000` (or set `VITE_API_HOST`)

### Install & Run

```bash
# install
bun install        # or: npm install

# start dev server
bun run dev        # or: npm run dev

# build for production
bun run build

# preview production build
bun run preview
```

The dev server runs on Vite's default port (printed in the terminal).

---

## Environment Variables

Create a `.env` (or `.env.local`) at the project root:

```bash
# Backend host (no trailing slash). Defaults to http://127.0.0.1:8000
VITE_API_HOST=http://127.0.0.1:8000

# Optional explicit API base. Defaults to `${VITE_API_HOST}/api`
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

All env vars are read in `src/services/api/index.ts`.

---

## Backend Integration

The frontend talks to a Django REST backend whose responses follow the envelope:

```json
{ "success": true, "data": { ... } }
```

The Axios client (`src/services/api/index.ts`) automatically:

- Prefixes requests with `API_BASE_URL`.
- Attaches `Authorization: Bearer <access-token>` from `localStorage`.
- Handles `multipart/form-data` for image uploads (no manual `Content-Type`).
- **Unwraps** `response.data.data` so callers consume clean payloads.
- Clears tokens on `401 Unauthorized`.

Tokens are persisted via `tokenStore` under:
- `pawsome-access-token`
- `pawsome-refresh-token`

Image fields on backend models return relative media paths (e.g. `/media/...`). Use `src/lib/img.ts → resolveImage()` to render them — it prepends `API_HOST` automatically.

Prices come back as **strings** (e.g. `"300.00"`). Use `src/lib/format.ts → formatPrice()` for safe display.

---

## API Reference

All endpoints below are wired in `src/services/api/index.ts`.

### Users / Auth
| Function | Method | Path |
|----------|--------|------|
| `signupUser` | POST | `/users/signup/` |
| `loginUser` | POST | `/users/login/` |
| `refreshToken` | POST | `/users/refresh/` |
| `getProfile` | GET | `/users/profile/` |

### Wishlist
| Function | Method | Path |
|----------|--------|------|
| `getWishlist` | GET | `/users/wishlist/` |
| `addToWishlist` | POST | `/users/wishlist/add/` |
| `removeFromWishlist` | DELETE | `/users/wishlist/remove/{productId}/` |

### Products
| Function | Method | Path |
|----------|--------|------|
| `getProducts` | GET | `/products/` |
| `getProductById` | GET | `/products/{id}/` |
| `addProduct` | POST | `/products/` (FormData) |
| `updateProduct` | PATCH | `/products/{id}/` (FormData) |
| `deleteProduct` | DELETE | `/products/{id}/` |
| `rateProduct` | POST | `/products/{id}/rate/` |
| `getProductRatings` | GET | `/products/{id}/ratings/` |

### Categories
| Function | Method | Path |
|----------|--------|------|
| `getCategories` | GET | `/categories/` |
| `addCategory` | POST | `/categories/` (FormData) |
| `updateCategory` | PATCH | `/categories/{id}/` (FormData) |
| `deleteCategory` | DELETE | `/categories/{id}/` |
| `getCategoryProducts` | GET | `/categories/{slug}/products/` |

### Cart
| Function | Method | Path |
|----------|--------|------|
| `getCart` | GET | `/cart/` |
| `addToCart` | POST | `/cart/add/` |
| `updateCart` | PATCH | `/cart/update/` |
| `removeCartItem` | DELETE | `/cart/remove/{productId}/` |
| `clearCart` | DELETE | `/cart/clear/` |

### Orders
| Function | Method | Path |
|----------|--------|------|
| `createOrder` | POST | `/orders/create/` |
| `getOrders` | GET | `/orders/` |
| `getOrderById` | GET | `/orders/{id}/` |
| `cancelOrder` | PATCH | `/orders/{id}/cancel/` |
| `updateOrderStatus` | PATCH | `/orders/{id}/status/` |

### Backend Types

Defined in `src/types/api.ts` and matched 1:1 to Django models:

- `User { id, name, email, profile_image, role, is_active, is_staff, created_at }`
- `Category { id, name, slug, image, is_active, created_at }`
- `Product { id, name, description, price (string), stock, image, is_active, created_at, category, average_rating, ratings }`
- `Rating { id, product, user, rating, review, created_at }`
- `CartItem { id, product, quantity }`
- `Order { id, user, total_amount, status, created_at, items: OrderItem[] }`
- `Payment { id, order, user, amount, payment_method, status, transaction_id, created_at }`
- `AuthResponse extends AuthTokens { user }`

---

## State Management

Zustand stores live in `src/store/`:

| Store | Purpose |
|-------|---------|
| `auth.ts` | Login / signup / logout, token persistence, current `user`, `role` |
| `cart.ts` | Backend-synced cart (`fetch`, `add`, `update`, `remove`, `clear`) |
| `wishlist.ts` | Backend-synced wishlist (`fetch`, `add`, `remove`, `has`) |
| `theme.ts` | Light/dark theme toggle |
| `admin.ts` | Admin UI state (sidebar collapse, filters, etc.) |

Stores call the API client and update local state on success — components subscribe via the standard `useStore(selector)` pattern.

---

## Routing

Defined in `src/App.tsx` using React Router DOM v6.

### Public / Customer (wrapped in `<Layout />`)
- `/` — Home
- `/shop` — Product listing
- `/product/:id` — Product detail
- `/cart`, `/checkout`, `/order-success`
- `/wishlist`
- `/login`, `/register`, `/forgot-password`
- `/dashboard` — Customer account
- `/about`, `/contact`
- `*` — NotFound

### Admin (wrapped in `<AdminLayout />`)
- `/admin/login`
- `/admin` — Dashboard
- `/admin/products`, `/admin/products/new`, `/admin/products/:id/edit`
- `/admin/orders`, `/admin/orders/:id`
- `/admin/users`
- `/admin/categories`
- `/admin/reviews`
- `/admin/analytics`
- `/admin/coupons`
- `/admin/settings`

---

## Design System

All colors, gradients, and shadows are defined as **HSL semantic tokens** in `src/index.css` and mapped in `tailwind.config.ts`. **Never hardcode colors** in components — use tokens like `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, etc.

- Soft, pet-friendly palette (warm primary + playful accents).
- Dark mode supported via the `theme` store + `next-themes`.
- shadcn/ui components live in `src/components/ui/` and can be variant-extended via `class-variance-authority`.
- Animations use Framer Motion (subtle entrance, hover, and page transitions).

---

## Customer Features

- **Home** — Hero, featured categories, offers banner, testimonials.
- **Shop** — Category & search filters, sorting, pagination, loading skeletons, empty/error states.
- **Product Detail** — Image, description, price (string-safe), stock, average rating, ratings list, "Out of stock" badge when `stock === 0`, add to cart, add to wishlist, submit rating.
- **Cart** — Live qty updates, remove items, totals, checkout CTA.
- **Checkout** — Address form (Zod-validated), order placement via `/orders/create/`.
- **Order Success** — Confirmation + order id.
- **Wishlist** — Add/remove with optimistic UI.
- **Auth** — Login, register, forgot-password (frontend), token persistence.
- **Dashboard** — Profile, order history, cancel order.

Inactive products (`is_active === false`) are hidden from customer pages.

---

## Admin Panel

The admin panel (`/admin/*`) is gated by role and provides:

- **Dashboard** — KPIs (revenue, orders, customers), recent activity.
- **Products** — Table with search/filter, create / edit form (RHF + Zod, image upload via FormData), delete.
- **Orders** — List, detail, status updates (`pending → confirmed → shipped → delivered`), cancel.
- **Users** — List, role assignment (`admin` / `manager` / `customer`).
- **Categories** — CRUD with slug + image.
- **Reviews** — Moderate product ratings.
- **Analytics** — Charts via Recharts (revenue, top products, orders over time).
- **Coupons / Settings** — Scaffolded screens for future expansion.

---

## Authentication & Roles

- Tokens are stored in `localStorage` and attached to every request by the Axios interceptor.
- `useAuth().user.role` drives UI gating:
  - **customer** — browse, cart, wishlist, rate, order.
  - **manager** / **admin** — additionally see admin actions (add/edit/delete) and can access the admin panel.
- On `401`, tokens are cleared automatically and the user is treated as logged out.

> Server-side role enforcement is the source of truth — the frontend only hides/shows controls.

---

## Available Scripts

```bash
bun run dev          # start Vite dev server
bun run build        # production build
bun run build:dev    # build in development mode
bun run preview      # preview production build
bun run lint         # eslint
bun run test         # vitest run
bun run test:watch   # vitest in watch mode
```

---

## Conventions & Best Practices

- **Types match backend exactly** — update `src/types/api.ts` when the Django models change.
- **Always unwrap with the API helpers** — never read `response.data.data` directly in components.
- **Use `formatPrice()`** for any price rendering (backend returns strings).
- **Use `resolveImage()`** for any backend image field.
- **Use semantic Tailwind tokens** — no raw `bg-white`, `text-black`, etc.
- **Reusable components first** — keep page files thin; push UI into `components/`.
- **Loading & error states everywhere** — show skeletons / toasts on every async action.
- **Forms** — React Hook Form + Zod resolver for validation.

---

## Troubleshooting

**`Network Error` / CORS** — make sure Django allows the Vite dev origin (typically `http://localhost:5173`) via `django-cors-headers`.

**`401 Unauthorized` after login** — confirm the backend returns `{ success, data: { access, refresh, user } }` and that `access` is a valid JWT.

**Images not loading** — backend likely returned a relative path (`/media/...`). Make sure you render through `resolveImage()` so `VITE_API_HOST` is prepended.

**Prices show `NaN`** — you're rendering `product.price` directly. Use `formatPrice(product.price)` (price is a string).

**TypeScript can't find `axios`** — run `bun add axios` (already in `package.json`); the dev server auto-restarts.

---

Built with ❤️ for pets and the people who love them.

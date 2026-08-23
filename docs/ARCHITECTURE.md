# Vyzobd Storefront — System Architecture

This document provides an overview of the system architecture, component topology, data flow, caching mechanisms, and authentication lifecycle of the **Vyzobd Storefront**.

---

## 1. High-Level System Architecture

```text
                                  ┌────────────────────────────────┐
                                  │      Client Web Browser        │
                                  │   (Desktop / Tablet / Mobile)  │
                                  └───────────────┬────────────────┘
                                                  │
                                                  ▼
                        ┌────────────────────────────────────────────────────┐
                        │              Next.js 16 (App Router)               │
                        │                                                    │
                        │  ┌─────────────────────────┬────────────────────┐  │
                        │  │ Server Components (SSR) │ Client Components  │  │
                        │  │ • app/layout.tsx        │ • Context Providers│  │
                        │  │ • app/sitemap.ts        │ • Product Gallery  │  │
                        │  │ • Metadata Generator    │ • Cart & Checkout  │  │
                        │  └─────────────┬───────────┴──────────┬─────────┘  │
                        └────────────────┼──────────────────────┼────────────┘
                                         │                      │
                                         ▼                      ▼
                        ┌────────────────────────────────────────────────────┐
                        │             Storefront Service Layer               │
                        │  • In-Flight Request Deduplication                 │
                        │  • 30-Second In-Memory Response Caching            │
                        │  • Data Normalization & Resilient Fallbacks        │
                        └────────────────────────┬───────────────────────────┘
                                                 │
                                                 ▼
                        ┌────────────────────────────────────────────────────┐
                        │             Centralized Axios Client               │
                        │  • Base URL: admin.vyzobd.com/api/storefront/v1    │
                        │  • JWT Bearer Interceptors & Auto Refresh          │
                        │  • Error Extraction & Normalization                │
                        └────────────────────────┬───────────────────────────┘
                                                 │
                                                 ▼
                        ┌────────────────────────────────────────────────────┐
                        │             Vyzobd Backend REST API                │
                        │     (Products, Orders, Customers, CMS, Settings)   │
                        └────────────────────────────────────────────────────┘
```

---

## 2. Component Topology & Provider Hierarchy

The client-side application is structured around a nested provider tree that coordinates global state:

```text
RootLayout (app/layout.tsx)
  │
  └── StorefrontProviders (src/providers/StorefrontProviders.tsx)
        │
        ├── SettingsProvider
        │     └── Provides: Branding, Contact Phone/Email, Shipping Fees, Tax Rules
        │
        ├── AuthProvider
        │     └── Provides: User session, JWT tokens, Login/Register/Logout methods
        │
        ├── CartProvider
        │     └── Provides: Cart items, subtotal, discount, coupon, drawer toggle
        │
        ├── WishlistProvider
        │     └── Provides: Saved items, toggle wishlist, persistent local storage
        │
        ├── QuickViewProvider
        │     └── Provides: Modal product preview state & active product
        │
        └── ToastProvider
              └── Provides: Notification stack, success/error toasts, copy alerts
```

---

## 3. Data Flow & Normalization Engine

1. **Request Initiation**: UI components request data through service functions (e.g. `catalogService.getProducts()`).
2. **Deduplication Check**: If an identical network request is already in-flight, the service re-uses the existing `Promise` instead of opening a duplicate TCP connection.
3. **Cache Validation**: If cached data exists within the TTL window (e.g. 30 seconds), it is returned instantly without hitting the network.
4. **Backend Ingestion**: Unwraps backend API responses formatted as `{ status: "success", data: [...], pagination: {...} }`.
5. **Normalization & Fallbacks**: Maps inconsistent attribute names (e.g. `regularPrice` vs `basePrice`, `storePhone` vs `callOrderNumber`) into strictly typed TypeScript domain models.

---

## 4. Authentication Lifecycle

```text
Customer Input (Email + Password)
  │
  ▼
authService.login() ──► POST /auth/login
  │
  ├──► Success:
  │      1. Extract accessToken & refreshToken
  │      2. Store tokens in Secure Cookie / Local Storage
  │      3. Set Auth State (isAuthenticated = true, user = Profile)
  │      4. Attach Bearer token to subsequent apiClient requests
  │
  └──► Token Expiry (401 Response):
         1. Interceptor captures 401 Unauthorized
         2. Triggers POST /auth/refresh-token with refreshToken
         3. Updates accessToken and retries original request
         4. If refresh fails: Clears session and redirects to /login
```

---

## 5. Deployment & Production Build

The storefront compiles into a standalone production server using Next.js build optimizations:
- Static generation for static assets and metadata.
- Dynamic SSR for live catalog and user-specific order operations.
- Sharp image optimization for all Cloudinary-hosted media assets.

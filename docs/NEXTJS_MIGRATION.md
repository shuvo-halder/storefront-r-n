# Next.js App Router Migration Documentation

## Overview
This document outlines the storefront architecture migration from the original Vite SPA architecture to a production-grade **Next.js App Router** architecture for the **Vyzobd Premium Single-Vendor E-Commerce Storefront**.

The storefront remains a completely separate, decoupled frontend communicating strictly with the Vyzobd Storefront API:
`https://admin.vyzobd.com/api/storefront/v1`

---

## Architecture Comparison

| Architecture Feature | Legacy Vite SPA Architecture | New Next.js App Router Architecture |
| :--- | :--- | :--- |
| **Framework & Router** | React 19 + Vite (`src/App.tsx`, hash/view state) | Next.js 16 App Router (`app/` directory) |
| **Routing Mechanism** | `currentView` in `StorefrontContext` | Real Next.js route paths (`next/link`, `useRouter`, `useParams`) |
| **Layout Management** | Single monolithic root component rendered per view | `app/layout.tsx` with global `StorefrontProvider`, `AuthProvider`, `SettingsProvider` |
| **Asset Delivery** | Public folder / static inline SVGs | Clean Next.js `public/` assets (`logo.svg`, `logowhite.svg`, `favicon.ico`) |
| **Server/Client Boundary** | 100% Client-side SPA bundle | Next.js Server Components with targeted `'use client'` interactive boundaries |
| **SEO & Head Metadata** | `react-helmet-async` | Native Next.js App Router `metadata` and structured JSON-LD schemas |

---

## Route Mapping Table

All hash/state-based legacy views have been mapped to real Next.js route paths:

| Legacy View (`AppView`) | New Next.js App Router Path | Description |
| :--- | :--- | :--- |
| `'home'` | `/` | Storefront Homepage |
| `'shop'` | `/products` / `/shop` | Product Catalog & Filter View |
| `'product-detail'` | `/products/[slug]` | Product Detail Page (resolves via `useParams`) |
| `'category'` | `/categories` & `/categories/[slug]` | Category Listings & Specific Category View |
| `'brand'` | `/brands` & `/brands/[slug]` | Brand Directory & Brand Page |
| `'search'` | `/search` | Search & Faceted Filtering |
| `'cart'` | `/cart` | Full Shopping Cart Page |
| `'checkout'` | `/checkout` | Multi-step Checkout |
| `'order-confirmation'` | `/checkout/confirmation` | Order Confirmation View |
| `'checkout-success'` | `/checkout/success` | Payment Success Landing |
| `'checkout-failed'` | `/checkout/failed` | Payment Failure Retry Page |
| `'checkout-gateway'` | `/checkout/gateway` | Simulated Payment Gateway |
| `'login'` | `/login` | User Login |
| `'register'` | `/register` | User Registration |
| `'forgot-password'` | `/forgot-password` | Password Recovery |
| `'reset-password'` | `/reset-password` | Password Reset |
| `'account'` | `/account` | Account Dashboard Overview |
| `'orders'` | `/account/orders` | Order History List |
| `'order-details'` | `/account/orders/[id]` | Order Tracking & Item Details |
| `'return-request'` | `/account/returns` | Return / Exchange Requests |
| `'profile'` | `/account/profile` | Account Settings & Password |
| `'addresses'` | `/account/addresses` | Shipping & Billing Address Book |
| `'wishlist'` | `/account/wishlist` | Saved Products List |
| `'notifications'` | `/account/notifications` | Email & Push Notification Settings |
| `'activity'` | `/account/activity` | Account Security & Activity Log |
| `'blog'` | `/blog` | Journal & Articles List |
| `'article-detail'` | `/blog/[slug]` | Article Reading Page |
| `'cms-page'` | `/pages/[slug]` | CMS Pages (About, Terms, Privacy) |
| `'faq'` | `/faq` | Knowledge Base & FAQ Accordion |

---

## Directory Structure

```
.
├── app/
│   ├── layout.tsx                # Root layout with providers, Header, Footer & Modals
│   ├── page.tsx                  # Homepage route
│   ├── products/
│   │   ├── page.tsx              # /products catalog
│   │   └── [slug]/page.tsx       # /products/[slug] detail
│   ├── categories/
│   │   ├── page.tsx              # /categories list
│   │   └── [slug]/page.tsx       # /categories/[slug]
│   ├── brands/
│   │   ├── page.tsx              # /brands directory
│   │   └── [slug]/page.tsx       # /brands/[slug]
│   ├── search/
│   │   └── page.tsx              # /search
│   ├── cart/
│   │   └── page.tsx              # /cart
│   ├── checkout/
│   │   ├── page.tsx              # /checkout
│   │   ├── confirmation/page.tsx
│   │   ├── success/page.tsx
│   │   ├── failed/page.tsx
│   │   └── gateway/page.tsx
│   ├── account/
│   │   ├── page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── addresses/page.tsx
│   │   └── wishlist/page.tsx
│   │   └── ...
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── pages/
│   │   └── [slug]/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── faq/page.tsx
├── public/
│   ├── logo.svg
│   ├── logowhite.svg
│   └── favicon.ico
└── src/
    ├── components/               # Modular UI components
    ├── context/                  # StorefrontContext, AuthContext, SettingsContext
    ├── services/                 # storefrontApi.ts (Axios + Storefront API)
    ├── hooks/                    # Custom React hooks (useCart, etc.)
    └── types/                    # TypeScript interfaces & Zod schemas
```

---

## API Integration & Response Normalization

All storefront data calls connect to `https://admin.vyzobd.com/api/storefront/v1`.

### Normalization Highlights
1. **Response Normalization**: `storefrontApi.ts` implements robust error-wrapper handling via `normalizeResponse` and `normalizeArrayResponse` to smoothly unwrap nested backend response structures (`data.data`, `data.items`, or plain arrays).
2. **Cart Totals Computation**: `calculateCartTotals` safely parses numbers and computes subtotal, tax, shipping, and grand totals even if item prices arrive as strings or missing fields.
3. **Graceful Fallbacks**: Products, Categories, Brands, and CMS content feature defensive checks and default properties to prevent runtime UI crashes.

---

## Summary of Verification Steps
1. Executed `compile_applet` (`next build` with Turbopack) - **Succeeded**.
2. Executed `lint_applet` (`tsc --noEmit`) - **0 errors found**.
3. Tested logo rendering, header links, search, cart, and account routes.
4. Legacy SPA entry files (`index.html`, `src/App.tsx`, `src/main.tsx`, `vite.config.ts`) were deleted to prevent dual-routing conflicts.

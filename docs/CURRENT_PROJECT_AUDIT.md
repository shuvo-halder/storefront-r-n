# Forensic Architecture & Quality Audit: Vyzobd Storefront

**Project**: Vyzobd Premium Single-Vendor E-Commerce Storefront  
**Backend/Admin API**: `https://admin.vyzobd.com/api/storefront/v1`  
**Audit Date**: August 11, 2026  
**Auditor**: Principal Frontend Architect & Senior Next.js E-Commerce Engineer  

---

## Executive Summary

The Vyzobd storefront project is currently in a **transitional hybrid state** between an older Vite SPA prototype and a Next.js 15 App Router full-stack web application. While Next.js App Router route files were created (`app/layout.tsx`, `app/page.tsx`, `app/(storefront)/*`), legacy Vite entry points (`vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`) remain in the repository. Furthermore, `app/layout.tsx` currently renders duplicate navigation headers (`<Header />` and `<Navbar />` stacked on top of each other), creating visual clutter and conflicting navigation behaviors.

Crucially, **PHASE 4 — VYZOBD PREMIUM HOMEPAGE DESIGN** is the established canonical homepage design. However, leftover legacy components from earlier phases (such as `HeroSlider.tsx`, `FlashSaleSection.tsx`, `CategoryGrid.tsx`, `FeaturedProductsSection.tsx`) exist alongside Phase 4 components, causing component duplication and confusion.

---

## 1. Current Architecture
- **Environment & Server**: Node.js Cloud Run container with Next.js 15 dev server running on port 3000 (`next dev -p 3000 -H 0.0.0.0`).
- **Hybrid Artifacts**: The repository contains both Next.js App Router (`app/`) and Vite SPA (`vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`).
- **Styling & Design System**: Tailwind CSS v4 with custom CSS variables in `src/index.css`. Brand colors: Navy Dark `#101A25` (`primary`), Crimson Accent `#DC2B53` (`primary-hover` / `accent`). Fonts: *Plus Jakarta Sans* (sans) and *Playfair Display* (display serif).
- **Icons**: `lucide-react`.

---

## 2. Current Framework
- **Primary Target**: Next.js 15 (App Router).
- **Current State**: `package.json` scripts were updated to `next dev` and `next build`, but legacy Vite dependencies (`vite`) and Vite entry points are still present in the directory.

---

## 3. Current Routing Architecture
- **App Router Shell**: `app/layout.tsx` wraps pages with `<StorefrontProviders>`, rendering `<Header />`, `<Navbar />`, `<Footer />`, and global modals (`CartDrawer`, `QuickViewModal`, `AuthModal`, `ToastContainer`).
- **Route Pages**:
  - `/` → `app/page.tsx` (Renders `<HomePage />`)
  - `/shop` → `app/(storefront)/shop/page.tsx`
  - `/cart` → `app/(storefront)/cart/page.tsx`
  - `/search` → `app/(storefront)/search/page.tsx`
  - `/blog` → `app/(storefront)/blog/page.tsx`
  - `/products/[slug]` → `app/(storefront)/products/[slug]/page.tsx`
- **Routing Mismatch / Anti-Pattern**:
  Navigation links across components (`Header`, `Navbar`, `ProductCard`, `CategorySection`) invoke `navigateTo('shop')` or `navigateTo('product-detail', { productSlug })` from `StorefrontContext`.
  `navigateTo` updates internal React state (`currentView` and `viewParams`) without calling Next.js `router.push(...)` or updating the browser URL. When a user is on `app/page.tsx`, calling `navigateTo('shop')` changes context state, but `app/page.tsx` exclusively renders `<HomePage />`. Consequently, clicking navigation links fails to change the page or update the URL.

---

## 4. Current Homepage Architecture
- **Canonical Design**: **PHASE 4 — VYZOBD PREMIUM HOMEPAGE DESIGN** (`src/components/home/HomePage.tsx`).
- **Phase 4 Components**:
  - `HeroSection.tsx` (Premium editorial hero banner with dynamic CTA)
  - `PromoCard.tsx` (Targeted promotional cards)
  - `TrustFeatures.tsx` (Service highlights: free express delivery, 2-year warranty, secure payment)
  - `CategorySection.tsx` (Editorial category grid)
  - `ProductSection.tsx` (Featured products grid with tabbed filtering)
  - `SpecialOfferSection.tsx` (Deal of the day showcase)
  - `OfferBanner.tsx` (Full-width promotional banner)
  - `BrandSection.tsx` (Official brand grid)
  - `BlogSection.tsx` (Latest tech editorial articles)
  - `NewsletterSection.tsx` (Email subscription)
- **Status**: The Phase 4 structure is intact in `src/components/home/HomePage.tsx`. However, legacy Phase 1-3 homepage components (`HeroSlider.tsx`, `CategoryGrid.tsx`, `PromoBanners.tsx`, `FeaturedProductsSection.tsx`, `FlashSaleSection.tsx`, `BrandCarousel.tsx`, `BlogArticlesSection.tsx`, `DealsPage.tsx`) remain in `src/components/home/` and must be safely removed to eliminate dead code.

---

## 5. Current Header Architecture
- **Duplicate Header / Navbar Execution**:
  In `app/layout.tsx`:
  ```tsx
  <Header />
  <Navbar />
  ```
  - `<Header />` renders top notification bar, brand logo, search bar with category selector, wishlist, cart button, user account menu, and its own mega menu navigation bar.
  - `<Navbar />` renders a second, dark horizontal bar underneath `<Header />` with "Browse Categories", "Home", "Shop", "Deals", "Brands", "Blog", etc.
  - **Result**: The UI displays two competing headers stacked vertically.
- **Header Asset Defect**: `<Header />` references image paths `/logo.svg`, `/navLogo.png`, and `/logowhite.svg`. The `/public` directory contains only `robots.txt` and `sitemap.xml`, resulting in HTTP 404 broken image placeholders in the browser.

---

## 6. Current API Architecture
- **Client**: `src/services/apiClient.ts` configured with `baseURL = 'https://admin.vyzobd.com/api/storefront/v1'`.
- **Endpoints**: `src/services/storefrontApi.ts` implements methods for:
  - Settings (`GET /settings/public`)
  - Banners (`GET /banners`)
  - Products & Catalog (`GET /products`, `GET /products/:slug`)
  - Search & Facets (`GET /search`, `GET /search/facets`)
  - Categories & Brands (`GET /categories`, `GET /brands`)
  - Cart Management (`GET /cart`, `POST /cart/items`, `PUT /cart/items/:id`, `DELETE /cart/items/:id`, `DELETE /cart`)
  - Checkout & Orders (`POST /orders`, `POST /checkout/complete`, `GET /checkout/verify/:orderId`, `GET /orders`, `GET /orders/:id`)
  - Auth (`POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `PATCH /auth/profile`)
  - Content (`GET /blog`, `GET /blog/:slug`, `GET /pages/:slug`, `GET /faq`)
- **Fallback Mechanism**: All methods wrap Axios calls in `try...catch` blocks that fall back to mock data (`src/data/mockProducts.ts` or `localStorage`).

---

## 7. Current State Management
- **TanStack Query (`@tanstack/react-query`)**: Configured in `StorefrontProviders.tsx` for client caching and data fetching (`useQuery` / `useMutation`).
- **React Context**:
  - `StorefrontContext`: Global UI state (cart drawer, auth modal, quick view modal, search history, wishlist, active view params, toast notifications).
  - `AuthContext`: Authenticated user state, login/logout handlers, profile management.
  - `SettingsContext`: Storefront public settings (currency, tax, shipping thresholds).
- **Custom Hooks**:
  - `useCart.ts`: TanStack Query wrapper around `storefrontApi.getCart()`, `addToCart()`, `updateCartQuantity()`, `removeCartItem()`.

---

## 8. Current Authentication Architecture
- **Token Handling**: JWT token stored in `localStorage` as `vyzobd_auth_token`.
- **Axios Interceptor**: `apiClient.interceptors.request` reads `vyzobd_auth_token` from `localStorage` and attaches `Authorization: Bearer <token>`.
- **User Session**: `AuthContext` calls `storefrontApi.getCurrentUser()` on mount.
- **UI Modal**: `AuthModal.tsx` provides email/password sign-in.

---

## 9. Current Problems
1. **Routing Disconnect**: Next.js App Router URLs do not sync with internal context `navigateTo(...)` calls.
2. **Duplicate Headers**: Both `<Header />` and `<Navbar />` rendered in `app/layout.tsx`.
3. **Broken Assets**: Logo images (`logo.svg`, `navLogo.png`, `logowhite.svg`) missing from `/public`.
4. **Residual Vite Files**: `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx` coexisting with Next.js.
5. **API Response Normalization Vulnerability**: `normalizeResponse` causes runtime type errors when API envelopes return null or error structures.
6. **Dead / Legacy Components**: 8 legacy Phase 1-3 homepage components unreferenced in Phase 4.

---

## 10. Runtime Errors
### Deep-Dive Analysis: `Uncaught TypeError: Cannot read properties of undefined (reading 'reduce')`

#### Root Cause 1: Inadequate `normalizeResponse` Implementation
In `src/services/storefrontApi.ts`:
```ts
const normalizeResponse = <T>(res: any, defaultValue: T): T => {
  if (!res || !res.data) return defaultValue;
  
  // If response is the envelope { success, data, ... }
  if (res.data.hasOwnProperty('data') && res.data.hasOwnProperty('success')) {
    return res.data.data ?? defaultValue;
  }
  
  // Otherwise assume res.data is the payload itself
  return res.data ?? defaultValue;
};
```
When an API endpoint returns an error envelope such as:
```json
{
  "success": false,
  "error": { "code": "UNAUTHORIZED", "message": "Invalid token" }
}
```
1. `res.data` exists.
2. `res.data.hasOwnProperty('success')` is `true`.
3. `res.data.hasOwnProperty('data')` is `false` (or `res.data.data` is `undefined`/`null`).
4. `res.data.data ?? defaultValue`: evaluates to `defaultValue`.
5. However, if an API method bypasses `normalizeResponse` (like `getOrders` using `res.data?.data || res.data`), when `res.data.data` is `undefined`, it evaluates to `res.data` (which is `{ success: false, error: ... }`, an object).
6. When the consuming component or hook expects an array and executes `.reduce(...)`, JavaScript throws `Uncaught TypeError: Cannot read properties of undefined (reading 'reduce')` or `orders.reduce is not a function`.

#### Root Cause 2: Unguarded `items.reduce` in `calculateCartTotals`
In `src/services/storefrontApi.ts:875`:
```ts
function calculateCartTotals(items: CartItem[], couponCode?: string): Cart {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  ...
}
```
If `items` is passed as `undefined` or `null` (e.g. from an uninitialized cart state), calling `items.reduce` directly throws `Uncaught TypeError: Cannot read properties of undefined (reading 'reduce')`.

#### Corrective Architecture for Normalization
Instead of a single naive `normalizeResponse`, the API layer must use **type-safe endpoint-specific normalizers**:
- **Array Normalizer**: Guarantees a valid array (`Array.isArray(payload) ? payload : defaultValue`).
- **Object Normalizer**: Guarantees a valid non-null object (`(payload && typeof payload === 'object' && !Array.isArray(payload)) ? payload : defaultValue`).
- **Envelope Handling**: Explicitly verifies `res.data.success === true` before extracting payload.

---

## 11. Broken Routes
- **Next.js App Router Page Coverage**:
  - Missing dynamic route for blog posts: `app/(storefront)/blog/[slug]/page.tsx`.
  - Missing route for CMS pages: `app/(storefront)/pages/[slug]/page.tsx` or `app/(storefront)/about/page.tsx`, `app/(storefront)/contact/page.tsx`, `app/(storefront)/faq/page.tsx`.
  - Missing route for Account pages: `app/(storefront)/account/page.tsx`, `app/(storefront)/account/orders/page.tsx`, `app/(storefront)/account/orders/[id]/page.tsx`.
  - Missing route for Checkout: `app/(storefront)/checkout/page.tsx`.

---

## 12. Broken Assets
- `/public/logo.svg` (404)
- `/public/navLogo.png` (404)
- `/public/logowhite.svg` (404)
- **Fix**: Provide clean, modern inline SVG logo fallbacks and add official Vyzobd logo files to `/public`.

---

## 13. Duplicate UI
- **Stacked Navigation Bars**: `Header.tsx` + `Navbar.tsx` both rendered in `app/layout.tsx`.
- **Fix**: Retain `Header.tsx` as the single canonical header, absorbing category mega menu features from `Navbar.tsx`, and remove `<Navbar />` from `app/layout.tsx`.

---

## 14. API Integration Problems
- **Mismatch between expected and received payloads**:
  - `products`: expected `{ products: Product[], total: number }`.
  - `cart`: expected `{ items: CartItem[], subtotal: number, ... }`.
  - `orders`: expected `Order[]`.
- **Handling Error Envelopes**: Errors return `{ success: false, error: { code, message } }`, which must be caught and normalized cleanly without crashing UI hooks.

---

## 15. Next.js Migration Requirements
1. Remove legacy SPA files (`vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`).
2. Implement Next.js App Router routing (`Link`, `useRouter`, `usePathname`).
3. Replace context-based view switching (`currentView`) with true Next.js URL navigation.
4. Set up complete App Router file tree (`app/(storefront)/*`).
5. Ensure all interactive components maintain `'use client'` directive.

---

## 16. Files That Can Be Reused
- `src/components/home/HomePage.tsx` (Phase 4 canonical homepage)
- `src/components/home/HeroSection.tsx`
- `src/components/home/PromoCard.tsx`
- `src/components/home/TrustFeatures.tsx`
- `src/components/home/CategorySection.tsx`
- `src/components/home/ProductSection.tsx`
- `src/components/home/SpecialOfferSection.tsx`
- `src/components/home/OfferBanner.tsx`
- `src/components/home/BrandSection.tsx`
- `src/components/home/BlogSection.tsx`
- `src/components/home/NewsletterSection.tsx`
- `src/components/shop/ShopCatalogView.tsx`
- `src/components/product/ProductDetailPage.tsx`
- `src/components/cart/CartPage.tsx`
- `src/components/cart/CheckoutPage.tsx`
- `src/components/search/SearchPageView.tsx`
- `src/components/content/BlogPage.tsx`
- `src/components/content/ArticleDetailPage.tsx`
- `src/components/content/CMSPage.tsx`
- `src/components/content/FAQPage.tsx`
- `src/components/account/*` (OrdersPage, ProfilePage, AccountDashboard, etc.)
- `src/components/common/*` (CartDrawer, QuickViewModal, ToastContainer, RatingStars, ProtectedRoute)
- `src/services/apiClient.ts`
- `src/context/AuthContext.tsx`, `src/context/SettingsContext.tsx`, `src/context/StorefrontContext.tsx`
- `src/hooks/useCart.ts`
- `src/types/*` & `src/data/mockProducts.ts`

---

## 17. Files That Should Be Removed
- `vite.config.ts`
- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `src/components/home/HeroSlider.tsx` (Legacy Phase 1-3)
- `src/components/home/CategoryGrid.tsx` (Legacy Phase 1-3)
- `src/components/home/PromoBanners.tsx` (Legacy Phase 1-3)
- `src/components/home/FeaturedProductsSection.tsx` (Legacy Phase 1-3)
- `src/components/home/FlashSaleSection.tsx` (Legacy Phase 1-3)
- `src/components/home/BrandCarousel.tsx` (Legacy Phase 1-3)
- `src/components/home/BlogArticlesSection.tsx` (Legacy Phase 1-3)
- `src/components/home/DealsPage.tsx` (Legacy Phase 1-3)

---

## 18. Files That Should Be Refactored
- `app/layout.tsx`: Remove `<Navbar />`, keep single `<Header />`.
- `src/components/common/Header.tsx`: Incorporate category mega menu, use Next.js `Link` and `useRouter`, add SVG logo fallbacks.
- `src/services/storefrontApi.ts`: Refactor `normalizeResponse` into typed array/object helpers (`normalizeArrayResponse`, `normalizeObjectResponse`), add null guards on `cart.items.reduce(...)`.
- `src/context/StorefrontContext.tsx`: Wire `navigateTo` to Next.js `router.push(...)` and sync state with current pathname.

---

## 19. Risk Assessment
- **Risk 1: Navigation Breaking during Migration**: Replacing `navigateTo` with Next.js `router.push` must preserve query parameters and modal trigger state (`quickViewProduct`, `isCartOpen`).
- **Risk 2: API Downtime or Network Failure**: If `https://admin.vyzobd.com` experiences latency or CORS issues, fallback logic must seamlessly serve mock data without throwing unhandled promise rejections.
- **Risk 3: Loss of Phase 4 Styling**: Modifying layout or header components must preserve exact Phase 4 aesthetic styling (#101A25 navy, #DC2B53 crimson accent, typography).

---

## 20. Recommended Implementation Order
1. **Asset & Header Cleanup**: Add brand SVG logo assets to `/public` and remove `<Navbar />` from `app/layout.tsx`, consolidating navigation into `<Header />`.
2. **API & Normalization Hardening**: Refactor `storefrontApi.ts` with type-safe response normalizers and array safety guards.
3. **App Router Integration**: Wire Next.js `useRouter` and `Link` into `StorefrontContext` and navigation components.
4. **App Router Pages**: Complete remaining route files (`app/(storefront)/checkout/page.tsx`, `account`, `blog/[slug]`, `pages/[slug]`).
5. **Clean Legacy Code**: Remove unused Vite SPA files and legacy Phase 1-3 homepage components.
6. **Final Verification**: Run `lint_applet` and `compile_applet` to confirm a clean build.

---
*Audit Completed.*

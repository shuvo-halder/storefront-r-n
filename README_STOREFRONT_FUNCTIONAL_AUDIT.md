# Vyzobd Storefront — Comprehensive Functional Audit & Integration Plan

**Document Version:** 1.0  
**Date:** August 2026  
**Author:** Principal E-Commerce Architect, Senior Next.js Engineer & Integration Specialist  
**Status:** DRAFT / PENDING APPROVAL  

---

## 1. Executive Summary

This document presents a exhaustive functional audit and architectural evaluation of the customer-facing **Vyzobd Storefront** application. Following the standardization of the backend REST API contract (`https://admin.vyzobd.com/api/storefront/v1`), this audit identifies operational gaps, component-level bugs, state synchronization failures, and routing discrepancies across 17 distinct functional areas.

The primary objective is to transition the storefront from hybrid client-side SPA behaviors to a fully server-rendered, decoupled Next.js 15 App Router architecture without compromising or redesigning the approved Phase 4 **Vyzobd Premium Light-Theme Homepage Design**.

---

## 2. Architecture & Routing Audit

### Current Architecture State
The Vyzobd Storefront utilizes Next.js App Router (`/app`) backed by React 19, TypeScript, TailwindCSS, and TanStack Query. However, state management in `src/context/StorefrontContext.tsx` maintains a legacy `AppView` state machine (`currentView`, `viewParams`, `navigateTo()`) that mimics single-page application (SPA) client-side view switching.

### Identified Deficiencies
* **Dual Routing Mechanism:** Certain components use native Next.js `<Link>` or `router.push()`, while others invoke `navigateTo()`, leading to state desynchronization between the browser URL bar and the context state.
* **Missing Root Page Route:** The `/app/pages` directory contains a dynamic `[slug]` route (`/app/pages/[slug]`) but lacks a root `page.tsx`, causing `404 Not Found` if a user directly accesses `/pages`.
* **State Stagnation on Navigation:** Client-side route changes fail to reset scroll position, active filters, or modal states consistently across App Router transitions.

---

## 3. Header & Navigation Audit

### Current Header Implementation
Located at `src/components/common/Header.tsx`, the header component is currently styled with `sticky top-0 z-40`.

### Identified Deficiencies
* **Permanent Sticky Behavior:** The header remains fixed at the top of the viewport continuously. The requested behavior is smart scroll detection: when scrolling down, the header should translate out of view (`-translate-y-full`); when scrolling up, it should smoothly slide back in (`translate-y-0`).
* **Layout Jumps:** Transitioning from full header height to mobile header lacks layout height reservation, leading to cumulative layout shifts (CLS) on small screens.
* **Mobile Drawer Overflow:** The mobile navigation drawer in `Header.tsx` does not lock body scrolling when open, allowing background content to scroll beneath the overlay.

---

## 4. Category Navigation & MegaMenu Audit

### Current MegaMenu Implementation
Located at `src/components/common/MegaMenu.tsx` and triggered within `Header.tsx`.

### Identified Deficiencies
* **Stuck Open State:** The `Categories` hover trigger in `Header.tsx` calls `onMouseEnter={() => setIsMegaMenuOpen(true)}` but lacks a corresponding `onMouseLeave` on the parent container. Once opened, the MegaMenu remains permanently open until an outside mouse click occurs.
* **Missing Keyboard Access:** The MegaMenu cannot be closed via the `Escape` key or navigated through keyboard `Tab` focus.
* **Pathname Listener Omission:** Changing pages via category links inside `MegaMenu` does not reset `isMegaMenuOpen` if navigation completes without a page reload.

---

## 5. Blog & Content Audit

### Current Blog Structure
Routes defined in `/app/blog/page.tsx` and `/app/blog/[slug]/page.tsx`, backed by `src/components/content/BlogPage.tsx` and `src/components/content/ArticleDetailPage.tsx`.

### Identified Deficiencies
* **Navigation Handler Crash / Misroute:** In `BlogPage.tsx`, clicking an article card executes `navigateTo('article-detail', { articleSlug: ... })`. In `ArticleDetailPage.tsx`, image clicking and back buttons invoke legacy `navigateTo('blog')` instead of Next.js native `router.push('/blog')`.
* **Undefined Featured Article Exception:** If the backend returns an empty array for blog articles (`[]`), `articles[0]` resolves to `undefined`, causing property access exceptions on `featuredArticle.title` and `featuredArticle.coverImage`.
* **Schema & Metadata Missing On SSR:** Article detail page SEO meta tags and JSON-LD structured data rely on client-rendered `useEffect` instead of Next.js `generateMetadata`.

---

## 6. Homepage Category Section Audit

### Current Implementation
Located at `src/components/home/CategorySection.tsx`.

### Identified Deficiencies
* **Incorrect Route Invocation:** Clicking a category card in `CategorySection.tsx` executes `handleCategoryClick(cat.slug)`, which sets context filters and calls `navigateTo('shop')` without passing `categorySlug` in `navigateTo` parameters. This redirects users to `/products` instead of `/categories/[slug]`.
* **Grid Breakpoint Inconsistencies:** The editorial bento grid layout (`idx % 5 === 0 ? 'lg:col-span-2' : ''`) misaligns on tablet viewports (`md`), producing uneven image aspect ratios.

---

## 7. Quick View & Modal Audit

### Current Implementation
Located at `src/components/common/QuickViewModal.tsx`.

### Identified Deficiencies
* **Stale Variant/Image State:** Component state (`selectedVariantId`, `selectedImage`, `quantity`) is initialized at mount using `useState`. Opening Quick View for a second product reuses staled state from the previous product because local state is not re-initialized upon prop/context product change.
* **Focus Trap Missing:** Keyboard navigation (`Tab`, `Shift+Tab`) escapes the modal dialog into background DOM elements.
* **Scroll Locking:** Opening the Quick View modal does not disable body overflow (`overflow-hidden` on `document.body`), causing double scrollbars on desktop viewports.

---

## 8. Stock Discrepancy & Catalog Audit

### Current Implementation
Products and inventory are handled in `src/components/common/ProductCard.tsx`, `src/components/product/ProductDetail.tsx`, and `src/services/productService.ts`.

### Identified Deficiencies
* **Variant vs Parent Stock Mismatch:** `ProductCard` displays `In Stock` based on `product.stock > 0`, but selected product variants may have `variant.stock === 0`.
* **Quantity Overflow:** Users can increment product quantities beyond `product.stock` or `variant.stock` in `ProductDetail.tsx` and `QuickViewModal.tsx`.
* **Zero Inventory Handling:** Cart controls allow adding out-of-stock items when `stock <= 0` if `variantId` is undefined.

---

## 9. Authentication & User Persistence Audit

### Current Implementation
Handled by `src/context/AuthContext.tsx`, `src/services/authService.ts`, `/app/login/page.tsx`, and `/app/register/page.tsx`.

### Identified Deficiencies
* **Token Storage Disconnection:** Auth tokens are saved to `localStorage` (`vyzobd_token`), but Axios interceptors in `src/lib/api.ts` fail to attach `Authorization: Bearer <token>` automatically if the token is set post-initialization.
* **Unprotected Client Routes:** `/app/account/*` subroutes lack server-side or layout-level route protection, causing brief flashes of authenticated UI before redirecting unauthenticated users.
* **Form Validation Standard:** Login and register forms use standard state validation instead of Zod schema validation matching the standardized backend error contract (`errors: [{ field, message }]`).

---

## 10. Metadata & SEO Audit

### Current Implementation
Metadata is partially handled by `src/components/common/SEO.tsx` (a legacy React Helmet wrapper) and `/app/layout.tsx`.

### Identified Deficiencies
* **Missing Next.js Metadata API:** Pages rely on client-side DOM manipulation via `SEO.tsx` rather than Next.js native `export const metadata` or `export async function generateMetadata()`.
* **OpenGraph Image Fallbacks:** OG images default to broken or empty paths on dynamic product and category pages.
* **Canonical URL Omission:** Missing canonical URL link tags across dynamic routes (`/products/[slug]`, `/categories/[slug]`, `/blog/[slug]`).

---

## 11. API Contract & Integration Audit

### Current Implementation
Centralized in `src/lib/api.ts` and `src/services/*Service.ts`.

### Identified Deficiencies
* **Legacy Response Unwrapping:** While Phase 5 normalized service return types to `ApiResponse<T>`, secondary helper functions in `src/lib/api.ts` (`normalizeCart`, `normalizeProduct`) still inspect legacy `success: boolean` properties.
* **Pagination Metadata Dropping:** `unwrapApiResponse` strips the root `pagination` object (`{ page, limit, total, totalPages }`) returned by backend endpoints, preventing catalog and search components from rendering paginated controls accurately.
* **Error Envelope Extraction:** Error handlers extract `err.message` but ignore backend field-level validation errors (`errors: Array<{ field: string, message: string }>`).

---

## 12. Cart & Checkout Flow Audit

### Current Implementation
Handled in `src/hooks/useCart.ts`, `src/services/cartService.ts`, `src/services/checkoutService.ts`, `/app/cart/page.tsx`, and `/app/checkout/page.tsx`.

### Identified Deficiencies
* **Guest Cart Synchronization:** Adding items as a guest stores cart data in `localStorage`. Upon user login, guest cart items are overwritten rather than merged with the user's server-side cart.
* **Address Payloads Mismatch:** Checkout form in `CheckoutForm.tsx` submits address fields under non-standard property names (`shippingAddress` vs `shipping_address`), triggering backend 422 validation errors.
* **Stale Cart Totals:** Coupon discounts applied during checkout do not trigger recalculation of tax and shipping fees in real-time.

---

## 13. Search & Filtering Audit

### Current Implementation
Located in `src/components/search/SearchPage.tsx` and `src/services/searchService.ts`.

### Identified Deficiencies
* **Query Parameter Desynchronization:** Changing search queries or filters updates React state in `SearchPage.tsx` but does not push updated URL search parameters (`?q=...&category=...&minPrice=...`), breaking browser bookmarking and back button history.
* **Facet Reset Logic:** Resetting filters in the search sidebar clears text queries unexpectedly.
* **Debounce Lag:** Live header autocomplete triggers requests on every keystroke without proper debouncing cancellation.

---

## 14. Catalog & Single Product Page Audit

### Current Implementation
Located in `/app/products/page.tsx`, `/app/products/[slug]/page.tsx`, and `src/components/product/ProductDetail.tsx`.

### Identified Deficiencies
* **Variant Image Switching:** Selecting a color or size variant does not update the primary image gallery in `ProductDetail.tsx`.
* **Tab Selection Persistence:** Navigating between products retains active tab index (e.g., "Reviews" tab remains open when switching products).
* **Related Products Missing Fallback:** If `product.relatedIds` returns empty, the related products section renders blank instead of fetching top products from the same category.

---

## 15. Responsive UX & Mobile Audit

### Current Implementation
Global styling managed via TailwindCSS in `src/app/globals.css` and component-specific classes.

### Identified Deficiencies
* **Touch Target Violations:** Mobile header buttons (`Search`, `Cart`, `Wishlist`) have tap targets under `44px x 44px`.
* **Horizontal Overflow:** Long product titles and breadcrumb links cause horizontal scrolling on viewports under `360px`.
* **Sticky Bottom Bar Collisions:** On mobile viewports, the sticky "Add to Cart" bottom bar overlays the footer when scrolled to the bottom of product pages.

---

## 16. Loading, Error & Empty States Audit

### Current Implementation
Managed via `src/components/common/ViewSkeleton.tsx`, `/app/loading.tsx`, `/app/not-found.tsx`, and `/app/global-error.tsx`.

### Identified Deficiencies
* **Generic Loading Spinners:** Several views (`BlogPage`, `ArticleDetailPage`, `CartPage`) render full-screen spinner wheels instead of structural content skeletons.
* **Missing Boundary Triggers:** `global-error.tsx` fails to catch async promise rejections from client components.
* **Empty State Actions:** Empty cart and empty search results screens lack clear call-to-action (CTA) buttons linking back to active shop collections.

---

## 17. Static Data & Mock Fallback Audit

### Current Implementation
Embedded mock arrays in `src/services/contentService.ts`, `src/services/productService.ts`, and `src/context/StorefrontContext.tsx`.

### Identified Deficiencies
* **Hardcoded Sample Arrays:** Offline fallback data in `contentService.ts` contains hardcoded articles and banners that override API responses if backend endpoints return empty arrays (`data: []`).
* **Environment Variable Guards:** API services attempt requests to `localhost:3000` when `NEXT_PUBLIC_API_URL` is undefined, rather than defaulting strictly to `https://admin.vyzobd.com/api/storefront/v1`.

---

## 18. Implementation Order & Architectural Roadmap

To execute the remediation safely without introducing regression errors, work will proceed in 5 strictly ordered phases upon approval:

```
┌─────────────────────────────────────────────────────────┐
│ Phase 1: Core Navigation, Routing & Smart Header       │
│ - Smart scroll header, MegaMenu fix, App Router routing │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│ Phase 2: Catalog, Category & Quick View Fixes           │
│ - Category routing, Quick View state, Stock & Variants  │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│ Phase 3: Blog, Content & CMS Pages                      │
│ - Blog navigation, article detail fix, /pages route     │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│ Phase 4: API Contract, Search & Cart Flow               │
│ - Pagination unwrapping, Search URL sync, Guest cart    │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│ Phase 5: Auth, SEO Metadata & Mobile UX Polish          │
│ - Next.js generateMetadata, Touch targets, Error states │
└─────────────────────────────────────────────────────────┘
```

---

## 19. Complete List of Files to Modify

| File Path | Functional Purpose |
| :--- | :--- |
| `src/components/common/Header.tsx` | Implement smart scroll behavior, fix MegaMenu hover/leave, body scroll lock |
| `src/components/common/MegaMenu.tsx` | Add keyboard event listeners (`Escape`), close handlers on link click |
| `src/components/common/QuickViewModal.tsx` | Reset state on product change, add focus trap and body scroll lock |
| `src/components/home/CategorySection.tsx` | Fix category click routing to `/categories/[slug]`, fix grid breakpoints |
| `src/components/content/BlogPage.tsx` | Replace `navigateTo` with Next.js `router.push`, add empty state guards |
| `src/components/content/ArticleDetailPage.tsx` | Fix back button routing, replace legacy `navigateTo` handlers |
| `src/context/StorefrontContext.tsx` | Align `navigateTo` with Next.js App Router, sync state with URL |
| `src/lib/api.ts` | Preserve pagination metadata in `unwrapApiResponse`, handle field errors |
| `src/services/productService.ts` | Ensure stock filtering and variant stock validation |
| `src/services/contentService.ts` | Remove aggressive mock overrides, streamline error handling |
| `src/components/product/ProductDetail.tsx` | Sync variant selection with image gallery, fix quantity limits |
| `src/components/search/SearchPage.tsx` | Sync filter state with URL search params (`useSearchParams`) |
| `app/pages/page.tsx` | Create missing root pages index route to prevent 404 errors |
| `app/layout.tsx` | Implement Next.js Root Metadata API |

---

## 20. Complete List of Files NOT to Modify

| File Path / Area | Reason for Protection |
| :--- | :--- |
| `src/components/home/HeroSection.tsx` | Part of approved Phase 4 Homepage Design |
| `src/components/home/FeaturedProducts.tsx` | Part of approved Phase 4 Homepage Design |
| `src/components/home/PromoBanner.tsx` | Part of approved Phase 4 Homepage Design |
| `src/components/home/NewsletterSection.tsx` | Part of approved Phase 4 Homepage Design |
| `public/logo.svg`, `public/logowhite.svg` | Brand assets protected under Phase 4 guidelines |
| `src/app/globals.css` | Core theme design system variable definitions |
| Backend Repository / Administrative Endpoints | Out of scope — Storefront is decoupled |

---

## 21. Approval Request & Next Steps

This functional audit and implementation plan is submitted for review. No application code, styling, or service logic will be modified until this plan is formally approved.

Upon approval, implementation will begin immediately following the strict order outlined in Section 18.

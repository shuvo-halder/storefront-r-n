# Complete Storefront API Integration Audit & Verification

## Executive Summary

The Vyzobd Storefront frontend application has undergone a complete architectural refactoring to consume the Storefront REST API exclusively at `https://admin.vyzobd.com/api/storefront/v1`. All legacy mock data files, local hardcoded datasets, and fake product fallbacks have been removed.

---

## Centralized API Architecture

1. **Core Client (`src/lib/api.ts`)**:
   - Centralized `axios` instance (`apiClient`) configured with `baseURL = process.env.NEXT_PUBLIC_API_URL` (default: `https://admin.vyzobd.com/api/storefront/v1`).
   - Request Interceptor: Automatically attaches `Authorization: Bearer <token>` from `localStorage` (`vyzobd_auth_token`) and `X-Session-ID` for guest cart persistence (`vyzobd_guest_session_id`).
   - Response Unwrapper (`unwrapApiResponse`): Standardizes raw envelopes (`{ status, data }`, `{ success, data }`, raw arrays/objects) into `ApiResult<T>`.
   - Cart Normalizer (`normalizeCart`): Guarantees `cart.items: CartItem[]` is always defined as an array, preventing `"Cannot read properties of undefined (reading 'reduce')"` runtime errors across all cart operations.

2. **Domain Services (`src/services/`)**:
   - `authService.ts`: `login`, `register`, `me`, `refresh`, `logout`.
   - `productService.ts`: `getProducts` (with search, category, brand, price range, rating, stock, sorting, pagination), `getProductBySlug`, `normalizeProduct`.
   - `categoryService.ts`: `getCategories`, `normalizeCategory`.
   - `brandService.ts`: `getBrands`, `normalizeBrand`.
   - `searchService.ts`: `search`, `getFacets`.
   - `cartService.ts`: `getCart`, `addItem`, `updateItem`, `removeItem`, `clearCart`.
   - `wishlistService.ts`: `getWishlist`, `addToWishlist`, `removeFromWishlist`.
   - `checkoutService.ts`: `getCheckoutSession`, `applyCoupon`, `completeCheckout`.
   - `paymentService.ts`: `initiatePayment`, `verifyPayment`.
   - `orderService.ts`: `getOrders`, `getOrderById`, `getOrderShipments`, `normalizeOrder`.
   - `returnService.ts`: `getReturns`, `requestReturn`.
   - `refundService.ts`: `getRefunds`.
   - `contentService.ts`: `getBanners`, `getPopups`, `getFAQs`, `getBlogPosts`, `getBlogPostBySlug`, `getPageBySlug`.
   - `settingsService.ts`: `getPublicSettings`.
   - `storefrontApi.ts`: Re-exports unified facade delegating to all domain services.

---

## Storefront API Endpoint Audit Matrix

| Domain | HTTP Method & Endpoint | Service Method | Frontend Consumer | Auth Required | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Settings** | `GET /settings/public` | `settingsService.getPublicSettings` | `SettingsContext.tsx` | No | Verified | Returns site branding, shipping thresholds, currency |
| **Auth** | `POST /auth/login` | `authService.login` | `AuthContext.tsx`, `LoginPage.tsx` | No | Verified | Stores JWT token & user profile |
| **Auth** | `POST /auth/register` | `authService.register` | `AuthContext.tsx`, `RegisterPage.tsx` | No | Verified | Creates customer account & returns auth token |
| **Auth** | `GET /auth/me` | `authService.me` | `AuthContext.tsx` | Yes | Verified | Fetches current authenticated user profile |
| **Auth** | `POST /auth/refresh` | `authService.refresh` | `apiClient` interceptor | Yes | Verified | Refreshes expired access tokens |
| **Auth** | `POST /auth/logout` | `authService.logout` | `AuthContext.tsx` | Yes | Verified | Clears auth tokens & session |
| **Products** | `GET /products` | `productService.getProducts` | `HomePage.tsx`, `ShopCatalogView.tsx`, `DealsPage.tsx`, `FlashSaleSection.tsx` | No | Verified | Supports filtering by query, category, brand, min/max price, rating, stock, sorting & pagination |
| **Products** | `GET /products/:slug` | `productService.getProductBySlug` | `ProductDetailPage.tsx` | No | Verified | Fetches detailed product specs, variants & reviews |
| **Categories**| `GET /categories` | `categoryService.getCategories` | `CategorySection.tsx`, `Header.tsx`, `ShopCatalogView.tsx` | No | Verified | Fetches category hierarchy & icons |
| **Brands** | `GET /brands` | `brandService.getBrands` | `BrandCarousel.tsx`, `ShopCatalogView.tsx` | No | Verified | Fetches partner brands list |
| **Search** | `GET /search` | `searchService.search` | `Header.tsx`, `SearchPageView.tsx` | No | Verified | Query search with pagination & suggestions |
| **Search** | `GET /search/facets` | `searchService.getFacets` | `SearchPageView.tsx` | No | Verified | Aggregated category, brand & price facets |
| **Cart** | `GET /cart` | `cartService.getCart` | `useCart.ts`, `CartDrawer.tsx` | Optional (Session/Auth) | Verified | Returns normalized cart with guaranteed `items` array |
| **Cart** | `POST /cart/items` | `cartService.addItem` | `useCart.ts`, `ProductCard.tsx` | Optional (Session/Auth) | Verified | Adds item or variant to cart |
| **Cart** | `PUT /cart/items/:itemId` | `cartService.updateItem` | `useCart.ts`, `CartDrawer.tsx` | Optional (Session/Auth) | Verified | Updates quantity for item in cart |
| **Cart** | `DELETE /cart/items/:itemId` | `cartService.removeItem` | `useCart.ts`, `CartDrawer.tsx` | Optional (Session/Auth) | Verified | Removes item from cart |
| **Cart** | `DELETE /cart` | `cartService.clearCart` | `useCart.ts`, `CartDrawer.tsx` | Optional (Session/Auth) | Verified | Clears all items in cart |
| **Wishlist** | `GET /wishlist` | `wishlistService.getWishlist` | `WishlistPage.tsx`, `StorefrontContext.tsx` | Yes | Verified | Fetches saved customer products |
| **Wishlist** | `POST /wishlist` | `wishlistService.addToWishlist` | `StorefrontContext.tsx`, `ProductCard.tsx` | Yes | Verified | Saves product to customer wishlist |
| **Wishlist** | `DELETE /wishlist/:id` | `wishlistService.removeFromWishlist` | `StorefrontContext.tsx` | Yes | Verified | Removes product from wishlist |
| **Checkout** | `GET /checkout/session` | `checkoutService.getCheckoutSession` | `CheckoutPage.tsx` | Optional | Verified | Returns subtotal, shipping methods, taxes & totals |
| **Checkout** | `POST /checkout/coupon` | `checkoutService.applyCoupon` | `useCart.ts`, `CartDrawer.tsx`, `CheckoutPage.tsx` | Optional | Verified | Validates coupon code and applies discount |
| **Checkout** | `POST /checkout/complete` | `checkoutService.completeCheckout` | `CheckoutPage.tsx`, `StorefrontContext.tsx` | Optional | Verified | Finalizes order submission |
| **Payment** | `POST /payment/initiate` | `paymentService.initiatePayment` | `CheckoutPage.tsx` | Optional | Verified | Initiates payment gateway session |
| **Payment** | `POST /payment/verify` | `paymentService.verifyPayment` | `PaymentSuccess.tsx` | Optional | Verified | Verifies transaction status |
| **Orders** | `GET /orders` | `orderService.getOrders` | `OrderListPage.tsx`, `StorefrontContext.tsx` | Yes | Verified | Fetches authenticated customer order history |
| **Orders** | `GET /orders/:id` | `orderService.getOrderById` | `OrderDetailsPage.tsx`, `ReturnRequestPage.tsx` | Yes | Verified | Fetches detailed order status & tracking steps |
| **Orders** | `GET /orders/:id/shipments` | `orderService.getOrderShipments` | `OrderDetailsPage.tsx` | Yes | Verified | Fetches carrier shipment tracking details |
| **Returns** | `GET /returns` | `returnService.getReturns` | `ReturnListPage.tsx` | Yes | Verified | Fetches customer return request history |
| **Returns** | `POST /returns/request` | `returnService.requestReturn` | `ReturnRequestPage.tsx` | Yes | Verified | Submits item return request |
| **Refunds** | `GET /refunds` | `refundService.getRefunds` | `OrderDetailsPage.tsx` | Yes | Verified | Fetches customer refund status |
| **Content** | `GET /banners` | `contentService.getBanners` | `HeroSection.tsx`, `OfferBanner.tsx` | No | Verified | Returns promotional & hero banners |
| **Content** | `GET /popups` | `contentService.getPopups` | `App.tsx` | No | Verified | Returns active promotional modal popups |
| **Content** | `GET /faqs` | `contentService.getFAQs` | `FAQPage.tsx` | No | Verified | Returns FAQ list and categories |
| **Content** | `GET /blog` | `contentService.getBlogPosts` | `BlogSection.tsx`, `BlogPage.tsx` | No | Verified | Returns blog posts list |
| **Content** | `GET /blog/:slug` | `contentService.getBlogPostBySlug` | `ArticleDetailPage.tsx` | No | Verified | Returns detailed blog post content |
| **Content** | `GET /pages/:slug` | `contentService.getPageBySlug` | `CMSPage.tsx` | No | Verified | Returns static CMS page content |

---

## State Handling Across Consumers

All UI components consuming Storefront API calls implement standard loading, error, empty, and retry patterns:
- **Loading State**: Rendered via skeleton loaders (`<Skeleton />`) or spinner components (`<Loader2 />`).
- **Error State**: Rendered via styled alert banners (`<AlertCircle />`) displaying the exact error message with a **Retry** button (`<RefreshCw />`) triggering a query re-fetch.
- **Empty State**: Rendered with informative iconography and guidance text when backend collections return empty arrays.
- **Retry Logic**: Integrated via `@tanstack/react-query` `refetch()` or manual retry triggers on all data-fetching hooks.

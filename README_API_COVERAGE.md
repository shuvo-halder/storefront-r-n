# Storefront API Coverage Audit

This document provides a comprehensive audit of the storefront application against the existing `storefrontApi.ts` contract and functional requirements.

## API Coverage Table

| API Feature | Method | Endpoint (v1) | Used By | Page/Component | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `login` | `POST /auth/login` | `AuthContext` | Login, AuthModal | ✅ Used |
| | `register` | `POST /auth/register` | `AuthContext` | Register, AuthModal | ✅ Used |
| | `forgotPassword` | `POST /auth/forgot-password` | `ForgotPasswordPage` | Forgot Password | ✅ Used |
| | `updateProfile` | `PATCH /auth/profile` | `AuthContext` | Profile Page | ✅ Used |
| | `getCurrentUser` | `GET /auth/me` | `AuthContext` | App Init | ✅ Used |
| | `logout` | `POST /auth/logout` | `AuthContext` | Header / Account | ✅ Used |
| **Products** | `getProducts` | `GET /products` | `ShopCatalogView` | Shop Page | ✅ Used |
| | `getProductBySlug`| `GET /products/:slug` | `ProductDetailPage` | Product Detail | ✅ Used |
| **Categories** | `getCategories` | `GET /categories` | `StorefrontContext` | Header, Navbar | ✅ Used |
| **Brands** | `getBrands` | `GET /brands` | `StorefrontContext` | Brands Section | ✅ Used |
| **Search** | `search` | `GET /search` | `Header`, `SearchPageView` | Search Results | ✅ Used |
| | `getSearchFacets`| `GET /search/facets` | `SearchPageView` | Search Sidebar | ✅ Used |
| **Cart** | `getCart` | `GET /cart` | `useCart` (Hook) | Global | ✅ Used |
| | `addToCart` | `POST /cart/items` | `useCart` (Hook) | Product Detail | ✅ Used |
| | `updateCartItem` | `PUT /cart/items/:id` | `useCart` (Hook) | Cart Drawer | ✅ Used |
| | `removeCartItem` | `DELETE /cart/items/:id` | `useCart` (Hook) | Cart Drawer | ✅ Used |
| | `clearCart` | `DELETE /cart` | `useCart` (Hook) | Checkout | ✅ Used |
| **Wishlist** | N/A | N/A | `StorefrontContext` | Wishlist Page | ⚠️ Local Only |
| **Checkout** | `checkout` | `POST /orders` | `StorefrontContext` | N/A (Orphan) | 🛑 Unused |
| | `checkoutComplete`| `POST /checkout/complete`| `CheckoutPage` | Checkout | ✅ Used |
| **Coupons** | `applyCoupon` | `POST /cart/coupons` | `useCart` (Hook) | Cart / Checkout | ✅ Used |
| **Payments** | `verifyPayment` | `GET /checkout/verify/:id`| `PaymentSuccess` | Payment Results | ✅ Used |
| **Orders** | `getOrders` | `GET /orders` | `StorefrontContext` | Orders Page | ✅ Used |
| | `getOrderById` | `GET /orders/:id` | `OrderDetailsPage` | Order Detail | ✅ Used |
| **Shipments** | N/A | N/A | N/A | Order Detail | ⚠️ In Order |
| **Returns** | `requestReturn` | `POST /orders/:id/returns`| `ReturnRequestPage` | Return Request | ✅ Used |
| **Refunds** | `getRefundByOrderId`| `GET /orders/:id/refunds`| `OrderDetailsPage` | Order Detail | ✅ Used |
| **Settings** | `getPublicSettings`| `GET /settings/public` | `SettingsContext` | App Root | ✅ Used |
| **Banners** | `getBanners` | `GET /banners` | `HeroSection` | Home Page | ✅ Used |
| **Popups** | N/A | N/A | N/A | N/A | ❌ Missing |
| **Blog** | `getArticles` | `GET /blog` | `BlogPage` | Blog / Home | ✅ Used |
| | `getArticleBySlug`| `GET /blog/:slug` | `ArticleDetailPage` | Article Detail | ✅ Used |
| **FAQ** | `getFAQs` | `GET /faq` | `FAQPage` | FAQ Page | ✅ Used |
| **CMS Pages** | `getCMSPageBySlug`| `GET /pages/:slug` | `CMSPage` | Static Pages | ✅ Used |
| **Notifications** | N/A | N/A | `NotificationsPage`| Account | ⚠️ Mock UI |
| **SEO** | N/A | N/A | `SEO` Component | Global | ⚠️ Part of Settings |

## Key Findings

### Unused & Redundant APIs
1.  **`storefrontApi.checkout`**: This method is implemented in `storefrontApi.ts` and wrapped in `StorefrontContext.createCheckoutOrder`, but the UI (`CheckoutPage.tsx`) uses `storefrontApi.checkoutComplete` instead. This is a redundant implementation that should be consolidated.

### Missing Backend APIs (Mocked/Local)
1.  **Wishlist API**: The wishlist functionality is strictly local-storage based. While acceptable for MVP, it should ideally be synced with a user account via `/api/storefront/v1/wishlist` for multi-device support.
2.  **Notifications API**: The `NotificationsPage` allows users to toggle settings, but these changes are never persisted to a backend. No `updateNotificationPreferences` API exists.
3.  **Shipment Tracking API**: Tracking information is embedded within the `Order` object. There is no dedicated `/shipments/:trackingNumber` endpoint for real-time carrier tracking.
4.  **Popup/Promotional API**: The request mentions "Popups," but no API exists for fetching dynamic promotional popups (e.g., newsletters or exit-intent offers).

### Orphaned UI / Logic
1.  **`StorefrontContext.createCheckoutOrder`**: This function is an orphan as `CheckoutPage` handles the submission logic independently to better manage form state and payment redirects.

### Data Integrity & Response Assumptions
1.  **Search Facets**: The `getSearchFacets` method in the mock implementation makes hardcoded assumptions about price ranges (0-1000) and available categories/brands from `MOCK_PRODUCTS`. A production implementation must return facets dynamically based on the filtered result set.
2.  **Order Success Flow**: `checkoutComplete` returns a `paymentUrl` for gateway simulation. If this URL is missing, the app defaults to the `order-confirmation` page. This dual-path logic is correct but relies on the backend correctly identifying which orders require external payment.

### Duplicate API Calls
1.  **None found**: The application effectively uses React Context (`StorefrontContext`, `SettingsContext`, `AuthContext`) and TanStack Query (`useCart`) to cache data and prevent redundant calls for settings, categories, brands, and user data.

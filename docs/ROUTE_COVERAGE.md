# Route Coverage & Audit Matrix

| Route | Page Component | Associated API Endpoint(s) | Functional | Mobile | SEO | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `/` | `app/page.tsx` (`Phase4Homepage`) | `GET /settings/public`, `GET /banners`, `GET /categories`, `GET /products`, `GET /blog` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/products` | `app/products/page.tsx` (`ShopCatalogView`) | `GET /products`, `GET /categories`, `GET /brands` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/products/[slug]` | `app/products/[slug]/page.tsx` (`ProductDetailPage`) | `GET /products/slug/:slug`, `GET /products` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/categories` | `app/categories/page.tsx` (`CategoriesIndexView`) | `GET /categories` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/categories/[slug]` | `app/categories/[slug]/page.tsx` (`ShopCatalogView`) | `GET /categories`, `GET /products?category=...` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/brands` | `app/brands/page.tsx` (`BrandsIndexView`) | `GET /brands` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/brands/[slug]` | `app/brands/[slug]/page.tsx` (`ShopCatalogView`) | `GET /brands`, `GET /products?brand=...` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/search` | `app/search/page.tsx` (`SearchPageView`) | `GET /search`, `GET /search/facets` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/cart` | `app/cart/page.tsx` (`CartPage`) | `GET /cart`, `POST /cart`, `DELETE /cart` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/checkout` | `app/checkout/page.tsx` (`CheckoutPageView`) | `POST /orders`, `GET /shipping/methods`, `POST /coupons/apply` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/login` | `app/login/page.tsx` (`AuthView`) | `POST /auth/login` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/register` | `app/register/page.tsx` (`AuthView`) | `POST /auth/register` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/forgot-password` | `app/forgot-password/page.tsx` (`AuthView`) | `POST /auth/forgot-password` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/reset-password` | `app/reset-password/page.tsx` (`AuthView`) | `POST /auth/reset-password` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/account` | `app/account/page.tsx` (`AccountDashboardView`) | `GET /account/dashboard`, `GET /account/orders` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/account/profile` | `app/account/profile/page.tsx` (`AccountProfileView`) | `GET /account/profile`, `PUT /account/profile` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/account/addresses` | `app/account/addresses/page.tsx` (`AccountAddressesView`) | `GET /account/addresses`, `POST /account/addresses` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/account/wishlist` | `app/account/wishlist/page.tsx` (`AccountWishlistView`) | `GET /wishlist`, `DELETE /wishlist/:id` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/account/notifications` | `app/account/notifications/page.tsx` (`AccountNotificationsView`) | `GET /account/notifications` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/account/activity` | `app/account/activity/page.tsx` (`AccountActivityView`) | `GET /account/activity` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/account/orders` | `app/account/orders/page.tsx` (`OrderHistoryView`) | `GET /account/orders` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/account/orders/[id]` | `app/account/orders/[id]/page.tsx` (`OrderDetailView`) | `GET /account/orders/:id` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/account/orders/[id]/tracking` | `app/account/orders/[id]/tracking/page.tsx` (`OrderTrackingView`) | `GET /account/orders/:id/tracking` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/account/returns` | `app/account/returns/page.tsx` (`ReturnsPage`) | `GET /account/returns`, `POST /account/returns` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/account/refunds` | `app/account/refunds/page.tsx` (`RefundsPage`) | `GET /account/refunds`, `POST /account/refunds` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/blog` | `app/blog/page.tsx` (`BlogPage`) | `GET /blog` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` (`ArticleDetailPage`) | `GET /blog/slug/:slug` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |
| `/pages/[slug]` | `app/pages/[slug]/page.tsx` (`CMSPage`) | `GET /cms/pages/:slug` | ✅ Yes | ✅ Yes | ✅ Yes | Complete |

## Verification Criteria
1. **App Router Alignment**: Every single route corresponds to a physical `app/[route]/page.tsx` file in Next.js.
2. **Zero Fake Routes**: No `javascript:void(0)`, `#` fragments, or `currentView` fake state handlers exist in navigation elements.
3. **API Integrity**: All pages consume real backend endpoints with fallback empty, loading (skeleton), and error states.
4. **Mobile Responsiveness**: Fluid layouts with responsive padding and mobile navigation drawers.
5. **SEO & Metadata**: Proper titles, metadata declarations, and structured Schema.org breadcrumbs across detail pages.

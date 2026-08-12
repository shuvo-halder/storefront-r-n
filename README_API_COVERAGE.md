# Vyzobd Premium Storefront — API Coverage Mapping

This document maps all backend administrative REST endpoints to the corresponding client-side services and frontend UI pages or components within the **Vyzobd E-Commerce Storefront**.

---

## API Endpoints Coverage Matrix

| Endpoint | Method | Frontend Service / File | UI Component / Page | Status | Verified |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /settings/public` | GET | `settingsService.ts` | `Header`, `Footer`, `SEO` | Integrated | Yes |
| `GET /banners` | GET | `contentService.ts` | `HeroSection`, `OfferBanner` | Integrated | Yes |
| `GET /popups` | GET | `contentService.ts` | Global Context / Popups | Integrated | Yes |
| `GET /faqs` | GET | `contentService.ts` | `/faq` Page | Integrated | Yes |
| `GET /blog` | GET | `contentService.ts` | `BlogSection`, `/blog` List Page | Integrated | Yes |
| `GET /blog/:slug` | GET | `contentService.ts` | `/blog/[slug]` Details Page | Integrated | Yes |
| `GET /pages/:slug` | GET | `contentService.ts` | `/pages/[slug]` CMS Page | Integrated | Yes |
| `GET /products` | GET | `productService.ts` | `HomePage` Showcase, `ShopCatalogView` | Integrated | Yes |
| `GET /products/:slug` | GET | `productService.ts` | `ProductDetailPage` | Integrated | Yes |
| `GET /categories` | GET | `categoryService.ts` | `CategorySection`, `Navbar`, `/categories` | Integrated | Yes |
| `GET /brands` | GET | `brandService.ts` | `BrandSection`, `Navbar`, `/brands` | Integrated | Yes |
| `GET /search` | GET | `searchService.ts` | `SearchPageView`, Suggestions | Integrated | Yes |
| `GET /search/facets` | GET | `searchService.ts` | `ProductFilterSidebar` | Integrated | Yes |
| `GET /cart` | GET | `cartService.ts` | `CartDrawer`, `/cart` page | Integrated | Yes |
| `POST /cart/items` | POST | `cartService.ts` | "Add To Cart" buttons | Integrated | Yes |
| `PUT /cart/items/:itemId` | PUT | `cartService.ts` | Quantity controls on Drawer/Page | Integrated | Yes |
| `DELETE /cart/items/:itemId` | DELETE | `cartService.ts` | Delete buttons on Drawer/Page | Integrated | Yes |
| `DELETE /cart` | DELETE | `cartService.ts` | "Clear Cart" button | Integrated | Yes |
| `GET /wishlist` | GET | `wishlistService.ts` | `/account/wishlist` page | Integrated | Yes |
| `POST /wishlist/:productId` | POST | `wishlistService.ts` | Product wishlist icons | Integrated | Yes |
| `DELETE /wishlist/:productId` | DELETE | `wishlistService.ts` | Product wishlist icons | Integrated | Yes |
| `POST /auth/register` | POST | `authService.ts` | `/register` Page | Integrated | Yes |
| `POST /auth/login` | POST | `authService.ts` | `/login` Page | Integrated | Yes |
| `GET /auth/me` | GET | `authService.ts` | `AuthContext` Initialization | Integrated | Yes |
| `POST /auth/logout` | POST | `authService.ts` | Logout click triggers | Integrated | Yes |
| `GET /checkout/session` | GET | `checkoutService.ts` | `/checkout` page totals | Integrated | Yes |
| `POST /checkout/coupon` | POST | `checkoutService.ts` | Coupon form submission | Integrated | Yes |
| `POST /checkout/complete` | POST | `checkoutService.ts` | "Place Order" button | Integrated | Yes |
| `POST /payment/initiate` | POST | `paymentService.ts` | Simulator checkout gateway | Integrated | Yes |
| `POST /payment/verify` | POST | `paymentService.ts` | Verify verification screen | Integrated | Yes |
| `GET /orders` | GET | `orderService.ts` | `/account/orders` page | Integrated | Yes |
| `GET /orders/:id` | GET | `orderService.ts` | `/account/orders/[id]` page | Integrated | Yes |
| `GET /orders/:id/shipments` | GET | `orderService.ts` | Order tracking visual steps | Integrated | Yes |
| `GET /returns` | GET | `returnService.ts` | `/account/returns` page | Integrated | Yes |
| `POST /returns/request` | POST | `returnService.ts` | Return requests submission forms | Integrated | Yes |
| `GET /refunds` | GET | `refundService.ts` | Refund details components | Integrated | Yes |

---
*All mapped REST routes interact dynamically with the live production administrative suite (`https://admin.vyzobd.com`).*

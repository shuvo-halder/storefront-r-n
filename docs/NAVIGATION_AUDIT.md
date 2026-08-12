# Vyzobd Storefront Navigation Audit

## Overview
This document provides a comprehensive audit of all navigation links, buttons, and routing mechanisms across the Vyzobd storefront.

Architecture: Next.js 15 App Router
Source of Truth: `src/components/common/Header.tsx`
API Endpoint: `https://admin.vyzobd.com/api/storefront/v1`

---

## Header Structure & Navigation Systems

| Navigation Section | Component / Link Text | Target Route | Route File Exists | Rendering Status | Mobile Drawer Accessible |
|---|---|---|---|---|---|
| **Top Utility Bar** | Phone Support | `tel:+8801700000000` | N/A (Tel Protocol) | ✅ Single Unified Header | 🟢 Accessible |
| **Top Utility Bar** | Support Email | `mailto:support@vyzobd.com` | N/A (Mailto Protocol) | ✅ Single Unified Header | 🟢 Accessible |
| **Top Utility Bar** | Language Selector | Client Toggle (English) | Client State | ✅ Single Unified Header | 🟢 Accessible |
| **Top Utility Bar** | Currency Selector | Client Toggle (`BDT` / `USD`) | Client State | ✅ Single Unified Header | 🟢 Accessible |
| **Top Utility Bar** | Sign In / Profile | `/login` / `/account/profile` | `app/login/page.tsx` & `app/account/profile/page.tsx` | ✅ Single Unified Header | 🟢 Accessible |
| **Announcement Banner** | Promotion Link | `/products?deals=true` | `app/products/page.tsx` | ✅ Single Unified Header | 🟢 Accessible |
| **Main Header** | Vyzobd Logo | `/` | `app/page.tsx` | ✅ Single Unified Header | 🟢 Accessible |
| **Main Header** | Category Selector | `/categories/[slug]` or Search filter | `app/categories/[slug]/page.tsx` | ✅ Dynamic API Categories | 🟢 Accessible |
| **Main Header** | Large Search Bar | `/search?q=<query>` | `app/search/page.tsx` | ✅ Real `useRouter` submit | 🟢 Mobile Search Input |
| **Main Header** | Account Menu | `/account/profile` & `/account/orders` | `app/account/profile/page.tsx` & `app/account/orders/page.tsx` | ✅ Auth State Integrated | 🟢 Accessible |
| **Main Header** | Wishlist Button | `/account/wishlist` | `app/account/wishlist/page.tsx` | ✅ Real State Count | 🟢 Accessible |
| **Main Header** | Cart Button | Opens Cart Drawer / `/cart` | `app/cart/page.tsx` | ✅ Real State Total | 🟢 Accessible |
| **Primary Navigation** | Home | `/` | `app/page.tsx` | ✅ Next.js `<Link>` | 🟢 Accessible |
| **Primary Navigation** | Shop | `/products` | `app/products/page.tsx` | ✅ Next.js `<Link>` | 🟢 Accessible |
| **Primary Navigation** | Categories (MegaMenu) | `/categories` | `app/categories/page.tsx` | ✅ Dynamic API Categories | 🟢 Accessible |
| **Primary Navigation** | Category Item | `/categories/[slug]` | `app/categories/[slug]/page.tsx` | ✅ Dynamic API Categories | 🟢 Accessible |
| **Primary Navigation** | Brands | `/brands` | `app/brands/page.tsx` | ✅ Next.js `<Link>` | 🟢 Accessible |
| **Primary Navigation** | Deals | `/products?deals=true` | `app/products/page.tsx` | ✅ Next.js `<Link>` | 🟢 Accessible |
| **Primary Navigation** | New Arrivals | `/products?sort=newest` | `app/products/page.tsx` | ✅ Next.js `<Link>` | 🟢 Accessible |
| **Primary Navigation** | Blog | `/blog` | `app/blog/page.tsx` | ✅ Next.js `<Link>` | 🟢 Accessible |
| **Primary Navigation** | About | `/pages/about` | `app/pages/about/page.tsx` | ✅ Next.js `<Link>` | 🟢 Accessible |
| **Primary Navigation** | Contact | `/pages/contact` | `app/pages/contact/page.tsx` | ✅ Next.js `<Link>` | 🟢 Accessible |
| **Primary Navigation** | Flash Deals Promo | `/products?deals=true` | `app/products/page.tsx` | ✅ Next.js `<Link>` | 🟢 Accessible |
| **Footer Links** | Privacy Policy | `/pages/privacy` | `app/pages/privacy/page.tsx` | ✅ Next.js `<Link>` | 🟢 Accessible |
| **Footer Links** | Terms & Conditions | `/pages/terms` | `app/pages/terms/page.tsx` | ✅ Next.js `<Link>` | 🟢 Accessible |
| **Footer Links** | Help & FAQ | `/faq` | `app/faq/page.tsx` | ✅ Next.js `<Link>` | 🟢 Accessible |

---

## Verification Summary

1. **Header Coherence**:
   - Competing/duplicate legacy navigation bar removed completely.
   - `src/components/common/Header.tsx` is the single source of truth for header and primary navigation.
   - Root `app/layout.tsx` renders ONLY `<Header />` and `<Footer />`.

2. **Route Integrity**:
   - All links use Next.js `Link` components or `router.push()` from `next/navigation`.
   - Zero `currentView` SPA state parameter navigation remains in the header.
   - All App Router route handlers exist under `app/`.

3. **Dynamic API Integration**:
   - Categories in search selector, MegaMenu, and mobile drawer are fetched dynamically from `GET /api/storefront/v1/categories`.
   - Search auto-complete fetches live product results from `GET /api/storefront/v1/search`.

4. **Mobile Responsiveness**:
   - Slide-out mobile drawer contains full navigation hierarchy, user profile status, top categories, and quick links without horizontal overflow.

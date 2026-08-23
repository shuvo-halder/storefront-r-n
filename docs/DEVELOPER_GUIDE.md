# Vyzobd Storefront — Developer Guide

This guide outlines engineering patterns, state management architecture, API layer integration, testing conventions, and UI/UX standards for developers contributing to the **Vyzobd Storefront**.

---

## Table of Contents
1. [Architecture & Component Boundaries](#1-architecture--component-boundaries)
2. [Data Fetching & API Service Layer](#2-data-fetching--api-service-layer)
3. [State Management Patterns](#3-state-management-patterns)
4. [Routing & Navigation Conventions](#4-routing--navigation-conventions)
5. [Forms & Validation](#5-forms--validation)
6. [SEO, Structured Data & Metadata](#6-seo-structured-data--metadata)
7. [Analytics & Enhanced E-Commerce Tracking](#7-analytics--enhanced-e-commerce-tracking)
8. [Styling & UI Guidelines](#8-styling--ui-guidelines)
9. [Error Handling & Resiliency](#9-error-handling--resiliency)
10. [Local Development & QA Checklist](#10-local-development--qa-checklist)

---

## 1. Architecture & Component Boundaries

### Next.js 16 App Router Philosophy
- **Server Components by Default**: All route pages (`app/**/page.tsx`) and static wrappers are Server Components. They do not ship JavaScript to the client unless interactivity is required.
- **Client Components at the Leaves**: Mark components with `'use client'` strictly when using React hooks (`useState`, `useEffect`, `useContext`), browser APIs (`window`, `localStorage`), or event handlers (`onClick`, `onChange`).
- **Composition Pattern**:
  ```tsx
  // Server Component: app/shop/page.tsx
  import { getPublicSiteSettings } from '@/lib/seo';
  import { ShopPageView } from '@/components/shop/ShopPageView';

  export default async function ShopPage() {
    return <ShopPageView />;
  }
  ```

---

## 2. Data Fetching & API Service Layer

### Service Layer Structure (`src/services/`)
All backend HTTP calls are encapsulated inside dedicated service modules utilizing the centralized `apiClient` (`src/lib/api.ts`).

- `authService.ts`: Customer registration, login, token refresh, OTP, social auth.
- `catalogService.ts`: Products, categories, brands, collections, search autocomplete.
- `orderService.ts`: Cart checkout submission, order tracking, customer order history.
- `contentService.ts`: Banners, blogs, FAQs, custom CMS pages, customer reviews.
- `settingsService.ts`: Store branding, SEO tags, shipping fees, tax policies, analytics IDs.

### Caching & In-Flight Deduplication Pattern
For high-frequency endpoints (e.g. `settings/public`, `/banners`), services implement in-flight promise deduplication and time-to-live (TTL) in-memory caching:

```ts
let cachedData: DataType | null = null;
let cacheTimestamp = 0;
let inFlightPromise: Promise<ApiResponse<DataType>> | null = null;
const CACHE_TTL_MS = 30000; // 30 seconds

export const customService = {
  getData: async (bypassCache = false): Promise<ApiResponse<DataType>> => {
    const now = Date.now();
    if (!bypassCache && cachedData && (now - cacheTimestamp < CACHE_TTL_MS)) {
      return { status: 'success', message: null, data: cachedData };
    }

    if (!bypassCache && inFlightPromise) {
      return inFlightPromise;
    }

    const fetchPromise = (async () => {
      try {
        const res = await apiClient.get('/endpoint');
        const unwrapped = unwrapApiResponse<DataType>(res);
        cachedData = unwrapped.data;
        cacheTimestamp = Date.now();
        return unwrapped;
      } finally {
        inFlightPromise = null;
      }
    })();

    inFlightPromise = fetchPromise;
    return fetchPromise;
  }
};
```

---

## 3. State Management Patterns

Global state is managed via specialized React Contexts wrapped in `StorefrontProviders`:

```text
StorefrontProviders
├── SettingsProvider   (Store branding, currency, contact info, shipping rules)
├── AuthProvider       (Customer session, profile, JWT token management)
├── CartProvider       (Cart items, quantity, coupons, subtotal, shipping meter)
├── WishlistProvider   (Persisted saved items with optimistic UI)
├── QuickViewProvider  (Modal product preview state)
└── ToastProvider      (Global notifications, error toasts, copy confirmations)
```

### Accessing Context in Components
Use the dedicated hooks:
```tsx
import { useCart } from '@/hooks/useCart';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';

export function CartWidget() {
  const { cart, openCartDrawer } = useCart();
  const { publicSettings } = useSettings();
  const { user, isAuthenticated } = useAuth();
  // ...
}
```

---

## 4. Routing & Navigation Conventions

| Route | Purpose | Component |
| :--- | :--- | :--- |
| `/` | Homepage | `src/components/home/HomePage.tsx` |
| `/shop` | Full catalog browsing & multi-filter grid | `src/components/shop/ShopPageView.tsx` |
| `/products/[slug]` | Product details, variants, reviews, related items | `src/components/product/ProductDetailPage.tsx` |
| `/categories` | Category catalog | `src/components/shop/CategoriesIndexView.tsx` |
| `/categories/[slug]` | Category-filtered product list | `src/components/shop/CategoryPageView.tsx` |
| `/brands` | Brand directory index | `src/components/brands/BrandsIndexView.tsx` |
| `/brands/[slug]` | Brand-filtered product list | `src/components/brands/BrandPageView.tsx` |
| `/search` | Full-text catalog search | `src/components/search/SearchPageView.tsx` |
| `/cart` | Full-page shopping cart | `src/components/cart/CartPage.tsx` |
| `/checkout` | Order placement & payment gateway selection | `src/components/cart/CheckoutPage.tsx` |
| `/account/*` | Customer dashboard, orders, profile, address book | `src/components/account/AccountDashboard.tsx` |
| `/blog` | CMS blog articles & category filter | `src/components/blog/BlogIndexPage.tsx` |

---

## 5. Forms & Validation

All interactive customer input forms use **React Hook Form** paired with **Zod** schema validation for type safety and instant validation feedback.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phoneNumber: z.string().regex(/^(\+8801|01)[3-9]\d{8}$/, 'Valid Bangladeshi phone number required'),
  address: z.string().min(5, 'Full street address is required'),
  city: z.string().min(2, 'City/District is required'),
  deliveryZone: z.enum(['inside_dhaka', 'outside_dhaka']),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;
```

---

## 6. SEO, Structured Data & Metadata

Metadata is dynamically generated on the server using Next.js `generateMetadata`:

```tsx
// app/products/[slug]/page.tsx
import { Metadata } from 'next';
import { getProductMetadata, generateProductJsonLd } from '@/lib/seo';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return await getProductMetadata(slug);
}
```

### JSON-LD Structured Data
Product pages inject rich Google-compatible Schema.org JSON-LD structured data:
- `Product` (Name, SKU, Price, Currency, Availability, Brand, Rating, Reviews)
- `BreadcrumbList` (Home > Category > Product)
- `Organization` (Logo, Contact, Social Profiles)

---

## 7. Analytics & Enhanced E-Commerce Tracking

The storefront includes built-in Google Analytics 4 (GA4) ecommerce event instrumentation located in `src/utils/analytics.ts`:

| Action | Function | Trigger |
| :--- | :--- | :--- |
| **View Item** | `trackGA4ViewItem(product, currency)` | Product Detail Page load |
| **View Item List** | `trackGA4ViewItemList(listId, listName, products)` | Search results, category/brand pages, related products |
| **Add to Cart** | `trackGA4AddToCart(product, quantity, variant)` | Add to Cart button clicked |
| **Remove from Cart** | `trackGA4RemoveFromCart(product, quantity)` | Item removed from cart |
| **Begin Checkout** | `trackGA4BeginCheckout(items, total, currency)` | Checkout page mount / customer entry |
| **Add Shipping Info** | `trackGA4AddShippingInfo(items, total, tier, currency)` | Shipping zone selected |
| **Add Payment Info** | `trackGA4AddPaymentInfo(items, total, type, currency)` | Payment method selected (COD / SSLCommerz) |
| **Purchase** | `trackGA4Purchase(order, currency)` | Order confirmation / Payment success |

---

## 8. Styling & UI Guidelines

1. **Tailwind CSS v4 Utility First**:
   - Primary Brand Color: `#DC2B53` (Accent / CTA)
   - Dark Neutral: `#111827` / `#0F172A`
   - Borders: `#E5E7EB` / `#F3F4F6`
   - Light Neutral Surface: `#F9FAFB`
2. **Icons**: Exclusively imported from `lucide-react`. Never create inline SVG icons manually.
3. **Animations**: Motion (Framer Motion) imported from `motion/react`.
4. **Interactive States**: Every button and link must include `:hover`, `:focus-visible`, and `:disabled` states.

---

## 9. Error Handling & Resiliency

1. **API Fallbacks**: When backend endpoints return `null` or are unreachable, components fall back gracefully to configured defaults rather than throwing runtime exceptions.
2. **Global Error Boundaries**: `app/global-error.tsx` and `app/not-found.tsx` catch uncaught client and routing errors.
3. **Empty States**: If catalogs, search results, or orders are empty, render clean informative illustrations with clear call-to-action buttons.

---

## 10. Local Development & QA Checklist

Before committing changes, execute the full QA validation pipeline:

```bash
# 1. Type check
npx tsc --noEmit

# 2. Lint check
npm run lint

# 3. Production build compilation
npm run build
```

### Pre-Release Verification Checklist
- [ ] Mobile responsive layout tested at 320px, 375px, and 414px viewports.
- [ ] No layout shift (CLS) during initial page load and hero banner hydration.
- [ ] Form validations display clear error messages for invalid inputs.
- [ ] SSLCommerz and COD payment paths calculate delivery fees correctly (Inside Dhaka: ৳60, Outside Dhaka: ৳120).
- [ ] Free shipping progress meter reflects dynamic threshold (৳3000).

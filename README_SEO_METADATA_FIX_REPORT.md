# SEO & Dynamic Metadata Fix Report

## Overview
This report documents the implementation of dynamic SEO metadata across the Vyzobd Storefront using the Next.js Metadata API (`generateMetadata()`). All metadata is dynamically generated from real backend storefront API endpoints without hardcoded entity titles, supporting OpenGraph, Twitter Cards, canonical URLs, dynamic site names, and missing entity / 404 fallbacks.

---

## 1. Source of Truth API Integration
All metadata generation queries live backend endpoints:
- **Public Store Settings**: `GET /api/storefront/v1/settings/public`
- **Products**: `GET /api/storefront/v1/products/:slug`
- **Categories**: `GET /api/storefront/v1/categories`
- **Brands**: `GET /api/storefront/v1/brands`
- **Blog Articles**: `GET /api/storefront/v1/blog/:slug`
- **CMS Pages**: `GET /api/storefront/v1/pages/:slug`

---

## 2. Shared SEO Helper Module (`/src/lib/seo.ts`)
A dedicated module provides dynamic metadata builders:
- `getHomepageMetadata()`
- `getProductsListingMetadata()`
- `getProductDetailMetadata(slug)`
- `getCategoryDetailMetadata(slug)`
- `getBrandDetailMetadata(slug)`
- `getBlogDetailMetadata(slug)`
- `getCMSPageMetadata(slug)`
- `getSearchPageMetadata(query)`
- `getCategoriesIndexMetadata()`
- `getBrandsIndexMetadata()`
- `getBlogIndexMetadata()`

---

## 3. Standard Title Formatting & 404 Handling
Titles follow the required format using dynamic site name (`siteName` from backend settings, defaulting to `Vyzobd`):
- **Homepage**: `Vyzobd Store` (or configured site title from settings)
- **Product Page**: `{Product Name} | Vyzobd`
- **Category Page**: `{Category Name} | Vyzobd`
- **Brand Page**: `{Brand Name} | Vyzobd`
- **Blog Article**: `{Article Title} | Vyzobd`
- **CMS Page**: `{Page Title} | Vyzobd`
- **Search Page**: `Search results for "{Query}" | Vyzobd`
- **Missing / 404 Entity**: `{Entity} Not Found | Vyzobd` (e.g., `Product Not Found | Vyzobd`, `Category Not Found | Vyzobd`, `Article Not Found | Vyzobd`)

---

## 4. Metadata API Attributes Included
For each route, the server produces:
1. `title`: Entity-specific formatted title.
2. `description`: Entity SEO description or truncated body excerpt (160 chars max).
3. `keywords`: Dynamic tags or configured SEO meta keywords.
4. `openGraph`: `title`, `description`, `url`, `siteName`, `images` (primary entity image or default favicon), `type`.
5. `twitter`: `card: 'summary_large_image'`, `title`, `description`, `images`.
6. `alternates.canonical`: Fully qualified canonical URL.
7. `icons`: Favicon URL dynamically fetched from public branding settings.

---

## 5. Verification & Testing Results
Verified direct URL access and server-rendered `<head>` tags via HTTP requests (without client-side navigation dependency):
- `GET /` -> `<title>Vyzobd Store</title>`
- `GET /products` -> `<title>All Products | Vyzobd</title>`
- `GET /products/qwertyuikol-k31m` -> `<title>QWERTYUIKOL | Vyzobd</title>`
- `GET /products/missing-product` -> `<title>Product Not Found | Vyzobd</title>`
- `GET /categories/electronics` -> `<title>Electronics | Vyzobd</title>`
- `GET /categories/missing-cat` -> `<title>Category Not Found | Vyzobd</title>`
- `GET /brands/doris-mcclain-5stj` -> `<title>Doris Mcclain | Vyzobd</title>`
- `GET /blog/wertyui` -> `<title>wertyui | Vyzobd</title>`
- `GET /search?q=audio` -> `<title>Search results for "audio" | Vyzobd</title>`

---

## 6. Build & Lint Verification
- **`lint_applet` (`tsc --noEmit`)**: Passed with 0 errors.
- **`compile_applet` (`next build`)**: Passed with 0 errors.

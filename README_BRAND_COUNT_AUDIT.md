# Brand Product Count Implementation Audit

**Audit Date**: August 13, 2026  
**Auditor**: Storefront Engineering QA  
**Target Scope**: Brand Product Count Audit across API endpoints and Storefront UI views  

---

## Audit Findings & Questions Breakdown

### 1. Does the `/brands` API response already contain a product count field?
**No.** Direct inspection of `GET /api/storefront/v1/brands` returns brand objects containing only:
- `id`
- `name`
- `slug`
- `logoUrl`
- `description`
- `seoTitle`
- `seoDescription`
- `ogImage`
- `website`

None of `productCount`, `productsCount`, `count`, or `itemCount` are present in `GET /brands`.

### 2. Inspect the actual TypeScript Brand type used by the storefront.
In `/src/types/storefront.ts`:
```ts
export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo: string;
  description?: string;
  featuredProductCount?: number;
  itemCount?: number;
}
```
In `/src/services/brandService.ts`:
```ts
export function normalizeBrand(raw: any): Brand {
  ...
  featuredProductCount: raw.featuredProductCount ? Number(raw.featuredProductCount) : undefined,
  itemCount: raw.itemCount ? Number(raw.itemCount) : undefined
}
```
Because `raw.itemCount` is missing from `GET /brands`, `brand.itemCount` is set to `undefined`.

### 3. Check the current `/brands` page (`/app/brands/page.tsx`).
In `/src/components/shop/BrandsIndexView.tsx` (lines 142–145):
```tsx
<div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-primary">
  <span>{brand.itemCount} Products</span>
  <ChevronRight size={16} className="text-slate-400 group-hover:text-primary" />
</div>
```
Because `brand.itemCount` is `undefined`, the card renders ` Products` with a blank number slot.

### 4. Check the Homepage Brands section (`BrandSection.tsx`).
In `/src/components/home/BrandSection.tsx` (lines 71–73):
```tsx
<Badge variant="secondary" size="sm" className="mt-2">
  {brand.itemCount} Items
</Badge>
```
Because `brand.itemCount` is `undefined`, the badge renders ` Items` with a missing count value.

### 5. Check `/brands/[slug]` (`/app/brands/[slug]/page.tsx`).
In `/app/brands/[slug]/page.tsx` rendering `/src/components/shop/ShopCatalogView.tsx`:
- Navigating to `/brands/[slug]` triggers `storefrontApi.getProducts({ brandSlug: slug, ... })`.
- This calls `GET /api/storefront/v1/products?brand=<slug>`.
- The response returns `meta.total` (e.g. `total: 1` for `doris-mcclain-5stj`).
- `ShopCatalogView` displays this total accurately in the catalog header (`1–1 of 1`).

### 6. Is any product count currently displayed for brands?
- **Homepage Brand Section (`BrandSection.tsx`)**: Renders ` Items` (missing numeric count).
- **Brands Directory (`BrandsIndexView.tsx` at `/brands`)**: Renders ` Products` (missing numeric count).
- **Brand Catalog Detail (`ShopCatalogView.tsx` at `/brands/[slug]`)**: Displays real dynamic total (`1–1 of 1`).

### 7. If a count is displayed, determine whether it comes from real backend API data, frontend calculation, or hardcoded/static data.
- **Homepage & Brands Index Page**: Static / Undefined because `GET /brands` payload lacks product counts.
- **Brand Detail Page (`/brands/[slug]`)**: Real backend API data via `meta.total` from `GET /products?brand=<slug>`.

### 8. Inspect existing APIs that may provide accurate counts.
`GET /api/storefront/v1/search/facets` provides `data.brands` array containing exact product counts for each brand:
```json
"brands": [
  {
    "id": "67bdf656-719d-460d-b89d-deabc0fa4026",
    "name": "Doris Mcclain",
    "slug": "doris-mcclain-5stj",
    "count": 1
  },
  ...
]
```
Additionally, `GET /api/storefront/v1/products?brand=<slug>` returns `meta.total`.

### 9. Page size caution.
Product counts must NOT be computed by counting items in page 1 of `GET /products?brand=<slug>`. `GET /search/facets` provides the true total catalog count for all brands in a single request.

### 10. Recommend the smallest clean solution.
In `brandService.getBrands()`, execute `GET /search/facets` concurrently with `GET /brands` via `Promise.allSettled`. Merge `facet.count` into `brand.itemCount` matching by `slug` (or `id`), defaulting to `0` if no matching facet is found.

---

BRAND COUNT IN /brands API:
NOT AVAILABLE

CURRENT UI:
STATIC

EXISTING API CAN PROVIDE ACCURATE COUNT:
YES

BACKEND CHANGE REQUIRED:
NO

RECOMMENDED SOLUTION:
In brandService.getBrands(), fetch GET /search/facets alongside GET /brands using Promise.allSettled and merge facet.count into brand.itemCount matching by brand slug or id.

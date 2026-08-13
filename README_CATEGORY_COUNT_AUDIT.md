# Category Product Count Implementation Audit

**Audit Date**: August 13, 2026  
**Auditor**: Storefront Engineering QA  
**Target Scope**: Category Product Count Audit across API endpoints and Storefront UI views  

---

## Audit Findings & Questions Breakdown

### 1. Does the category API response already contain a product count field?
**No.** Direct inspection of `GET /api/storefront/v1/categories` returns category objects containing only:
- `id`
- `name`
- `slug`
- `description`
- `image`
- `icon`
- `parentId`
- `seoTitle`
- `seoDescription`
- `ogImage`
- `children`

There is no `productCount`, `productsCount`, `count`, or `itemCount` field provided in `GET /categories`.

### 2. Inspect the actual TypeScript category type used by the storefront.
In `/src/types/storefront.ts`:
```ts
export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  itemCount: number;
  iconName?: string;
  subcategories?: { id: string; name: string; slug: string }[];
}
```
In `/src/services/categoryService.ts`:
```ts
itemCount: Number(raw.itemCount ?? raw.productCount ?? raw.count ?? 0)
```
Because none of `itemCount`, `productCount`, or `count` exist in the raw response of `GET /categories`, `itemCount` evaluates to `0` for every category object.

### 3. Check the current Shop By Category section (Homepage).
In `/src/components/home/CategoryGrid.tsx` (lines 64–66):
```tsx
<p className="text-[11px] font-medium text-slate-400 mt-0.5">
  {cat.itemCount} Items
</p>
```
Because `cat.itemCount` is `0`, the homepage category cards display **"0 Items"** for every department.

### 4. Check the `/categories` page.
In `/src/components/shop/CategoriesIndexView.tsx` (lines 132–134):
```tsx
<div className="absolute top-3 right-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-full border border-white/10">
  {cat.itemCount} Items
</div>
```
Because `cat.itemCount` is `0`, all category cards on the `/categories` index view display **"0 Items"**.

### 5. Check `/categories/[slug]`.
In `/app/categories/[slug]/page.tsx` rendering `/src/components/shop/ShopCatalogView.tsx`:
- When navigating to `/categories/[slug]`, `ShopCatalogView` fetches products using `storefrontApi.getProducts({ categorySlug: slug, ... })`.
- This calls `GET /api/storefront/v1/products?category=<slug>`.
- The response returns `meta.total` (e.g., `total: 1` for Electronics, `total: 2` for Home & Appliances).
- `ShopCatalogView` displays this total accurately in the catalog header bar (`1–1 of 1` or `1–2 of 2`).

### 6. Is any product count currently displayed?
- **Homepage (`CategoryGrid.tsx`)**: Displays "0 Items" for all categories.
- **Category Index (`CategoriesIndexView.tsx`)**: Displays "0 Items" for all categories.
- **Category Detail (`ShopCatalogView.tsx` at `/categories/[slug]`)**: Displays real dynamic count (e.g. "1–1 of 1").

### 7. If a count is displayed, determine whether it comes from the real backend API or is calculated/hardcoded on the frontend.
- **Homepage & Category Index**: Displays "0 Items" due to `cat.itemCount` defaulting to `0` on the frontend because `GET /categories` lacks count data.
- **Category Detail Page (`/categories/[slug]`)**: Comes dynamically from the backend `meta.total` field returned by `GET /api/storefront/v1/products?category=<slug>`.

### 8. If the API does NOT provide product count, determine whether an existing API can provide an accurate count using `/products?category=<slug>`, `/search`, or `/search/facets`.
**Yes.** Existing endpoints can provide accurate counts:
1. `GET /api/storefront/v1/search/facets` returns a `categories` array where each item contains `id`, `name`, `slug`, and `count` (exact total product count per category).
2. `GET /api/storefront/v1/products?category=<slug>` returns `meta.total` representing the total product count for that category.

### 9. Determine exactly what backend data is missing if an accurate category product count cannot currently be obtained.
The `GET /api/storefront/v1/categories` endpoint is missing a `productCount` (or `itemCount` / `count`) property on category objects in its returned payload.

### 10. Recommend the smallest clean solution.
- **Without Backend Modifications (Client-Side Bridge)**: In `storefrontApi.getCategories()`, execute `GET /search/facets` alongside `GET /categories` and merge the `facet.count` into `category.itemCount` by matching `slug` or `id`.
- **With Backend Modification (Ideal)**: Update `GET /api/storefront/v1/categories` to include `productCount` directly on each category object.

---

CATEGORY COUNT API:
NOT AVAILABLE

CURRENT UI:
STATIC

BACKEND CHANGE REQUIRED:
NO

RECOMMENDED SOLUTION:
In storefrontApi.getCategories(), fetch GET /search/facets alongside GET /categories and merge the facet category count into category.itemCount by matching category slug.

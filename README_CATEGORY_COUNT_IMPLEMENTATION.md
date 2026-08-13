# Category Product Count Dynamic Data Integration Report

**Implementation Date**: August 13, 2026  
**Developer Role**: Storefront Integration Engineer  
**Task Scope**: Phase 7 — Step 2: Dynamic Category Product Count  

---

## 1. Executive Summary

Category product counts are now dynamically integrated across all storefront UI components (including the Homepage "Shop by Category" / "Top Categories" sections and the `/categories` index page). Category item counts are populated in real-time by combining response data from `GET /categories` and `GET /search/facets` without requiring any backend code changes or extra server endpoints.

---

## 2. Files Changed

1. `/src/services/categoryService.ts`:
   - Updated `normalizeCategory` signature to accept optional `facetCountMap` containing `bySlug` and `byId` lookup tables.
   - Updated `getCategories()` to fetch `GET /categories` and `GET /search/facets` concurrently via `Promise.allSettled`.
   - Merged `facet.count` into `category.itemCount` using primary `slug` matching (case-insensitive) and secondary `id` matching.

---

## 3. API Endpoints Used

- `GET /api/storefront/v1/categories`: Retrieves full category hierarchy, metadata, images, and descriptions.
- `GET /api/storefront/v1/search/facets`: Retrieves category facet counts (`count` per category `slug` / `id`).

---

## 4. Merge Strategy

1. **Parallel Fetching**: Both `GET /categories` and `GET /search/facets` are executed simultaneously using `Promise.allSettled` to minimize latency.
2. **Lookup Map Construction**:
   - `bySlugMap`: Maps lowercased category `slug` to `facet.count`.
   - `byIdMap`: Maps category `id` to `facet.count`.
3. **Property Mapping**:
   - Checks if `raw` response already includes `itemCount`, `productCount`, or `count`.
   - If not, queries `bySlugMap` using `category.slug.toLowerCase()`.
   - If no match in `bySlugMap`, queries `byIdMap` using `category.id`.
   - Sets `category.itemCount = matchedCount`.

---

## 5. Fallback Behavior

- If a category is not present in the facet response (0 items in inventory), `category.itemCount` safely defaults to `0`.
- Displayed UI labels automatically output `0 Items` / `0 Units` cleanly without runtime exceptions or broken layouts.
- If `GET /search/facets` fails or is delayed, `Promise.allSettled` guarantees `GET /categories` continues to resolve cleanly with fallback `itemCount: 0`.

---

## 6. UI Impact

- **Homepage ("Top Categories" & "Shop by Category")**: Displays real live product counts (e.g., `1 Units`, `2 Units`) matching backend database records.
- **Category Index (`/categories`)**: Category cards automatically render accurate item badges (e.g., `1 Items`, `2 Items`).

---

## 7. Validation Results

- **TypeScript Check (`tsc --noEmit`)**: PASSED (0 errors)
- **ESLint**: PASSED (0 warnings)
- **Production Build (`next build`)**: PASSED (Compiled successfully)

# Homepage Banner & Hero Implementation Audit

**Audit Date**: August 13, 2026  
**Auditor**: Storefront Engineering QA  
**Target Component**: Homepage Hero & Promo Banner Section (`HeroSection.tsx`, `PromoCard.tsx`)  
**Backend Endpoint**: `GET /api/storefront/v1/banners` (`GET /banners`)  

---

## 10-Point Audit Checklist

### 1. Is the homepage banner coming from the real backend API?
**Yes.** `HeroSection.tsx` executes real asynchronous API calls via `storefrontApi.getBanners('hero')` and `storefrontApi.getBanners('promo')` on mount. These delegate to `contentService.getBanners()` which performs an HTTP GET request to `/banners` using the configured API client (`GET /api/storefront/v1/banners`).

### 2. Which file fetches the banners?
- **Service Layer**: `/src/services/contentService.ts` (`getBanners` method) invoked via `/src/services/storefrontApi.ts`.
- **UI Component Layer**: `/src/components/home/HeroSection.tsx` inside a React `useEffect` hook.

### 3. Which component renders them?
- `/src/components/home/HeroSection.tsx` (renders main hero slide banner, pagination controls, and indicators).
- `/src/components/home/PromoCard.tsx` (renders secondary promotional card banners alongside the hero).

### 4. Is any banner content hardcoded/dummy?
No default display data is hardcoded. Hardcoded fallback objects (`fallbackHero` and `fallbackPromos`) exist in `/src/components/home/HeroSection.tsx`, but they are used **only** as fallback defaults if the API endpoint returns an empty array or encounters a network error. When backend API data is returned, it dynamically replaces all fallback content.

### 5. Are these backend fields being used correctly?
- **`title`**: **Yes** — Rendered dynamically in `HeroSection.tsx` (`activeHero.title`) and `PromoCard.tsx` (`banner.title`).
- **`desktopImage` / `mobileImage`**: **Partially** — The frontend `Banner` type and rendering components use `banner.image` for all viewports. Separate `mobileImage` switching is not implemented on mobile.
- **`ctaText`**: **Partially** — The frontend maps `buttonText` (`activeHero.buttonText` / `banner.buttonText`) with a fallback default string (`Shop Flagship Gear`).
- **`linkUrl`**: **Partially** — Banner clicks evaluate `productSlug` or `categorySlug` for internal SPA navigation (`navigateTo('product-detail')` or `navigateTo('shop')`). Direct raw `linkUrl` string navigation is not directly invoked.
- **`priority`**: **Implicitly** — The frontend renders banners in the array order returned by the backend API rather than applying explicit frontend client-side sorting by `priority`.
- **`isActive`**: **Handled by Backend** — Filtering active banners is delegated to the backend query logic (`GET /banners`).

### 6. Does the banner support multiple banners/slides?
**Yes.** `HeroSection.tsx` handles `heroBanners` as an array (`Banner[]`). If `heroBanners.length > 1`, it enables:
- Automatic slide rotation every 6 seconds (`setInterval` timer).
- Previous and Next navigation arrows (`ChevronLeft`, `ChevronRight`).
- Dynamic bottom dot pagination indicators corresponding to each slide index.

### 7. Does it correctly handle loading, empty and API error states?
**Yes.**
- **Loading State**: Displays a full skeleton UI (`<HeroSkeleton />`) while `loading` is `true`.
- **Empty / Error States**: Uses a `try...catch` block. If the API returns no banners or throws an error, it falls back gracefully to default hero and promo banner objects (`fallbackHero`, `fallbackPromos`) so the page layout never breaks or renders blank.

### 8. Does mobile use mobileImage?
**No.** The component uses `activeHero.image` (rendered via `SmartImage` with responsive object fit styling) across all screen widths without inspecting a separate `mobileImage` property.

### 9. Does banner priority/order come from the API?
**Yes.** The banners are displayed in the exact array index sequence returned by the backend `GET /banners` response.

### 10. Is clicking the banner/CTA navigating to the backend-provided linkUrl?
**Partially.** Navigation logic inspects `banner.productSlug` (navigating to product detail) or `banner.categorySlug` (navigating to category shop view). If neither slug exists, it defaults to `navigateTo('shop')`. It does not navigate directly to a custom `linkUrl` string.

---

## Final Verdict

**PARTIALLY DYNAMIC**

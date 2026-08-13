# Vyzobd Storefront - API Contract Migration & Integration Audit Report

This report documents the audit and migration of the Next.js Storefront to the standardized API response contract issued by the backend at `https://admin.vyzobd.com/api/storefront/v1`.

---

## 1. Old Contract Usage Found

During the initial audit, the storefront was relying on heterogeneous and legacy envelopes:
- `{ success: true, data: ..., meta: ... }`
- `{ success: false, error: { message: ... } }`
- Deeply nested responses requiring unsafe `unwrapApiResponse` checks with `body.success === false`.
- Array parsing issues where endpoints returning `{ data: null }` for empty lists caused runtime `.map()` crashes.
- Direct reliance on `res.data.data` or `res.success` scattered across service files.

---

## 2. New Contract Implementation

All storefront services now strictly adhere to the standardized response envelope:

```typescript
export interface ApiPagination {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface ApiFieldError {
  field?: string;
  message: string;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data: T;
  pagination?: ApiPagination;
  errors?: ApiFieldError[];
}
```

The success state check is now standard across all services:
- `status === 'success'` indicates a valid response.
- `status === 'error'` indicates a failed request or validation error.

---

## 3. API Client Architecture

- **Centralized Client**: `src/lib/api.ts` houses the primary `apiClient` configured with Axios.
- **Base URL**: Sanitized dynamically from `process.env.NEXT_PUBLIC_API_URL` or defaulting to `https://admin.vyzobd.com/api/storefront/v1`.
- **Request Interceptors**: Automatically injects `Authorization: Bearer <token>` and `X-Cart-Session-Id` headers when available in `localStorage`.
- **Response Unwrapper**: `unwrapApiResponse<T>()` extracts `status`, `message`, `data`, `pagination`, and `errors` safely into `ApiResponse<T>`, preventing raw Axios envelopes from leaking into the UI.

---

## 4. Error Handling Architecture

- Interceptors convert 4xx/5xx HTTP errors into normalized `ApiResponse` objects with `status: 'error'`.
- Domain services catch exceptions and wrap them into user-friendly `ApiResponse` formats with descriptive error messages.
- Prevents database error leaks or raw stack traces from reaching customer-facing UI components.

---

## 5. Pagination Handling

- Migrated away from deprecated `meta` and `data.meta` objects.
- All paginated list endpoints (Products, Search, Orders, Returns, Refunds, Blog) extract pagination parameters directly from `response.pagination`:
  - `total`
  - `page`
  - `limit`
  - `totalPages`

---

## 6. Authentication Handling

- Standardized `authService.ts` endpoints:
  - `POST /auth/login`
  - `POST /auth/register`
  - `GET /auth/me`
  - `POST /auth/refresh`
  - `POST /auth/logout`
- The `401 Unauthorized` interceptor handles silent token refresh via `POST /auth/refresh` with an in-flight queue lock to prevent duplicate concurrent requests.

---

## 7. Cart Handling

- `normalizeCart(rawCart)` in `src/lib/api.ts` guarantees `cart.items` is always an array (`CartItem[]`), avoiding `.reduce()` or `.length` runtime crashes if `data === null` or `data.items` is missing.
- All cart operations (`getCart`, `addToCart`, `updateCartItem`, `removeCartItem`, `clearCart`) now safely return normalized cart domain objects.

---

## 8. TanStack Query Integration

- The `storefrontApi` facade unspools service responses and supplies pure domain data to UI components and context hooks (`AuthContext`, `StorefrontContext`).
- Prevents components from needing to parse `AxiosResponse` or raw API envelopes directly.

---

## 9. Legacy Code Removed

- Removed legacy `success: boolean` checks from all service handlers.
- Removed deprecated `ApiResult<T>` and replaced it with `ApiResponse<T>`.
- Cleared defensive fallback hacks that masked contract bugs; replaced with strict contract normalization at the API/service boundary.

---

## 10. Files Changed

- `src/lib/api.ts`
- `src/services/authService.ts`
- `src/services/brandService.ts`
- `src/services/cartService.ts`
- `src/services/categoryService.ts`
- `src/services/checkoutService.ts`
- `src/services/contentService.ts`
- `src/services/orderService.ts`
- `src/services/paymentService.ts`
- `src/services/productService.ts`
- `src/services/refundService.ts`
- `src/services/returnService.ts`
- `src/services/searchService.ts`
- `src/services/settingsService.ts`
- `src/services/storefrontApi.ts`
- `src/services/wishlistService.ts`

---

## 11. Remaining Backend Dependencies

- Real endpoints at `https://admin.vyzobd.com/api/storefront/v1` provide storefront data.
- Standardized error codes and validation messages are surfaced directly from backend responses.

---

## 12. Validation Results

- **Lint Check (`npm run lint`)**: 0 errors across TypeScript type checking (`tsc --noEmit`).
- **Compilation Check (`compile_applet`)**: Build succeeded with zero errors.
- **Runtime Safety**: Safely normalized empty states for cart, products, categories, orders, and search.

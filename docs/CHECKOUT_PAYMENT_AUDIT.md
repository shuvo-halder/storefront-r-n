# Customer Flow & E-Commerce Integration Audit

## 1. Architecture Overview

This document details the production-grade customer flow implementation across **Authentication**, **Cart Management**, **Wishlist**, **Checkout**, and **Payment Verification**.

The system connects client components with existing REST APIs via a centralized, resilient client architecture defined in `src/lib/api.ts` and `src/services/apiClient.ts`.

### Key Design Pillars
- **Zero Mocking / Real REST Backend**: All customer actions interact directly with backend REST API endpoints.
- **Fail-Safe Normalization**: Cart and customer payloads are sanitized through `normalizeCart()` to prevent UI runtime crashes if server state is `null`, `undefined`, or missing keys.
- **Backend Payment Verification**: The frontend strictly relies on `POST /payment/verify` to confirm payment state before rendering success screens. No frontend assumption of payment completion is allowed.
- **Secure Secret Handling**: Payment keys and tokens are restricted to server environment variables and never exposed in `NEXT_PUBLIC_` prefixes.

---

## 2. Authentication & Session Architecture

### API Endpoint Mapping
- `POST /auth/register` - Registers a new customer account and returns JWT credentials.
- `POST /auth/login` - Authenticates user credentials and stores bearer tokens.
- `GET /auth/me` (fallback `GET /auth/profile`) - Restores session context on client load.
- `POST /auth/refresh` - Silently exchanges refresh tokens on 401 responses.
- `POST /auth/logout` - Revokes session on server and purges local storage.

### Client Session State Machine
1. **Unauthenticated State**: Standard guest experience with anonymous guest cart session ID (`X-Cart-Session-Id`).
2. **Session Restoration**: On app boot, `AuthContext` checks `localStorage` for `vyzobd_auth_token`. If present, `GET /auth/me` validates and restores user identity.
3. **Automatic 401 Interceptor Queue**: If an API call fails with `401 Unauthorized`, `apiClient` pauses requests in `failedQueue`, executes `POST /auth/refresh` with `vyzobd_refresh_token`, updates `vyzobd_auth_token`, and retries blocked requests seamlessly.
4. **Protected Route Enforcer**: Accessing `/account/*` or `/checkout` redirects unauthenticated guests cleanly to `/login` with return destination parameters.

---

## 3. Cart Management & Defensive Normalization

### API Endpoint Mapping
- `GET /cart` - Fetches active cart for current user or session ID.
- `POST /cart/items` - Adds product or variant to cart.
- `PUT /cart/items/:itemId` - Updates item quantity.
- `DELETE /cart/items/:itemId` - Removes specific line item.
- `DELETE /cart` - Empties all items from cart.

### Resilient Cart Normalization (`normalizeCart`)
To eliminate runtime errors caused by missing properties, `normalizeCart()` guarantees the following fallback schema regardless of backend response shape:

```typescript
export function normalizeCart(rawCart: any): Cart {
  if (!rawCart) {
    return {
      items: [],
      subtotal: 0,
      discount: 0,
      appliedCoupon: undefined,
      shippingFee: 0,
      estimatedTax: 0,
      total: 0
    };
  }
  // Safe extraction of items array, numerical subtotals, and totals
}
```

### Supported Features
- Product and variant level tracking.
- Real-time subtotal, shipping, tax, and discount calculation.
- Empty cart state handling with "Continue Shopping" CTA.
- React Query caching and cache invalidation upon mutations.

---

## 4. Wishlist Management

### API Endpoint Mapping
- `GET /wishlist` - Fetches saved products for authenticated user.
- `POST /wishlist/:productId` (fallback `POST /wishlist`) - Adds item to customer wishlist.
- `DELETE /wishlist/:productId` - Removes item from wishlist.

### Functional Implementation
- Real-time UI updates in `/account/wishlist`.
- Direct "Add to Cart" transfer from wishlist grid.
- Offline/Guest fallback capability synced with local storage.

---

## 5. Checkout Session & Coupon Engine

### API Endpoint Mapping
- `GET /checkout/session` - Initializes checkout session details and validates item stock.
- `POST /checkout/coupon` - Validates promo codes and applies discount amounts to cart.
- `POST /checkout/complete` - Finalizes purchase payload and generates immutable Order record.

### Checkout Flow Steps
1. **Account Step**: Validates email and customer phone number.
2. **Shipping & Billing Step**: Collects structured address details with optional "Same as Shipping" billing sync.
3. **Delivery Step**: Supports Standard, Express, and Priority Overnight shipping methods.
4. **Payment Step**: Supports COD, bKash, Nagad, SSLCommerz, and Stripe.
5. **Review Step**: Summarizes line items, coupon discounts, shipping costs, and grand totals.

---

## 6. Payment Processing & Gateway Verification

### API Endpoint Mapping
- `POST /payment/initiate` - Requests payment initiation and receives gateway URL/transaction reference.
- `POST /payment/verify` - Strictly verifies transaction signature and capture status with backend provider.

### Payment Providers Supported
| Method | Provider | Type | Flow |
| :--- | :--- | :--- | :--- |
| **COD** | Cash on Delivery | Offline | Direct order placement with `Pending` status |
| **BKASH** | bKash Wallet | Mobile Financial | Redirect/Gateway token -> Verification |
| **NAGAD** | Nagad Wallet | Mobile Financial | Redirect/Gateway token -> Verification |
| **SSLCOMMERZ** | SSLCommerz | Aggregator | Hosted payment page -> IPN / Verification |
| **STRIPE** | Stripe | Card Processing | Secure elements -> Verification |

### Gateway State Machine
- **PaymentPending**: Renders polling state while `POST /payment/verify` queries payment gateway status.
- **PaymentSuccess**: Rendered ONLY when `verified === true`. Displays order ID, transaction reference, and confetti celebration.
- **PaymentFailed**: Rendered when payment fails or is declined. Offers immediate "Retry Payment" option without losing cart context.

---

## 7. Audit Compliance Verification

- **Lint & Compilation**: Project compiles cleanly with TypeScript type safety.
- **All Routes Active**: All required routes (/cart, /checkout, /account/wishlist, /account/orders, etc.) connect to real Next.js pages and API layers.
- **No Sensitive Secrets in Client Code**: All payment keys remain secure in backend environment scope.

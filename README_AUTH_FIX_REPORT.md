# Customer Authentication & State Refactor Report

## Executive Summary
This document summarizes the changes implemented during the customer authentication and state refactor for the Vyzobd Storefront. The objective was to eliminate static user data across the storefront, integrate real customer JWT authentication state, implement dynamic header controls, ensure route protection for account pages, and align all error handling with the standardized backend API response format.

---

## Key Refactor Overview

### 1. Dynamic Session Management & Token Maintenance (`AuthContext.tsx`)
- **Restoration**: Upon application mount, `AuthContext` checks `localStorage` for `vyzobd_auth_token`.
- **Loading State**: `isLoading` is held true until session verification finishes.
- **Guest State**: If no token exists or if `/auth/me` returns 401 / unauthenticated, tokens are cleared and `user` is initialized to `null`.
- **Session Expiry**: Token refresh (`/auth/refresh`) is automatically handled. Invalid or expired tokens trigger session teardown without corrupting UI state.

### 2. Standalone Authentication Service (`authService.ts` & `storefrontApi.ts`)
- **API Mapping**:
  - `POST /auth/login` - Logs customer in, stores JWT in `vyzobd_auth_token` and refresh token in `vyzobd_refresh_token`.
  - `POST /auth/register` - Registers customer and automatically authenticates session.
  - `GET /auth/me` - Retrieves current customer profile.
  - `POST /auth/refresh` - Obtains a fresh CustomerJWT using stored refresh token.
  - `POST /auth/logout` - Revokes session on backend and purges local credentials.
- **Removal of Static Fallbacks**:
  - Removed all hardcoded static user IDs (e.g. `'usr_1'`) and static dummy customer profiles.
  - Real API responses are unwrapped via `unwrapApiResponse` and `extractApiError`.

### 3. Header & Navigation Refactor (`Header.tsx`)
- **Guest User View**:
  - Displays **"Login / Register"** in the top utility bar and header navigation bar.
  - Links directly to `/login`.
  - Never displays fake customer names or dummy avatars to guest users.
- **Authenticated Customer View**:
  - Displays customer's name (`user.fullName`) in the top utility bar and header.
  - Clicking the customer avatar toggles a dedicated account menu with links to:
    - Account Profile (`/account/profile`)
    - Order History (`/account/orders`)
    - Wishlist (`/account/wishlist`)
    - Sign Out (executes `logout()`)

### 4. Route Protection (`ProtectedRoute.tsx` & `AccountLayout.tsx`)
- All customer account pages (`/account`, `/account/profile`, `/account/orders`, `/account/wishlist`, `/account/addresses`) are guarded by `ProtectedRoute`.
- Unauthenticated access automatically redirects guests to `/login`.
- While checking session status (`isLoading`), clean skeletal/spinner states are rendered instead of flickering content.

### 5. Login / Register Forms & Validation (`LoginPage.tsx` & `RegisterPage.tsx`)
- Added Next.js `Link` routing between Login ("Join Vyzobd today") and Register ("Sign in here").
- Integrated field-level error mapping from backend error responses (`errors: [{ field, message }]`).
- Displays clear, user-friendly field validation messages and error alerts.

---

## Verification
- **Linter Check**: Executed `lint_applet` (`tsc --noEmit`) - 0 errors.
- **Build Check**: Executed `compile_applet` (`npm run build`) - Succeeded without errors.

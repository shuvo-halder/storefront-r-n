# Vyzobd Storefront - Social Authentication Readiness Audit

This document outlines the current state of authentication in the Vyzobd storefront and details the requirements for implementing social authentication (Google, Facebook, Apple).

## 1. Current Authentication Architecture

The current authentication implementation is entirely centered around Email + Password identity, managed via a pure client-side architecture that interacts with the backend API.

*   **AuthContext**: `src/context/AuthContext.tsx` provides global state (`user`, `isAuthenticated`, `isLoading`) and exposes core methods: `login`, `register`, `logout`, `updateProfile`, and `refreshUser`.
*   **API Client / Service**: `src/services/authService.ts` handles the API abstractions. It wraps the raw Axios/fetch requests and normalizes the payload.
*   **Token Storage**: Tokens are stored purely on the client in `localStorage` under the keys `vyzobd_auth_token` and `vyzobd_refresh_token`.
*   **Protected Routes**: Account protection is handled client-side via a `useEffect` hook in `src/components/account/AccountLayout.tsx`. If a user is not authenticated after loading completes, they are redirected to `/login`.
*   **Session Refresh**: `refreshUser` fetches `/auth/me` on initial mount to restore the session based on the stored token.

## 2. Existing Authentication APIs

Based on the implemented `authService.ts`, the storefront expects the following backend API contract:

*   `POST /auth/login` (Expects: `email`, `password`)
*   `POST /auth/register` (Expects: `fullName`, `firstName`, `lastName`, `email`, `password`, `phone`)
*   `GET /auth/me` (or `/auth/profile`)
*   `POST /auth/refresh` (Expects: `refreshToken`)
*   `POST /auth/logout`

## 3. Social Authentication APIs Found

**SOCIAL AUTH BACKEND SUPPORT NOT CURRENTLY DOCUMENTED.**

There are zero references to OAuth, Social Auth, Providers, or Callbacks in the API client or AuthContext. The backend contract currently only supports Email + Password.

## 4. Google OAuth Support Status

Not supported. No UI elements, logic, or API endpoints exist for Google authentication.

## 5. Facebook OAuth Support Status

Not supported. No UI elements, logic, or API endpoints exist for Facebook authentication.

## 6. Apple OAuth Support Status

Not supported. No UI elements, logic, or API endpoints exist for Apple authentication.

## 7. Backend Requirements

**BACKEND REQUIREMENT**

To support social authentication, the backend *must* implement endpoints capable of verifying provider tokens and issuing standard Vyzobd storefront sessions. The frontend cannot securely sign its own JWTs.

Conceptual Flow Required:
1. Customer clicks "Continue with Google".
2. Frontend retrieves OAuth ID Token / Access Token from Google.
3. Frontend sends token to a backend endpoint (e.g., `POST /auth/social/google`).
4. **Backend verification**: The backend verifies the token directly with Google.
5. **Backend identity**: The backend finds an existing user or creates a new one.
6. **Backend response**: The backend issues a standard Vyzobd `token` and `refreshToken`.
7. Frontend stores the token exactly as it does for Email/Password logins.

## 8. Frontend Architecture Recommendation

The frontend should abstract authentication to keep UI components clean.

*   `AuthService`: Should be expanded to include methods like `loginWithGoogle(providerToken: string)`.
*   OAuth flow should be handled via a popup or redirect using the provider's official SDKs (e.g., Google Identity Services) or a lightweight frontend library. 
*   **Do not install NextAuth/Auth.js** unless the backend architecture changes to rely on Next.js as the primary identity provider. As long as the separate backend API is the source of truth, the frontend should act as a dumb client passing OAuth tokens to the backend for verification.

## 9. Security Requirements

*   **No Secrets on the Client**: `GOOGLE_CLIENT_SECRET`, `FACEBOOK_APP_SECRET`, and Apple Private Keys **must never** be exposed in `NEXT_PUBLIC_*` variables.
*   The frontend should only ever use the **Public Client ID** to initiate the OAuth flow and receive a temporary token/code.
*   The backend is responsible for all secret verification.

## 10. Account Linking Requirements

**BACKEND REQUIREMENT**

Account linking must be handled safely on the backend. If a user registers with `email@example.com` and later clicks "Continue with Google" using the same email address:
*   The backend must detect the existing email.
*   The backend must link the Google identity to the existing account rather than creating a duplicate or throwing an unhandled conflict error.
*   The frontend should not attempt to merge user data manually.

## 11. Required Login UI

For the next implementation phase, the Login UI should be structured as:

*   Continue with Google (Button)
*   Continue with Facebook (Button)
*   *-- OR --* (Divider)
*   Email (Input)
*   Password (Input)
*   Forgot Password? (Link)
*   Sign In (Button)
*   Don't have an account? Create Account (Link)

## 12. Required Register UI

For the next implementation phase, the Register UI should be structured as:

*   Continue with Google (Button)
*   Continue with Facebook (Button)
*   *-- OR --* (Divider)
*   First Name (Input)
*   Last Name (Input)
*   Email (Input)
*   Phone (Input)
*   Password (Input)
*   Confirm Password (Input)
*   Create Account (Button)
*   Already have an account? Sign In (Link)

## 13. Error/Loading States

The future implementation must handle and gracefully display the following UX states:
*   Popup blocked by browser.
*   User cancelled the login flow.
*   Provider denied access.
*   Provider unavailable.
*   Invalid/expired OAuth response.
*   Account linking required (if backend requires explicit permission).
*   Backend unavailable / Network timeout.

## 14. Implementation Dependencies

*   Backend API endpoints for verifying Social Auth tokens must be deployed and documented.
*   Google Cloud Console Project (to obtain Public Client ID).
*   Meta for Developers App (to obtain App ID).

## 15. Recommended Implementation Order

1.  **Backend Implementation**: Backend engineers implement and deploy token verification endpoints (e.g., `/auth/google`).
2.  **Frontend Provider Config**: Configure Google/Facebook public Client IDs in the environment (`.env`).
3.  **Frontend API Update**: Update `authService.ts` to include `loginWithProvider` methods.
4.  **UI Implementation**: Update the Login/Register forms to include the new buttons and error handling states.
5.  **E2E Testing**: Verify successful login, registration, account linking, and error state handling.

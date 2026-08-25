/**
 * Centralized Customer Token Storage Abstraction
 * Manages customer_access_token and customer_refresh_token in localStorage
 * with safe SSR validation and backward-compatible fallback cleanup.
 */

export const CUSTOMER_ACCESS_TOKEN_KEY = 'customer_access_token';
export const CUSTOMER_REFRESH_TOKEN_KEY = 'customer_refresh_token';

// Legacy keys for migration/cleanup compatibility
const LEGACY_ACCESS_TOKEN_KEY = 'vyzobd_auth_token';
const LEGACY_REFRESH_TOKEN_KEY = 'vyzobd_refresh_token';
const LEGACY_PROFILE_KEY = 'vyzobd_user_profile';

export const tokenStorage = {
  /**
   * Retrieves the current customer access token
   */
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const token = localStorage.getItem(CUSTOMER_ACCESS_TOKEN_KEY);
      if (token && token.trim() !== '') return token.trim();
      
      // Fallback to legacy key if customer_access_token not set yet
      const legacyToken = localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY);
      if (legacyToken && legacyToken.trim() !== '') {
        // Migrate to primary key
        localStorage.setItem(CUSTOMER_ACCESS_TOKEN_KEY, legacyToken.trim());
        return legacyToken.trim();
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Retrieves the current customer refresh token
   */
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const token = localStorage.getItem(CUSTOMER_REFRESH_TOKEN_KEY);
      if (token && token.trim() !== '') return token.trim();

      // Fallback to legacy key if customer_refresh_token not set yet
      const legacyRefresh = localStorage.getItem(LEGACY_REFRESH_TOKEN_KEY);
      if (legacyRefresh && legacyRefresh.trim() !== '') {
        localStorage.setItem(CUSTOMER_REFRESH_TOKEN_KEY, legacyRefresh.trim());
        return legacyRefresh.trim();
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Stores both access token and refresh token safely
   */
  setTokens: (accessToken: string, refreshToken?: string | null): void => {
    if (typeof window === 'undefined') return;
    try {
      if (accessToken) {
        localStorage.setItem(CUSTOMER_ACCESS_TOKEN_KEY, accessToken.trim());
        localStorage.setItem(LEGACY_ACCESS_TOKEN_KEY, accessToken.trim());
      }
      if (refreshToken) {
        localStorage.setItem(CUSTOMER_REFRESH_TOKEN_KEY, refreshToken.trim());
        localStorage.setItem(LEGACY_REFRESH_TOKEN_KEY, refreshToken.trim());
      }
    } catch (e) {
      console.error('Failed to persist customer tokens to localStorage');
    }
  },

  /**
   * Updates only the access token (e.g. after refresh flow)
   */
  setAccessToken: (accessToken: string): void => {
    if (typeof window === 'undefined') return;
    try {
      if (accessToken) {
        localStorage.setItem(CUSTOMER_ACCESS_TOKEN_KEY, accessToken.trim());
        localStorage.setItem(LEGACY_ACCESS_TOKEN_KEY, accessToken.trim());
      }
    } catch (e) {
      console.error('Failed to persist updated access token');
    }
  },

  /**
   * Clears all customer tokens and cached session information
   */
  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(CUSTOMER_ACCESS_TOKEN_KEY);
      localStorage.removeItem(CUSTOMER_REFRESH_TOKEN_KEY);
      localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
      localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
      localStorage.removeItem(LEGACY_PROFILE_KEY);
    } catch (e) {
      console.error('Failed to clear customer tokens from localStorage');
    }
  },

  /**
   * Check if an access token exists
   */
  hasAccessToken: (): boolean => {
    return Boolean(tokenStorage.getAccessToken());
  }
};

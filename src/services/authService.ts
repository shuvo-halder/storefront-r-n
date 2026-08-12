import { apiClient, unwrapApiResponse, ApiResult } from '../lib/api';
import { LoginFormData, RegisterFormData, AuthResponse } from '../types/auth';
import { UserProfile } from '../types/storefront';

export const authService = {
  // POST /auth/login
  login: async (data: LoginFormData): Promise<ApiResult<AuthResponse>> => {
    try {
      const res = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password
      });
      const result = unwrapApiResponse<any>(res);
      if (result.success && result.data) {
        const token = result.data.token || result.data.accessToken;
        const refreshToken = result.data.refreshToken;
        const user = result.data.user || result.data.profile || result.data;
        if (token && typeof window !== 'undefined') {
          localStorage.setItem('vyzobd_auth_token', token);
          if (refreshToken) {
            localStorage.setItem('vyzobd_refresh_token', refreshToken);
          }
        }
        return {
          success: true,
          data: { token, refreshToken, user },
          error: null
        };
      }
      return {
        success: false,
        data: null,
        error: result.error || { message: 'Login failed' }
      };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Invalid email or password';
      return {
        success: false,
        data: null,
        error: { message: errorMsg }
      };
    }
  },

  // POST /auth/register
  register: async (data: RegisterFormData): Promise<ApiResult<AuthResponse>> => {
    try {
      const names = data.fullName.split(' ');
      const firstName = names[0] || '';
      const lastName = names.slice(1).join(' ') || '';

      const res = await apiClient.post('/auth/register', {
        fullName: data.fullName,
        firstName,
        lastName,
        email: data.email,
        password: data.password,
        phone: data.phone
      });

      const result = unwrapApiResponse<any>(res);
      if (result.success && result.data) {
        const token = result.data.token || result.data.accessToken;
        const refreshToken = result.data.refreshToken;
        const user = result.data.user || result.data.profile || result.data;
        if (token && typeof window !== 'undefined') {
          localStorage.setItem('vyzobd_auth_token', token);
          if (refreshToken) {
            localStorage.setItem('vyzobd_refresh_token', refreshToken);
          }
        }
        return {
          success: true,
          data: { token, refreshToken, user },
          error: null
        };
      }
      return {
        success: false,
        data: null,
        error: result.error || { message: 'Registration failed' }
      };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Registration failed';
      return {
        success: false,
        data: null,
        error: { message: errorMsg }
      };
    }
  },

  // GET /auth/me or GET /auth/profile
  me: async (): Promise<ApiResult<UserProfile>> => {
    try {
      const res = await apiClient.get('/auth/me').catch(() => apiClient.get('/auth/profile'));
      const result = unwrapApiResponse<any>(res);
      if (result.success && result.data) {
        const raw = result.data.user || result.data.profile || result.data;
        const profile: UserProfile = {
          id: raw.id || raw._id || '',
          fullName: raw.fullName || `${raw.firstName || ''} ${raw.lastName || ''}`.trim() || raw.email || 'User',
          email: raw.email || '',
          avatar: raw.avatar || raw.avatarUrl,
          avatarUrl: raw.avatarUrl || raw.avatar,
          phone: raw.phone,
          defaultAddress: raw.defaultAddress || raw.address
        };
        return { success: true, data: profile, error: null };
      }
      return { success: false, data: null, error: result.error };
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: { message: err.response?.data?.message || err.message || 'Failed to fetch user profile' }
      };
    }
  },

  // POST /auth/refresh
  refresh: async (): Promise<ApiResult<{ token: string }>> => {
    try {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('vyzobd_refresh_token') : null;
      const res = await apiClient.post('/auth/refresh', { refreshToken });
      const result = unwrapApiResponse<any>(res);
      if (result.success && result.data?.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('vyzobd_auth_token', result.data.token);
        }
        return { success: true, data: { token: result.data.token }, error: null };
      }
      return { success: false, data: null, error: result.error };
    } catch (err: any) {
      return { success: false, data: null, error: { message: err.message || 'Token refresh failed' } };
    }
  },

  // POST /auth/logout
  logout: async (): Promise<ApiResult<boolean>> => {
    try {
      await apiClient.post('/auth/logout').catch(() => {});
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vyzobd_auth_token');
        localStorage.removeItem('vyzobd_refresh_token');
      }
    }
    return { success: true, data: true, error: null };
  }
};

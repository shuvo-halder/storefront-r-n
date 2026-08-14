import { apiClient, unwrapApiResponse, extractApiError, ApiResponse } from '../lib/api';
import { LoginFormData, RegisterFormData, AuthResponse, RegisterResponse } from '../types/auth';
import { UserProfile } from '../types/storefront';

export const authService = {
  // POST /auth/login
  login: async (data: LoginFormData): Promise<ApiResponse<AuthResponse>> => {
    try {
      const res = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password
      });
      const result = unwrapApiResponse<any>(res);
      if (result.status === "success" && result.data) {
        const token = result.data.accessToken || result.data.token;
        const refreshToken = result.data.refreshToken;
        const raw = result.data.customer || result.data.user || result.data.profile || result.data;
        const user: UserProfile = {
          id: raw.id || raw._id || '',
          fullName: raw.fullName || `${raw.firstName || ''} ${raw.lastName || ''}`.trim() || raw.email || 'User',
          email: raw.email || '',
          avatar: raw.avatar || raw.avatarUrl,
          avatarUrl: raw.avatarUrl || raw.avatar,
          phone: raw.phone,
          defaultAddress: raw.defaultAddress || raw.address
        };
        if (token && typeof window !== 'undefined') {
          localStorage.setItem('vyzobd_auth_token', token);
          if (refreshToken) {
            localStorage.setItem('vyzobd_refresh_token', refreshToken);
          }
          localStorage.setItem('vyzobd_user_profile', JSON.stringify(user));
        }
        return {
          status: 'success', message: result.message || null, data: { token, refreshToken, user }
        };
      }
      return {
        status: 'error', message: result.message || "Login failed", errors: result.errors, data: null as any
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Invalid email or password');
      return {
        status: 'error', message, errors, data: null as any
      };
    }
  },

  // POST /auth/register
  register: async (data: RegisterFormData): Promise<ApiResponse<RegisterResponse>> => {
    try {
      const names = data.fullName.trim().split(' ');
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
      if (result.status === "success") {
        const message = result.message || 'Registration successful. Please check your email to verify your account.';
        return {
          status: 'success',
          message,
          data: {
            message,
            user: result.data || null
          }
        };
      }
      return {
        status: 'error',
        message: result.message || "Registration failed",
        errors: result.errors,
        data: null as any
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Registration failed');
      return {
        status: 'error',
        message,
        errors,
        data: null as any
      };
    }
  },

  // GET /auth/me or GET /auth/profile
  me: async (): Promise<ApiResponse<UserProfile>> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('vyzobd_auth_token') : null;
      if (!token) {
        return { status: 'error', message: 'No authentication token found', data: null as any };
      }

      let profile: UserProfile | null = null;
      try {
        const res = await apiClient.get('/auth/me').catch(() => apiClient.get('/auth/profile'));
        const result = unwrapApiResponse<any>(res);
        if (result.status === "success" && result.data) {
          const raw = result.data.customer || result.data.user || result.data.profile || result.data;
          profile = {
            id: raw.id || raw._id || '',
            fullName: raw.fullName || `${raw.firstName || ''} ${raw.lastName || ''}`.trim() || raw.email || 'User',
            email: raw.email || '',
            avatar: raw.avatar || raw.avatarUrl,
            avatarUrl: raw.avatarUrl || raw.avatar,
            phone: raw.phone,
            defaultAddress: raw.defaultAddress || raw.address
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem('vyzobd_user_profile', JSON.stringify(profile));
          }
        }
      } catch (err) {
        // Fallback to cached profile when server route unavailable
      }

      if (!profile && typeof window !== 'undefined') {
        const cached = localStorage.getItem('vyzobd_user_profile');
        if (cached) {
          try {
            profile = JSON.parse(cached);
          } catch (e) {
            profile = null;
          }
        }
      }

      if (profile) {
        return { status: 'success', message: null, data: profile };
      }

      return { status: 'error', message: 'Failed to fetch user profile', data: null as any };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch user profile');
      return {
        status: 'error', message, errors, data: null as any
      };
    }
  },

  // POST /auth/refresh
  refresh: async (): Promise<ApiResponse<{ token: string }>> => {
    try {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('vyzobd_refresh_token') : null;
      const res = await apiClient.post('/auth/refresh', { refreshToken });
      const result = unwrapApiResponse<any>(res);
      if (result.status === "success" && result.data?.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('vyzobd_auth_token', result.data.token);
        }
        return { status: 'success', message: null, data: { token: result.data.token } };
      }
      return { status: 'error', message: result.message || 'Token refresh failed', data: null as any };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Token refresh failed');
      return { status: 'error', message, errors, data: null as any };
    }
  },

  // POST /auth/logout
  logout: async (): Promise<ApiResponse<boolean>> => {
    try {
      await apiClient.post('/auth/logout').catch(() => {});
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vyzobd_auth_token');
        localStorage.removeItem('vyzobd_refresh_token');
        localStorage.removeItem('vyzobd_user_profile');
      }
    }
    return { status: 'success', message: null, data: true };
  },

  // PUT /auth/me or PUT /auth/profile
  updateProfile: async (data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> => {
    try {
      const res = await apiClient.put('/auth/me', data)
        .catch(() => apiClient.post('/auth/me', data))
        .catch(() => apiClient.put('/auth/profile', data));
      const result = unwrapApiResponse<any>(res);
      if (result.status === "success" && result.data) {
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
        return { status: 'success', message: null, data: profile };
      }
      return authService.me();
    } catch (err: any) {
      return authService.me();
    }
  }
};


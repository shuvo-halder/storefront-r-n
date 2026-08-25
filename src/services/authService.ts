import { apiClient, ApiResponse, unwrapApiResponse, extractApiError } from '../lib/api';
import { tokenStorage } from '../lib/tokenStorage';
import { 
  Customer,
  RegisterRequestPayload,
  LoginRequestPayload,
  RegisterMobileRequestPayload,
  VerifyMobileRegisterPayload,
  LoginMobileRequestPayload,
  VerifyMobileLoginPayload,
  AuthSuccessData,
  MobileRegisterData,
  MobileLoginData,
  AuthResponse,
  RegisterResponse
} from '../types/auth';
import { formatBDPhoneE164 } from '../utils/phone';

/**
 * Normalizes backend customer payload into a consistent Customer object
 */
export function normalizeCustomer(raw: any): Customer {
  if (!raw) {
    return {
      id: '',
      fullName: 'Customer',
      email: '',
      phone: '',
      emailVerified: false,
      phoneVerified: false
    };
  }

  const firstName = raw.firstName || '';
  const lastName = raw.lastName || '';
  const fullName = raw.fullName || (firstName ? `${firstName} ${lastName}`.trim() : '') || raw.name || 'Customer';

  return {
    id: raw.id || raw._id || raw.customerId || '',
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    fullName,
    email: raw.email || '',
    phone: raw.phone || '',
    avatarUrl: raw.avatarUrl || raw.avatar || undefined,
    avatar: raw.avatar || raw.avatarUrl || undefined,
    emailVerified: Boolean(raw.emailVerified),
    phoneVerified: Boolean(raw.phoneVerified),
    defaultAddress: raw.defaultAddress || undefined
  };
}

export const authService = {
  /**
   * POST /auth/login
   * Standard Email & Password Authentication
   */
  login: async (credentials: LoginRequestPayload): Promise<ApiResponse<AuthSuccessData>> => {
    try {
      const res = await apiClient.post('/auth/login', {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password
      });

      const unwrapped = unwrapApiResponse<any>(res);
      if (unwrapped.status === 'error') {
        return {
          status: 'error',
          message: unwrapped.message || 'Invalid email or password',
          errors: unwrapped.errors,
          data: null as any
        };
      }

      const rawData = unwrapped.data || {};
      const customer = normalizeCustomer(rawData.customer || rawData.user || rawData);
      const accessToken = rawData.accessToken || rawData.token;
      const refreshToken = rawData.refreshToken;

      if (accessToken) {
        tokenStorage.setTokens(accessToken, refreshToken);
      }

      const normalizedData: AuthSuccessData = {
        customer,
        accessToken,
        refreshToken
      };

      return {
        status: 'success',
        message: unwrapped.message || 'Login successful',
        data: normalizedData
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to sign in. Please check your credentials.');
      return {
        status: 'error',
        message,
        errors,
        data: null as any
      };
    }
  },

  /**
   * POST /auth/register
   * Standard Email & Password Registration
   */
  register: async (payload: RegisterRequestPayload): Promise<ApiResponse<AuthSuccessData>> => {
    try {
      const formattedPhone = formatBDPhoneE164(payload.phone);
      const res = await apiClient.post('/auth/register', {
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        phone: formattedPhone
      });

      const unwrapped = unwrapApiResponse<any>(res);
      if (unwrapped.status === 'error') {
        return {
          status: 'error',
          message: unwrapped.message || 'Registration failed',
          errors: unwrapped.errors,
          data: null as any
        };
      }

      const rawData = unwrapped.data || {};
      const customer = normalizeCustomer(rawData.customer || rawData.user || rawData);
      const accessToken = rawData.accessToken || rawData.token;
      const refreshToken = rawData.refreshToken;

      if (accessToken) {
        tokenStorage.setTokens(accessToken, refreshToken);
      }

      const normalizedData: AuthSuccessData = {
        customer,
        accessToken,
        refreshToken
      };

      return {
        status: 'success',
        message: unwrapped.message || 'Account created successfully',
        data: normalizedData
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Registration failed. Please try again.');
      return {
        status: 'error',
        message,
        errors,
        data: null as any
      };
    }
  },

  /**
   * POST /auth/register-mobile
   * Step 1 of Mobile OTP Registration: Send verification SMS
   */
  registerMobile: async (payload: RegisterMobileRequestPayload): Promise<ApiResponse<MobileRegisterData>> => {
    try {
      const formattedPhone = formatBDPhoneE164(payload.phone);
      const res = await apiClient.post('/auth/register-mobile', {
        phone: formattedPhone
      });

      const unwrapped = unwrapApiResponse<any>(res);
      if (unwrapped.status === 'error') {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to send verification code',
          errors: unwrapped.errors,
          data: null as any
        };
      }

      return {
        status: 'success',
        message: unwrapped.message || 'Verification code sent via SMS',
        data: {
          phone: formattedPhone,
          expiresIn: unwrapped.data?.expiresIn || 300
        }
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to send verification code to mobile number.');
      return {
        status: 'error',
        message,
        errors,
        data: null as any
      };
    }
  },

  /**
   * POST /auth/verify-mobile-register
   * Step 2 of Mobile OTP Registration: Verify code and create account
   */
  verifyMobileRegister: async (payload: VerifyMobileRegisterPayload): Promise<ApiResponse<AuthSuccessData>> => {
    try {
      const formattedPhone = formatBDPhoneE164(payload.phone);
      const body: any = {
        phone: formattedPhone,
        code: payload.code.trim(),
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim()
      };

      if (payload.password && payload.password.trim() !== '') {
        body.password = payload.password;
      }

      const res = await apiClient.post('/auth/verify-mobile-register', body);
      const unwrapped = unwrapApiResponse<any>(res);
      if (unwrapped.status === 'error') {
        return {
          status: 'error',
          message: unwrapped.message || 'Invalid or expired verification code',
          errors: unwrapped.errors,
          data: null as any
        };
      }

      const rawData = unwrapped.data || {};
      const customer = normalizeCustomer(rawData.customer || rawData.user || rawData);
      const accessToken = rawData.accessToken || rawData.token;
      const refreshToken = rawData.refreshToken;

      if (accessToken) {
        tokenStorage.setTokens(accessToken, refreshToken);
      }

      return {
        status: 'success',
        message: unwrapped.message || 'Mobile registration verified successfully',
        data: {
          customer,
          accessToken,
          refreshToken
        }
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Verification failed. Please check the code and try again.');
      return {
        status: 'error',
        message,
        errors,
        data: null as any
      };
    }
  },

  /**
   * POST /auth/login-mobile
   * Step 1 of Mobile OTP Login: Send OTP code
   */
  loginMobile: async (payload: LoginMobileRequestPayload): Promise<ApiResponse<MobileLoginData>> => {
    try {
      const formattedPhone = formatBDPhoneE164(payload.phone);
      const res = await apiClient.post('/auth/login-mobile', {
        phone: formattedPhone
      });

      const unwrapped = unwrapApiResponse<any>(res);
      if (unwrapped.status === 'error') {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to send OTP code',
          errors: unwrapped.errors,
          data: null as any
        };
      }

      return {
        status: 'success',
        message: unwrapped.message || 'OTP code sent to mobile number',
        data: unwrapped.data || {}
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to send OTP to mobile number.');
      return {
        status: 'error',
        message,
        errors,
        data: null as any
      };
    }
  },

  /**
   * POST /auth/verify-mobile-login
   * Step 2 of Mobile OTP Login: Verify code and sign in
   */
  verifyMobileLogin: async (payload: VerifyMobileLoginPayload): Promise<ApiResponse<AuthSuccessData>> => {
    try {
      const formattedPhone = formatBDPhoneE164(payload.phone);
      const res = await apiClient.post('/auth/verify-mobile-login', {
        phone: formattedPhone,
        code: payload.code.trim()
      });

      const unwrapped = unwrapApiResponse<any>(res);
      if (unwrapped.status === 'error') {
        return {
          status: 'error',
          message: unwrapped.message || 'Invalid or expired OTP code',
          errors: unwrapped.errors,
          data: null as any
        };
      }

      const rawData = unwrapped.data || {};
      const customer = normalizeCustomer(rawData.customer || rawData.user || rawData);
      const accessToken = rawData.accessToken || rawData.token;
      const refreshToken = rawData.refreshToken;

      if (accessToken) {
        tokenStorage.setTokens(accessToken, refreshToken);
      }

      return {
        status: 'success',
        message: unwrapped.message || 'Login successful',
        data: {
          customer,
          accessToken,
          refreshToken
        }
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to verify OTP code.');
      return {
        status: 'error',
        message,
        errors,
        data: null as any
      };
    }
  },

  /**
   * POST /auth/refresh
   * Refreshes customer access token using stored or provided refresh token
   */
  refresh: async (refreshTokenOverride?: string): Promise<ApiResponse<{ accessToken: string }>> => {
    const refreshToken = refreshTokenOverride || tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return {
        status: 'error',
        message: 'No refresh token available',
        data: null as any
      };
    }

    try {
      const res = await apiClient.post('/auth/refresh', { refreshToken });
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        tokenStorage.clearTokens();
        return {
          status: 'error',
          message: unwrapped.message || 'Session expired',
          errors: unwrapped.errors,
          data: null as any
        };
      }

      const newAccessToken = unwrapped.data?.accessToken || unwrapped.data?.token;
      if (newAccessToken) {
        tokenStorage.setAccessToken(newAccessToken);
        return {
          status: 'success',
          message: 'Token refreshed',
          data: { accessToken: newAccessToken }
        };
      }

      tokenStorage.clearTokens();
      return {
        status: 'error',
        message: 'Invalid refresh response',
        data: null as any
      };
    } catch (err: any) {
      tokenStorage.clearTokens();
      const { message, errors } = extractApiError(err, 'Failed to refresh session');
      return {
        status: 'error',
        message,
        errors,
        data: null as any
      };
    }
  },

  /**
   * GET /auth/me
   * Fetches current authenticated customer profile using customer_access_token
   */
  me: async (): Promise<ApiResponse<{ customer: Customer }>> => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      return {
        status: 'error',
        message: 'Not authenticated',
        data: null as any
      };
    }

    try {
      const res = await apiClient.get('/auth/me');
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to fetch customer profile',
          errors: unwrapped.errors,
          data: null as any
        };
      }

      const rawData = unwrapped.data || {};
      const customer = normalizeCustomer(rawData.customer || rawData.user || rawData);

      return {
        status: 'success',
        message: null,
        data: { customer }
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to fetch profile');
      return {
        status: 'error',
        message,
        errors,
        data: null as any
      };
    }
  },

  /**
   * PUT /auth/me or update customer profile
   */
  updateProfile: async (data: Partial<Customer>): Promise<ApiResponse<{ customer: Customer }>> => {
    try {
      const res = await apiClient.put('/auth/me', data);
      const unwrapped = unwrapApiResponse<any>(res);

      if (unwrapped.status === 'error') {
        return {
          status: 'error',
          message: unwrapped.message || 'Failed to update profile',
          errors: unwrapped.errors,
          data: null as any
        };
      }

      const rawData = unwrapped.data || {};
      const customer = normalizeCustomer(rawData.customer || rawData.user || rawData);

      return {
        status: 'success',
        message: unwrapped.message || 'Profile updated successfully',
        data: { customer }
      };
    } catch (err: any) {
      const { message, errors } = extractApiError(err, 'Failed to update profile');
      return {
        status: 'error',
        message,
        errors,
        data: null as any
      };
    }
  },

  /**
   * Client-side logout: Clears all customer tokens & storage
   */
  logout: async (): Promise<void> => {
    tokenStorage.clearTokens();
  }
};

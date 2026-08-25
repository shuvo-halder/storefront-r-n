'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Customer, 
  LoginRequestPayload, 
  RegisterRequestPayload, 
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
import { authService } from '../services/authService';
import { customerService } from '../services/customerService';
import { tokenStorage } from '../lib/tokenStorage';

export interface AuthContextType {
  customer: Customer | null;
  user: Customer | null; // Alias for backward compatibility
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Standard Email & Password Methods
  login: (data: LoginRequestPayload) => Promise<AuthSuccessData>;
  register: (data: RegisterRequestPayload) => Promise<AuthSuccessData>;
  
  // Mobile OTP Methods
  loginWithMobile: (phone: string) => Promise<MobileLoginData>;
  verifyMobileLogin: (data: VerifyMobileLoginPayload) => Promise<AuthSuccessData>;
  registerWithMobile: (phone: string) => Promise<MobileRegisterData>;
  verifyMobileRegister: (data: VerifyMobileRegisterPayload) => Promise<AuthSuccessData>;
  
  // Session & Profile Management
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Customer>) => Promise<Customer>;
  syncCustomerProfile: (data: Partial<Customer>) => void;
  refreshSession: () => Promise<string | null>;
  reloadCustomer: () => Promise<Customer | null>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Session restoration on application mount
   */
  const reloadCustomer = useCallback(async (): Promise<Customer | null> => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setCustomer(null);
      setIsLoading(false);
      return null;
    }

    try {
      const res = await authService.me();
      if (res.status === 'success' && res.data?.customer) {
        setCustomer(res.data.customer);
        return res.data.customer;
      }

      // If initial /auth/me failed, attempt refresh token flow once
      const refreshRes = await authService.refresh();
      if (refreshRes.status === 'success' && refreshRes.data?.accessToken) {
        const retryMe = await authService.me();
        if (retryMe.status === 'success' && retryMe.data?.customer) {
          setCustomer(retryMe.data.customer);
          return retryMe.data.customer;
        }
      }

      // Refresh failed or unauthorized: clear tokens
      tokenStorage.clearTokens();
      queryClient.removeQueries({ queryKey: ['customer'] });
      setCustomer(null);
      return null;
    } catch (err) {
      tokenStorage.clearTokens();
      queryClient.removeQueries({ queryKey: ['customer'] });
      setCustomer(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    await reloadCustomer();
  }, [reloadCustomer]);

  // Initial load effect
  useEffect(() => {
    reloadCustomer();
  }, [reloadCustomer]);

  // Global session expiration event listener
  useEffect(() => {
    const handleSessionExpired = () => {
      queryClient.removeQueries({ queryKey: ['customer'] });
      setCustomer(null);
      setIsLoading(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('customer:session_expired', handleSessionExpired);
      return () => {
        window.removeEventListener('customer:session_expired', handleSessionExpired);
      };
    }
  }, [queryClient]);

  /**
   * Standard Email & Password Login
   */
  const login = async (data: LoginRequestPayload): Promise<AuthSuccessData> => {
    setIsLoading(true);
    try {
      const res = await authService.login(data);
      if (res.status === 'error' || !res.data) {
        throw new Error(res.message || 'Login failed. Please check your credentials.');
      }
      queryClient.removeQueries({ queryKey: ['customer'] });
      setCustomer(res.data.customer);
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      return res.data;
    } catch (err: any) {
      setCustomer(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Standard Email & Password Registration
   */
  const register = async (data: RegisterRequestPayload): Promise<AuthSuccessData> => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      if (res.status === 'error' || !res.data) {
        throw new Error(res.message || 'Registration failed. Please try again.');
      }
      queryClient.removeQueries({ queryKey: ['customer'] });
      setCustomer(res.data.customer);
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      return res.data;
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mobile OTP Login - Step 1: Send OTP
   */
  const loginWithMobile = async (phone: string): Promise<MobileLoginData> => {
    const res = await authService.loginMobile({ phone });
    if (res.status === 'error') {
      throw new Error(res.message || 'Failed to send OTP code to mobile number.');
    }
    return res.data || { message: res.message || 'OTP sent' };
  };

  /**
   * Mobile OTP Login - Step 2: Verify OTP
   */
  const verifyMobileLogin = async (data: VerifyMobileLoginPayload): Promise<AuthSuccessData> => {
    setIsLoading(true);
    try {
      const res = await authService.verifyMobileLogin(data);
      if (res.status === 'error' || !res.data) {
        throw new Error(res.message || 'Failed to verify OTP code.');
      }
      queryClient.removeQueries({ queryKey: ['customer'] });
      setCustomer(res.data.customer);
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      return res.data;
    } catch (err: any) {
      setCustomer(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mobile OTP Registration - Step 1: Send verification code
   */
  const registerWithMobile = async (phone: string): Promise<MobileRegisterData> => {
    const res = await authService.registerMobile({ phone });
    if (res.status === 'error' || !res.data) {
      throw new Error(res.message || 'Failed to send verification SMS.');
    }
    return res.data;
  };

  /**
   * Mobile OTP Registration - Step 2: Verify code & complete registration
   */
  const verifyMobileRegister = async (data: VerifyMobileRegisterPayload): Promise<AuthSuccessData> => {
    setIsLoading(true);
    try {
      const res = await authService.verifyMobileRegister(data);
      if (res.status === 'error' || !res.data) {
        throw new Error(res.message || 'Failed to verify registration code.');
      }
      queryClient.removeQueries({ queryKey: ['customer'] });
      setCustomer(res.data.customer);
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      return res.data;
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      tokenStorage.clearTokens();
      queryClient.removeQueries({ queryKey: ['customer'] });
      setCustomer(null);
      setIsLoading(false);
    }
  };

  /**
   * Synchronize Customer Profile without full reload
   */
  const syncCustomerProfile = useCallback((updated: Partial<Customer>) => {
    setCustomer((prev) => {
      if (!prev) return null;
      const firstName = updated.firstName !== undefined ? updated.firstName : prev.firstName;
      const lastName = updated.lastName !== undefined ? updated.lastName : prev.lastName;
      const fullName = (firstName || lastName) 
        ? `${firstName || ''} ${lastName || ''}`.trim() 
        : (updated.fullName || prev.fullName);
      const avatarUrl = updated.avatarUrl !== undefined ? updated.avatarUrl : (updated.avatar !== undefined ? updated.avatar : prev.avatarUrl);

      return {
        ...prev,
        ...updated,
        firstName,
        lastName,
        fullName,
        avatarUrl,
        avatar: avatarUrl
      };
    });
  }, []);

  /**
   * Update Customer Profile
   */
  const updateProfile = async (data: Partial<Customer>): Promise<Customer> => {
    const firstName = data.firstName || data.fullName?.split(' ')[0] || '';
    const lastName = data.lastName || data.fullName?.split(' ').slice(1).join(' ') || '';
    const avatarUrl = data.avatarUrl || data.avatar;

    const res = await customerService.updateProfile({
      firstName,
      lastName,
      avatarUrl
    });

    if (res.status === 'error' || !res.data?.profile) {
      throw new Error(res.message || 'Failed to update profile');
    }

    const updatedProfile = res.data.profile;
    syncCustomerProfile(updatedProfile);

    const mergedCustomer: Customer = {
      ...(customer || { id: updatedProfile.id }),
      ...updatedProfile,
      fullName: `${updatedProfile.firstName || ''} ${updatedProfile.lastName || ''}`.trim() || 'Customer'
    };

    return mergedCustomer;
  };

  /**
   * Manual token refresh
   */
  const refreshSession = async (): Promise<string | null> => {
    const res = await authService.refresh();
    if (res.status === 'success' && res.data?.accessToken) {
      return res.data.accessToken;
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        user: customer, // Backward-compatible alias
        isAuthenticated: Boolean(customer && customer.id),
        isLoading,
        login,
        register,
        loginWithMobile,
        verifyMobileLogin,
        registerWithMobile,
        verifyMobileRegister,
        logout,
        updateProfile,
        syncCustomerProfile,
        refreshSession,
        reloadCustomer,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types/storefront';
import { LoginFormData, RegisterFormData, AuthResponse } from '../types/auth';
import { storefrontApi } from '../services/storefrontApi';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<AuthResponse>;
  register: (data: RegisterFormData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('vyzobd_auth_token') : null;
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const currentUser = await storefrontApi.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('vyzobd_auth_token');
          localStorage.removeItem('vyzobd_refresh_token');
        }
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to restore customer session:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vyzobd_auth_token');
        localStorage.removeItem('vyzobd_refresh_token');
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (data: LoginFormData): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await storefrontApi.login(data);
      if (response.user) {
        setUser(response.user);
      } else {
        await refreshUser();
      }
      return response;
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await storefrontApi.register(data);
      if (response.user) {
        setUser(response.user);
      } else {
        await refreshUser();
      }
      return response;
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await storefrontApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vyzobd_auth_token');
        localStorage.removeItem('vyzobd_refresh_token');
      }
      setUser(null);
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const updatedUser = await storefrontApi.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
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


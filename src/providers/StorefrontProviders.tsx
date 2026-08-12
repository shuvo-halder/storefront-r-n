'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsProvider } from '../context/SettingsContext';
import { StorefrontProvider } from '../context/StorefrontContext';
import { AuthProvider } from '../context/AuthContext';

export function StorefrontProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <StorefrontProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </StorefrontProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

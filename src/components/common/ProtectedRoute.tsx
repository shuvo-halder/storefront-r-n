'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const search = searchParams?.toString();
      const currentPath = search ? `${pathname}?${search}` : pathname;
      const redirectUrl = currentPath && currentPath !== '/' && currentPath !== '/login'
        ? `/login?redirect=${encodeURIComponent(currentPath)}`
        : '/login';

      router.replace(redirectUrl);
    }
  }, [isLoading, isAuthenticated, router, pathname, searchParams]);

  if (isLoading) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#DC2B53] animate-spin" />
        <p className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Verifying Account Session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

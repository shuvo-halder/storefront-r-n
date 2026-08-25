'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStorefront } from '../../context/StorefrontContext';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Mail, ArrowRight, Smartphone, Eye, EyeOff, Loader2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const router = useRouter();
  const { isAuthModalOpen, setIsAuthModalOpen, addToast } = useStorefront();
  const { login } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!emailInput || !emailInput.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!passwordInput) {
      setErrorMessage('Password is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: emailInput.trim(), password: passwordInput });
      addToast({ title: 'Signed in successfully', type: 'success' });
      setIsAuthModalOpen(false);
    } catch (err: any) {
      const msg = err?.message || 'Invalid email or password.';
      setErrorMessage(msg);
      addToast({ title: 'Failed to sign in', message: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToFullLogin = (method?: 'mobile') => {
    setIsAuthModalOpen(false);
    router.push(method === 'mobile' ? '/login?method=mobile' : '/login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        onClick={() => setIsAuthModalOpen(false)}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl p-6 sm:p-8 max-w-sm w-full z-10 shadow-xl border border-gray-200 animate-in zoom-in-95 duration-200">
        
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 bg-primary-light border border-primary/20 text-primary rounded-xl flex items-center justify-center mx-auto">
            <Lock size={20} />
          </div>
          <h3 className="font-bold text-xl text-gray-900">Customer Sign In</h3>
          <p className="text-xs text-gray-500 font-medium">
            Sign in to access your orders, track shipments, and manage your account.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-600">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700">Email Address</label>
            <div className="relative mt-1.5">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@example.com"
                className="w-full py-2 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700">Password</label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full py-2 pl-9 pr-9 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full inline-flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
            <span>{isSubmitting ? 'Signing in...' : 'Sign In with Email'}</span>
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-2 text-center">
          <button
            type="button"
            onClick={() => navigateToFullLogin('mobile')}
            className="w-full py-2 text-xs font-semibold text-primary hover:bg-primary-light rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-primary/20"
          >
            <Smartphone size={14} />
            <span>Sign in with Mobile OTP</span>
          </button>

          <p className="text-[11px] text-gray-500 mt-1">
            New customer?{' '}
            <button
              type="button"
              onClick={() => {
                setIsAuthModalOpen(false);
                router.push('/register');
              }}
              className="font-bold text-primary hover:underline cursor-pointer"
            >
              Create an account
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};


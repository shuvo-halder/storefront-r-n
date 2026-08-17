'use client';

import React, { useState } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, addToast } = useStorefront();
  const { login } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) return;
    setIsSubmitting(true);
    try {
      await login({ email: emailInput, password: passwordInput || 'password' });
      addToast({ title: 'Logged in successfully', type: 'success' });
      setIsAuthModalOpen(false);
    } catch {
      addToast({ title: 'Failed to sign in', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
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
          <h3 className="font-bold text-xl text-gray-900">Sign In to Vyzobd</h3>
          <p className="text-xs text-gray-500 font-medium">
            Access saved order history, tracking status, and account address settings.
          </p>
        </div>

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
                className="w-full py-2.5 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full inline-flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Signing in...' : 'Sign In / Register'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-100 text-[11px] text-gray-400 text-center font-medium">
          By continuing you agree to Vyzobd Terms & Privacy Policy.
        </div>

      </div>
    </div>
  );
};

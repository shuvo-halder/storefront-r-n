import React, { useState } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { X, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginUser } = useStorefront();
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) return;
    setIsSubmitting(true);
    await loginUser(emailInput);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        onClick={() => setIsAuthModalOpen(false)}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full z-10 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-800 rounded-full"
        >
          <X size={18} />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <Lock size={22} />
          </div>
          <h3 className="font-extrabold text-xl text-slate-900">Sign In to AuraTech</h3>
          <p className="text-xs text-slate-500">
            Access saved order history, tracking status, and account address settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative mt-1">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@example.com"
                className="w-full py-2.5 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-500"
              />
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Signing in...' : 'Sign In / Register'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
          By continuing you agree to AuraTech Terms & Privacy Policy.
        </div>

      </div>
    </div>
  );
};

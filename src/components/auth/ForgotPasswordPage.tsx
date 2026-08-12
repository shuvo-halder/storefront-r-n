'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../../types/auth';
import { storefrontApi } from '../../services/storefrontApi';
import { useStorefront } from '../../context/StorefrontContext';
import { Mail, ArrowLeft, CheckCircle2, Loader2, KeyRound } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { navigateTo } = useStorefront();
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    try {
      await storefrontApi.forgotPassword(data.email);
      setIsSent(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
        <div className="max-w-md mx-auto bg-white rounded-[40px] p-10 shadow-2xl shadow-slate-200/50 text-center border border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Email Sent!</h2>
          <p className="text-slate-500 text-sm font-medium mb-8">
            We've sent a password reset link to your email. Please check your inbox and spam folder.
          </p>
          <button
            onClick={() => navigateTo('login')}
            className="w-full py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white shadow-xl shadow-slate-200/50 mb-6 border border-slate-100">
            <KeyRound size={32} className="text-primary" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Forgot Password?</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium px-4">
            Enter your email and we'll send you instructions to reset your password.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-10 px-8 shadow-2xl shadow-slate-200/50 sm:rounded-[40px] border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-[10px] font-black text-primary uppercase tracking-tighter">{errors.email.message}</p>}
            </div>

            {error && (
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-[11px] font-bold text-primary">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
              <span>{isSubmitting ? 'Sending...' : 'Send Reset Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('login')}
              className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

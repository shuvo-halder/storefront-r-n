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
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-xl p-8 shadow-xs text-center border border-[#E5E7EB] space-y-5">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200">
            <CheckCircle2 size={24} />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-[#111827]">Email Sent!</h2>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              We've sent a password reset link to your email. Please check your inbox and spam folder.
            </p>
          </div>
          <button
            onClick={() => navigateTo('login')}
            className="w-full py-2.5 px-4 bg-[#111827] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 hover:bg-[#1F2937] transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FDF0F3] mb-4 border border-[#DC2B53]/20">
          <KeyRound size={24} className="text-[#DC2B53]" />
        </div>
        <h2 className="text-xl font-bold text-[#111827]">Forgot Password?</h2>
        <p className="mt-1 text-xs text-[#6B7280]">
          Enter your email and we'll send you instructions to reset your password.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xs rounded-xl border border-[#E5E7EB]">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                  <Mail size={16} />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2B53]"
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-[11px] font-medium text-[#DC2626]">{errors.email.message}</p>}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-[#DC2626]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#DC2B53] hover:bg-[#C52247] disabled:bg-gray-300 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
              <span>{isSubmitting ? 'Sending...' : 'Send Reset Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('login')}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
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

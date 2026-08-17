'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Mail, Lock, User, Phone, ShieldCheck, ArrowRight, CheckCircle2, Info } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { register: registerAccount } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [socialNotice, setSocialNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError: setErrorField,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setSuccessMessage(null);
    setSocialNotice(null);
    try {
      const res = await registerAccount(data);
      setSuccessMessage(res.message || 'Registration successful. Please check your email to verify your account.');
    } catch (err: any) {
      if (err?.errors && Array.isArray(err.errors)) {
        err.errors.forEach((e: any) => {
          if (e.field) {
            setErrorField(e.field as any, { type: 'server', message: e.message });
          }
        });
      }
      setError(err?.message || 'Registration failed. Please try again.');
    }
  };

  const handleSocialClick = (provider: string) => {
    setError(null);
    setSocialNotice(`Continue with ${provider} is currently coming soon. Please register using your details below.`);
  };

  if (successMessage) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 sm:px-8 shadow-xs rounded-xl border border-[#E5E7EB] text-center space-y-5">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200">
              <CheckCircle2 size={24} />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-[#111827]">Account Created!</h2>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {successMessage}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#DC2B53] hover:bg-[#C52247] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <span>Continue to Sign In</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <h2 className="text-xl font-bold text-[#111827]">Create Account</h2>
        <p className="mt-1 text-xs text-[#6B7280]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-[#DC2B53] font-semibold hover:text-[#C52247] transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xs rounded-xl border border-[#E5E7EB]">
          
          {/* Social Registration Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
            <button
              type="button"
              onClick={() => handleSocialClick('Google')}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] text-[#111827] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialClick('Facebook')}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] text-[#111827] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <FacebookIcon />
              <span>Continue with Facebook</span>
            </button>
          </div>

          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]"></div>
            </div>
            <span className="relative bg-white px-3 text-[11px] font-medium text-[#6B7280]">
              Or register with email
            </span>
          </div>

          {socialNotice && (
            <div className="p-3 mb-5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-800 flex items-start gap-2.5">
              <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <span>{socialNotice}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#111827] mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                    <User size={16} />
                  </div>
                  <input
                    {...register('fullName')}
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2B53]"
                    placeholder="Full Name"
                  />
                </div>
                {errors.fullName && <p className="mt-1 text-[11px] font-medium text-[#DC2626]">{errors.fullName.message}</p>}
              </div>

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

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                    <Phone size={16} />
                  </div>
                  <input
                    {...register('phone')}
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2B53]"
                    placeholder="+8801..."
                  />
                </div>
                {errors.phone && <p className="mt-1 text-[11px] font-medium text-[#DC2626]">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                    <Lock size={16} />
                  </div>
                  <input
                    {...register('password')}
                    type="password"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2B53]"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-1 text-[11px] font-medium text-[#DC2626]">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                    <CheckCircle2 size={16} />
                  </div>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2B53]"
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-[11px] font-medium text-[#DC2626]">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="flex items-start pt-1">
              <div className="flex items-center h-5">
                <input
                  {...register('agreeTerms')}
                  id="agree-terms"
                  type="checkbox"
                  className="h-4 w-4 text-[#DC2B53] focus:ring-[#DC2B53] border-[#E5E7EB] rounded accent-[#DC2B53]"
                />
              </div>
              <div className="ml-2.5 text-xs">
                <label htmlFor="agree-terms" className="font-medium text-[#6B7280]">
                  I agree to the <Link href="/pages/terms" className="text-[#DC2B53] hover:underline font-semibold">Terms of Service</Link> and <Link href="/pages/privacy" className="text-[#DC2B53] hover:underline font-semibold">Privacy Policy</Link>
                </label>
                {errors.agreeTerms && <p className="mt-1 text-[11px] font-medium text-[#DC2626]">{errors.agreeTerms.message}</p>}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-[#DC2626] flex items-center gap-2">
                <ShieldCheck size={16} className="rotate-180 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#DC2B53] hover:bg-[#C52247] disabled:bg-gray-300 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


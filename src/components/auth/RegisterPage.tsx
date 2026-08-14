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
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-10 px-8 shadow-2xl shadow-slate-200/50 rounded-[40px] border border-slate-100 mx-4 sm:mx-0 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100">
              <CheckCircle2 size={36} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Account Created!</h2>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {successMessage}
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all cursor-pointer"
              >
                <span>Continue to Sign In</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primary font-bold hover:text-primary-hover transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-10 px-8 shadow-2xl shadow-slate-200/50 sm:rounded-[40px] border border-slate-100 mx-4 sm:mx-0">
          
          {/* Social Registration Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleSocialClick('Google')}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer active:scale-98"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialClick('Facebook')}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer active:scale-98"
            >
              <FacebookIcon />
              <span>Continue with Facebook</span>
            </button>
          </div>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Or register with email
            </span>
          </div>

          {socialNotice && (
            <div className="p-4 mb-6 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs font-medium text-amber-800 flex items-start gap-3 shadow-sm">
              <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <span>{socialNotice}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    {...register('fullName')}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    placeholder="Full Name"
                  />
                </div>
                {errors.fullName && <p className="mt-1.5 text-[10px] font-black text-primary uppercase tracking-tighter">{errors.fullName.message}</p>}
              </div>

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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Phone size={18} />
                  </div>
                  <input
                    {...register('phone')}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    placeholder="+8801..."
                  />
                </div>
                {errors.phone && <p className="mt-1.5 text-[10px] font-black text-primary uppercase tracking-tighter">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    {...register('password')}
                    type="password"
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-1.5 text-[10px] font-black text-primary uppercase tracking-tighter">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <CheckCircle2 size={18} />
                  </div>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1.5 text-[10px] font-black text-primary uppercase tracking-tighter">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  {...register('agreeTerms')}
                  id="agree-terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded-lg"
                />
              </div>
              <div className="ml-3 text-xs">
                <label htmlFor="agree-terms" className="font-bold text-slate-700">
                  I agree to the <Link href="/pages/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/pages/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </label>
                {errors.agreeTerms && <p className="mt-1 text-[10px] font-black text-primary uppercase tracking-tighter">{errors.agreeTerms.message}</p>}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-[11px] font-bold text-primary flex items-center gap-3">
                <ShieldCheck size={18} className="rotate-180" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 cursor-pointer"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              <span>{isSubmitting ? 'Creating Account...' : 'Get Started Now'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

